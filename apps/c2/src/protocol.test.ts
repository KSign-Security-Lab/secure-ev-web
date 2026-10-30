import assert from "node:assert/strict";
import { test } from "node:test";
import {
  beaconProfileSchema,
  decodeAgentOutput,
  decodeBeaconBody,
  encodeBeaconResponse,
  generatePaw,
  defaultExecutor,
  type Instruction,
} from "./protocol.ts";
import { agentBinaryCandidates, isAgentBinaryRequest } from "./routes/download.ts";

test("beacon body round-trips through base64/JSON", () => {
  const profile = { paw: "abc123", platform: "linux", executors: ["sh"], results: [] };
  const raw = Buffer.from(JSON.stringify(profile), "utf-8").toString("base64");
  const parsed = beaconProfileSchema.parse(decodeBeaconBody(raw));
  assert.equal(parsed.paw, "abc123");
  assert.equal(parsed.platform, "linux");
  assert.deepEqual(parsed.executors, ["sh"]);
});

test("beacon response is double-encoded instructions inside a base64 envelope", () => {
  const instructions: Instruction[] = [
    { id: "i1", command: "d2hvYW1p", executor: "sh", payloads: [], uploads: [], sleep: 0, timeout: 60, deadman: false },
  ];
  const encoded = encodeBeaconResponse({ paw: "p", sleep: 3, watchdog: 0, instructions });
  const envelope = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
  assert.equal(envelope.paw, "p");
  assert.equal(envelope.sleep, 3);
  // instructions is a JSON string holding an array of JSON strings.
  const outer = JSON.parse(envelope.instructions);
  assert.equal(outer.length, 1);
  const inner = JSON.parse(outer[0]);
  assert.equal(inner.command, "d2hvYW1p");
  assert.equal(inner.deadman, false);
});

test("decodeAgentOutput decodes base64 but leaves non-base64 intact", () => {
  assert.equal(decodeAgentOutput(Buffer.from("hello", "utf-8").toString("base64")), "hello");
  assert.equal(decodeAgentOutput(""), "");
  assert.equal(decodeAgentOutput("not base64 @@@"), "not base64 @@@");
});

test("generatePaw is 6 lowercase alphanumerics", () => {
  assert.match(generatePaw(), /^[a-z0-9]{6}$/);
});

test("defaultExecutor prefers platform shell", () => {
  assert.equal(defaultExecutor("windows", ["psh", "cmd"]), "psh");
  assert.equal(defaultExecutor("windows", ["cmd"]), "cmd");
  assert.equal(defaultExecutor("linux", ["sh", "bash"]), "sh");
  assert.equal(defaultExecutor("linux", ["ruby"]), "ruby");
});

test("agent binary candidates fall back arch -> amd64 -> legacy", () => {
  assert.deepEqual(agentBinaryCandidates("darwin", "arm64"), [
    "sandcat-darwin-arm64",
    "sandcat-darwin-amd64",
    "sandcat.go-darwin",
  ]);
  // No architecture header defaults to amd64.
  assert.deepEqual(agentBinaryCandidates("linux", ""), [
    "sandcat-linux-amd64",
    "sandcat-linux-amd64",
    "sandcat.go-linux",
  ]);
  // Unknown platform builds nothing.
  assert.deepEqual(agentBinaryCandidates("solaris", "amd64"), []);
});

test("isAgentBinaryRequest matches the self-download, not ability payloads", () => {
  assert.equal(isAgentBinaryRequest("sandcat.go"), true);
  assert.equal(isAgentBinaryRequest(""), true);
  assert.equal(isAgentBinaryRequest("powerview.ps1"), false);
});
