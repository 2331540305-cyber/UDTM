import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 🔥 Firebase Configuration
// ✅ Credentials từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCcCByP5NU7FSKfEyFXwViUhybWa5d_BJw",
  authDomain: "teo2-vaa.firebaseapp.com",
  projectId: "teo2-vaa",
  storageBucket: "teo2-vaa.firebasestorage.app",
  messagingSenderId: "537112602371",
  appId: "1:537112602371:web:867355bd4850647c5fab36",
  measurementId: "G-BRX8TN6ND7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ⚙️ Cấu hình Google provider
googleProvider.setCustomParameters({
  prompt: "select_account", // Hiển thị lựa chọn tài khoản
});

export default app;
