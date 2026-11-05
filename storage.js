const DB_NAME = 'neemisha-notebook-drafts-v1';
const EMPTY = {recipient:'Neemisha', order:[], voice:null};
let connection;
function open() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('memories', {keyPath:'id'});
      req.result.createObjectStore('settings');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return connection;
}
async function write(stores, operation) {
  const db = await open();
  return new Promise((resolve,reject) => {
    const tx = db.transaction(stores,'readwrite');
    operation(tx);
    tx.oncomplete=()=>{try{localStorage.setItem('neemisha-draft-revision',Date.now()+'-'+Math.random());}catch{}resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || Error('Save interrupted'));
  });
}
export async function loadDraft() {
  const db=await open();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(['settings','memories'],'readonly');
    const settings=tx.objectStore('settings').get('book'), memories=tx.objectStore('memories').getAll();
    tx.oncomplete=()=>{
      const config=settings.result || {...EMPTY};
      const map=new Map(memories.result.map(m=>[m.id,m]));
      const order=[...new Set((config.order||[]).filter(id=>map.has(id)))];
      const seen=new Set(order);
      for(const id of map.keys())if(!seen.has(id)){order.push(id);seen.add(id);}
      resolve({...config,order,memories:order.map(id=>map.get(id))});
    };
    tx.onerror=()=>reject(tx.error);
  });
}
export function saveSettings(settings) {return write(['settings'],tx=>tx.objectStore('settings').put(settings,'book'));}
export function saveMemory(memory, settings) {return write(['memories','settings'],tx=>{tx.objectStore('memories').put(memory);tx.objectStore('settings').put(settings,'book');});}
export function deleteMemory(id, settings) {return write(['memories','settings'],tx=>{tx.objectStore('memories').delete(id);tx.objectStore('settings').put(settings,'book');});}
export function replaceDraft(project) {return write(['memories','settings'],tx=>{const store=tx.objectStore('memories');store.clear();project.memories.forEach(m=>store.put(m));const {memories,...settings}=project;tx.objectStore('settings').put(settings,'book');});}
