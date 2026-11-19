import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(); const rows=JSON.parse(await fs.readFile('docs/traceability/presentations.json','utf8'));
for(const row of rows){
 const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,row.path)));
 const rec=(await p.inspect({kind:'slide,textbox,shape',maxChars:1000000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
 const filtered=rec.filter(x=>x.text&&((row.id==='PKG-01'&&x.slideIndex===6)||(row.id==='PKG-10'&&x.slideIndex===5)||(row.id==='PKG-05'&&x.slideIndex===6)));
 console.log(JSON.stringify({deck:row.id,items:filtered.map(x=>({id:x.id,slide:x.slide,slideIndex:x.slideIndex,text:x.text}))}));
}
