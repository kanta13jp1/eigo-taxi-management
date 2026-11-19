import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getGoogleIdToken, prepareGoogleSignIn, signInGoogle, signOutGoogle } from '../../src/services/google-auth';

type Phase = 'initializing' | 'ready' | 'authenticated' | 'armed' | 'failed' | 'ready-again' | 'verified' | 'done' | 'error';
const state = document.querySelector<HTMLElement>('#state')!;
const instruction = document.querySelector<HTMLElement>('#instruction')!;
const button = (id: string) => document.querySelector<HTMLButtonElement>(`#${id}`)!;
const login = button('login'), arm = button('arm'), logout = button('logout'), retry = button('retry'), cleanup = button('cleanup');
let phase: Phase = 'initializing', busy = false, firstUid: string | undefined, armed = false, injected = 0;
let unsubscribe: (() => void) | undefined;

function render(message: string, next: string) {
  state.textContent = message;
  instruction.textContent = next;
  login.disabled = busy || !['ready', 'ready-again'].includes(phase);
  arm.disabled = busy || phase !== 'authenticated';
  logout.disabled = busy || phase !== 'armed';
  retry.disabled = busy || phase !== 'failed';
  cleanup.disabled = busy || !['authenticated', 'armed', 'failed', 'verified', 'error'].includes(phase);
}

function auth() { return getAuth(getApp('eigo-taxi')); }
function disableInjection() { armed = false; unsubscribe?.(); unsubscribe = undefined; }

if (location.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
  phase = 'error';
  render('この検証はローカルホストからのみ実行できます。', '');
  login.disabled = arm.disabled = logout.disabled = retry.disabled = cleanup.disabled = true;
} else {
  prepareGoogleSignIn().then(() => {
    phase = 'ready'; render('認証の準備ができました。', 'Googleで本人認証を押し、検証用の会社アカウントを選択します。');
  }).catch(() => {
    phase = 'error'; render('認証の準備に失敗しました。', '専用タブを閉じて担当者に連絡してください。');
  });
}

login.addEventListener('click', async () => {
  if (busy || !['ready', 'ready-again'].includes(phase)) return;
  const second = phase === 'ready-again';
  busy = true; render('Google認証中です。', 'ご本人が検証用の会社アカウントを選択してください。');
  try {
    // This call starts the popup synchronously in the user click.
    const result = await signInGoogle();
    if (!auth().currentUser?.emailVerified || (second && result.uid !== firstUid)) {
      disableInjection(); await signOutGoogle(); firstUid = undefined; phase = 'error';
      render('本人確認または同一アカウントの確認ができませんでした。', '通常ログアウト後、専用タブを閉じてください。');
      return;
    }
    firstUid = result.uid; // In-memory comparison only; never displayed, logged, or saved by this harness.
    phase = second ? 'verified' : 'authenticated';
    render(second ? '同じアカウントで再認証できました。' : 'Google認証ができました。', second ? '通常ログアウトして終了してください。' : '人工的な1回の失敗を設定してください。');
  } catch {
    disableInjection(); phase = 'error';
    render('Google認証を完了できませんでした。', '通常ログアウト後、専用タブを閉じてください。');
  } finally { busy = false; render(state.textContent || '', instruction.textContent || ''); }
});

arm.addEventListener('click', () => {
  if (busy || phase !== 'authenticated' || !auth().currentUser || !firstUid) return;
  armed = true; injected = 0;
  unsubscribe = auth().beforeAuthStateChanged(user => {
    if (user === null && armed) { armed = false; injected++; throw new Error('synthetic-signout-failure'); }
  });
  phase = 'armed'; render('人工的な1回の失敗を設定しました。', 'ログアウトを試してください。');
});

logout.addEventListener('click', async () => {
  if (busy || phase !== 'armed' || !firstUid) return;
  busy = true; render('ログアウトを試行中です。', '');
  try {
    await signOutGoogle();
    disableInjection(); phase = 'error';
    render('想定した人工失敗を確認できませんでした。', '通常ログアウト後、専用タブを閉じてください。');
  } catch {
    let tokenBlocked = false;
    try { await getGoogleIdToken(firstUid); } catch { tokenBlocked = true; }
    if (injected !== 1 || !tokenBlocked || auth().currentUser?.uid !== firstUid) {
      disableInjection(); phase = 'error';
      render('期待した安全状態を確認できませんでした。', '通常ログアウト後、専用タブを閉じてください。');
    } else {
      phase = 'failed'; render('人工的な終了失敗を確認。旧セッションの取得は拒否されました。', '終了処理を再試行してください。');
    }
  } finally { busy = false; render(state.textContent || '', instruction.textContent || ''); }
});

retry.addEventListener('click', async () => {
  if (busy || phase !== 'failed') return;
  busy = true; render('終了処理を再試行中です。', '');
  try {
    await prepareGoogleSignIn();
    if (auth().currentUser !== null || injected !== 1) throw new Error('verification-failed');
    disableInjection(); phase = 'ready-again';
    render('再試行でFirebaseのログアウトが完了しました。', 'Googleで本人認証を押し、同じ検証用アカウントを選択してください。');
  } catch {
    disableInjection(); phase = 'error';
    render('終了処理の再試行を確認できませんでした。', '通常ログアウト後、専用タブを閉じてください。');
  } finally { busy = false; render(state.textContent || '', instruction.textContent || ''); }
});

cleanup.addEventListener('click', async () => {
  if (busy) return;
  busy = true; disableInjection(); render('通常ログアウト中です。', '');
  try {
    await signOutGoogle();
    if (auth().currentUser !== null) throw new Error('logout-not-complete');
    firstUid = undefined; phase = 'done';
    render('通常ログアウトが完了しました。', '専用タブを閉じてください。');
  } catch {
    phase = 'error'; render('通常ログアウトを確認できませんでした。', '専用タブを閉じて担当者に連絡してください。');
  } finally { busy = false; render(state.textContent || '', instruction.textContent || ''); }
});
