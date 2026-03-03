import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCHeqn6XDpPZUc46T1dl74maVruQhfYj9E",
    authDomain: "section-a-3bc20.firebaseapp.com",
    databaseURL: "https://section-a-3bc20-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "section-a-3bc20",
    storageBucket: "section-a-3bc20.firebasestorage.app",
    messagingSenderId: "944136450248",
    appId: "1:944136450248:web:72552f8accb738ebdd35fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);