// Synthetic identity only; this harness never loads Firebase or Google.
export async function prepareGoogleSignIn() {}
export async function signInGoogle() { return {uid:'synthetic-reviewer',idToken:'synthetic-token'}; }
export async function getGoogleIdToken() { return 'synthetic-token'; }
export async function signOutGoogle() {}
