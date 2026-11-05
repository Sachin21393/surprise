// Refresh the service worker before importing app modules, including after upgrading an older book.
const app=document.querySelector('script[data-app]')?.dataset.app;
if(!['reader','admin'].includes(app))throw Error('Unknown notebook screen.');
if('serviceWorker' in navigator){
 const controlled=Boolean(navigator.serviceWorker.controller);
 let reloading=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled&&!reloading){reloading=true;location.reload();}});
 try{
  const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  await registration.update();
  const worker=registration.installing;
  if(worker&&worker.state!=='activated'&&worker.state!=='redundant'){
   await new Promise(resolve=>{
    const timer=setTimeout(resolve,12000);
    worker.addEventListener('statechange',()=>{if(worker.state==='activated'||worker.state==='redundant'){clearTimeout(timer);resolve();}});
   });
  }
 }catch(error){console.warn('Continuing with the locally available app:',error);}
}
await import('./'+app+'.js');
