function num(v){if(typeof v==='number')return v; if(typeof v==='string'){const n=Number(v.replace(/[$, ]/g,''));return Number.isFinite(n)?n:null}return null}
function walk(x,fn,depth=0,seen=new Set()){if(depth>7||x==null)return;if(typeof x!=='object')return;if(seen.has(x))return;seen.add(x);fn(x);if(Array.isArray(x)){for(const v of x.slice(0,300))walk(v,fn,depth+1,seen)}else{for(const v of Object.values(x))walk(v,fn,depth+1,seen)}}
function keyScore(k,terms){k=k.toLowerCase();return terms.some(t=>k.includes(t))}
function extract(records,visible){
 let cash=null, aircraft=null, routes=null, hubs=null;
 const candidates={cash:[],aircraft:[],routes:[],hubs:[]};
 const consider=(k,v)=>{
   const n=num(v);
   if(n==null)return;
   if(keyScore(k,['cash','balance','money','account','credits','funds']) && n>1000)candidates.cash.push(n);
   if(keyScore(k,['aircraftcount','fleetcount','planecount','aircraft_count','fleet_count']))candidates.aircraft.push(n);
   if(keyScore(k,['routecount','routescount','route_count']))candidates.routes.push(n);
   if(keyScore(k,['hubcount','hubs_count','hub_count']))candidates.hubs.push(n);
 };
 for(const r of records){
   let o;try{o=JSON.parse(r.body)}catch{o=null}
   if(!o)continue;
   walk(o,node=>{
     if(Array.isArray(node)){
       const parentHint=JSON.stringify(node.slice(0,2)).toLowerCase();
       if(node.length>2){
         if(r.category==='fleet')candidates.aircraft.push(node.length);
         if(r.category==='routes')candidates.routes.push(node.length);
         if(r.category==='hubs')candidates.hubs.push(node.length);
       }
       return;
     }
     for(const [k,v] of Object.entries(node))consider(k,v);
   });
 }
 const text=String(visible||'');
 const moneyMatches=[...text.matchAll(/(?:\$|cash|balance|account)[^\d]{0,30}([\d,]{4,})/gi)].map(m=>num(m[1])).filter(Boolean);
 if(moneyMatches.length)candidates.cash.push(...moneyMatches);
 const pick=a=>a.length?Math.max(...a):null;
 cash=pick(candidates.cash); aircraft=pick(candidates.aircraft); routes=pick(candidates.routes); hubs=pick(candidates.hubs);
 return {cash,aircraft,routes,hubs,candidates};
}
async function run(){
 const d=await chrome.storage.local.get({records:[],lastCapture:0,visibleState:null});
 const r=d.records||[], v=d.visibleState?.text||'';
 const age=d.lastCapture?Math.floor((Date.now()-d.lastCapture)/1000):null;
 document.querySelector('#status').innerHTML=age==null?'<span class="warn">● No capture yet</span>':age<60?'<span class="ok">● Live capture · '+age+'s ago</span>':'<span class="warn">● Last capture '+age+'s ago</span>';
 const x=extract(r,v);
 const money=x.cash==null?'—':'$'+x.cash.toLocaleString('en-US',{maximumFractionDigits:0});
 document.querySelector('#stats').innerHTML='<span class="metric"><b>'+money+'</b><br><small>cash</small></span><span class="metric"><b>'+(x.aircraft??'—')+'</b><br><small>aircraft candidate</small></span><span class="metric"><b>'+(x.routes??'—')+'</b><br><small>route candidate</small></span><span class="metric"><b>'+(x.hubs??'—')+'</b><br><small>hub candidate</small></span>';
 document.querySelector('#cats').innerHTML=Object.entries(r.reduce((a,z)=>(a[z.category]=(a[z.category]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]).map(([k,n])=>k+': '+n).join(' · ')||'None';
 document.querySelector('#next').innerHTML=r.length?'<span class="ok">Capture is working.</span><br>We are now mapping the captured AM4 payloads into real fleet/route/hub/finance state.':'Open/reload AM4 after installing the extension.';
}
document.querySelector('#refresh').onclick=run;
document.querySelector('#clear').onclick=async()=>{await chrome.runtime.sendMessage({type:'AM4_CLEAR'});run()};
document.querySelector('#diagnostic').onclick=async()=>{
 const d=await chrome.storage.local.get({records:[],visibleState:null});
 const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),records:d.records||[],visibleState:d.visibleState||null},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='am4_diagnostic_snapshot.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
run();
