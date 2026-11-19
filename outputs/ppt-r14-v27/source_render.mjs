import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),rows=JSON.parse(await fs.readFile('docs/traceability/presentations.json','utf8'));
const row=rows.find(x=>x.id===process.argv[2]);if(!row)throw Error('deck missing');
const name=path.basename(row.path).split('-2026-')[0];const dir=path.join(root,'outputs/ppt-r14-v27/source',name);await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,row.path)));
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(dir,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
console.log(JSON.stringify({deck:row.id,slides:p.slides.items.length}));
