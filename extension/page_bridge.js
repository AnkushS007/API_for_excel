(()=>{
  const emit=r=>{try{window.postMessage({source:'AM4_RGA',type:'NETWORK',record:r},'*')}catch{}};
  const groups={fleet:['fleet','aircraft'],routes:['route','demand'],hubs:['hub','airport'],finance:['finance','revenue','cost','transaction'],fuel:['fuel'],maintenance:['maintenance','check'],company:['company','dashboard'],research:['research'],staff:['staff','employee'],marketing:['marketing'],stock:['stock','share']};
  const classify=u=>{u=String(u||'').toLowerCase();for(const [k,a] of Object.entries(groups))if(a.some(x=>u.includes(x)))return k;return'other'};
  const interesting=(u,c)=>/api|ajax|graphql|fleet|route|hub|aircraft|finance|company|demand|airport|maintenance|fuel|research|staff|marketing|stock/i.test(String(u))||/json/i.test(String(c));
  const capture=(url,method,status,ct,getText)=>{try{if(!interesting(url,ct))return;Promise.resolve(getText()).then(body=>{if(body)emit({capturedAt:new Date().toISOString(),url:String(url),method:method||'GET',status:Number(status||0),contentType:String(ct||''),category:classify(url),body:String(body).slice(0,500000)})})}catch{}};
  const ofetch=window.fetch;window.fetch=async function(...a){const res=await ofetch.apply(this,a);try{const c=res.clone();capture(c.url,a[1]?.method||'GET',c.status,c.headers.get('content-type'),()=>c.text())}catch{}return res};
  const X=XMLHttpRequest,oo=X.prototype.open,ss=X.prototype.send;X.prototype.open=function(m,u,...z){this.__r={m,u};return oo.call(this,m,u,...z)};X.prototype.send=function(...a){this.addEventListener('load',function(){try{const u=this.responseURL||this.__r?.u||'',ct=this.getResponseHeader('content-type')||'';capture(u,this.__r?.m||'GET',this.status,ct,()=>this.responseText)}catch{}});return ss.apply(this,a)};
})();
