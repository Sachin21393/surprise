const BUILD='mw3hf39c';
const BASE=new URL('./',self.location.href);
const PREFIX='neemisha:'+BASE.pathname+':';
const CACHE=PREFIX+BUILD;
const SHELL=['./','index.html','admin.html','book.css','admin.css','boot.js','reader.js','admin.js','core.js','content.js','storage.js','zip.js','pwa.js','manifest.webmanifest','resources.json','data/book.json','assets/sample.svg','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL.map(path=>new URL(path,BASE).href));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=new URL(event.request.url);key.search='';
  // Draft query strings must never become a different published data cache.
  const fresh=event.request.mode==='navigate'||url.pathname.endsWith('/book.json')||url.pathname.endsWith('/resources.json');
  if(!fresh){const hit=await cache.match(key.href);if(hit)return hit;}
  try{const response=await fetch(event.request);if(response.ok)await cache.put(key.href,response.clone());return response;}
  catch(error){return(await cache.match(key.href))||Response.error();}
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_BOOK'||!Array.isArray(event.data.urls))return;
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);let failed=false;
  for(const path of event.data.urls.slice(0,101)){
   const url=new URL(path,BASE);
   if(url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))continue;
   try{if(!(await cache.match(url.href)))await cache.add(url.href);}catch{failed=true;}
  }
  event.source?.postMessage({type:failed?'OFFLINE_ERROR':'OFFLINE_READY'});
 })());
});
