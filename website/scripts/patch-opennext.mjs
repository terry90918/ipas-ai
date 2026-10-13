import { readFileSync, writeFileSync } from 'node:fs';

const path = 'node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js';
const original = '**/{*-manifest,required-server-files,prefetch-hints}.json';
const fixed = '**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json';
const source = readFileSync(path, 'utf8');
if (source.includes(original)) writeFileSync(path, source.replace(original, fixed));
else if (!source.includes(fixed)) throw new Error('OpenNext manifest patch changed; review compatibility before building.');
