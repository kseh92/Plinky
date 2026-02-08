import { RecommendedTrack } from '../types_V2';

const parseVideoId = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.replace('/', '');
    const v = u.searchParams.get('v');
    if (v) return v;
    return '';
  } catch {
    return '';
  }
};

const checkOEmbed = async (videoId: string) => {
  if (!videoId) return false;
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const resp = await fetch(oembedUrl, { signal: controller.signal });
    return resp.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
};

export async function filterPlayableTracks(tracks: RecommendedTrack[]): Promise<RecommendedTrack[]> {
  if (!tracks.length) return tracks;

  const results = await Promise.all(
    tracks.map(async (track) => {
      const id = parseVideoId(track.youtubeMusicUrl);
      const ok = await checkOEmbed(id);
      return { track, ok };
    })
  );

  const playable = results.filter((r) => r.ok).map((r) => r.track);
  if (playable.length >= 3) return playable.slice(0, 3);

  const fallback = tracks.slice(0, 3);
  return playable.length ? [...playable, ...fallback.slice(playable.length)] : fallback;
}
