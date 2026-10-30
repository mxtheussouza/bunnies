import { describe, expect, it } from "vitest";
import { parseAmqpsEndpoint } from "./amqpsEndpoint";
describe("raw AMQPS endpoint and vhost", () => {
  it.each(["amqps://host", "amqps://host/%2F"])(
    "defaults to / without rewriting %s",
    value =>
      expect(parseAmqpsEndpoint(value)).toEqual({
        hostname: "host",
        port: 5671,
        vhost: "/",
      }),
  );
  it("canonicalizes DNS/IPv6 authority without normalizing the raw vhost", () => {
    expect(parseAmqpsEndpoint("amqps://[::1]:443/%2E%2E")).toEqual({
      hostname: "::1",
      port: 443,
      vhost: "..",
    });
    expect(
      parseAmqpsEndpoint("amqps://BROKER.EXAMPLE:5672/%20a%2Fb%252F%20"),
    ).toEqual({ hostname: "broker.example", port: 5672, vhost: " a/b%2F " });
  });
  it.each([
    "amqp://host",
    "amqps://user:secret@host",
    "amqps://host/",
    "amqps://host/a/b",
    "amqps://host?x=1",
    "amqps://host/#x",
    "amqps://host/%zz",
    "amqps://host/%C0%AF",
    "amqps://host/%00",
    "amqps://host/%0A",
    "amqps://host:0",
    "amqps://host:65536",
    "amqps://host\\evil",
    "amqps://host/" + "%C3%A9".repeat(128),
  ])("rejects %s", value => expect(parseAmqpsEndpoint(value)).toBeNull());
  it("accepts exactly 255 bytes and rejects invalid UTF-8", () => {
    expect(
      parseAmqpsEndpoint("amqps://host/" + "a".repeat(255))?.vhost,
    ).toHaveLength(255);
    expect(parseAmqpsEndpoint("amqps://host/\ud800")).toBeNull();
  });
});
