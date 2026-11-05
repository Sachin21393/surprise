export const MAX_MEMORIES = 100;
export const MIN_LINES = 10;
export const MAX_LINES = 15;
export function parseLetter(text){return String(text).replace(/\r\n?/g,"\n").trim().split("\n").map(line=>line.trim());}
export function classifyGesture(dx, dy, width) {
  if (!(width > 0) || Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) < Math.min(65, width * .1)) return 'cancel';
  return dx < 0 ? 'next' : dx >= width * .75 ? 'close' : 'previous';
}
export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function validateMemory(memory, requirePhoto = true) {
  const errors = [];
  if (!memory.title?.trim() || memory.title.length > 24) errors.push('Title: use 1–24 characters.');
  if ((memory.caption || '').length > 48) errors.push('Caption: use at most 48 characters.');
  if (!Array.isArray(memory.lines) || (memory.lines.length < MIN_LINES || memory.lines.length > MAX_LINES)) errors.push('Write 10–15 lines in the letter box (press Enter for each new line).');
  else memory.lines.forEach((line, i) => {
    if (typeof line !== 'string' || !line.trim() || /[\r\n]/.test(line)) errors.push(`Line ${i+1}: write a nonempty line without an embedded line break.`);
  });
  if (requirePhoto && !memory.photo) errors.push('Add a photo.');
  return errors;
}
export function safeAsset(path) {
  return typeof path === 'string' && /^(?:assets|data)\/[a-zA-Z0-9_./-]+$/.test(path) && !path.split('/').includes('..');
}
export function validateBook(book) {
  if (book?.schema !== 1 || !Array.isArray(book.memories) || book.memories.length < 1 || book.memories.length > MAX_MEMORIES) throw Error('Book must contain 1–100 memories.');
  if (typeof book.recipient !== 'string' || !book.recipient.trim() || book.recipient.length > 30) throw Error('Recipient must contain 1–30 characters.');
  book.memories.forEach((m, i) => {
    const errors = validateMemory(m);
    if (!safeAsset(m.photo)) errors.push('Invalid photo path.');
    if (errors.length) throw Error(`Memory ${i+1}: ${errors.join(' ')}`);
  });
  if (book.voice && !safeAsset(book.voice)) throw Error('Invalid voice path.');
  return book;
}
