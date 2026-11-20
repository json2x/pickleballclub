import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const MEMBER_AVATAR_BUCKET = 'member-avatars';
export const MEMBER_AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2 MiB
export const MEMBER_AVATAR_SIGNED_URL_SECONDS = 300;

export type AvatarExtension = 'jpg' | 'png' | 'webp';

export function getAvatarExtension(mimeType: string): AvatarExtension | null {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return null;
}

export async function hasValidAvatarSignature(file: File, extension: AvatarExtension) {
  const bytesToRead = extension === 'jpg' ? 3 : extension === 'png' ? 8 : 12;
  const bytes = new Uint8Array(await file.slice(0, bytesToRead).arrayBuffer());

  if (extension === 'jpg') {
    return bytes.length === 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (extension === 'png') {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length === signature.length && signature.every((byte, index) => bytes[index] === byte);
  }

  return (
    bytes.length === 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export async function validateAvatarFile(file: File | null) {
  if (!file) {
    return { success: false as const, message: 'No file provided.' };
  }

  if (!(file instanceof File)) {
    return { success: false as const, message: 'Choose a JPEG, PNG, or WebP image.' };
  }

  const extension = getAvatarExtension(file.type);
  if (!extension) {
    return { success: false as const, message: 'Choose a JPEG, PNG, or WebP image.' };
  }

  if (file.size > MEMBER_AVATAR_MAX_SIZE) {
    return { success: false as const, message: 'Avatar must be 2 MiB or smaller.' };
  }

  const hasValidSignature = await hasValidAvatarSignature(file, extension);
  if (!hasValidSignature) {
    return { success: false as const, message: 'Choose a JPEG, PNG, or WebP image.' };
  }

  return { success: true as const, file, extension };
}

export function buildAvatarPath(clubId: string, userId: string, extension: AvatarExtension) {
  return `${clubId}/${userId}/${crypto.randomUUID()}.${extension}`;
}

export async function getSignedAvatarUrl(
  supabase: SupabaseClient<Database>,
  avatarPath: string | null,
) {
  if (!avatarPath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(MEMBER_AVATAR_BUCKET)
    .createSignedUrl(avatarPath, MEMBER_AVATAR_SIGNED_URL_SECONDS);

  return error || !data?.signedUrl ? null : data.signedUrl;
}
