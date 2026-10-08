import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
export function client(args,cwd) {
 const child=spawn(process.execPath,args,{cwd,stdio:['pipe','pipe','pipe'],windowsHide:true});
 const pending=new Map();let seq=0;
 const failAll=error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();};
 child.on('error',failAll);child.on('exit',code=>failAll(new Error('MCP exited: '+code)));
 child.stderr.on('data',()=>{});
 createInterface({input:child.stdout}).on('line',line=>{try{const msg=JSON.parse(line),p=pending.get(msg.id);if(p){pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}}catch{}});
 return {request(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error(method+' timed out'));},35000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});},notify(method){child.stdin.write(JSON.stringify({jsonrpc:'2.0',method})+'\n');},close(){child.stdin.end();child.kill();}};
}
