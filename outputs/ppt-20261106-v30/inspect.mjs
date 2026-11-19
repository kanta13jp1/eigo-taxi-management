import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('docs/deliverables/2026-10-23-traceability/implementation-2026-11-03-v27.pptx'));
const r=await p.inspect({kind:'slide,textbox,shape',maxChars:900000});
await fs.writeFile('outputs/ppt-20261106-v30/inspect-implementation.json',typeof r==='string'?r:JSON.stringify(r));
console.log(JSON.stringify({type:typeof r,keys:Object.keys(r),preview:JSON.stringify(r).slice(0,1500)}));
