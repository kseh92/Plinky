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

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isLikelyMatch = (trackTitle: string, trackArtist: string, oembedTitle: string, oembedAuthor: string) => {
  const tTitle = normalizeText(trackTitle);
  const tArtist = normalizeText(trackArtist);
  const oTitle = normalizeText(oembedTitle);
  const oAuthor = normalizeText(oembedAuthor);
  if (!tTitle || !tArtist || !oTitle || !oAuthor) return false;
  const titleMatch = oTitle.includes(tTitle) || tTitle.includes(oTitle);
  const artistMatch = oAuthor.includes(tArtist) || tArtist.includes(oAuthor);
  return titleMatch && artistMatch;
};

const buildYouTubeMusicSearchUrl = (title: string, artist: string) => {
  const query = `${title} ${artist}`.trim();
  return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
};

type OEmbedResult = { ok: boolean; title?: string; author?: string };

const checkOEmbed = async (videoId: string): Promise<OEmbedResult> => {
  if (!videoId) return { ok: false };
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const resp = await fetch(oembedUrl, { signal: controller.signal });
    if (!resp.ok) return { ok: false };
    const data = await resp.json();
    return { ok: true, title: data?.title, author: data?.author_name };
  } catch {
    return { ok: false };
  } finally {
    window.clearTimeout(timer);
  }
};

export async function filterPlayableTracks(tracks: RecommendedTrack[]): Promise<RecommendedTrack[]> {
  if (!tracks.length) return tracks;

  const results = await Promise.all(
    tracks.map(async (track) => {
      const id = parseVideoId(track.youtubeMusicUrl);
      const oembed = await checkOEmbed(id);
      const matches = oembed.ok && !!oembed.title && !!oembed.author
        ? isLikelyMatch(track.title, track.artist, oembed.title, oembed.author)
        : false;
      const safeUrl = matches ? track.youtubeMusicUrl : buildYouTubeMusicSearchUrl(track.title, track.artist);
      return { track: { ...track, youtubeMusicUrl: safeUrl }, ok: matches };
    })
  );

  const playable = results.filter((r) => r.ok).map((r) => r.track);
  if (playable.length >= 3) return playable.slice(0, 3);

  const fallback = tracks.slice(0, 3);
  return playable.length ? [...playable, ...fallback.slice(playable.length)] : fallback;
}
