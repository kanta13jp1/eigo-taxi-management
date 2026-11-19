import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const root='C:/Users/kanta/GitHub/eigo-taxi-management',name=process.argv[2],stage=root+'/docs/traceability/reports/ppt-r10/'+name;
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1020.11618/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const m=JSON.parse(await fs.readFile(stage+'/meta.json','utf8'));if(name==='business')m.tables=[13,14,15,16,17];
await fs.mkdir(root+'/docs/deliverables/2026-10-23-traceability',{recursive:true});
await finalizePresentation({workspaceDir:root,candidatePath:stage+'/candidate.pptx',finalPath:root+'/docs/deliverables/2026-10-23-traceability/'+name+'-2026-10-24-v10.pptx',pythonExecutable:'C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit',...m.tables.flatMap(x=>['--require-native-table-slide',String(x)])],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:stage+'/validation.json',explicitTotalSlideCount:m.count,requiredNativeTableOwnerSlides:m.tables,requiredNativeChartOwnerSlides:[]});
