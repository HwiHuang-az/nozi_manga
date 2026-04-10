import React from 'react';
import Link from 'next/link';
import styles from './MangaCard.module.css';

interface MangaCardProps {
  id: string;
  slug?: string;
  title: string;
  coverUrl: string;
  author?: string;
  latestChapter?: string;
  statusBadge?: string;
}

const MangaCard: React.FC<MangaCardProps> = ({ id, slug, title, coverUrl, author, latestChapter, statusBadge }) => {
  const href = slug ? `/manga/${slug}` : `/manga/${id}`;
  
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.coverWrapper}>
        {statusBadge && <div className={styles.badge}>{statusBadge}</div>}
        <img 
          src={coverUrl} 
          alt={title} 
          className={styles.cover} 
          loading="lazy"
        />
        {latestChapter && <div className={styles.chapterBadge}>Ch. {latestChapter}</div>}
        <div className={styles.overlay}>
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>View Details</button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.bottomInfo}>
          <span className={styles.author}>{author || "Unknown"}</span>
          {latestChapter && <span className={styles.chapterLink}>Latest</span>}
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;
