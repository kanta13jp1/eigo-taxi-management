const fs = require('fs');
const path = require('path');
const { google } = require('C:/Users/kanta/AppData/Roaming/npm/node_modules/@piotr-agier/google-drive-mcp/node_modules/googleapis');

async function main() {
  const keysPath = 'C:/Users/kanta/.config/google-drive-mcp/gcp-oauth.keys.json';
  const tokensPath = 'C:/Users/kanta/.config/google-drive-mcp/tokens.json';

  const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8')).installed;
  const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const account = tokensData.accounts[tokensData.defaultAccount || 'default'];

  const oauth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    keys.redirect_uris[0]
  );
  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiryDate,
    token_type: account.tokenType,
    scope: account.scope
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const targetFolderId = '1k1HwCo8p37e1Vpm6Qu2ZGPvGfAhbWFzx'; // 「成果物一覧」フォルダ
  console.log(`Target folder ('成果物一覧'): ${targetFolderId}`);

  // 2. アップロード対象のドキュメントファイル一覧
  const filesToUpload = [
    {
      filePath: path.join(__dirname, '../docs/ADMIN_MANUAL.md'),
      name: 'Mauro & Brenda Taxi Link 管理者マニュアル'
    },
    {
      filePath: path.join(__dirname, '../docs/USER_GUIDE.md'),
      name: 'Mauro & Brenda Taxi Link 送迎予約ご利用ガイド（保護者・生徒用）'
    },
    {
      filePath: path.join(__dirname, '../docs/OPERATION_RUNBOOK.md'),
      name: 'Mauro & Brenda Taxi Link 保守運用・リリース手順書'
    },
    {
      filePath: path.join(__dirname, '../docs/DELIVERY_CHECKLIST.md'),
      name: 'Mauro & Brenda Taxi Link 正式納品物一覧表'
    },
    {
      filePath: 'C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/release_readiness_tasklist.md',
      name: '正式リリース残作業タスクリスト & 検討項目書'
    }
  ];

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.filePath)) {
      console.warn(`File not found: ${item.filePath}`);
      continue;
    }
    const content = fs.readFileSync(item.filePath, 'utf8');

    // Google Docs (application/vnd.google-apps.document) としてアップロード
    console.log(`Uploading as Google Doc: ${item.name}...`);
    const fileMetadata = {
      name: item.name,
      parents: [targetFolderId],
      mimeType: 'application/vnd.google-apps.document' // Google Docsに自動変換！
    };
    const media = {
      mimeType: 'text/markdown',
      body: content
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true
    });

    console.log(`✓ Uploaded: ${res.data.name} (ID: ${res.data.id})`);
    console.log(`  Link: ${res.data.webViewLink}`);
  }

  console.log('\nAll deliverables successfully uploaded to Google Drive!');
}

main().catch(console.error);
