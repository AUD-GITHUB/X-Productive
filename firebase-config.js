import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyBU-ocVwBZhR5JuK8QkJBGn_lNRj777Ai0",
    authDomain: "x-productive.firebaseapp.com",
    databaseURL: "https://x-productive-default-rtdb.firebaseio.com",
    projectId: "x-productive",
    storageBucket: "x-productive.appspot.com",
    messagingSenderId: "723408949950",
    appId: "1:723408949950:web:940895f888db42be8cc4ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
firebase.initializeApp(firebaseConfig);
// Export the initialized Firebase app and Auth service if needed
export { app, auth, database };
