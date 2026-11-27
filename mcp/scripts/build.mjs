import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(mcpRoot, '..');
const distDir = path.join(mcpRoot, 'dist');
const distLibDir = path.join(distDir, 'lib');
const pluginBinDir = path.join(repoRoot, '.agents', 'plugins', 'eigo-taxi-mcp', 'bin');

fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(distLibDir, { recursive: true });
fs.mkdirSync(pluginBinDir, { recursive: true });

// 1. Bundle MCP App UI into a single self-contained CSP-safe HTML file.
const uiBuild = await esbuild.build({
  entryPoints: [path.join(mcpRoot, 'app', 'main.ts')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2023'],
  write: false,
});

const uiJs = uiBuild.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const uiCss = fs.readFileSync(path.join(mcpRoot, 'app', 'styles.css'), 'utf8');

const html = [
  '<!DOCTYPE html>',
  '<html lang="ja">',
  '<head>',
  '  <meta charset="UTF-8" />',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  '  <title>Eigo Taxi Link — MCP App</title>',
  '  <style>',
  uiCss,
  '  </style>',
  '</head>',
  '<body>',
  '  <div id="app"></div>',
  '  <script>',
  uiJs,
  '  </script>',
  '</body>',
  '</html>',
  '',
].join('\n');

const distHtmlPath = path.join(distDir, 'dashboard.html');
fs.writeFileSync(distHtmlPath, html, 'utf8');

// 2. Transpile unbundled ESM library modules for programmatic imports and tests.
await esbuild.build({
  entryPoints: [
    path.join(mcpRoot, 'src', 'types.ts'),
    path.join(mcpRoot, 'src', 'store.ts'),
    path.join(mcpRoot, 'src', 'gas-client.ts'),
    path.join(mcpRoot, 'src', 'backend.ts'),
    path.join(mcpRoot, 'src', 'server.ts'),
  ],
  bundle: false,
  platform: 'node',
  target: ['node22'],
  format: 'esm',
  outdir: distLibDir,
});

// 3. Bundle Node.js MCP server CLI into a standalone ESM artifact.
await esbuild.build({
  entryPoints: [path.join(mcpRoot, 'src', 'cli.ts')],
  bundle: true,
  platform: 'node',
  target: ['node22'],
  format: 'esm',
  outfile: path.join(distDir, 'server.mjs'),
  banner: {
    js: [
      'import { createRequire as __createRequire } from "node:module";',
      'import { fileURLToPath as __fileURLToPath } from "node:url";',
      'import { dirname as __dirnameFn } from "node:path";',
      'const require = __createRequire(import.meta.url);',
      'const __filename = __fileURLToPath(import.meta.url);',
      'const __dirname = __dirnameFn(__filename);',
    ].join('\n'),
  },
});

// 4. Synchronize standalone artifacts into the Antigravity plugin bin directory.
fs.copyFileSync(path.join(distDir, 'server.mjs'), path.join(pluginBinDir, 'server.mjs'));
fs.copyFileSync(distHtmlPath, path.join(pluginBinDir, 'dashboard.html'));

// 5. If the global Antigravity plugin directory is installed, keep its artifacts in sync too.
const installedPluginDir = path.join(os.homedir(), '.gemini', 'config', 'plugins', 'eigo-taxi-mcp');
if (fs.existsSync(installedPluginDir)) {
  const installedBinDir = path.join(installedPluginDir, 'bin');
  fs.mkdirSync(installedBinDir, { recursive: true });
  fs.copyFileSync(path.join(distDir, 'server.mjs'), path.join(installedBinDir, 'server.mjs'));
  fs.copyFileSync(distHtmlPath, path.join(installedBinDir, 'dashboard.html'));
  const pluginSrcDir = path.join(repoRoot, '.agents', 'plugins', 'eigo-taxi-mcp');
  for (const rel of ['plugin.json', 'mcp_config.json', 'skills/eigo-taxi-mcp/SKILL.md', 'assets/logo.svg']) {
    const srcFile = path.join(pluginSrcDir, rel);
    const dstFile = path.join(installedPluginDir, rel);
    if (fs.existsSync(srcFile)) {
      fs.mkdirSync(path.dirname(dstFile), { recursive: true });
      fs.copyFileSync(srcFile, dstFile);
    }
  }
}

console.log(
  `Built MCP server (${fs.statSync(path.join(distDir, 'server.mjs')).size} bytes) and MCP App UI (${Buffer.byteLength(html, 'utf8')} bytes) -> synced to .agents/plugins/eigo-taxi-mcp/bin/`,
);
