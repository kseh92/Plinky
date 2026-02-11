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

const parseThumbId = (url?: string | null) => {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (!u.hostname.includes('ytimg.com')) return '';
    const match = u.pathname.match(/\/vi\/([^/]+)/);
    return match?.[1] || '';
  } catch {
    return '';
  }
};

const extractVideoId = (track: RecommendedTrack) => {
  return parseVideoId(track.youtubeMusicUrl) || parseThumbId(track.coverImageUrl);
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

const buildYouTubeMusicWatchUrl = (videoId: string) => {
  return `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
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
      const id = extractVideoId(track);
      const oembed = await checkOEmbed(id);
      const hasMeta = oembed.ok && !!oembed.title && !!oembed.author;
      const matches = hasMeta ? isLikelyMatch(track.title, track.artist, oembed.title, oembed.author) : null;
      const safeUrl = matches === false
        ? buildYouTubeMusicSearchUrl(track.title, track.artist)
        : (id ? buildYouTubeMusicWatchUrl(id) : track.youtubeMusicUrl);
      return { track: { ...track, youtubeMusicUrl: safeUrl, youtubeVideoId: id || track.youtubeVideoId }, ok: matches };
    })
  );

  const playable = results.filter((r) => r.ok !== false).map((r) => r.track);
  const combined = playable.length ? playable : tracks;

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const seen = new Set<string>();
  const deduped = combined.filter((track) => {
    const key = `${normalize(track.title)}::${normalize(track.artist)}`;
    if (!key.replace(/[:\s]/g, '').length) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.slice(0, 3);
}
