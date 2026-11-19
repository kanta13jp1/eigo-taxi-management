import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('docs/deliverables/2026-10-23-traceability/user-2026-11-07-v33.pptx'));
const x=await p.inspect({kind:'slide,textbox,shape,image,layout',maxChars:1000000});
await fs.writeFile('outputs/teacher-reviewer-20261107/ppt/source-inspect.json',JSON.stringify(x,null,2));
console.log(JSON.stringify(x.records.filter(r=>r.slideIndex===10),null,2));
console.log('slides',p.slides.items.length,'slide frame',p.slides.items[10].frame);
