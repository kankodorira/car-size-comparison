import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../dist/client/", import.meta.url);

test("exports the public comparison page", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");

  assert.match(html, /<title>くらべるガレージ｜車サイズ比較<\/title>/);
  assert.match(html, /数字だけでは/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/);
});
