import { ProfileFailure } from "../profiles/errors";
import { openAmqpsConnection, type AmqpsInput } from "./amqpsConnection";
export async function probeAmqps(
  input: AmqpsInput,
  signal: AbortSignal,
): Promise<string> {
  const connection = await openAmqpsConnection(input, signal);
  if (!(await connection.close())) {
    if (signal.aborted)
      throw signal.reason instanceof ProfileFailure
        ? signal.reason
        : new ProfileFailure("AMQP_CANCELLED");
    throw new ProfileFailure("AMQP_CLOSE");
  }
  return connection.vhost;
}
