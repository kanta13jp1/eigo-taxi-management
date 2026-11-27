import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const mcpRoot = path.resolve(import.meta.dirname, '..');
const pluginServerPath = path.resolve(mcpRoot, '..', '.agents', 'plugins', 'eigo-taxi-mcp', 'bin', 'server.mjs');

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      srv.close(() => resolve(address.port));
    });
  });
}

test('Stdio MCP E2E exercises all 14 tools, 4 resources (including ui:// MCP App), and 2 prompts', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eigo-taxi-mcp-stdio-'));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [pluginServerPath, '--data-dir', tempDir],
    stderr: 'pipe',
  });
  const client = new Client({ name: 'eigo-taxi-test-client', version: '1.0.0' });

  try {
    await client.connect(transport);

    const { tools } = await client.listTools();
    assert.equal(tools.length, 14);
    const dashboardTool = tools.find((t) => t.name === 'open_dashboard');
    assert.ok(dashboardTool);
    assert.equal(dashboardTool._meta?.ui?.resourceUri, 'ui://eigo-taxi/dashboard.html');
    assert.equal(dashboardTool._meta?.['ui/resourceUri'], 'ui://eigo-taxi/dashboard.html');
    assert.deepEqual(dashboardTool._meta?.['com.google.antigravity/ui']?.entrypoints, [
      { type: 'aux_pane', title: 'Eigo Taxi Link' },
      { type: 'global', title: 'Eigo Taxi Link' },
    ]);

    const { resources } = await client.listResources();
    assert.equal(resources.length, 4);
    const uiResource = await client.readResource({ uri: 'ui://eigo-taxi/dashboard.html' });
    assert.equal(uiResource.contents[0].mimeType, 'text/html;profile=mcp-app');
    assert.ok(uiResource.contents[0].text.includes('<div id="app"></div>'));

    const { prompts } = await client.listPrompts();
    assert.equal(prompts.length, 2);
    const promptResult = await client.getPrompt({ name: 'daily_dispatch_briefing', arguments: {} });
    assert.ok(promptResult.messages[0].content.text.includes('Eigo Taxi Link'));

    const status = await client.callTool({ name: 'get_service_status', arguments: {} });
    assert.equal(status.isError, undefined);
    assert.equal(status.structuredContent.status.mode, 'demo');
    assert.equal(status.structuredContent.status.releasePolicy.release, 'HOLD');

    const dash = await client.callTool({ name: 'open_dashboard', arguments: {} });
    assert.equal(dash.structuredContent.snapshot.students.length, 3);
    assert.equal(dash.structuredContent.snapshot.todayRides.length, 2);

    const createdStu = await client.callTool({
      name: 'create_student',
      arguments: { name: '佐藤 健太', address: '世田谷区駒沢1-1-1', ticketBalance: 3 },
    });
    const newStudentId = createdStu.structuredContent.student.id;
    assert.match(newStudentId, /^STU-/);

    const createdRide = await client.callTool({
      name: 'create_reservation',
      arguments: {
        studentId: newStudentId,
        rideDate: dash.structuredContent.snapshot.today,
        rideTime: '18:15',
        rideType: 'roundtrip',
        pickupLocation: '世田谷区駒沢1-1-1',
      },
    });
    const newRideId = createdRide.structuredContent.ride.id;

    const completed = await client.callTool({
      name: 'complete_ride',
      arguments: { rideId: newRideId },
    });
    assert.equal(completed.structuredContent.consumedTickets, 2);
    assert.equal(completed.structuredContent.remainingBalance, 1);

    const added = await client.callTool({
      name: 'add_tickets',
      arguments: { studentId: newStudentId, ticketCount: 5, amount: 5000, note: 'テスト' },
    });
    assert.equal(added.structuredContent.newBalance, 6);

    const cancel102 = await client.callTool({
      name: 'cancel_reservation',
      arguments: { rideId: 'RIDE-102' },
    });
    assert.equal(cancel102.structuredContent.cancelled, true);

    const invites = await client.callTool({ name: 'list_portal_invitations', arguments: {} });
    assert.equal(invites.structuredContent.count, 1);

    await client.callTool({ name: 'switch_demo_role', arguments: { role: 'parent' } });
    const forbidden = await client.callTool({
      name: 'create_student',
      arguments: { name: '権限外', address: '東京' },
    });
    assert.equal(forbidden.isError, true);

    await client.callTool({ name: 'switch_demo_role', arguments: { role: 'admin' } });
    const reset = await client.callTool({ name: 'reset_demo_data', arguments: { confirm: true } });
    assert.equal(reset.structuredContent.snapshot.students.length, 3);
  } finally {
    await transport.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('Streamable HTTP MCP E2E serves /health, enforces Bearer token, and runs tools via StreamableHTTPClientTransport', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eigo-taxi-mcp-http-'));
  const port = await getFreePort();
  const token = 'test-eigo-http-token';

  const child = spawn(
    process.execPath,
    [pluginServerPath, '--transport', 'http', '--host', '127.0.0.1', '--port', String(port), '--data-dir', tempDir],
    {
      env: { ...process.env, EIGO_TAXI_MCP_HTTP_TOKEN: token },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  try {
    // Wait until /health responds 200 with minimal fields (no internal stateFile leaked)
    const deadline = Date.now() + 8000;
    let healthy = false;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/health`);
        if (res.ok) {
          const json = await res.json();
          assert.deepEqual(json, { ok: true, mode: 'demo' });
          assert.equal('status' in json, false);
          healthy = true;
          break;
        }
      } catch {
        // retry
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.equal(healthy, true, 'HTTP MCP server should become healthy');

    // Unauthenticated POST /mcp must be rejected with 401
    const unauthRes = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
    });
    assert.equal(unauthRes.status, 401);

    // Authenticated Streamable HTTP client connects and calls tools
    const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    const client = new Client({ name: 'eigo-taxi-http-client', version: '1.0.0' });
    await client.connect(transport);

    const { tools } = await client.listTools();
    assert.equal(tools.length, 14);
    const dash = await client.callTool({ name: 'open_dashboard', arguments: {} });
    assert.equal(dash.structuredContent.snapshot.students.length, 3);
    await transport.close();
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('Non-loopback HTTP bind without EIGO_TAXI_MCP_HTTP_TOKEN fails closed at startup', async () => {
  const port = await getFreePort();
  const child = spawn(
    process.execPath,
    [pluginServerPath, '--transport', 'http', '--host', '0.0.0.0', '--port', String(port)],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8'); });
  const exitCode = await new Promise((resolve) => child.once('exit', resolve));
  assert.notEqual(exitCode, 0);
  assert.match(stderr, /EIGO_TAXI_MCP_HTTP_TOKEN/);
});
