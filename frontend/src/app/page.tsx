'use client';

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import MangaCard from "@/components/MangaCard";
import { searchManga, getCoverUrl, getAuthor } from "@/lib/api";
import styles from "./page.module.css";

export default function Home() {
  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchManga(query);
      setMangas(data.data || []);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch("Naruto"); // Default "Featured"
  }, []);

  return (
    <div className={styles.homeContainer}>
      <header className={styles.header}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {mangas.length > 0 && !loading ? "Kết Quả Tìm Kiếm" : "Truyện Hot Mỗi Ngày"}
          </h2>
          <div className={styles.sectionActions}>
            <button className={`${styles.filterBtn} glass`}>Tất Cả</button>
            <button className={`${styles.filterBtn} glass`}>Mới Cập Nhật</button>
          </div>
        </div>

        {error && <div className={`${styles.error} glass`}>{error}</div>}
        
        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`${styles.skeletonWrapper} glass`}>
                <div className="skeleton" style={{ height: '240px', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '90%', marginTop: '0.75rem', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {mangas.map((manga) => (
              <MangaCard
                key={manga.id}
                id={manga.id}
                slug={manga.slug}
                title={manga.attributes?.title?.en || manga.attributes?.title?.ja || manga.attributes?.title?.['ja-ro'] || "Manga Không Tên"}
                coverUrl={getCoverUrl(manga)}
                author={getAuthor(manga)}
                latestChapter={manga.attributes?.lastChapter || "???"}
                statusBadge={manga.attributes?.status === 'ongoing' ? 'Hot' : 'End'}
              />
            ))}
          </div>
        )}

        {!loading && mangas.length === 0 && !error && (
          <div className={`${styles.empty} glass`}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>Không thấy truyện nào cả. Thử tên khác xem?</p>
          </div>
        )}
      </section>
    </div>
  );
}
