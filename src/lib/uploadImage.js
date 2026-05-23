import { supabase } from '../supabaseClient';

/** Upload file to public `images` bucket; returns public URL or null if unavailable. */
export async function uploadImageToStorage(file, folder = 'inline') {
  if (!supabase || !file) return null;

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, { upsert: false, contentType: file.type || undefined });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
