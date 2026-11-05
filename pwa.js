export async function setupPwa(media=[]) {
 const install=document.getElementById('install'),dialog=document.getElementById('install-help');
 let prompt;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;});
 if(install)install.onclick=async()=>{if(prompt){await prompt.prompt();prompt=null;}else dialog?.showModal();};
 document.getElementById('dismiss-install')?.addEventListener('click',()=>dialog.close());
 if(matchMedia('(display-mode: standalone)').matches&&install)install.hidden=true;
 if(!('serviceWorker' in navigator))return;
 try{
  await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  const registration=await navigator.serviceWorker.ready;
  const urls=media.map(path=>new URL(path,location.href).href);
  (navigator.serviceWorker.controller||registration.active)?.postMessage({type:'CACHE_BOOK',urls});
  navigator.serviceWorker.addEventListener('message',event=>{
   if(event.data?.type==='OFFLINE_ERROR'){
    const status=document.getElementById('voice-status')||document.getElementById('status');
    if(status)status.textContent='Some photos are not saved offline yet. Keep this page open online and reopen it to retry.';
   }
   if(event.data?.type==='OFFLINE_READY'){
    const info=document.getElementById('install-instructions');
    if(info&&!info.dataset.ready){info.dataset.ready='true';info.textContent+=' Your book is saved for offline reading on this device.';}
   }
  });
 }catch(error){console.warn('Offline setup unavailable:',error);}
}
