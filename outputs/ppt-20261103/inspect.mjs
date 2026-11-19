import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
for (const name of ['tasks','progress']) {
 const file=`docs/deliverables/2026-10-23-traceability/${name}-2026-10-30-v24.pptx`;
 const ppt=await PresentationFile.importPptx(await FileBlob.load(file));
 const snap=await ppt.inspect({kind:'slide,textbox,shape',maxChars:200000});
 await fs.writeFile(`outputs/ppt-20261103/${name}-inspect.ndjson`,snap.ndjson);
 console.log(name,ppt.slides.items.length);
}
