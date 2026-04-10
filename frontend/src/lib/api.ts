const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const searchManga = async (title: string) => {
  const response = await fetch(`${API_BASE_URL}/mangas/search?title=${encodeURIComponent(title)}`);
  if (!response.ok) throw new Error('Failed to search manga');
  return response.json();
};

// Resolve slug → manga details (stored in DB, fallback to MangaDex search)
export const getMangaBySlug = async (slug: string) => {
  const response = await fetch(`${API_BASE_URL}/mangas/slug/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error(`No manga found for slug: ${slug}`);
  return response.json();
};

export const getManga = async (mangaId: string) => {
  const response = await fetch(`${API_BASE_URL}/mangas/${mangaId}`);
  if (!response.ok) throw new Error('Failed to get manga details');
  return response.json();
};

export const getMangaChapters = async (mangaId: string) => {
  const response = await fetch(`${API_BASE_URL}/mangas/${mangaId}/chapters`);
  if (!response.ok) throw new Error('Failed to get chapters');
  return response.json();
};

// Retry helper for frontend
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const getChapterImages = async (chapterId: string) => {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/mangas/chapters/${chapterId}/images`);
    if (!response.ok) throw new Error('Failed to get images');
    return response.json();
  });
};

export const getChapter = async (chapterId: string) => {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/mangas/chapters/${chapterId}`);
    if (!response.ok) throw new Error('Failed to get chapter metadata');
    return response.json();
  });
};

export const getCoverUrl = (manga: any) => {
  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  if (!coverRel || !coverRel.attributes) return 'https://placehold.co/400x600?text=No+Cover';
  const fileName = coverRel.attributes.fileName;
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`;
};

export const getAuthor = (manga: any) => {
  const authorRel = manga.relationships.find((rel: any) => rel.type === 'author');
  return authorRel?.attributes?.name || 'Unknown Author';
};
