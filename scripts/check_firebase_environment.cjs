// Read-only audit using the installed Firebase CLI's existing login.
// Credentials stay inside its auth library; never serialize tokens or full errors.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const cliRoot = process.env.FIREBASE_TOOLS_ROOT || path.join(os.homedir(), 'AppData/Local/pnpm/global/5/node_modules/firebase-tools');
const auth = require(path.join(cliRoot, 'lib/auth.js'));
const { requireAuth } = require(path.join(cliRoot, 'lib/requireAuth.js'));
const { Client } = require(path.join(cliRoot, 'lib/apiv2.js'));
const accountEmail = 'k-umezawa@ml-mightylink.com';
const projectId = 'eigo-taxi-app';
async function main() {
  const account = auth.getAllAccounts().find(a => a.user.email === accountEmail);
  if (!account) throw new Error('Required company account is not signed in to Firebase CLI');
  const options = { project: projectId, nonInteractive: true };
  auth.setActiveAccount(options, account);
  await requireAuth(options);
  const crm = new Client({urlPrefix:'https://cloudresourcemanager.googleapis.com',apiVersion:'v3'});
  const hosting = new Client({urlPrefix:'https://firebasehosting.googleapis.com',apiVersion:'v1beta1'});
  // Hosting versions/releases are authorized through sites.update, not distinct
  // firebasehosting.versions.* permissions (those do not exist).
  const required = ['resourcemanager.projects.get','firebase.projects.get','firebasehosting.sites.get','firebasehosting.sites.list','firebasehosting.sites.create','firebasehosting.sites.update'];
  const checks = {};
  async function read(name, fn) {
    try { checks[name] = {ok:true,data:await fn()}; }
    catch(e) { checks[name] = {ok:false,error:e.message}; }
  }
  await read('project',async()=>(await crm.get('/projects/'+projectId)).body);
  await read('permissions',async()=>(await crm.post('/projects/'+projectId+':testIamPermissions',{permissions:required})).body);
  await read('sites',async()=>(await hosting.get('/projects/'+projectId+'/sites')).body);
  await read('defaultReleases',async()=>(await hosting.get('/sites/eigo-taxi-app/releases?pageSize=5')).body);
  await read('testReleases',async()=>(await hosting.get('/sites/eigo-taxi-test/releases?pageSize=5')).body);
  if(checks.project.ok && checks.project.data.parent) {
    await read('parent',async()=>(await crm.get('/'+checks.project.data.parent)).body);
  }
  const report={checkedAt:new Date().toISOString(),account:accountEmail,projectId,required,checks};
  const out=path.join(root,'docs/acceptance/deployment');fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'firebase-environment.json'),JSON.stringify(report,null,2));
  // Only project metadata, permission names, hosting release metadata; no credentials.
  console.log(JSON.stringify(report,null,2));
  if(!checks.project.ok||!checks.permissions.ok)process.exitCode=1;
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
