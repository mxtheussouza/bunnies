// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseProfileRequest, validSave } from "./validation";
const fields = {
  name: "Local",
  environment: "development",
  httpsUrl: "https://localhost:15671/prefix",
  amqpsUrl: "amqps://localhost:5671/%2F",
  username: "tester",
  revision: "absent",
  secret: {
    action: "replace",
    mode: "memory",
    password: "synthetic\npassword",
  },
};
describe("profile boundary validation", () => {
  it("accepts only named finite DTOs including independent TLS endpoints", () => {
    expect(validSave(fields)).toBe(true);
    expect(parseProfileRequest({ command: "listProfiles" })).toEqual({
      command: "listProfiles",
    });
    expect(
      parseProfileRequest({ command: "saveProfile", input: fields }),
    ).not.toBeNull();
  });
  it.each([
    "http://host",
    "https://user:secret@host",
    "https://@host",
    "https://host?token=secret",
    "https://host#fragment",
    "https://host/?",
    "https://host\\evil",
    "https://host\n",
    "https://host:99999",
  ])("rejects unsafe endpoint %s", httpsUrl => {
    expect(validSave({ ...fields, httpsUrl })).toBe(false);
  });
  it("rejects extra/nested/accessor/oversized fields without stringifying arbitrary graphs", () => {
    for (const input of [
      { ...fields, path: "/tmp" },
      { ...fields, username: "x".repeat(257) },
      { ...fields, name: " " },
      { ...fields, id: "../../file" },
      { ...fields, secret: { action: "keep", password: "sentinel" } },
      {
        ...fields,
        secret: { action: "replace", mode: "plaintext", password: "x" },
      },
      {
        ...fields,
        secret: {
          action: "replace",
          mode: "memory",
          password: "x".repeat(4097),
        },
      },
    ])
      expect(validSave(input)).toBe(false);
    expect(
      parseProfileRequest({ command: Array(100000).fill("x") }),
    ).toBeNull();
    const getter = Object.defineProperty({}, "command", {
      get() {
        throw new Error("must not execute");
      },
    });
    expect(parseProfileRequest(getter)).toBeNull();
    const circular: Record<string, unknown> = {};
    circular.command = circular;
    expect(parseProfileRequest(circular)).toBeNull();
    expect(
      parseProfileRequest({ command: "listProfiles", input: {} }),
    ).toBeNull();
    expect(
      parseProfileRequest({
        command: "removeProfile",
        input: { id: "x", revision: "absent", confirmed: true },
      }),
    ).toBeNull();
  });
});
