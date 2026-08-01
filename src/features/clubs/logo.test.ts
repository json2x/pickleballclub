import { describe, expect, it } from 'vitest';

import {
  CLUB_LOGO_MAX_BYTES,
  getClubLogoExtension,
  hasValidClubLogoSignature,
  validateClubLogo,
} from './logo';

describe('club logo helpers', () => {
  it.each([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
  ] as const)('maps exact MIME %s to extension %s', (mimeType, extension) => {
    expect(getClubLogoExtension(mimeType)).toBe(extension);
  });

  it.each(['image/svg+xml', 'image/JPEG', 'application/octet-stream', ''])('rejects MIME %s', (mimeType) => {
    expect(getClubLogoExtension(mimeType)).toBeNull();
  });

  it('treats a missing or zero-byte file as omitted', () => {
    expect(validateClubLogo(null)).toEqual({ success: true, file: null, extension: null });
    expect(validateClubLogo(new File([], 'ignored.svg', { type: 'image/svg+xml' }))).toEqual({
      success: true,
      file: null,
      extension: null,
    });
  });

  it('accepts a supported file at the size limit', () => {
    const file = new File([new Uint8Array(CLUB_LOGO_MAX_BYTES)], 'not-persisted.png', {
      type: 'image/png',
    });

    expect(validateClubLogo(file)).toEqual({ success: true, file, extension: 'png' });
  });

  it('rejects unsupported file types', () => {
    expect(validateClubLogo(new File(['svg'], 'logo.svg', { type: 'image/svg+xml' }))).toEqual({
      success: false,
      message: 'Choose a JPEG, PNG, or WebP image.',
    });
  });

  it('rejects files over 5 MiB', () => {
    const file = new File([new Uint8Array(CLUB_LOGO_MAX_BYTES + 1)], 'too-large.webp', {
      type: 'image/webp',
    });

    expect(validateClubLogo(file)).toEqual({
      success: false,
      message: 'Logo must be 5 MiB or smaller.',
    });
  });

  it('rejects non-file form values', () => {
    expect(validateClubLogo('not-a-file')).toEqual({
      success: false,
      message: 'Choose a JPEG, PNG, or WebP image.',
    });
  });

  it.each([
    ['image/jpeg', 'jpg', [0xff, 0xd8, 0xff]],
    ['image/png', 'png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    [
      'image/webp',
      'webp',
      [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
    ],
  ] as const)('accepts a valid minimal %s signature', async (mimeType, extension, signature) => {
    const file = new File([new Uint8Array(signature)], 'ignored', { type: mimeType });

    expect(await hasValidClubLogoSignature(file, extension)).toBe(true);
  });

  it.each([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
  ] as const)('rejects spoofed content labeled %s', async (mimeType, extension) => {
    const file = new File(['not an image'], 'ignored', { type: mimeType });

    expect(await hasValidClubLogoSignature(file, extension)).toBe(false);
  });

  it('rejects a valid signature when it does not match the MIME-derived extension', async () => {
    const pngSignature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const spoofedJpeg = new File([pngSignature], 'ignored', { type: 'image/jpeg' });

    expect(await hasValidClubLogoSignature(spoofedJpeg, 'jpg')).toBe(false);
  });
});
