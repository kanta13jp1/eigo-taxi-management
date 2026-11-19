import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from '../../src/App';
import {ApiService} from '../../src/services/api';
import '../../src/index.css';

const query=new URLSearchParams(location.search);
const entry='12345678-1234-4123-8123-123456789abc';
const seed={students:[{id:'FIXTURE-1',name:'架空検証生徒',parentName:'架空保護者',phone:'000',address:'架空の検証場所',pickupNote:'',ticketBalance:5,createdAt:'2020-01-01'},{id:'OTHER-2',name:'表示禁止生徒',parentName:'Other',phone:'000',address:'Other',pickupNote:'',ticketBalance:100,createdAt:'2020-01-01'}],rides:[{id:'R-pickup',studentId:'FIXTURE-1',studentName:'架空検証生徒',rideDate:'2020-01-01',rideTime:'10:00',rideType:'pickup',pickupLocation:'CUST-04 完了用A・片道',status:'scheduled',reservedBy:'teacher'},{id:'R-roundtrip',studentId:'FIXTURE-1',studentName:'架空検証生徒',rideDate:'2020-01-02',rideTime:'10:00',rideType:'roundtrip',pickupLocation:'CUST-04 完了用B・往復',status:'scheduled',reservedBy:'teacher'},{id:'R-other',studentId:'OTHER-2',studentName:'表示禁止生徒',rideDate:'2020-01-01',rideTime:'10:00',rideType:'pickup',pickupLocation:'Other',status:'scheduled',reservedBy:'teacher'}],calls:[],users:[{id:'reviewer',name:'架空の検証担当',email:'review@example.test',role:'reviewer',active:true,linked:true,studentIds:['FIXTURE-1'],publicEntryId:entry}]};
let state=JSON.parse(sessionStorage.getItem('reviewer-fixture')||'null')||seed;
const persist=()=>sessionStorage.setItem('reviewer-fixture',JSON.stringify(state));
const capability=query.get('cap')==='string'?'true':query.get('cap')==='true';
const snapshot=()=>({users:state.users,revision:'revision-1',reviewModeAvailable:capability});
window.fetch=(async (_url,options)=>{
 const body=JSON.parse(String(options?.body));state.calls.push(body);let data:unknown;
 if(body.action==='login'){
  const reviewOnly=query.get('actor')!=='admin';
  data={id:reviewOnly?'reviewer':'admin',name:reviewOnly?'架空の検証担当':'通常管理者',role:body.portalRole,studentIds:reviewOnly?['FIXTURE-1']:[],...(reviewOnly?{reviewOnly:true}:{}),...(body.portalRole==='parent'?{publicEntryId:entry}:{})};
 }else if(body.action==='getStudents')data=state.students;
 else if(body.action==='getRides')data=state.rides;
 else if(body.action==='getManagedUsers'||body.action==='deleteManagedUser')data=snapshot();
 else if(body.action==='saveManagedUser'){state.saved=body;data=snapshot();}
 else if(body.action==='completeRide'){
  const ride=state.rides.find(r=>r.id===body.rideId);const consume=ride.rideType==='roundtrip'?2:1;
  const count=ride.status==='completed'?0:consume;if(count)state.students[0].ticketBalance-=count;ride.status='completed';persist();
  return {ok:true,json:async()=>({success:true,consumedTickets:count,remainingBalance:state.students[0].ticketBalance})};
 }else if(body.action==='addTickets'){state.students[0].ticketBalance+=body.ticketCount;persist();return {ok:true,json:async()=>({success:true,newBalance:state.students[0].ticketBalance})};}
 else if(body.action==='cancelReservation'){state.rides.find(r=>r.id===body.rideId).status='cancelled';data=true;}
 else throw new Error('Unexpected synthetic action: '+body.action);
 persist();return {ok:true,json:async()=>({success:true,data})};
}) as typeof fetch;
(window as any).__reviewFixture={api:ApiService,state:()=>state};
createRoot(document.getElementById('root')!).render(<App/>);
