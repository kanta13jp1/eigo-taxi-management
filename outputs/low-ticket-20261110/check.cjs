const fs=require('node:fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),assert=require('node:assert/strict');
for(const ext of ['.ts','.tsx']) require.extensions[ext]=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const rows=[];
for(const balance of [3,2,1,0]) {
  const props={isDemo:true,isOpen:true,isTeacher:true,rides:[],students:[{id:'fixture',name:'架空生徒',ticketBalance:balance,address:'テスト'}]};
  const html=name=>renderToStaticMarkup(React.createElement(require('../../src/components/'+name+'.tsx')[name],props)).replace(/<[^>]+>/g,'');
  const admin=html('TeacherDashboard').match(/チケット残り2枚以下\s*(\d+)\s*名/)?.[1];
  const parent=html('ParentPortal').includes('Mauro・Brenda に連絡してね！');
  const form=html('AddRideModal').includes('現在のチケット残数が残り '+balance+' 枚です');
  assert.equal(admin,balance<=2?'1':'0');assert.equal(parent,balance<=2);assert.equal(form,balance<=2);
  rows.push({balance,adminCount:+admin,parentContact:parent,formWarning:form});
}
const report={case:'AT-04',mode:'React rendering, synthetic fixture, no Google',testedAt:new Date().toISOString(),release:JSON.parse(fs.readFileSync('dist/release.json')),rows};
fs.writeFileSync('outputs/low-ticket-20261110/at04.json',JSON.stringify(report,null,2));console.log(report);
