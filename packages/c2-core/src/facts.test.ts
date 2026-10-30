import { test } from "node:test";
import assert from "node:assert/strict";
import {
  agentDerivedFacts,
  applyCaptures,
  extractPlaceholders,
  substitute,
  unresolvedPlaceholders,
} from "./facts";

const agent = {
  paw: "abc123",
  server: "http://10.0.0.1:4204",
  group: "red",
  location: "/tmp/splunkd",
  host: "victim01",
  platform: "linux",
};

test("substitute fills known facts and agent-derived facts, leaves the rest", () => {
  const facts = { ...{ "demo.v": "hello" }, ...agentDerivedFacts(agent) };
  const out = substitute("echo #{demo.v} from #{paw} to #{missing.fact}", facts);
  assert.equal(out, "echo hello from abc123 to #{missing.fact}");
});

test("app.contact.http resolves from the agent server", () => {
  const facts = agentDerivedFacts(agent);
  assert.equal(substitute("curl #{app.contact.http}/x", facts), "curl http://10.0.0.1:4204/x");
});

test("extractPlaceholders returns distinct keys in order", () => {
  assert.deepEqual(extractPlaceholders("#{a} #{b} #{a}"), ["a", "b"]);
});

test("unresolvedPlaceholders reports only the keys with no value", () => {
  assert.deepEqual(unresolvedPlaceholders("#{a} #{b}", { a: "1" }), ["b"]);
});

test("applyCaptures pulls the first group, named or positional", () => {
  assert.deepEqual(applyCaptures("FACT=abc123", [{ fact: "demo.v", regex: "FACT=(?<v>\\w+)" }]), {
    "demo.v": "abc123",
  });
  assert.deepEqual(applyCaptures("user: root", [{ fact: "u", regex: "user: (\\S+)" }]), {
    u: "root",
  });
});

test("applyCaptures ignores a non-matching or malformed regex", () => {
  assert.deepEqual(applyCaptures("nothing", [{ fact: "x", regex: "zzz" }]), {});
  assert.deepEqual(applyCaptures("abc", [{ fact: "x", regex: "(" }]), {});
});
