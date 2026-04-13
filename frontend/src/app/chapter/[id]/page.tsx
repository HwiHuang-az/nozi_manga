'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChapterImages } from '@/lib/api';
import Link from 'next/link';
import styles from './page.module.css';

export default function ChapterReader() {
  const { id } = useParams();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterMeta, setChapterMeta] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchImagesAndMeta = async () => {
      setLoading(true);
      setError(null);
      try {
        const [imagesData, metaData] = await Promise.all([
          getChapterImages(id as string),
          import('@/lib/api').then(m => m.getChapter(id as string))
        ]);
        setImages(imagesData.imageUrls || []);
        setChapterMeta(metaData.data);
        window.scrollTo(0, 0); // Scroll to top on new chapter
      } catch (err) {
        setError('Failed to load chapter data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImagesAndMeta();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className="skeleton" style={{ width: '100%', maxWidth: '800px', height: '100vh', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p className={styles.error}>{error || 'No images found for this chapter'}</p>
        <button onClick={() => router.back()} className="btn-primary" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  const mangaRel = chapterMeta?.relationships?.find((rel: any) => rel.type === 'manga');
  const mangaId = mangaRel?.id;
  const chapterNumber = chapterMeta?.attributes?.chapter || '?';
  const chapterTitle = chapterMeta?.attributes?.title ? ` - ${chapterMeta.attributes.title}` : '';

  return (
    <main className={styles.main}>
      <header className={`glass ${styles.header}`}>
        <div className="container">
          <div className={styles.nav}>
            <div className={styles.controls}>
              {mangaId ? (
                <Link href={`/manga/${mangaId}`} className={`glass ${styles.btnBack}`}>
                  Back to Manga
                </Link>
              ) : (
                <button onClick={() => router.back()} className={`glass ${styles.btnBack}`}>
                  Back
                </button>
              )}
            </div>
            <div className={styles.hudMeta}>
              <span className={styles.hudChapterNumber}>Chapter {chapterNumber}{chapterTitle}</span>
            </div>
            <div className={styles.logo}>
               <Link href="/">Nozi Manga</Link>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.readerContainer}>
        {images.map((url, index) => (
          <div key={index} className={styles.imageWrapper}>
            <img 
              src={url} 
              alt={`Page ${index + 1}`} 
              className={styles.mangaImage}
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className={styles.endMessage}>End of Chapter</p>
          <button onClick={() => router.back()} className="btn-primary">
            Back to Chapter List
          </button>
        </div>
      </footer>
    </main>
  );
}
