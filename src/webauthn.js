export async function isWebAuthnAvailable() {
  return window.PublicKeyCredential !== undefined;
}

export async function registerBiometric() {
  if (!(await isWebAuthnAvailable())) {
    throw new Error('WebAuthn not available on this device');
  }
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Kitab Notes' },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: 'kitab-user',
        displayName: 'Kitab User',
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  });
  localStorage.setItem('webauthn_credential', JSON.stringify({ id: cred.id, type: cred.type }));
  return true;
}

export async function authenticateBiometric() {
  if (!(await isWebAuthnAvailable())) {
    throw new Error('WebAuthn not available on this device');
  }
  const stored = JSON.parse(localStorage.getItem('webauthn_credential') || 'null');
  if (!stored) {
    throw new Error('No biometric credential registered');
  }
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: stored.id ? [{ id: Uint8Array.from(atob(stored.id), c => c.charCodeAt(0)), type: stored.type }] : [],
      userVerification: 'required',
      timeout: 60000,
    },
  });
  return !!cred;
}
