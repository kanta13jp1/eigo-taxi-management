/**
 * Developer-maintained PUBLIC settings bundled into the website.
 * Never put personal access keys, user lists, or private keys here.
 * Firebase web configuration is public; access is controlled by the GAS allowlist.
 */
export const deploymentConfig: unknown = {
  environment: 'test',
  gasApiUrl: 'https://script.google.com/macros/s/AKfycbznxkg_f_7ddHdopFZfN0OlFDsxoFoi67OslKNQ93ipkWZLq-tj1jAsxz_uxNo2jBtwFg/exec',
  // Fill only after registering the approved Firebase web app and Google provider.
  // { apiKey, authDomain, projectId, appId }; never supply an OAuth client secret.
  firebase: {
  "apiKey": "AIzaSyAzIjeKh1DAVX5jNjubWi42wc_LGdfLlDA",
  "authDomain": "eigo-taxi-app.firebaseapp.com",
  "projectId": "eigo-taxi-app",
  "appId": "1:753038429305:web:9fce8459b09dbd4e2318a8"
},
};

export type FirebaseWebConfig = { apiKey: string; authDomain: string; projectId: string; appId: string };
export type DeploymentConfig = {
  environment: 'test' | 'production';
  gasApiUrl: string;
  firebase: FirebaseWebConfig | null;
};
export const SETUP_REQUIRED_MESSAGE = 'ログインの準備中です。教室の担当者にお問い合わせください。';

export function validateDeploymentConfig(value: unknown): DeploymentConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(SETUP_REQUIRED_MESSAGE);
  const config = value as Record<string, unknown>;
  if (!['test', 'production'].includes(String(config.environment)) || typeof config.gasApiUrl !== 'string') {
    throw new Error(SETUP_REQUIRED_MESSAGE);
  }
  let endpoint: URL;
  try { endpoint = new URL(config.gasApiUrl); } catch { throw new Error(SETUP_REQUIRED_MESSAGE); }
  if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'script.google.com' ||
      endpoint.port || endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
      !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint.pathname)) {
    throw new Error(SETUP_REQUIRED_MESSAGE);
  }
  let firebase: FirebaseWebConfig | null = null;
  if (config.firebase !== null && config.firebase !== undefined) {
    if (typeof config.firebase !== 'object' || Array.isArray(config.firebase)) throw new Error(SETUP_REQUIRED_MESSAGE);
    const supplied = config.firebase as Record<string, unknown>;
    if (['apiKey', 'authDomain', 'projectId', 'appId'].some(key => typeof supplied[key] !== 'string' || !supplied[key])) {
      throw new Error(SETUP_REQUIRED_MESSAGE);
    }
    const candidate = supplied as FirebaseWebConfig;
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(candidate.projectId) ||
        !/^[A-Za-z0-9_-]{20,100}$/.test(candidate.apiKey) ||
        !/^1:\d+:web:[A-Za-z0-9]+$/.test(candidate.appId) ||
        ![`${candidate.projectId}.firebaseapp.com`, `${candidate.projectId}.web.app`].includes(candidate.authDomain)) {
      throw new Error(SETUP_REQUIRED_MESSAGE);
    }
    firebase = { apiKey: candidate.apiKey, authDomain: candidate.authDomain, projectId: candidate.projectId, appId: candidate.appId };
  }
  return { environment: config.environment as DeploymentConfig['environment'], gasApiUrl: endpoint.href, firebase };
}

export function getDeploymentConfig(): DeploymentConfig {
  return validateDeploymentConfig(deploymentConfig);
}

export function requireGoogleConfig(): FirebaseWebConfig {
  const config = getDeploymentConfig().firebase;
  if (!config) throw new Error(SETUP_REQUIRED_MESSAGE);
  return config;
}
