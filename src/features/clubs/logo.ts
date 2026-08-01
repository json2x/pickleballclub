export const CLUB_ASSET_BUCKET = 'club-assets';
export const CLUB_LOGO_MAX_BYTES = 5 * 1024 * 1024;
export const CLUB_LOGO_SIGNED_URL_SECONDS = 300;

export type ClubLogoExtension = 'jpg' | 'png' | 'webp';

type ClubLogoValidationResult =
  | { success: true; file: File | null; extension: ClubLogoExtension | null }
  | { success: false; message: string };

export function getClubLogoExtension(mimeType: string): ClubLogoExtension | null {
  if (mimeType === 'image/jpeg') {
    return 'jpg';
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return null;
}

export function validateClubLogo(value: FormDataEntryValue | null): ClubLogoValidationResult {
  if (value === null) {
    return { success: true, file: null, extension: null };
  }

  if (!(value instanceof File)) {
    return { success: false, message: 'Choose a JPEG, PNG, or WebP image.' };
  }

  if (value.size === 0) {
    return { success: true, file: null, extension: null };
  }

  const extension = getClubLogoExtension(value.type);

  if (!extension) {
    return { success: false, message: 'Choose a JPEG, PNG, or WebP image.' };
  }

  if (value.size > CLUB_LOGO_MAX_BYTES) {
    return { success: false, message: 'Logo must be 5 MiB or smaller.' };
  }

  return { success: true, file: value, extension };
}

export async function hasValidClubLogoSignature(file: File, extension: ClubLogoExtension) {
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

export function createClubLogoPath(clubId: string, extension: ClubLogoExtension) {
  return `${clubId}/logo/${crypto.randomUUID()}.${extension}`;
}
