import { initializeApp } from 'firebase/app';
import {
  browserSessionPersistence, getAuth, GoogleAuthProvider,
  setPersistence, signInWithPopup, signOut,
} from 'firebase/auth';
import type { Auth, UserCredential } from 'firebase/auth';
import { requireGoogleConfig } from '../deployment-config';

let authReady: Promise<Auth> | undefined;
let preparedAuth: Auth | undefined;
let firebaseAuthInstance: Auth | undefined;
let pendingSignOut: Promise<void> = Promise.resolve();
let pendingPopup: Promise<UserCredential> | undefined;
let signOutRequired = false;
let signOutFailed = false;
let authGeneration = 0;

function configuredAuth(): Promise<Auth> {
  if (!authReady) {
    const auth = getAuth(initializeApp(requireGoogleConfig(), 'eigo-taxi'));
    firebaseAuthInstance = auth;
    auth.languageCode = 'ja';
    authReady = setPersistence(auth, browserSessionPersistence)
      .then(() => auth.authStateReady())
      .then(() => auth)
      .catch(error => {
        // A temporary storage or initialization failure must not poison every
        // later attempt in this page. Concurrent callers still share one setup.
        authReady = undefined;
        throw error;
      });
  }
  return authReady;
}

function signInError(error: unknown): Error {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new Error('ログインを中止しました。もう一度お試しください。');
  }
  if (code === 'auth/popup-blocked') return new Error('ログイン画面を開けませんでした。ブラウザーのポップアップを許可してお試しください。');
  if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-allowed') return new Error('ログインの準備中です。教室の担当者にお問い合わせください。');
  return new Error('Googleでログインできませんでした。通信状況を確認して、SafariまたはChromeからお試しください。');
}

// @trace CODE-01 REQ-01
export async function signInGoogle(): Promise<{ uid: string; idToken: string }> {
  try {
    // Preparation completes before enabling the button. Open the popup directly
    // in the click handler, before asynchronous work can lose user activation.
    if (!preparedAuth || signOutRequired || pendingPopup) throw new Error('Googleログインを準備しています。');
    const generation = authGeneration;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const popup = signInWithPopup(preparedAuth, provider);
    pendingPopup = popup;
    let result: UserCredential;
    try { result = await popup; }
    finally { if (pendingPopup === popup) pendingPopup = undefined; }
    if (signOutRequired || generation !== authGeneration) throw new Error('もう一度ログインしてください。');
    const idToken = await result.user.getIdToken();
    if (signOutRequired || generation !== authGeneration) throw new Error('もう一度ログインしてください。');
    return { uid: result.user.uid, idToken };
  } catch (error) { throw signInError(error); }
}

export async function prepareGoogleSignIn(): Promise<void> {
  try {
    // A failed sign-out stays a barrier until a real retry succeeds. Concurrent
    // preparations share the same retry instead of opening multiple popups.
    for (;;) {
      const observedSignOut = signOutFailed ? signOutGoogle() : pendingSignOut;
      await observedSignOut;
      const auth = await configuredAuth();
      // A newer logout may have started while initialization was in progress.
      if (observedSignOut === pendingSignOut && !signOutRequired) {
        preparedAuth = auth;
        return;
      }
    }
  }
  catch (error) { throw signInError(error); }
}

export async function getGoogleIdToken(expectedUid: string): Promise<string> {
  if (signOutRequired) throw new Error('もう一度ログインしてください。');
  const generation = authGeneration;
  const auth = await configuredAuth();
  const user = auth.currentUser;
  if (signOutRequired || generation !== authGeneration || !user || user.uid !== expectedUid) throw new Error('もう一度ログインしてください。');
  // The SDK refreshes expired/soon-to-expire ID tokens; GAS checks identity on every call.
  const idToken = await user.getIdToken();
  if (signOutRequired || generation !== authGeneration || auth.currentUser !== user) throw new Error('もう一度ログインしてください。');
  return idToken;
}

// @trace CODE-34 REQ-34
export function signOutGoogle(): Promise<void> {
  authGeneration++;
  signOutRequired = true;
  signOutFailed = false;
  preparedAuth = undefined;
  const popupAtLogout = pendingPopup;
  const attempt = pendingSignOut.catch(() => {}).then(async () => {
    // A late popup can restore the SDK user; clear it only after it settles.
    if (popupAtLogout) await popupAtLogout.catch(() => {});
    // If initialization itself failed, the SDK instance can still retain a
    // user; retry sign-out on that instance rather than skipping it.
    const auth = authReady ? await authReady : firebaseAuthInstance;
    if (auth) await signOut(auth);
  });
  const tracked = attempt.then(
    () => { if (pendingSignOut === tracked) signOutRequired = false; },
    error => { if (pendingSignOut === tracked) signOutFailed = true; throw error; },
  );
  pendingSignOut = tracked;
  return pendingSignOut;
}
