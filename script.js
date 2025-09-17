// script.js (Final Refactored Version)
import app from './firebase-config.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getDatabase, ref, onValue, get, update, query, orderByChild, push } 
from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// Initialize Firebase services
const auth = getAuth(app);
const db = getDatabase(app);

// DOM elements for the home page
const loggedInUserNameEl = document.getElementById('loggedUserName');
const logOutButton = document.getElementById('logout');
const questionsList = document.getElementById('questionsList');
const inputBox = document.getElementById('input-box');

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
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

// --- Search Bar Functionality ---
inputBox.addEventListener('keyup', () => {
    const searchQuery = inputBox.value.trim().toLowerCase();
    loadQuestions(searchQuery);
});

// --- Question Display and Interaction (Realtime Database specific logic) ---
function loadQuestions(searchQuery = '') {
    const questionsRef = ref(db, 'questions');
    const sortedQuery = query(questionsRef, orderByChild('createdAt'));

    onValue(sortedQuery, (snapshot) => {
        questionsList.innerHTML = "";
        if (snapshot.exists()) {
            const questions = snapshot.val();
            const questionsArray = Object.keys(questions).reverse().map(key => ({
                id: key,
                ...questions[key]
            }));

            const filteredQuestions = questionsArray.filter(q => {
                if (searchQuery === '') {
                    return true;
                }
                return (q.level && q.level.toLowerCase().includes(searchQuery)) ||
                       (q.question && q.question.toLowerCase().includes(searchQuery)) ||
                       (q.authorName && q.authorName.toLowerCase().includes(searchQuery));
            });

            if (filteredQuestions.length > 0) {
                filteredQuestions.forEach(q => {
                    const li = document.createElement("li");

                    // --- NEW LOGIC TO HANDLE IMAGE DISPLAY ---
                    const imageHtml = q.imageUrl
                        ? `<div class="question-image-container">
                             <img src="${q.imageUrl}" alt="Question Diagram" />
                           </div>`
                        : '';
                    // ----------------------------------------

                    const answersHtml = q.answers && Object.keys(q.answers).length > 0
                        ? `<div class="answers">${Object.keys(q.answers).map(key => {
                            const answer = q.answers[key];
                            return `<div class="answer-item">
                                        <p>${answer.text}</p>
                                        <button class="upvote-btn" onclick="upvote('${q.id}', '${key}', ${answer.votes || 0})">👍 ${answer.votes || 0}</button>
                                        <button class="downvote-btn" onclick="downvote('${q.id}', '${key}', ${answer.votes || 0})">👎</button>
                                    </div>`;
                          }).join('')}</div>`
                        : '';
                    
                    li.innerHTML = `
                        <strong>[${q.level || 'N/A'}] ${q.question}</strong>
                        <p>— asked by ${q.authorName || 'Anonymous'}</p>
                        ${imageHtml} ${answersHtml}
                        <div class="answer-form">
                            <input type="text" id="answer-${q.id}" class="answer-input" placeholder="Your answer..." />
                            <button class="answer-btn" onclick="submitAnswer('${q.id}')">Submit</button>
                        </div>
                    `;
                    questionsList.appendChild(li);
                });
            } else {
                questionsList.innerHTML = '<p>No questions found matching your search.</p>';
            }
        } else {
            questionsList.innerHTML = '<p>No questions posted yet. Be the first!</p>';
        }
    }, { onlyOnce: false });
}

window.upvote = async function(questionId, answerId, currentVotes) {
    const answerRef = ref(db, `questions/${questionId}/answers/${answerId}`);
    await update(answerRef, { votes: (currentVotes || 0) + 1 });
};

// ADDED: New function to handle downvoting
window.downvote = async function(questionId, answerId, currentVotes) {
    const answerRef = ref(db, `questions/${questionId}/answers/${answerId}`);
    const newVotes = Math.max(0, (currentVotes || 0) - 1); // Ensure votes don't go below 0
    await update(answerRef, { votes: newVotes });
};

window.submitAnswer = async function(id) {
    const answerInput = document.getElementById(`answer-${id}`);
    const answerText = answerInput.value.trim();
    if (!answerText) return;

    const answersRef = ref(db, `questions/${id}/answers`);
    
    const newAnswer = {
        text: answerText,
        votes: 0
    };

    await push(answersRef, newAnswer);

    answerInput.value = "";
};

loadQuestions();
