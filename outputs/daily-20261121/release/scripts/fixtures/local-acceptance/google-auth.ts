// All Google authentication is disabled in this local UI rehearsal.
export async function prepareGoogleSignIn() {}
export async function signInGoogle(): Promise<never> { throw new Error('ローカル試験ではGoogleログインを実行しません'); }
export async function getGoogleIdToken(): Promise<never> { throw new Error('ローカル試験ではGoogleトークンを取得しません'); }
export async function signOutGoogle() {}
