import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const work=path.join(root,'outputs/ppt-visual-b-v2');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.11149/skills/presentations';
process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-709-0_26.1104.709.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
for(const kind of process.argv.slice(2)){
 const dir=path.join(work,kind);await fs.mkdir(path.join(dir,'final'),{recursive:true});
 const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(dir,'candidate.pptx'),finalPath:path.join(dir,'final',`${kind}-visual-2026-11-06-v2.pptx`),pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-709-0_26.1104.709.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:10,verifyArtifactToolImport:true,receiptPath:path.join(dir,'validation.json')});
 console.log(kind,JSON.stringify(result));
}

