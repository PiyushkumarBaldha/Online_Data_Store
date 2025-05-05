// Quiz Configuration
const colors = [
    ["#0f0c29", "#302b63"],
    ["#1a1a2e", "#16213e"],
    ["#1f005c", "#5b0060"],
    ["#070024", "#2c005b"],
    ["#0f2027", "#203a43"],
    ["#1a2a6c", "#b21f1f"],
    ["#3a1c71", "#d76d77"],
    ["#200122", "#6f0000"],
    ["#0f0c29", "#24243e"],
    ["#000428", "#004e92"]
];

// Quiz Variables
let score = 0;
let currentQuestionIndex = 0;
const totalQuestions = 10;
let imageFolder = "Img"; // Default image folder
let sessionId = localStorage.getItem('sessionId') || generateSessionId();
let playNumber = getPlayNumber();
let userAnswers = new Array(totalQuestions).fill(null);
let userConfidence = new Array(totalQuestions).fill(null);
let timerInterval;
const quizStartTime = Date.now();
let currentConfidence = null;

// This will store our randomized image paths and their correct answers
let imageSet = [];
let correctAnswers = {};

// Store session ID in localStorage if not already set
if (!localStorage.getItem('sessionId')) {
    localStorage.setItem('sessionId', sessionId);
}

// Initialize the quiz when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Get form data from localStorage
    const formData = JSON.parse(localStorage.getItem('formData') || '{}');
    
    // Set image folder based on user data
    const userAge = formData.age || localStorage.getItem("userAge");
    const userProfession = formData.profession || localStorage.getItem("userProfession");

    if (userAge !== null && userProfession !== null) {
        const age = parseInt(userAge);
        if (userProfession.toLowerCase() !== "engineer") {
            if (age >= 0 && age <= 18) {
                imageFolder = "Img18";
            } else if (age >= 19 && age <= 60) {
                imageFolder = "Img60";
            } else if (age >= 61 && age <= 100) {
                imageFolder = "Img70";
            }
        }
    }
    
    // Initialize the image set (5 from R folder, 5 from F folder)
    initializeImageSet();
    
    // Create navigation
    createNavigation();
    
    // Initialize timer
    initializeTimer();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update first question
    updateQuestion();
    
    // Initialize player data in localStorage if not exists
    initPlayerData(formData);
});

// Initialize player data in localStorage
function initPlayerData(formData) {
    let playerData = JSON.parse(localStorage.getItem('playerData')) || {
        playerId: localStorage.getItem('playerId') || generatePlayerId(),
        scores: [],
        sessions: [],
        attempts: 0,
        formData: {
            age: formData.age || null,
            profession: formData.profession || null,
            status: formData.status || null
        }
    };
    
    // Store playerId in localStorage if not already set
    if (!localStorage.getItem('playerId')) {
        localStorage.setItem('playerId', playerData.playerId);
    }
    
    localStorage.setItem('playerData', JSON.stringify(playerData));
}

function generatePlayerId() {
    const id = 'player_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    localStorage.setItem('playerId', id);
    return id;
}

function generateSessionId() {
    const id = 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    localStorage.setItem('sessionId', id);
    return id;
}






function getPlayNumber() {
    let playData = localStorage.getItem('playNumberData');
    

    if (!playData) {
        // Initialize with whole number if no data exists
        playData = {
            base: 1,
            increment: 0
        };
        localStorage.setItem('playNumberData', JSON.stringify(playData));
    } else {
        playData = JSON.parse(playData);
    }
    
    // Format as "base.increment"
    return `${playData.base}.${playData.increment}`;
    
}

function incrementPlayNumber() {
    let playData = localStorage.getItem('playNumberData');
    
    if (!playData) {
        playData = {
            base: 1,
            increment: 0
        };
    } else {
        playData = JSON.parse(playData);
    }
    
    // Increment the decimal part for "Play Again"
    playData.increment += 1;
    
    localStorage.setItem('playNumberData', JSON.stringify(playData));
}

function resetPlayNumber() {
    let playData = localStorage.getItem('playNumberData');
    
    if (!playData) {
        playData = {
            base: 1,
            increment: 0
        };
    } else {
        playData = JSON.parse(playData);
    }
    
    // Increment the whole number and reset decimal for "Finish"
    playData.base += 1;
    playData.increment = 0;
    
    localStorage.setItem('playNumberData', JSON.stringify(playData));
}

