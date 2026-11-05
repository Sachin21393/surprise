import {escapeHTML, validateBook, classifyGesture} from './core.js';
import {loadContent,draftRevision} from './content.js';
import {setupPwa} from './pwa.js';
async function init(){
 const params=new URL(location.href).searchParams;
 const mode=params.has('published')?'published':params.has('draft')?'draft':'';
 const content=await loadContent({mode});
 const openedRevision=draftRevision();
 if(mode!=='published'){
  const refresh=()=>{if(draftRevision()!==openedRevision)location.reload();};
  window.addEventListener('storage',event=>{if(event.key==='neemisha-draft-revision')refresh();});
  window.addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
 }
 const root=document.getElementById('birthday-drama'), q=s=>root.querySelector(s), book=q('.book'), stage=q('.stage');
 let page=0,drag=null,busy=false,sheet=null,closing=null,voice=null,utterance=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const total=content.memories.length;
 q('.cover .fine:last-of-type').textContent='Happy Birthday '+content.recipient;
 document.title='Happy Birthday '+content.recipient;
 const recording=content.voice?new Audio(content.voice):null;
 if(recording)recording.preload='auto';
 const paw='<span class="paw" aria-hidden="true"><i class="toe"></i><i class="toe"></i><i class="toe"></i><i class="toe"></i><i class="pad"></i></span>';
 function paper(n,side){const data=content.memories[n-1], el=document.createElement('section');el.className='paper '+(side==='left'?'left':'right photo-page');const folio='<div class="folio" aria-label="Page '+(side==='left'?n*2-1:n*2)+'">'+paw+'<span>'+String(side==='left'?n*2-1:n*2).padStart(3,'0')+'</span></div>';
  if(side==='left')el.innerHTML='<span class="chapter">A LITTLE BIRTHDAY LETTER</span><h2>'+escapeHTML(data.title)+'</h2><p class="lines">'+data.lines.map(line=>'<span>'+escapeHTML(line)+'</span>').join('')+'</p><div class="signature">With all my heart, always.</div>'+folio;
  else el.innerHTML='<span class="ribbon" aria-hidden="true"></span><div class="polaroid"><img class="photo-real" src="'+escapeHTML(data.photo)+'" alt="'+escapeHTML(data.caption||data.title)+'" draggable="false" decoding="async"><p class="caption">'+escapeHTML(data.caption)+'</p></div>'+folio;

  return el;
 }
 function base(n){book.querySelectorAll(':scope > .paper').forEach(el=>el.remove());if(n>0&&n<=total){book.prepend(paper(n,'left'),paper(n,'right'))}}
 function announce(){q('#announce').textContent=page===0?'Book cover':page===(total+1)?'The end':'Pages '+(page*2-1)+' and '+(page*2);}
 function render(){q('.cover').hidden=page!==0;book.hidden=page===0||page===(total+1);q('.ending').hidden=page!==(total+1);base(page);announce()}
 function unlockSound(){
  if(recording)return true;
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){q('#voice-status').textContent='Voice unavailable on this device';return false;}
  const voices=window.speechSynthesis.getVoices();
  const english=voices.filter(v=>/^en(?:-|$)/i.test(v.lang));
  voice=english.find(v=>v.localService&&/samantha|karen|serena|natural/i.test(v.name))||english.find(v=>v.localService)||english[0]||null;
  return true;
 }
 function sayLove(){
  if(recording){
   recording.pause();recording.currentTime=0;
   recording.play().catch(()=>{q('#voice-status').textContent='Tap the cover again to enable your recording.';});
   return;
  }
  if(!unlockSound())return;
  try{
   const synth=window.speechSynthesis;
   synth.cancel();
   utterance=new window.SpeechSynthesisUtterance('I love you.');
   utterance.lang=voice?voice.lang:'en-US';
   if(voice)utterance.voice=voice;
   utterance.rate=.82;utterance.pitch=1.05;utterance.volume=.7;
   utterance.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')q('#voice-status').textContent='Voice unavailable on this device';};
   synth.speak(utterance);
  }catch(e){q('#voice-status').textContent='Voice unavailable on this device';}
 }
 function makeSheet(dir){const to=page+dir;sheet=document.createElement('div');sheet.className='sheet';sheet.style.left=dir>0?'50%':'0';sheet.style.transformOrigin=dir>0?'left center':'right center';const front=document.createElement('div'),back=document.createElement('div');front.className='face front';back.className='face back';front.append(paper(page,dir>0?'right':'left'));back.append(paper(to,dir>0?'left':'right'));const shade=document.createElement('div');shade.className='shade';front.append(shade);back.append(shade.cloneNode());sheet.append(front,back);base(to);const old=book.querySelector(dir>0?':scope > .left':':scope > .right');old.replaceWith(paper(page,dir>0?'left':'right'));book.append(sheet);return sheet}
 function position(p,dir){
  if(!sheet)return;
  const progress=Math.max(0,Math.min(1,p));
  sheet.style.transform='rotateY('+(progress*180*(dir>0?-1:1))+'deg)';
  // A filter on this preserve-3d element flattens its two faces.
  // Keep the shadow in the separate cast-shadow layer instead.
  sheet.querySelector('.front').style.visibility=progress<.5?'visible':'hidden';
  sheet.querySelector('.back').style.visibility=progress>=.5?'visible':'hidden';
  sheet.querySelectorAll('.shade').forEach(el=>el.style.opacity=.7*Math.sin(progress*Math.PI));
  q('.cast-shadow').style.opacity=.6*Math.sin(progress*Math.PI);
 }
 function settle(dir,from,commit,after){busy=true;const end=commit?1:0;if(commit)sayLove();if(reduced()){if(sheet)sheet.remove();sheet=null;q('.cast-shadow').style.opacity=0;if(commit)page+=dir;render();busy=false;if(after)after();return}const start=performance.now(),duration=Math.max(220,700*Math.abs(end-from));function frame(now){const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3);position(from+(end-from)*ease,dir);if(t<1)requestAnimationFrame(frame);else{sheet.remove();sheet=null;q('.cast-shadow').style.opacity=0;if(commit)page+=dir;render();busy=false;if(after)after()}}requestAnimationFrame(frame)}
 function go(dir){if(busy||drag||page+dir<0||page+dir>(total+1))return;unlockSound();if(page===0||page===(total+1)||page+dir===0||page+dir===(total+1)){busy=true;sayLove();if(page===0&&dir===1&&!reduced()){book.hidden=false;base(1);q('.cover').style.zIndex=15;const a=q('.cover').animate([{transform:'rotateY(0deg)'},{transform:'rotateY(-165deg)'}],{duration:850,easing:'cubic-bezier(.3,.05,.25,1)'});a.onfinish=()=>{page=1;render();q('.cover').style.zIndex='';busy=false};a.oncancel=()=>{render();busy=false}}else{page+=dir;render();busy=false}return}makeSheet(dir);settle(dir,0,true)}
 stage.addEventListener('pointerdown',e=>{if(busy||e.button!==0||e.target.closest('button'))return;unlockSound();drag={x:e.clientX,y:e.clientY,dir:0,p:0,id:e.pointerId};stage.setPointerCapture(e.pointerId)});
 function beginClosing(){
  if(closing)return;
  closing=document.createElement('div');closing.className='closing';
  const n=Math.min(page,total);
  closing.append(paper(n,'right'));
  const leaf=document.createElement('div');leaf.className='closing-leaf';
  const front=document.createElement('div'),back=document.createElement('div');
  front.className='face front';back.className='face back';front.append(paper(n,'left'));
  const cover=q('.cover').cloneNode(true);cover.hidden=false;
  cover.removeAttribute('aria-label');
  cover.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  cover.querySelector('button').style.visibility='hidden';
  back.append(cover);leaf.append(front,back);closing.append(leaf);stage.append(closing);
  book.style.visibility='hidden';q('.ending').style.visibility='hidden';
  positionClosing(0);
 }
 function positionClosing(p){
  if(!closing)return;
  const progress=Math.max(0,Math.min(1,p));
  closing.style.transform='translateX('+(-25*progress)+'%)';
  const leaf=closing.querySelector('.closing-leaf');
  leaf.style.transform='rotateY('+(180*progress)+'deg)';
  leaf.querySelector('.front').style.visibility=progress<.5?'visible':'hidden';
  leaf.querySelector('.back').style.visibility=progress>=.5?'visible':'hidden';
 }
 function finishClosing(from,commit,after){
  busy=true;if(commit)sayLove();
  const target=commit?1:0,start=performance.now();
  const duration=reduced()?0:Math.max(180,650*Math.abs(target-from));
  function finish(){
   // Keep the final frame until the original cover has been laid out.
   if(commit)page=0;
   render();book.style.visibility='';q('.ending').style.visibility='';
   closing.remove();closing=null;busy=false;
   if(after)after();
  }
  if(!duration){finish();return;}
  function frame(now){
   const t=Math.min(1,(now-start)/duration);
   const ease=1-Math.pow(1-t,3);
   positionClosing(from+(target-from)*ease);
   if(t<1)requestAnimationFrame(frame);else finish();
  }
  requestAnimationFrame(frame);
 }
 stage.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.dir){
   if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy))return;
   const dir=dx<0?1:-1;
   if(page+dir<0||page+dir>(total+1))return;
   drag.dir=dir;
   if(page>0&&page<(total+1)&&page+dir>0&&page+dir<(total+1))makeSheet(dir);
  }
  if(sheet){
   drag.p=Math.max(0,Math.min(.98,(drag.dir>0?-dx:dx)/(stage.clientWidth*.62)));
   position(drag.p,drag.dir);
  }
 });
 function isClosingSwipe(dx,dy,width){return classifyGesture(dx,dy,width)==='close';}
 function release(e,cancel){
  if(!drag||e.pointerId!==drag.id)return;
  const d=drag;drag=null;
  if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
  const dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!cancel&&page>0&&isClosingSwipe(dx,dy,stage.clientWidth)){
   const close=()=>{beginClosing();finishClosing(0,true);};
   // Finish the held page movement before folding the cover, without a reset.
   if(sheet)settle(d.dir,d.p,true,close);else close();
   return;
  }
  const commit=!cancel&&d.dir&&(d.dir>0?-dx:dx)>Math.min(65,stage.clientWidth*.1);
  if(sheet)settle(d.dir,d.p,commit);else if(commit)go(d.dir);
 }
 stage.addEventListener('pointerup',e=>release(e,false));stage.addEventListener('pointercancel',e=>release(e,true));stage.addEventListener('lostpointercapture',e=>{if(drag)release(e,true)});
 q('#open').onclick=()=>go(1);root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(e.key==='ArrowRight'?1:-1)}});
 q('#landscape').onclick=async()=>{unlockSound();try{if(!document.fullscreenElement&&root.requestFullscreen)await root.requestFullscreen();if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape');else throw Error('unsupported')}catch(e){q('#rotation-note').textContent='Please rotate your phone sideways. If it stays upright, turn off your phone’s rotation lock.'}};
 render();
 stage.addEventListener('contextmenu',e=>e.preventDefault());
 async function requestLandscape(){
  if(matchMedia('(pointer: coarse)').matches&&screen.orientation?.lock){try{await screen.orientation.lock('landscape');}catch{}}
 }
 q('#open').addEventListener('click',requestLandscape);
 requestLandscape();
 const urls=content.memories.map(m=>m.photo).concat(content.voice?[content.voice]:[]).filter(url=>!url.startsWith('blob:'));
 setupPwa(urls);
 // Warm only neighboring photos; the service worker handles offline storage.
 const originalAnnounce=announce;
 announce=function(){originalAnnounce();for(const n of [page,page+1]){if(content.memories[n]){const image=new Image();image.src=content.memories[n].photo;}}};

}
init().catch(error=>{document.querySelector(".desk").hidden=true;const target=document.getElementById("load-error");target.hidden=false;target.textContent="Could not open the book: "+error.message;});
