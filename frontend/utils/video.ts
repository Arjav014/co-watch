const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.m3u8'];

export function isSupportedDirectVideoUrl(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return false;
  }

  try {
    const url = new URL(trimmedValue);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    const pathname = url.pathname.toLowerCase();
    return DIRECT_VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(extension));
  } catch {
    return false;
  }
}

export function getSupportedVideoMessage() {
  return 'Use a direct MP4 or HLS (.m3u8) URL. YouTube, Twitch, and Vimeo are not supported yet.';
}
