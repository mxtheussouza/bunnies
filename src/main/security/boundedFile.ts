import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
export class FileLimitFailure extends Error {
  constructor(readonly reason: "type" | "size" = "type") {
    super();
  }
}
export async function readBoundedFile(
  path: string,
  limit: number,
): Promise<Buffer> {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink()) throw new FileLimitFailure();
  const file = await open(
    path,
    constants.O_RDONLY |
      (constants.O_NOFOLLOW ?? 0) |
      (constants.O_NONBLOCK ?? 0),
  );
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.ino !== before.ino || stat.dev !== before.dev)
      throw new FileLimitFailure();
    if (stat.size > limit) throw new FileLimitFailure("size");
    const buffer = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(
        buffer,
        length,
        buffer.length - length,
        null,
      );
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > limit) throw new FileLimitFailure("size");
    return buffer.subarray(0, length);
  } finally {
    await file.close();
  }
}
