// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { VhostCatalog } from "./vhostCatalog";

const context = {
  owner: 1,
  revision: "revision",
  sessionId: "session",
  generation: 2,
};
afterEach(() => vi.useRealTimers());

it("only authorizes the exact name in the latest catalog for its owner and revision", () => {
  const catalog = new VhostCatalog();
  const selectionId = catalog.replace(context, ["área %2F"]);
  const input = {
    ...context,
    selectionId,
    vhost: "área %2F",
    operationId: "op",
  };
  expect(() => catalog.authorize(1, context.revision, input)).not.toThrow();
  for (const [owner, revision, candidate] of [
    [2, context.revision, input],
    [1, "other", input],
    [1, context.revision, { ...input, generation: 3 }],
    [1, context.revision, { ...input, vhost: "área /" }],
  ] as const)
    expect(() => catalog.authorize(owner, revision, candidate)).toThrow();
  catalog.replace(context, ["área %2F"]);
  expect(() => catalog.authorize(1, context.revision, input)).toThrow();
});

it("expires authorization after five minutes and clears when lifecycle invalidates the context", () => {
  vi.useFakeTimers();
  const catalog = new VhostCatalog();
  const select = () => ({
    ...context,
    selectionId: catalog.replace(context, ["."]),
    vhost: ".",
    operationId: "op",
  });
  const input = select();
  vi.advanceTimersByTime(299999);
  expect(() => catalog.authorize(1, context.revision, input)).not.toThrow();
  vi.advanceTimersByTime(1);
  expect(() => catalog.authorize(1, context.revision, input)).toThrow();
  const current = select();
  catalog.validateCurrent(() => {
    throw new Error("background");
  });
  expect(() => catalog.authorize(1, context.revision, current)).toThrow();
});
