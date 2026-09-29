const MAX_RECORDS=2000;
const MAX_BODY=500000;
chrome.runtime.onMessage.addListener((m,s)=>{
  if(m?.type==='AM4_NETWORK'){
    chrome.storage.local.get({records:[]},d=>{
      const x={...m.record,body:String(m.record.body||'').slice(0,MAX_BODY)};
      chrome.storage.local.set({records:[...(d.records||[]),x].slice(-MAX_RECORDS),lastCapture:Date.now(),lastUrl:s.tab?.url||''});
    });
  }
  if(m?.type==='AM4_VISIBLE_STATE') chrome.storage.local.set({visibleState:{capturedAt:Date.now(),url:s.tab?.url||'',text:String(m.text||'').slice(0,250000)}});
  if(m?.type==='AM4_CLEAR') chrome.storage.local.clear();
});
