import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync('src/app/api/resend/webhook/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
test('verified foreign inbox is skipped without recipient echo; legitimate forwarding preserved',async()=>{
 let to=['support@storybookpost.com'],verified=false,forwarded=0;
 const resend={webhooks:{verify:()=>{verified=true;return {type:'email.received',data:{email_id:'synthetic',to}};}},emails:{receiving:{forward:async()=>{assert.equal(verified,true);forwarded++;return {data:{id:'synthetic'}};}}}};
 const exports={};new Function('exports','require',source)(exports,name=>name==='next/server'?{NextResponse:Response}:{getResend:()=>resend,getInboundForwardTo:()=> 'test@example.test',getFromAddress:()=> 'hello@mywillbuddy.com'});
 const original=process.env.RESEND_WEBHOOK_SECRET;process.env.RESEND_WEBHOOK_SECRET='synthetic-only';
 try {const request=()=>new Request('https://mywillbuddy.com/api/resend/webhook',{method:'POST',body:'{}'});
 assert.deepEqual(await (await exports.POST(request())).json(),{ok:true,skipped:'not_target_inbox'});assert.equal(forwarded,0);
 to=['support@mywillbuddy.com'];await exports.POST(request());assert.equal(forwarded,1);
 }finally{if(original===undefined)delete process.env.RESEND_WEBHOOK_SECRET;else process.env.RESEND_WEBHOOK_SECRET=original;}
});
