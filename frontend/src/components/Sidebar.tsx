'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Trang Chủ', href: '/', icon: '🏠' },
    { name: 'Hot', href: '/hot', icon: '🔥' },
    { name: 'Theo Dõi', href: '/library', icon: '❤️' },
    { name: 'Lịch Sử', href: '/history', icon: '🕒' },
  ];

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-fi', 'Slife of Life'
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>N</span>
          <span className={styles.logoText}>Nozi<span className="gradient-text">Manga</span></span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.name}</span>
            </Link>
          );
        })}

        <h3 className={styles.sectionTitle}>Thể Loại</h3>
        {genres.map((genre) => (
          <Link 
            key={genre} 
            href={`/genre/${genre.toLowerCase()}`} 
            className={styles.navItem}
          >
            <span className={styles.icon}>•</span>
            <span className={styles.label}>{genre}</span>
          </Link>
        ))}
      </nav>
      
      <div className={styles.footer}>
        <div className={styles.social}>
          <a href="#" className={styles.socialLink}>GitHub</a>
          <a href="#" className={styles.socialLink}>Discord</a>
        </div>
        <p className={styles.copyright}>© 2026 Nozi Manga</p>
      </div>
    </aside>
  );
};

export default Sidebar;
