// postq.js
import app from './firebase-config.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getDatabase, ref, get, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
// NEW: Import Firebase Storage modules
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js';

// Initialize Firebase services
const auth = getAuth(app);
const db = getDatabase(app);
// NEW: Initialize Firebase Storage
const storage = getStorage(app);

// DOM elements for the post question page
const loggedInUserNameEl = document.getElementById('loggedUserName');
const logOutButton = document.getElementById('logout');
const questionInput = document.getElementById('questionInput');
const questionLevelSelect = document.getElementById('questionlevel'); 
const submitQuestionBtn = document.getElementById('submitQuestionBtn');
// NEW: Get the image upload element
const imageUploadInput = document.getElementById('imageUpload');

// --- User Authentication and Logout ---
onAuthStateChanged(auth, (user) => {
    if (user) {
       const userRef = ref(db, 'users/' + user.uid);
        get(userRef)
            .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                    loggedInUserNameEl.innerText = userData.username || 'User';
                } else {
                   loggedInUserNameEl.innerText = 'Guest';
                }
            })
            .catch((error) => {
               console.error('Error getting user data:', error);
                loggedInUserNameEl.innerText = 'Guest';
            });
        } else {
           window.location.href = 'auth.html';
        }
});

logOutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
             console.log('User signed out successfully.');
            window.location.href = 'auth.html';
        })
          .catch(( error) => {
            console.error('Error signing out:', error);
        });
});

// --- Question Submission to Realtime Database ---
submitQuestionBtn.addEventListener('click', async () => {
    const questionText = questionInput.value.trim();
    const questionLevel = questionLevelSelect.value;
    const imageFile = imageUploadInput.files[0]; // NEW: Get the selected image file

    // Validate input
    if (!questionText && !imageFile) {
        alert("Please enter a question or upload an image before submitting.");
        return;
        }
    if (!questionLevel) {
    alert("Please select a level.");
    return;
    }

    submitQuestionBtn.disabled = true; // Disable button to prevent multiple submissions
    submitQuestionBtn.innerText = "Submitting...";

        try {
        const user = auth.currentUser;
            if (!user) {
            alert("You must be logged in to post a question.");
            return;
        }

        const userRef = ref(db, 'users/' + user.uid);
        const userSnapshot = await get(userRef);
        const username = userSnapshot.exists() ? userSnapshot.val().username : 'Anonymous';
        
        let imageUrl = null;
        // NEW: If an image is selected, upload it to Firebase Storage
        if (imageFile) {
            const imagePath = `Images/${user.uid}/${Date.now()}_${imageFile.name}`;
            const imgStorageRef = storageRef(storage, imagePath);
 
            await uploadBytes(imgStorageRef, imageFile);
            imageUrl = await getDownloadURL(imgStorageRef);
            console.log("Image uploaded. URL:", imageUrl);
        }

        const questionsRef = ref(db, 'questions');
   
            await push(questionsRef, {
              question: questionText,
              level: questionLevel,
              authorId: user.uid,
              authorName: username,
              imageUrl: imageUrl, // NEW: Store the image URL
              answers: {},
              votes: 0,
            createdAt: serverTimestamp()
        });

          questionInput.value = "";
          questionLevelSelect.value = "";
          imageUploadInput.value = ""; // NEW: Clear the file input
    
          alert("Question submitted successfully!");
          window.location.href = 'home.html';
        } catch (error) {
            console.error("Error submitting question:", error);
           alert("Failed to submit question. Please try again.");
         } finally {
            submitQuestionBtn.disabled = false;
            submitQuestionBtn.innerText = "Submit Question";
        }
});