// Initialize the randomized image set with complete shuffling
function initializeImageSet() {
    // Total number of images available in each folder
    const totalImages = 50;
    
    // Create separate arrays for R and F folder images
    const allRImages = Array.from({length: totalImages}, (_, i) => ({
        path: `${imageFolder}/R/${i+1}.png`,
        answer: "Real"
    }));
    
    const allFImages = Array.from({length: totalImages}, (_, i) => ({
        path: `${imageFolder}/F/${i+1}.png`,
        answer: "Fake"
    }));
    
    // Shuffle both sets separately
    shuffleArray(allRImages);
    shuffleArray(allFImages);
    
    // Take first 5 from each shuffled set
    const selectedR = allRImages.slice(0, 5);
    const selectedF = allFImages.slice(0, 5);
    
    // Combine all selected images
    imageSet = [...selectedR, ...selectedF];
    
    // Shuffle the combined set again for final randomness
    shuffleArray(imageSet);
    
    // Create correct answers mapping
    imageSet.forEach((img, index) => {
        correctAnswers[index] = img.answer;
    });
    
    console.log("Selected images:", imageSet); // For debugging
}

// Fisher-Yates shuffle algorithm for complete randomization
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Navigation Functions
function createNavigation() {
    const navContainer = document.getElementById("question-nav");

    for (let i = 0; i < totalQuestions; i++) {
        let btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.classList.add("nav-btn");
        btn.addEventListener("click", () => goToQuestion(i));
        navContainer.appendChild(btn);
    }
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    currentConfidence = userConfidence[index]; // Load confidence for this question
    updateQuestion();
}

// Timer Functions
function initializeTimer() {
    const timerElement = document.getElementById("timer");

    let totalTime = 600;
    function updateTimer() {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalTime <= 60) {
            timerElement.style.color = "red";
        }

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            endQuiz();
        }
        totalTime--;
    }
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

// Question Handling
function updateQuestion() {
    setGradientBackground();
    document.getElementById("question-title").textContent = "Question " + (currentQuestionIndex + 1);
    document.getElementById("quiz-image").src = imageSet[currentQuestionIndex].path;
    
    // Update confidence button states
    updateConfidenceButtons();
}

function checkAnswer(isReal) {
    const answer = isReal ? "Real" : "Fake";
    userAnswers[currentQuestionIndex] = answer;
    
    // Update score
    score = 0;
    userAnswers.forEach((ans, index) => {
        if (ans === correctAnswers[index]) {
            score += 10;
        }
    });
    
    updateScore();
    markAnswered(currentQuestionIndex);
    updateProgress();
    
    // Auto-proceed if confidence already selected
    if (currentConfidence !== null) {
        setTimeout(goToNextQuestion, 300); // Small delay for better UX
    }
}

function setConfidence(confidence) {
    currentConfidence = confidence;
    userConfidence[currentQuestionIndex] = confidence;
    
    // Update button states
    updateConfidenceButtons();
    
    // Auto-proceed if answer already selected
    if (userAnswers[currentQuestionIndex] !== null) {
        setTimeout(goToNextQuestion, 300); // Small delay for better UX
    }
}

