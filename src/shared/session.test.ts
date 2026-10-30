import { describe, expect, it } from "vitest";
import { emptySession, isSessionSnapshot } from "./session";
describe("session event boundary", () => {
  it("accepts the bounded DTO and rejects injected data, fields and invalid enums", () => {
    const value = { ...emptySession(), sequence: 1 };
    expect(isSessionSnapshot(value)).toBe(true);
    for (const invalid of [
      null,
      [],
      { ...value, password: "sentinel" },
      { ...value, flow: "published" },
      { ...value, sequence: -1 },
      { ...value, https: { ...value.https, retries: 6 } },
      { ...value, amqps: { ...value.amqps, error: "private-message" } },
      { ...value, https: { ...value.https, checkedAt: "invalid" } },
      {
        ...value,
        profile: { id: "id", name: "x", environment: "production", vhost: "/" },
      },
      { ...value, sessionId: "not-a-uuid" },
    ])
      expect(isSessionSnapshot(invalid)).toBe(false);
  });
});
