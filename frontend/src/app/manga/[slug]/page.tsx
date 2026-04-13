'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMangaBySlug, getMangaChapters, getCoverUrl, getAuthor } from '@/lib/api';
import Link from 'next/link';
import styles from './page.module.css';

export default function MangaDetail() {
  const { slug } = useParams();
  const [manga, setManga] = useState<any>(null);
  const [mangaId, setMangaId] = useState<string>('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Resolve slug → manga data
        const mangaData = await getMangaBySlug(slug as string);
        const manga = mangaData.data;
        setManga(manga);
        setMangaId(manga.id);

        // Fetch chapters using the real MangaDex ID
        const chaptersData = await getMangaChapters(manga.id);
        setChapters(chaptersData.data || []);
      } catch (err) {
        setError('Failed to load manga details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '20px', marginBottom: '2rem' }}></div>
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p className={styles.error}>{error || 'Manga not found'}</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const title = manga.attributes.title.en || manga.attributes.title.ja || 'Unknown Title';
  const description = manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || 'No description available.';
  const author = getAuthor(manga);
  const coverUrl = getCoverUrl(manga);

  return (
    <main className={styles.main}>
      <div className={styles.heroWrapper}>
        <div className={styles.heroBg} style={{ backgroundImage: `url(${coverUrl})` }}></div>
        <div className={styles.heroOverlay}></div>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.coverWrapper}>
              <img src={coverUrl} alt={title} className={styles.cover} />
            </div>
            <div className={styles.info}>
              <h1 className={styles.title}>{title}</h1>
              
              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Tác giả:</span>
                  <span className={styles.metaValue}>{author}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Tình trạng:</span>
                  <span className={styles.metaValue}>{manga.attributes.status?.charAt(0).toUpperCase() + manga.attributes.status?.slice(1) || 'Unknown'}</span>
                </div>
              </div>

              <div className={styles.tags}>
                {manga.attributes.tags.slice(0, 5).map((tag: any) => (
                  <span key={tag.id} className={styles.tag}>
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>
              <div className={styles.actions}>
                {chapters.length > 0 ? (
                  <Link href={`/chapter/${chapters[0].id}`} className="btn-primary">
                    Read Chapter {chapters[0].attributes.chapter || 'Latest'}
                  </Link>
                ) : (
                  <button className="btn-primary" disabled>No Chapters Available</button>
                )}
                <button className={`glass ${styles.btnSave}`}>Save to Library</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <section className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <div className={styles.description}>
              {description as string}
            </div>
          </section>

          <section className={styles.chaptersSection}>
            <h2 className={styles.sectionTitle}>Chapters ({chapters.length})</h2>
            <div className={styles.chapterList}>
              {chapters.length > 0 ? (
                chapters.map((chapter: any) => (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.id}`}
                    className={`glass glass-hover ${styles.chapterItem}`}
                  >
                    <div className={styles.chapterInfo}>
                      <span className={styles.chapterNumber}>
                        Chapter {chapter.attributes.chapter || '?'}{chapter.attributes.title ? `: ${chapter.attributes.title}` : ''}
                      </span>
                      <div className={styles.chapterMeta}>
                        <span className={styles.chapterLang}>
                          {chapter.attributes.translatedLanguage?.toUpperCase()}
                        </span>
                        {chapter.attributes.pages > 0 && (
                          <span className={styles.pageCount}>{chapter.attributes.pages} pages</span>
                        )}
                      </div>
                    </div>
                    <span className={styles.chapterDate}>
                      {new Date(chapter.attributes.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <p className={styles.empty}>No chapters found for this language selection (VI, EN).</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