function updateConfidenceButtons() {
    const buttons = document.querySelectorAll(".confidence-btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    
    if (currentConfidence === "Confident") {
        document.getElementById("confident-btn").classList.add("selected");
    } else if (currentConfidence === "Not Sure") {
        document.getElementById("not-sure-btn").classList.add("selected");
    } else if (currentConfidence === "Not Confident") {
        document.getElementById("not-confident-btn").classList.add("selected");
    }
}

function goToNextQuestion() {
    // First check if we have both answer and confidence
    if (userAnswers[currentQuestionIndex] !== null && userConfidence[currentQuestionIndex] !== null) {
        let nextIndex = findNextUnanswered(currentQuestionIndex);
        
        if (nextIndex !== -1) {
            currentQuestionIndex = nextIndex;
            currentConfidence = userConfidence[nextIndex];
            updateQuestion();
        } else {
            // All questions answered - enable review button
            document.getElementById("review-btn").disabled = false;
            // Show review screen
            showReviewScreen();
        }
    } else {
        // Show alert if missing answer or confidence
        alert("Please select both an answer and confidence level before proceeding.");
    }
}

function findNextUnanswered(current) {
    for (let i = current + 1; i < totalQuestions; i++) {
        if (userAnswers[i] === null) return i;
    }
    for (let i = 0; i < current; i++) {
        if (userAnswers[i] === null) return i;
    }
    return -1;
}

function markAnswered(index) {
    const navButtons = document.querySelectorAll(".nav-btn");
    const button = navButtons[index];
    
    // Remove all classes and just add 'answered' to turn it blue
    button.classList.remove("correct", "incorrect");
    button.classList.add("answered");
}

function updateProgress() {
    let answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progress = (answeredCount / totalQuestions) * 100;
    document.getElementById("progress-bar-filled").style.width = progress + "%";
    document.getElementById("progress-bar-filled").textContent = Math.round(progress) + "%";
}

function updateScore() {
    document.getElementById("score").textContent = score;
}

// Review Functions
function showReviewScreen() {
    const quizContainer = document.querySelector(".quiz-container");
    quizContainer.innerHTML = `
        <div class="review-container">
            <h2>Review Your Answers</h2>
            <p>Check your answers before submitting. You can change any answer.</p>
            
            ${imageSet.map((img, index) => `
                <div class="review-item">
                    <h4>Question ${index + 1}</h4>
                    <img class="review-image" src="${img.path}" alt="Question ${index + 1}">
                    <div class="review-answer">
                        Your answer: ${userAnswers[index] || "Not answered yet"}
                        ${userAnswers[index] ? `(${userConfidence[index] || "No confidence level"})` : ''}
                    </div>
                    <div class="review-buttons">
                        <button class="review-change-btn" data-index="${index}" data-answer="Real">Change to Real</button>
                        <button class="review-change-btn" data-index="${index}" data-answer="Fake">Change to Fake</button>
                    </div>
                </div>
            `).join('')}
            
            <div style="margin-top: 20px;">
                <button id="final-submit-btn" class="confidence-btn" style="background-color: #2196F3;">Submit Final Answers</button>
            </div>
        </div>
    `;

    // Add event listeners to the dynamically created buttons
    document.querySelectorAll('.review-change-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const answer = this.getAttribute('data-answer');
            changeAnswer(index, answer);
        });
    });

    // Add event listener for the final submit button AFTER it's created
    const finalSubmitBtn = document.getElementById('final-submit-btn');
    if (finalSubmitBtn) {
        finalSubmitBtn.addEventListener('click', submitFinalAnswers);
    }
}

function changeAnswer(index, answer) {
    userAnswers[index] = answer;
    
    // Update the display
    const answerElements = document.querySelectorAll('.review-answer');
    if (answerElements[index]) {
        answerElements[index].textContent = `Your answer: ${answer} (${userConfidence[index] || "No confidence level"})`;
    }
    
    // Recalculate score
    score = 0;
    userAnswers.forEach((ans, i) => {
        if (ans === correctAnswers[i]) {
            score += 10;
        }
    });
}

function submitFinalAnswers() {
    // Calculate final score
    score = 0;
    imageSet.forEach((img, index) => {
        if (userAnswers[index] === correctAnswers[index]) {
            score += 10;
        }
    });
    
    // End the quiz
    endQuiz();
}

// End Quiz Functions
function endQuiz() {
    clearInterval(timerInterval);
    const quizEndTime = Date.now();
    const timeTaken = Math.floor((quizEndTime - quizStartTime) / 1000);
    
    // Prepare the answers for reporting
    const answersReport = {};
    imageSet.forEach((img, index) => {
        answersReport[index] = {
            imagePath: img.path,
            answer: userAnswers[index],
            confidence: userConfidence[index],
            correct: userAnswers[index] === correctAnswers[index]
        };
    });

    // Get form data from localStorage
    const formData = JSON.parse(localStorage.getItem('formData') || '{}');

    const quizData = {
        timestamp: new Date().toISOString(),
        age: formData.age || "unknown",
        profession: formData.profession || "unknown",
        status: formData.status || "unknown",
        score: score,
        answers: answersReport,
        timeTaken: timeTaken,
        sessionId: sessionId,
        playNumber: playNumber,
        imageSet: imageSet,
        playerId: formData.playerId || generatePlayerId()
    };

    // Store quiz data in localStorage
    storeQuizData(quizData);
    
    // Send data to Google Sheets
    sendDataToGoogleSheets(quizData);

    document.querySelector(".quiz-container").innerHTML = `
        <div class="result-container">
            <h2>Quiz Complete!</h2>
            <p>Score: <strong>${score}/100</strong></p>
            <p>Time Taken: <strong>${Math.floor(timeTaken/60)}m ${timeTaken%60}s</strong></p>
            <div class="stars">${getStarRating()}</div>
            <div class="end-container">
                <button class="end-btn" id="finish-btn">Finish</button>
                <button class="end-btn" id="playagain-btn">Play Again</button>
            </div>
        </div>
    `;

    // Add event listeners to the new buttons
    document.getElementById('finish-btn').addEventListener('click', finishGame);
    document.getElementById('playagain-btn').addEventListener('click', playAgain);
}

