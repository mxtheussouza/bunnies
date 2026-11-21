import { describe, expect, it } from "vitest";
import { parseManagementRequest } from "./validation";
import { isManagementSnapshot } from "../../shared/management";
const input = {
  sessionId: "00000000-0000-4000-8000-000000000001",
  operationId: "00000000-0000-4000-8000-000000000002",
  generation: 1,
};
const snapshot = {
  ...input,
  kind: "vhosts",
  selectionId: "00000000-0000-4000-8000-000000000003",
  names: ["/", ".."],
  currentVhost: "/",
  currentVisible: true,
  source: "https-management",
  checkedAt: "2026-10-30T12:00:00.000Z",
};
describe("closed management boundary DTOs", () => {
  it("only accepts the three named commands with exact UUID/context inputs", () => {
    expect(
      parseManagementRequest({ command: "listSessionVhosts", input }),
    ).toBeTruthy();
    for (const value of [
      { command: "getCurrentVhostInfo", input },
      { command: "listSessionVhosts", input: { ...input, page: 1 } },
      {
        command: "getBrokerInfo",
        input: { ...input, url: "https://elsewhere.invalid" },
      },
      { command: "getBrokerInfo", input: { ...input, generation: Infinity } },
      { command: "getBrokerInfo", input: { ...input, operationId: "invalid" } },
      { command: "getBrokerInfo", input, extra: true },
    ])
      expect(parseManagementRequest(value)).toBeNull();
  });
  it("rejects replies with secrets, names over limits, duplicates, wrong visibility or dates", () => {
    expect(isManagementSnapshot(snapshot)).toBe(true);
    for (const v of [
      { ...snapshot, password: "sentinel" },
      { ...snapshot, names: ["/", "/"] },
      { ...snapshot, currentVisible: false },
      { ...snapshot, names: Array(201).fill("/") },
      { ...snapshot, checkedAt: "now" },
      { ...snapshot, currentVhost: "\ud800" },
      { ...snapshot, selectionId: "stale" },
    ])
      expect(isManagementSnapshot(v)).toBe(false);
  });
});

it("rejects boxed or coercible enums without invoking coercion", () => {
  let called = false;
  const command = {
    toString() {
      called = true;
      return "getBrokerInfo";
    },
  };
  expect(parseManagementRequest({ command, input })).toBeNull();
  expect(called).toBe(false);
  expect(
    parseManagementRequest({ command: Object("getBrokerInfo"), input }),
  ).toBeNull();
  expect(
    isManagementSnapshot({
      ...input,
      source: "https-management",
      checkedAt: snapshot.checkedAt,
      kind: "broker",
      matrix: Object("reference"),
    }),
  ).toBe(false);
});

it("accepts only closed binding fields and preserves empty, false and zero", () => {
  const input = {
    sessionId: "00000000-0000-4000-8000-000000000001",
    operationId: "00000000-0000-4000-8000-000000000002",
    generation: 1,
    binding: {
      source: "origin",
      destination: "destination",
      destinationType: "queue",
      routingKey: "",
      arguments: { empty: "", flag: false, count: 0 },
    },
  };
  const request = { command: "createSessionBinding", input };
  expect(parseManagementRequest(request)).toEqual(request);
  expect(
    parseManagementRequest({ ...request, input: { ...input, vhost: "/" } }),
  ).toBeNull();
  for (const fields of [
    { source: "amq.topic" },
    { destination: ".." },
    { arguments: { bad: { nested: true } } },
    { arguments: { over: 2147483648 } },
    {
      arguments: Object.fromEntries(
        Array.from({ length: 17 }, (_, index) => [String(index), 0]),
      ),
    },
    { destinationType: "exchange", destination: "origin" },
  ]) {
    expect(
      parseManagementRequest({
        ...request,
        input: { ...input, binding: { ...input.binding, ...fields } },
      }),
    ).toBeNull();
  }
});
