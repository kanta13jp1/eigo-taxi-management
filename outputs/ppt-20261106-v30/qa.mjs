import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const base='outputs/ppt-20261106-v30-final',dest='docs/deliverables/2026-10-23-traceability';
const configs={design:'design-2026-11-03-v27.pptx',implementation:'implementation-2026-11-03-v27.pptx','test-spec':'test-spec-2026-11-03-v27.pptx','test-code':'test-code-2026-11-03-v27.pptx',tasks:'tasks-2026-11-06-v29.pptx',progress:'progress-2026-11-06-v29.pptx'};
for(const [n,src] of Object.entries(configs)){
 for(const [kind,file] of [['source',path.join(dest,src)],['roundtrip',path.join(base,n,'final',`${n}-2026-11-06-v30.pptx`)]] ){
  const p=await PresentationFile.importPptx(await FileBlob.load(file));
  const out=path.join(base,n,kind);await fs.mkdir(out,{recursive:true});
  for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(out,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
  await fs.writeFile(path.join(out,'inspect.json'),JSON.stringify(await p.inspect({kind:'slide,textbox,shape',maxChars:900000})));
 }
 console.log(n+' rendered source and final');
}
