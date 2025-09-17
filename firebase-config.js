// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHeqn6XDpPZUc46T1dl74maVruQhfYj9E",
    authDomain: "section-a-3bc20.firebaseapp.com",
    databaseURL: "https://section-a-3bc20-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "section-a-3bc20",
    storageBucket: "section-a-3bc20.firebasestorage.app",
    messagingSenderId: "944136450248",
    appId: "1:944136450248:web:72552f8accb738ebdd35fd",
    measurementId: "G-QS2J4SWS18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;