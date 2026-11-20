const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const bundled=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python=process.env.EIGO_PYTHON||(process.platform==='win32'&&fs.existsSync(bundled)?bundled:'python3');
const [command,...args]=process.argv.slice(2);
const script=command==='test'?'scripts/test_traceability.py':'scripts/traceability.py';
const result=spawnSync(python,[script,...(command==='test'?[]:[command,...args])],{stdio:'inherit',cwd:path.resolve(__dirname,'..')});
if(result.error){console.error(result.error.message);process.exit(1);}process.exit(result.status??1);
