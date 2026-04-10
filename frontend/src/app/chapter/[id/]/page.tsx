'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getChapterImages, getMangaBySlug, getMangaChapters } from "@/lib/api";
import styles from "./page.module.css";

export default function ChapterReader() {
  const { id } = useParams();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [chapterInfo, setChapterInfo] = useState<any>(null);
  const [mangaSlug, setMangaSlug] = useState<string>("");
  const [nav, setNav] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHUD, setShowHUD] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        // 1. Fetch images
        const imageData = await getChapterImages(id as string);
        setImages(imageData.imageUrls);

        // 2. Fetch chapter metadata
        const chapData = await getChapter(id as string);
        setChapterInfo(chapData.data);

        // 3. Find manga ID and navigation
        const mangaRel = chapData.data.relationships.find((r: any) => r.type === 'manga');
        if (mangaRel) {
          const mangaId = mangaRel.id;
          
          // Get the slug for exit button
          const mData = await getMangaBySlug(mangaId); 
          setMangaSlug(mData.data.slug || mangaId);

          // Get all chapters to find next/prev
          const chaptersRes = await getMangaChapters(mangaId);
          const allChapters = chaptersRes.data || [];
          
          // Sort by chapter number numeric value (since MangaDex returns feed)
          const sorted = [...allChapters].sort((a, b) => 
            parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter)
          );

          const currentIndex = sorted.findIndex(c => c.id === id);
          setNav({
            prev: currentIndex > 0 ? sorted[currentIndex - 1].id : null,
            next: currentIndex < sorted.length - 1 ? sorted[currentIndex + 1].id : null
          });
        }
      } catch (err) {
        setError("Không thể tải chương này. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Auto-hide HUD after 4 seconds
    const timer = setTimeout(() => setShowHUD(false), 4000);
    return () => clearTimeout(timer);
  }, [id]);

  const toggleHUD = (e: React.MouseEvent) => {
    // Prevent hiding HUD when clicking buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    setShowHUD(!showHUD);
  };

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>Đang tải hình ảnh...</p>
    </div>
  );

  if (error) return (
    <div className={styles.error}>
      <p>{error}</p>
      <Link href="/" className="btn-primary">Quay lại trang chủ</Link>
    </div>
  );

  return (
    <div className={styles.reader} onClick={toggleHUD}>
      {/* HUD - TOP */}
      <div className={`${styles.hudTop} ${showHUD ? styles.visible : ''} glass`}>
        <div className={styles.hudContent}>
          <Link href={`/manga/${mangaSlug}`} className={styles.backBtn}>← Thoát</Link>
          <div className={styles.chapterInfo}>
             <span className={styles.mangaTitle}>Chương {chapterInfo?.attributes?.chapter}</span>
          </div>
          <div className={styles.settings}>
            <button className={styles.navBtn}>HD</button>
          </div>
        </div>
      </div>

      {/* Main Panels */}
      <main className={styles.panels}>
        {images.map((url, index) => (
          <div key={index} className={styles.panelWrapper}>
            <img 
              src={url} 
              alt={`Trang ${index + 1}`} 
              className={styles.panel}
              loading={index < 3 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </main>

      {/* HUD - BOTTOM */}
      <div className={`${styles.hudBottom} ${showHUD ? styles.visible : ''} glass`}>
        <div className={styles.hudContent}>
          {nav.prev ? (
            <Link href={`/chapter/${nav.prev}`} className={`${styles.navBtn} glass`}>Chương Trước</Link>
          ) : (
            <button className={`${styles.navBtn} glass`} disabled style={{ opacity: 0.3 }}>Đầu Truyện</button>
          )}
          
          <div className={styles.progress}>
             <span>Cuộn để xem tiếp</span>
          </div>
          
          {nav.next ? (
            <Link href={`/chapter/${nav.next}`} className={`${styles.navBtn} glass`}>Chương Sau</Link>
          ) : (
            <button className={`${styles.navBtn} glass`} disabled style={{ opacity: 0.3 }}>Hết Truyện</button>
          )}
        </div>
      </div>
    </div>
  );
}
