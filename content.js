import {validateBook,validateMemory} from './core.js';
import {loadDraft} from './storage.js';
// Prefer saved local memories on the editor's device. Other visitors read published content.
export async function loadContent({mode='',readDraft=loadDraft,readPublished=async()=>{
 const response=await fetch('./data/book.json',{cache:'no-cache'});
 if(!response.ok)throw Error('Book data is missing.');
 return validateBook(await response.json());
},objectURL=blob=>URL.createObjectURL(blob)}={}){
 if(mode!=='published'){
  let draft;
  try{draft=await readDraft();}catch(error){if(mode==='draft')throw Error('Cannot open the saved draft in this browser. '+error.message);}
  const memories=(draft?.memories||[]).filter(memory=>validateMemory(memory).length===0&&memory.photo instanceof Blob);
  if(memories.length)return{recipient:draft.recipient,voice:draft.voice?objectURL(draft.voice):null,memories:memories.map(memory=>({...memory,photo:objectURL(memory.photo)}))};
  if(mode==='draft')throw Error('No saved memories are ready yet. Add a photo and 10–15 lines in admin.html, then click Save memory.');
 }
 return readPublished();
}
export function draftRevision(){try{return localStorage.getItem('neemisha-draft-revision')||'';}catch{return '';}}
