export type PortalRoute =
  | { kind: 'home' }
  | { kind: 'admin' }
  | { kind: 'parent'; entryId?: string }
  | { kind: 'invalid' };

export const ENTRY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const DEMO_ENTRY_ID = '00000000-0000-4000-8000-000000000001';

export function parsePortal(hash: string): PortalRoute {
  if (!hash || hash === '#' || hash === '#/') return { kind: 'home' };
  if (hash === '#/admin') return { kind: 'admin' };
  if (hash === '#/parent') return { kind: 'parent' };
  const match = /^#\/parent\/([^/]+)$/.exec(hash);
  if (match && ENTRY_ID.test(match[1])) return { kind: 'parent', entryId: match[1] };
  return { kind: 'invalid' };
}

export function portalHash(user: { role: 'admin' | 'parent'; publicEntryId?: string }): string {
  return user.role === 'admin' ? '#/admin' : '#/parent' + (user.publicEntryId ? '/' + user.publicEntryId : '');
}

// @trace CODE-20 REQ-20
export function assertPortal(route: PortalRoute, user: { role: 'admin' | 'parent'; publicEntryId?: string }): void {
  if (route.kind !== user.role) throw new Error('この入口ではログインできません。ご本人に案内された入口を開いてください。');
  if (route.kind === 'parent' && route.entryId && route.entryId !== user.publicEntryId) {
    throw new Error('この個別URLは利用できません。教室からご本人向けの最新URLを受け取ってください。');
  }
}

// The server and assertPortal both start a wrong-entrance refusal with this sentence.
export function isPortalMismatch(message: string): boolean {
  return message.startsWith('この入口ではログインできません');
}

export function invitationUrl(base: string, entryId: string): string {
  if (!ENTRY_ID.test(entryId)) throw new Error('個別URLの登録IDが不正です');
  const url = new URL(base);
  url.search = '';
  url.hash = '/parent/' + entryId;
  return url.href;
}
