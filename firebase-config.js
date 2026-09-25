// Firebaseコンソール(プロジェクトの設定 → マイアプリ → SDK の設定と構成)からコピーした
// firebaseConfig をそのまま貼り付けてください。
// このファイルの値(apiKey等)はクライアント側で公開される前提の値なので、
// ここに直接書いてコミットして問題ありません(実際のアクセス制御は Firestore のセキュリティルールで行います)。
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
