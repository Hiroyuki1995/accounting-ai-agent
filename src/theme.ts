import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00893E', // りそなカラーコード
    },
    secondary: {
      main: '#e0e0e0',
    },
    // 必要に応じて他の色も定義
  },
  typography: {
    // フォント設定など
  },
  components: {
    // グローバルなコンポーネントのスタイル上書きなど
  },
});

export default theme; 