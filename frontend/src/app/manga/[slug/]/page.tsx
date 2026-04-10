'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMangaBySlug, getMangaChapters, getCoverUrl } from "@/lib/api";
import styles from "./page.module.css";

export default function MangaDetail() {
  const { slug } = useParams();
  const [manga, setManga] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      try {
        setLoading(true);
        const response = await getMangaBySlug(slug as string);
        const mangaData = response.data; // Extract inner data
        setManga(mangaData);

        const chaptersData = await getMangaChapters(mangaData.id);
        setChapters(chaptersData.data || []);
      } catch (err) {
        setError("Failed to load manga details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: '24px' }}></div>
      <div className={styles.loadingInfo}>
        <div className="skeleton" style={{ height: '48px', width: '60%', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '40%', marginTop: '1rem', borderRadius: '4px' }}></div>
      </div>
    </div>
  );

  if (error || !manga) return <div className="container">{error || "Manga not found"}</div>;

  const title = manga.attributes?.title?.en || manga.attributes?.title?.ja || manga.attributes?.title?.['ja-ro'] || "Manga Không Tên";
  const status = manga.attributes?.status === 'ongoing' ? 'Đang Tiến Hành' : 'Đã Hoàn Thành';
  const description = manga.attributes?.description?.en || "Chưa có mô tả cho bộ truyện này.";
  const coverUrl = getCoverUrl(manga);
  const author = getAuthor(manga);

  // Find the first chapter (usually last in the feed if sorted correctly)
  const firstChapterId = chapters.length > 0 ? chapters[chapters.length - 1].id : null;

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} style={{ backgroundImage: `url(${coverUrl})` }}></div>
      
      <div className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.coverWrapper}>
            <img src={coverUrl} alt={title} className={styles.cover} />
          </div>
          <div className={styles.meta}>
            <div className={styles.badges}>
              <span className={styles.statusBadge}>{status}</span>
              <span className={styles.yearBadge}>{manga.attributes?.year || '2026'}</span>
            </div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.author}>
               <span>✍️</span> {author}
            </p>
            
            <div className={styles.actions}>
              {firstChapterId ? (
                <Link href={`/chapter/${firstChapterId}`} className="btn-primary">
                  Đọc Từ Đầu
                </Link>
              ) : (
                <button className="btn-primary" disabled>Sắp Ra Mắt</button>
              )}
              <button className={`${styles.actionBtn} glass`}>+ Theo Dõi</button>
            </div>
            
            <div className={styles.descriptionWrapper}>
              <h3>Tóm Tắt</h3>
              <p className={styles.description}>{description}</p>
            </div>
          </div>
        </header>

        <section className={styles.chaptersSection}>
          <div className={styles.sectionHeader}>
            <h2>Danh Sách Chương <span className={styles.chapterCount}>({chapters.length})</span></h2>
            <button className={styles.sortBtn}>Sắp xếp: Mới nhất</button>
          </div>

          <div className={styles.chapterGrid}>
            {chapters.map((chapter) => (
              <Link 
                key={chapter.id} 
                href={`/chapter/${chapter.id}`} 
                className={`${styles.chapterCard} glass glass-hover`}
              >
                <div className={styles.chapterInfo}>
                  <span className={styles.chapterNumber}>Chương {chapter.attributes.chapter}</span>
                  <span className={styles.chapterTitle}>{chapter.attributes.title || `Chương ${chapter.attributes.chapter}`}</span>
                </div>
                <span className={styles.date}>
                  {new Date(chapter.attributes.publishAt).toLocaleDateString('vi-VN')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
