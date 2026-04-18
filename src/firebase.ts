import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANY1yVEe9_EM0f6fmEMIcPf1gYHU2ezUk",
  authDomain: "systemy-chmurowe-b6eff.firebaseapp.com",
  projectId: "systemy-chmurowe-b6eff",
  storageBucket: "systemy-chmurowe-b6eff.firebasestorage.app",
  messagingSenderId: "416521327292",
  appId: "1:416521327292:web:9a4a47ff88158ddc46f6b9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);