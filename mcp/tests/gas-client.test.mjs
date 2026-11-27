import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { LiveGasClient, validateGasApiUrl } from '../dist/lib/gas-client.js';

test('validateGasApiUrl rejects arbitrary origins and local URLs by default while allowing official script.google.com exec URLs', () => {
  assert.match(
    validateGasApiUrl('https://script.google.com/macros/s/AKfycbTest12345/exec'),
    /^https:\/\/script\.google\.com\/macros\/s\/AKfycbTest12345\/exec$/,
  );
  assert.throws(() => validateGasApiUrl('https://evil.example.com/exec'), /のみ許可/);
  assert.throws(() => validateGasApiUrl('https://script.google.com/macros/s/abc/dev'), /のみ許可/);
  assert.throws(() => validateGasApiUrl('http://127.0.0.1:8080/exec'), /のみ許可/);
  assert.equal(validateGasApiUrl('http://127.0.0.1:8080/exec', true), 'http://127.0.0.1:8080/exec');
});

test('LiveGasClient communicates with GAS contract (GET health, POST text/plain, idToken, portalRole, entryId, readonly)', async () => {
  const capturedPosts = [];
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Eigo Taxi Link API Ready' }));
      return;
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const rawBody = Buffer.concat(chunks).toString('utf8');
    const body = JSON.parse(rawBody);
    capturedPosts.push({ contentType: req.headers['content-type'], body });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (body.idToken === 'expired-token') {
      res.end(JSON.stringify({ success: false, code: 'UNAUTHORIZED', error: 'もう一度ログインしてください' }));
      return;
    }
    if (body.action === 'login') {
      res.end(
        JSON.stringify({
          success: true,
          data: { id: 'admin-1', name: 'テスト先生', role: body.portalRole, studentIds: [] },
        }),
      );
      return;
    }
    if (body.action === 'getStudents') {
      res.end(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'STU-901',
              name: '検証 生徒',
              parentName: '検証 保護者',
              phone: '090-0000-0000',
              address: '世田谷区',
              pickupNote: '',
              ticketBalance: 3,
              createdAt: '2026-11-23',
            },
          ],
        }),
      );
      return;
    }
    if (body.action === 'createReservation') {
      res.end(
        JSON.stringify({
          success: true,
          data: {
            id: body.rideId,
            studentId: body.studentId,
            studentName: '検証 生徒',
            rideDate: body.rideDate,
            rideTime: body.rideTime,
            rideType: body.rideType,
            pickupLocation: body.pickupLocation,
            status: 'scheduled',
            reservedBy: 'teacher',
            note: body.note,
          },
        }),
      );
      return;
    }
    if (body.action === 'getPortalInvitations') {
      res.end(
        JSON.stringify({
          success: true,
          data: [
            {
              userId: 'user-1',
              name: '検証保護者',
              publicEntryId: '12345678-1234-4123-8123-123456789abc',
            },
          ],
        }),
      );
      return;
    }
    res.end(JSON.stringify({ success: true, data: {} }));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const url = `http://127.0.0.1:${addr.port}/exec`;

  try {
    // Missing token fails closed for data calls, but healthCheck succeeds
    const unauthClient = new LiveGasClient({ gasApiUrl: url, portalRole: 'admin', allowLocalTestUrl: true });
    const health = await unauthClient.healthCheck();
    assert.equal(health.reachable, true);
    assert.equal(health.message, 'Eigo Taxi Link API Ready');
    await assert.rejects(() => unauthClient.getStudents(), /EIGO_TAXI_GAS_ID_TOKEN/);

    // Authenticated client sends exact GAS payload contract
    const entryId = '12345678-1234-4123-8123-123456789abc';
    const client = new LiveGasClient({
      gasApiUrl: url,
      idToken: 'valid-firebase-id-token',
      portalRole: 'parent',
      entryId,
      allowLocalTestUrl: true,
    });
    const students = await client.getStudents();
    assert.equal(students.length, 1);
    assert.equal(capturedPosts[0].contentType, 'text/plain;charset=utf-8');
    assert.equal(capturedPosts[0].body.idToken, 'valid-firebase-id-token');
    assert.equal(capturedPosts[0].body.portalRole, 'parent');
    assert.equal(capturedPosts[0].body.entryId, entryId);

    const created = await client.createReservation({
      studentId: 'STU-901',
      rideDate: '2026-11-24',
      rideTime: '16:00',
      rideType: 'pickup',
      pickupLocation: '世田谷区',
    });
    assert.match(created.ride.id, /^RIDE-/);

    const invitations = await client.getPortalInvitations('https://eigo-taxi-test.web.app/');
    assert.equal(
      invitations[0].portalUrl,
      'https://eigo-taxi-test.web.app/#/parent/12345678-1234-4123-8123-123456789abc',
    );

    // Readonly client permits reads and rejects mutations before any HTTP call
    const readonlyClient = new LiveGasClient({
      gasApiUrl: url,
      idToken: 'valid-firebase-id-token',
      readonly: true,
      allowLocalTestUrl: true,
    });
    const countBefore = capturedPosts.length;
    await assert.rejects(
      () =>
        readonlyClient.createReservation({
          studentId: 'STU-901',
          rideDate: '2026-11-24',
          rideTime: '16:00',
          rideType: 'pickup',
          pickupLocation: '世田谷区',
        }),
      /読み取り専用モード/,
    );
    assert.equal(capturedPosts.length, countBefore);

    // GAS error code is propagated cleanly
    const expiredClient = new LiveGasClient({ gasApiUrl: url, idToken: 'expired-token', allowLocalTestUrl: true });
    await assert.rejects(() => expiredClient.login(), /\[UNAUTHORIZED\]/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