// Store quiz data in localStorage
function storeQuizData(quizData) {
    // Get existing player data
    let playerData = JSON.parse(localStorage.getItem('playerData')) || {
        playerId: quizData.playerId,
        scores: [],
        sessions: [],
        attempts: 0,
        formData: {
            age: quizData.age,
            profession: quizData.profession,
            status: quizData.status
        }
    };
    
    // Update player data with new quiz results
    playerData.scores.push(quizData.score);
    playerData.sessions.push({
        sessionId: quizData.sessionId,
        timestamp: quizData.timestamp,
        score: quizData.score,
        timeTaken: quizData.timeTaken
    });
    playerData.attempts = (playerData.attempts || 0) + 1;
    
    // Save updated player data
    localStorage.setItem('playerData', JSON.stringify(playerData));
    
    // Also store the complete quiz data separately
    localStorage.setItem('quizPerformance', JSON.stringify(quizData));
}

function sendDataToGoogleSheets(quizData) {
    try {
        // Prepare the data for submission
        const formData = new URLSearchParams();
        
        // Add basic info
        formData.append('timestamp', quizData.timestamp);
        formData.append('sessionId', quizData.sessionId);
        formData.append('playNumber', quizData.playNumber);
        formData.append('age', quizData.age);
        formData.append('profession', quizData.profession);
        formData.append('status', quizData.status);
        formData.append('score', quizData.score);
        formData.append('timeTaken', quizData.timeTaken);
        formData.append('playerId', quizData.playerId);
        
        // Add answers and confidence levels
        for (let i = 0; i < totalQuestions; i++) {
            formData.append(`q${i+1}_image`, quizData.imageSet[i].path);
            formData.append(`q${i+1}_answer`, userAnswers[i] || '');
            formData.append(`q${i+1}_confidence`, userConfidence[i] || '');
            formData.append(`q${i+1}_correct`, (userAnswers[i] === correctAnswers[i]) ? '1' : '0');
        }
        
        // Send data to Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbyXbr3n2AXR3NIqKhrc82cbju5YkFZtq_zn-6T3NrarE6jNkURzrjnFiRY2ovREC_kx/exec', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error in sendDataToGoogleSheets:', error);
    }
}

function getStarRating() {
    return score >= 80 ? "⭐️⭐️⭐️" : score >= 50 ? "⭐️⭐️☆" : "⭐️☆☆";
}

// Utility Functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function setGradientBackground() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    const gradient = `linear-gradient(to bottom, ${colors[randomIndex][0]}, ${colors[randomIndex][1]})`;
    document.body.style.background = gradient;
}

function setupEventListeners() {
    document.getElementById("real-btn").addEventListener("click", () => checkAnswer(true));
    document.getElementById("fake-btn").addEventListener("click", () => checkAnswer(false));
    
    document.getElementById("confident-btn").addEventListener("click", () => setConfidence("Confident"));
    document.getElementById("not-sure-btn").addEventListener("click", () => setConfidence("Not Sure"));
    document.getElementById("not-confident-btn").addEventListener("click", () => setConfidence("Not Confident"));
    
    document.getElementById("review-btn").addEventListener("click", showReviewScreen);
}

function playAgain() {
    incrementPlayNumber();
    let attempt = parseInt(localStorage.getItem("attempt") || "1", 10);
    attempt++;
    localStorage.setItem("attempt", attempt);
    window.location.reload();
}

function finishGame() {
    resetPlayNumber();
    /* Clear the form data from localStorage if no longer needed.
   Just use the line below after the comment, so it will be automatically indented.
    localStorage.removeItem('playNumberData');
   
    */
    window.location.href = "photo-learning.html";
}

