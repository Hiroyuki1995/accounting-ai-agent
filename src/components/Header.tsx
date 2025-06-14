import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>onestop</div>
        {/* ナビゲーションなどの要素をここに追加できます */}
      </div>
    </header>
  );
};

export default Header; 