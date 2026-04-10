import { Router, Request, Response } from 'express';
import { searchManga, getMangaChapters, getChapterImages, getManga } from '../services/mangaDexApi';
import { getOrCreateMangaBySlug, getOrCreateSlugById, generateSlug } from '../services/slugService';

const router = Router();

// GET /api/mangas/search?title=...
// Also returns slugs for each result
router.get('/search', async (req: Request, res: Response) => {
  try {
    const title = req.query.title as string;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const data = await searchManga(title);

    // Persist search results to our DB and generate slugs
    if (data.data && data.data.length > 0) {
      await Promise.allSettled(data.data.map(async (manga: any) => {
        const enTitle = manga.attributes.title.en || manga.attributes.title.ja || '';
        if (enTitle) {
          // This also saves the manga metadata to our DB
          manga.slug = await getOrCreateSlugById(manga.id, enTitle);
          
          // Optionally update other metadata if needed
          await prisma.manga.update({
            where: { id: manga.id },
            data: {
              title: enTitle,
              description: manga.attributes.description?.en || '',
              coverUrl: '', // Will be handled by helper if needed, but we keep it simple for now
            }
          }).catch(() => {}); // Ignore update errors for now
        } else {
          manga.slug = generateSlug(manga.id.slice(0, 8));
        }
      }));
    }

    res.json(data);
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ error: 'Failed to search manga' });
  }
});

// GET /api/mangas/slug/:slug
// Resolve a slug to manga data
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const data = await getOrCreateMangaBySlug(slug);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Manga not found for this slug' });
  }
});

// GET /api/mangas/chapters/:id (metadata)
router.get('/chapters/:id', async (req: Request, res: Response) => {
  try {
    const chapterId = req.params.id as string;
    const data = await getChapter(chapterId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chapter metadata' });
  }
});

// GET /api/mangas/:idOrSlug/chapters
router.get('/:id/chapters', async (req: Request, res: Response) => {
  try {
    const mangaId = req.params.id as string;
    const data = await getMangaChapters(mangaId, ['vi', 'en']);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get manga chapters' });
  }
});

// GET /api/mangas/chapters/:id/images
router.get('/chapters/:id/images', async (req: Request, res: Response) => {
  try {
    const chapterId = req.params.id as string;
    const data = await getChapterImages(chapterId);
    
    const { baseUrl, chapter } = data;
    const isDataSaver = req.query.dataSaver === 'true';
    const folder = isDataSaver ? 'data-saver' : 'data';
    const filenames = isDataSaver ? chapter.dataSaver : chapter.data;

    const imageUrls = filenames.map((filename: string) => {
      return `${baseUrl}/${folder}/${chapter.hash}/${filename}`;
    });

    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chapter images' });
  }
});

// GET /api/mangas/:id (by MangaDex UUID)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const mangaId = req.params.id as string;
    const data = await getManga(mangaId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get manga details' });
  }
});

export default router;
