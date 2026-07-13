import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Script } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync("src/lib/analytics/properties.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const cjsModule = { exports: {} };
new Script(compiled).runInNewContext({
  exports: cjsModule.exports,
  module: cjsModule,
  require,
});

const {
  getAttributionProperties,
  sanitizeTransportProperties,
  stripSensitiveProperties,
} = cjsModule.exports;

assert.deepEqual(
  normalize(stripSensitiveProperties({
    email: "person@example.com",
    message: "private support body",
    transcript: "private estate planning transcript",
    route: "/",
    topic: "Support",
  })),
  {
    route: "/",
    topic: "Support",
  }
);

assert.deepEqual(
  normalize(
    sanitizeTransportProperties({
      token: "phc_publicProjectToken123",
      email: "person@example.com",
      route: "/tools/example",
    })
  ),
  {
    token: "phc_publicProjectToken123",
    route: "/tools/example",
  }
);

assert.deepEqual(
  normalize(
    sanitizeTransportProperties({
      token: "private-session-token",
      route: "/tools/example",
    })
  ),
  { route: "/tools/example" }
);

const longValue = "a".repeat(200);
assert.deepEqual(
  normalize(getAttributionProperties(
    new URLSearchParams({
      utm_source: " google ",
      utm_medium: "cpc",
      gclid: longValue,
      email: "person@example.com",
      message: "private support body",
    })
  )),
  {
    utm_source: "google",
    utm_medium: "cpc",
    gclid: "a".repeat(160),
  }
);

console.log("analytics property tests passed");

function normalize(value) {
  return JSON.parse(JSON.stringify(value));
}
