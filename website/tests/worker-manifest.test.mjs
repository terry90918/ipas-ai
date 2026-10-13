import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { inlineLoadManifest } from '../node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js';

test('Worker embeds Next 16.4 preview props without runtime filesystem access', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ipas-manifest-'));
  try {
    const dir = join(root, 'server-functions/default/.next/server');
    await mkdir(dir, { recursive: true });
    const props = { previewModeId: 'test-id', previewModeSigningKey: 'test-signing', previewModeEncryptionKey: 'test-encryption' };
    await writeFile(join(dir, 'preview-props.json'), JSON.stringify(props));
    let rules;
    inlineLoadManifest({ updateContent: (_name, value) => { rules = value; } }, { outputDir: root, monorepoRoot: root, appBuildOutputPath: root });
    const original = await readFile('node_modules/next/dist/server/load-manifest.external.js', 'utf8');
    const patched = await rules[0].callback({ contents: original });
    const context = { exports: {}, process: { env: {} }, require: () => ({}) };
    runInNewContext(patched, context);
    assert.deepEqual(JSON.parse(JSON.stringify(context.exports.loadManifest('/.next/server/preview-props.json'))), props);
  } finally { await rm(root, { recursive: true, force: true }); }
});
