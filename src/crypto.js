const LOCK_PREFIX = 'locked:v1:';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (base64) => new Uint8Array(atob(base64).split('').map((c) => c.charCodeAt(0)));

export const isNoteLocked = (note) => typeof note?.content === 'string' && note.content.startsWith(LOCK_PREFIX);

export const deriveEncryptionKey = async (password, salt) => {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 120000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptNoteContent = async (plainText, password) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(password, salt);
  const cipherBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plainText));
  const payload = { v: 1, salt: toBase64(salt), iv: toBase64(iv), cipher: toBase64(new Uint8Array(cipherBuffer)) };
  return `${LOCK_PREFIX}${toBase64(encoder.encode(JSON.stringify(payload)))}`;
};

export const decryptNoteContent = async (encryptedContent, password) => {
  if (!encryptedContent.startsWith(LOCK_PREFIX)) return encryptedContent;
  const rawPayload = encryptedContent.slice(LOCK_PREFIX.length);
  const payload = JSON.parse(decoder.decode(fromBase64(rawPayload)));
  const key = await deriveEncryptionKey(password, fromBase64(payload.salt));
  const plainBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(payload.iv) }, key, fromBase64(payload.cipher));
  return decoder.decode(plainBuffer);
};