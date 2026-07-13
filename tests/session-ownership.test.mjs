import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

test("specific session reads verify ownership before loading child records", async () => {
  const source = await readFile(
    path.join(repoRoot, "src/app/api/session/route.ts"),
    "utf8"
  );

  const ownerLookup = source.indexOf('.eq("user_id", userId)');
  const childLookup = source.indexOf('.from("decisions")');

  assert.notEqual(ownerLookup, -1, "specific GET must filter by user_id");
  assert.notEqual(childLookup, -1, "specific GET must load session decisions");
  assert.ok(
    ownerLookup < childLookup,
    "ownership must be verified before session child records are queried"
  );
});

test("session writes filter by owner and require an updated row", async () => {
  const source = await readFile(
    path.join(repoRoot, "src/app/api/session/route.ts"),
    "utf8"
  );
  const patchHandler = source.slice(source.indexOf("export async function PATCH"));

  assert.match(
    patchHandler,
    /\.update\(dbUpdates\)[\s\S]*?\.eq\("id", sessionId\)[\s\S]*?\.eq\("user_id", userId\)/,
    "PATCH must filter the update by both session id and authenticated user"
  );
  assert.match(
    patchHandler,
    /\.select\("id"\)[\s\S]*?\.maybeSingle\(\)/,
    "PATCH must select the matched row so a missing owned session is detectable"
  );
  assert.match(
    patchHandler,
    /if \(!updatedSession\)[\s\S]*?status: 404/,
    "PATCH must not report success when no owned session matched"
  );
});
