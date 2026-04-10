import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { searchManga, getManga } from './mangaDexApi';

const prisma = new PrismaClient();

// Generate a URL-friendly slug from a title
export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,      // strip special characters
    locale: 'vi',      // Vietnamese support
    trim: true,
  });
};

// Get or create a slug→id mapping in the database
export const getOrCreateMangaBySlug = async (slug: string) => {
  // 1. Check if the "slug" is actually a MangaDex UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  // 2. Look up in database
  const existing = await prisma.manga.findUnique({ 
    where: isUUID ? { id: slug } : { slug } 
  });

  if (existing) {
    // Return full manga data from MangaDex using the stored ID
    const mangaResponse = await getManga(existing.id);
    return { data: mangaResponse.data }; 
  }

  // 3. Not found in DB - if it's a UUID, fetch from MangaDex and save
  if (isUUID) {
    const mangaResponse = await getManga(slug);
    const manga = mangaResponse.data;
    const title = manga.attributes.title.en || manga.attributes.title.ja || slug;
    const generatedSlug = generateSlug(title);
    
    await prisma.manga.upsert({
      where: { id: slug },
      update: { slug: generatedSlug, title },
      create: { id: slug, slug: generatedSlug, title },
    });
    return { data: manga };
  }

  // 4. If not UUID and not in DB, try to search MangaDex by the slug as a title
  const searchTitle = slug.replace(/-/g, ' ');
  const searchResult = await searchManga(searchTitle);

  if (!searchResult.data || searchResult.data.length === 0) {
    throw new Error(`No manga found for slug: ${slug}`);
  }

  const manga = searchResult.data[0];
  const title = manga.attributes.title.en || manga.attributes.title.ja || slug;
  const generatedSlug = generateSlug(title);

  // 3. Save the mapping to the DB (use the generated slug, not necessarily the user's input)
  await prisma.manga.upsert({
    where: { id: manga.id },
    update: { slug: generatedSlug, title },
    create: { id: manga.id, slug: generatedSlug, title },
  });

  return { data: manga };
};

// Get or create a slug for a given MangaDex manga ID
export const getOrCreateSlugById = async (mangaId: string, title: string): Promise<string> => {
  const existing = await prisma.manga.findUnique({ where: { id: mangaId } });
  if (existing) return existing.slug;

  const slug = generateSlug(title);

  // Handle uniqueness collision by appending part of the ID
  const conflict = await prisma.manga.findUnique({ where: { slug } });
  const finalSlug = conflict ? `${slug}-${mangaId.slice(0, 6)}` : slug;

  await prisma.manga.create({
    data: { id: mangaId, slug: finalSlug, title },
  });

  return finalSlug;
};
