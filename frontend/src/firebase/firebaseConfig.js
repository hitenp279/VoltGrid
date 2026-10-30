import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA-Ndvj32xYN7V1KLqWtm_Bj3j83u9gC4w",
  authDomain: "major-project-user.firebaseapp.com",
  databaseURL: "https://major-project-user-default-rtdb.firebaseio.com",
  projectId: "major-project-user",
  storageBucket: "major-project-user.firebasestorage.app",
  messagingSenderId: "821904231138",
  appId: "1:821904231138:web:21241ed98fc19a9411acbb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
