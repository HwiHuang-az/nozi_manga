import axios, { AxiosError } from 'axios';
import http from 'http';
import https from 'https';

const MANGADEX_API_URL = 'https://api.mangadex.org';

const api = axios.create({
  baseURL: MANGADEX_API_URL,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://mangadex.org/',
  },
  httpsAgent: new https.Agent({ 
    keepAlive: false, // Sometimes fresh connections are more stable for rate-limited APIs
    timeout: 30000 
  }),
});

// Retry helper with exponential backoff and jitter
const withRetry = async <T>(fn: () => Promise<T>, retries = 4, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const axiosError = error as AxiosError;
    const isRetryable =
      axiosError.code === 'ECONNRESET' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.code === 'ECONNABORTED' ||
      (axiosError.response?.status && (axiosError.response.status >= 500 || axiosError.response.status === 429));

    if (retries > 0 && isRetryable) {
      const actualDelay = delay + Math.random() * 500; // Add jitter
      console.log(`[Retry] ${retries} left. Error: ${axiosError.code}. Retrying in ${Math.round(actualDelay)}ms...`);
      await new Promise(res => setTimeout(res, actualDelay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

export const searchManga = async (title: string) => {
  return withRetry(() =>
    api.get('/manga', {
      params: {
        title,
        includes: ['cover_art', 'author', 'artist'],
        limit: 20,
      },
    }).then(r => r.data)
  );
};

export const getManga = async (mangaId: string) => {
  return withRetry(() =>
    api.get(`/manga/${mangaId}`, {
      params: {
        includes: ['cover_art', 'author', 'artist'],
      },
    }).then(r => r.data)
  );
};

export const getMangaChapters = async (mangaId: string, translatedLanguage: string[] = ['vi', 'en']) => {
  return withRetry(() =>
    api.get(`/manga/${mangaId}/feed`, {
      params: {
        translatedLanguage,
        order: { chapter: 'desc' },
        limit: 100,
      },
    }).then(r => r.data)
  );
};

export const getChapterImages = async (chapterId: string) => {
  return withRetry(() =>
    api.get(`/at-home/server/${chapterId}`).then(r => r.data)
  );
};

export const getChapter = async (chapterId: string) => {
  return withRetry(() =>
    api.get(`/chapter/${chapterId}`, {
      params: {
        includes: ['manga']
      }
    }).then(r => r.data)
  );
};
