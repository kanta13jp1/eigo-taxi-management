import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createBackendFromEnv } from './backend.js';
import { createEigoTaxiMcpServer } from './server.js';
import type { McpMode } from './types.js';

const MAX_HTML_BYTES = 10 * 1024 * 1024;
const MAX_HTTP_BODY_BYTES = 1024 * 1024;

interface CliOptions {
  transport: 'stdio' | 'http';
  host: string;
  port: number;
  mode?: McpMode;
  dataDir?: string;
  htmlPath?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    transport: 'stdio',
    host: process.env.EIGO_TAXI_MCP_HOST?.trim() || '127.0.0.1',
    port: Number(process.env.EIGO_TAXI_MCP_PORT || '8787') || 8787,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--transport' && argv[i + 1]) {
      const val = argv[++i];
      if (val !== 'stdio' && val !== 'http') {
        throw new Error(`Invalid --transport value: ${val}`);
      }
      opts.transport = val;
    } else if (arg.startsWith('--transport=')) {
      const val = arg.slice('--transport='.length);
      if (val !== 'stdio' && val !== 'http') {
        throw new Error(`Invalid --transport value: ${val}`);
      }
      opts.transport = val;
    } else if (arg === '--host' && argv[i + 1]) {
      opts.host = argv[++i];
    } else if (arg.startsWith('--host=')) {
      opts.host = arg.slice('--host='.length);
    } else if (arg === '--port' && argv[i + 1]) {
      opts.port = Number(argv[++i]);
    } else if (arg.startsWith('--port=')) {
      opts.port = Number(arg.slice('--port='.length));
    } else if (arg === '--mode' && argv[i + 1]) {
      const val = argv[++i];
      if (val !== 'demo' && val !== 'live-gas') {
        throw new Error(`Invalid --mode value: ${val}`);
      }
      opts.mode = val;
    } else if (arg.startsWith('--mode=')) {
      const val = arg.slice('--mode='.length);
      if (val !== 'demo' && val !== 'live-gas') {
        throw new Error(`Invalid --mode value: ${val}`);
      }
      opts.mode = val;
    } else if (arg === '--data-dir' && argv[i + 1]) {
      opts.dataDir = argv[++i];
    } else if (arg.startsWith('--data-dir=')) {
      opts.dataDir = arg.slice('--data-dir='.length);
    } else if (arg === '--html' && argv[i + 1]) {
      opts.htmlPath = argv[++i];
    } else if (arg.startsWith('--html=')) {
      opts.htmlPath = arg.slice('--html='.length);
    }
  }
  if (!Number.isInteger(opts.port) || opts.port < 1 || opts.port > 65535) {
    throw new Error(`Invalid --port value: ${opts.port}`);
  }
  return opts;
}

function resolveDashboardHtmlLoader(explicitHtmlPath?: string): () => string {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    explicitHtmlPath,
    process.env.EIGO_TAXI_MCP_HTML?.trim(),
    path.join(scriptDir, 'dashboard.html'),
    path.resolve(scriptDir, '..', 'dist', 'dashboard.html'),
  ].filter((value): value is string => Boolean(value));

  return () => {
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const buf = fs.readFileSync(candidate);
        if (buf.byteLength === 0 || buf.byteLength >= MAX_HTML_BYTES) {
          throw new Error(`dashboard.html のサイズが範囲外です: ${buf.byteLength} bytes`);
        }
        return buf.toString('utf8');
      }
    }
    throw new Error(`dashboard.html が見つかりません。検索パス: ${candidates.join(', ')}`);
  };
}

function timingSafeBearerMatch(authHeader: string | undefined, expectedToken: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const supplied = authHeader.slice('Bearer '.length);
  const a = crypto.createHash('sha256').update(supplied, 'utf8').digest();
  const b = crypto.createHash('sha256').update(expectedToken, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

function isLoopbackHostName(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return normalized === '127.0.0.1' || normalized === 'localhost' || normalized === '::1' || normalized === '[::1]';
}

function isAllowedLocalHost(hostHeader: string | undefined): boolean {
  if (!hostHeader) return false;
  const hostname = hostHeader.replace(/:\d+$/, '').toLowerCase();
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]';
}

function isAllowedOrigin(originHeader: string | undefined): boolean {
  if (!originHeader) return true;
  try {
    const parsed = new URL(originHeader);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return (
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '[::1]'
    );
  } catch {
    return false;
  }
}

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_HTTP_BODY_BYTES) {
      throw new Error('Request body too large');
    }
    chunks.push(buf);
  }
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function startStdio(opts: CliOptions): Promise<void> {
  const backend = createBackendFromEnv(process.env, { mode: opts.mode, dataDir: opts.dataDir });
  const getDashboardHtml = resolveDashboardHtmlLoader(opts.htmlPath);
  const server = createEigoTaxiMcpServer({ backend, getDashboardHtml });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[eigo-taxi-mcp] stdio ready (mode=${backend.mode})`);
}

async function startHttp(opts: CliOptions): Promise<void> {
  const backend = createBackendFromEnv(process.env, { mode: opts.mode, dataDir: opts.dataDir });
  const getDashboardHtml = resolveDashboardHtmlLoader(opts.htmlPath);
  const expectedToken = process.env.EIGO_TAXI_MCP_HTTP_TOKEN?.trim() || undefined;
  const isLoopbackBind = isLoopbackHostName(opts.host);

  if (!isLoopbackBind && !expectedToken) {
    throw new Error(
      '非ループバックアドレスへ HTTP 公開する場合は EIGO_TAXI_MCP_HTTP_TOKEN の設定が必須です',
    );
  }

  const httpServer = http.createServer(async (req, res) => {
    try {
      if (isLoopbackBind && !isAllowedLocalHost(req.headers.host)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden Host header' }));
        return;
      }
      if (isLoopbackBind && !isAllowedOrigin(req.headers.origin)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden Origin header' }));
        return;
      }

      const reqPath = (req.url || '/').split('?')[0];
      if (reqPath === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, mode: backend.mode }));
        return;
      }

      if (expectedToken && !timingSafeBearerMatch(req.headers.authorization, expectedToken)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      if (reqPath !== '/mcp') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }

      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Method not allowed.' },
            id: null,
          }),
        );
        return;
      }

      let parsedBody: unknown;
      try {
        parsedBody = await readJsonBody(req);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Invalid JSON' }));
        return;
      }

      const server = createEigoTaxiMcpServer({ backend, getDashboardHtml });
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, parsedBody);
    } catch (error) {
      console.error('[eigo-taxi-mcp] HTTP error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(opts.port, opts.host, () => {
      httpServer.removeListener('error', reject);
      console.error(`[eigo-taxi-mcp] Streamable HTTP ready at http://${opts.host}:${opts.port}/mcp (mode=${backend.mode})`);
      resolve();
    });
  });
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.transport === 'http') {
    await startHttp(opts);
  } else {
    await startStdio(opts);
  }
}

main().catch((error) => {
  console.error('[eigo-taxi-mcp] Fatal error:', error);
  process.exit(1);
});
