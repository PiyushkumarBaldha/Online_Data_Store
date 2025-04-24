// AfterQuiz Configuration
const afterQuizColors = [
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

// AfterQuiz Variables
let afterQuizScore = 0;
let currentAfterQuizQuestionIndex = 0;
const totalAfterQuizQuestions = 10;
let afterQuizImageFolder = "Img";
let afterQuizSessionId = generateAfterQuizSessionId();
let afterQuizPlayNumber = getAfterQuizPlayNumber(1);
let afterQuizUserAnswers = new Array(totalAfterQuizQuestions).fill(null);
let afterQuizUserConfidence = new Array(totalAfterQuizQuestions).fill(null);
let afterQuizTimerInterval;
const afterQuizStartTime = Date.now();
let currentAfterQuizConfidence = null;

let afterQuizImageSet = [];
let afterQuizCorrectAnswers = {};

// Initialize the quiz
document.addEventListener("DOMContentLoaded", function() {
    initQuiz();
});

function initQuiz() {
    const afterQuizFormData = JSON.parse(localStorage.getItem('formData') || '{}');
    const afterQuizUserAge = afterQuizFormData.age || localStorage.getItem("userAge");
    const afterQuizUserProfession = afterQuizFormData.profession || localStorage.getItem("userProfession");

    if (afterQuizUserAge !== null && afterQuizUserProfession !== null) {
        const age = parseInt(afterQuizUserAge);
        if (afterQuizUserProfession.toLowerCase() !== "engineer") {
            if (age >= 0 && age <= 18) {
                afterQuizImageFolder = "Img18";
            } else if (age >= 19 && age <= 60) {
                afterQuizImageFolder = "Img60";
            } else if (age >= 61 && age <= 100) {
                afterQuizImageFolder = "Img70";
            }
        }
    }
    
    initializeAfterQuizImageSet();
    createAfterQuizNavigation();
    initializeAfterQuizTimer();
    setupAfterQuizEventListeners();
    updateAfterQuizQuestion();
    initAfterQuizPlayerData(afterQuizFormData);
}

function initAfterQuizPlayerData(afterQuizFormData) {
    if (!localStorage.getItem('playerData')) {
        const afterQuizPlayerData = {
            playerId: afterQuizFormData.playerId || generateAfterQuizPlayerId(),
            scores: [],
            sessions: [],
            attempts: 0,
            formData: {
                age: afterQuizFormData.age || null,
                profession: afterQuizFormData.profession || null,
                status: afterQuizFormData.status || null
            }
        };
        localStorage.setItem('playerData', JSON.stringify(afterQuizPlayerData));
    }
}

function generateAfterQuizPlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

function generateAfterQuizSessionId() {
    return 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function getAfterQuizPlayNumber() {
    let afterQuizPlayData = localStorage.getItem('afterQuizPlayNumberData');
    
    if (!afterQuizPlayData) {
        afterQuizPlayData = {
            base: 1,
            increment: 0
        };
    } else {
        afterQuizPlayData = JSON.parse(afterQuizPlayData);
    }
    
    return `${afterQuizPlayData.base}.${afterQuizPlayData.increment}`;
}

function incrementAfterQuizPlayNumber() {
    let afterQuizPlayData = localStorage.getItem('afterQuizPlayNumberData');
    
    if (!afterQuizPlayData) {
        afterQuizPlayData = {
            base: 1,
            increment: 0
        };
    } else {
        afterQuizPlayData = JSON.parse(afterQuizPlayData);
    }
    
    afterQuizPlayData.increment += 1;
    localStorage.setItem('afterQuizPlayNumberData', JSON.stringify(afterQuizPlayData));
}

function resetAfterQuizPlayNumber() {
    let afterQuizPlayData = localStorage.getItem('afterQuizPlayNumberData');
    
    if (!afterQuizPlayData) {
        afterQuizPlayData = {
            base: 1,
            increment: 0
        };
    } else {
        afterQuizPlayData = JSON.parse(afterQuizPlayData);
    }
    
    afterQuizPlayData.base += 1;
    afterQuizPlayData.increment = 0;
    localStorage.setItem('afterQuizPlayNumberData', JSON.stringify(afterQuizPlayData));
}

function initializeAfterQuizImageSet() {
    const totalImages = 50;
    
    const allAfterQuizRImages = Array.from({length: totalImages}, (_, i) => ({
        path: `${afterQuizImageFolder}/R/${i+1}.jpg`,
        answer: "Real"
    }));
    
    const allAfterQuizFImages = Array.from({length: totalImages}, (_, i) => ({
        path: `${afterQuizImageFolder}/F/${i+1}.jpg`,
        answer: "Fake"
    }));
    
    shuffleAfterQuizArray(allAfterQuizRImages);
    shuffleAfterQuizArray(allAfterQuizFImages);
    
    const selectedAfterQuizR = allAfterQuizRImages.slice(0, 5);
    const selectedAfterQuizF = allAfterQuizFImages.slice(0, 5);
    
    afterQuizImageSet = [...selectedAfterQuizR, ...selectedAfterQuizF];
    shuffleAfterQuizArray(afterQuizImageSet);
    
    afterQuizImageSet.forEach((img, index) => {
        afterQuizCorrectAnswers[index] = img.answer;
    });
}

function shuffleAfterQuizArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createAfterQuizNavigation() {
    const navContainer = document.getElementById("question-nav");

    for (let i = 0; i < totalAfterQuizQuestions; i++) {
        let btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.classList.add("nav-btn");
        btn.addEventListener("click", () => goToAfterQuizQuestion(i));
        navContainer.appendChild(btn);
    }
}

function goToAfterQuizQuestion(index) {
    currentAfterQuizQuestionIndex = index;
    currentAfterQuizConfidence = afterQuizUserConfidence[index];
    updateAfterQuizQuestion();
}

function initializeAfterQuizTimer() {
    const timerElement = document.getElementById("timer");

    let totalTime = 600;
    function updateAfterQuizTimer() {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalTime <= 60) {
            timerElement.style.color = "red";
        }

        if (totalTime <= 0) {
            clearInterval(afterQuizTimerInterval);
            endAfterQuiz();
        }
        totalTime--;
    }
    afterQuizTimerInterval = setInterval(updateAfterQuizTimer, 1000);
    updateAfterQuizTimer();
}

function updateAfterQuizQuestion() {
    setAfterQuizGradientBackground();
    document.getElementById("question-title").textContent = "Question " + (currentAfterQuizQuestionIndex + 1);
    
    const quizImage = document.getElementById("quiz-image");
    const currentImage = afterQuizImageSet[currentAfterQuizQuestionIndex];
    
    if (currentImage) {
        quizImage.src = currentImage.path;
        quizImage.onerror = function() {
            console.error("Failed to load image:", currentImage.path);
            quizImage.src = "Img/default.jpg";
        };
    }
    
    updateAfterQuizConfidenceButtons();
}

function checkAfterQuizAnswer(isReal) {
    const answer = isReal ? "Real" : "Fake";
    afterQuizUserAnswers[currentAfterQuizQuestionIndex] = answer;
    
    afterQuizScore = 0;
    afterQuizUserAnswers.forEach((ans, index) => {
        if (ans === afterQuizCorrectAnswers[index]) {
            afterQuizScore += 10;
        }
    });
    
    updateAfterQuizScore();
    markAfterQuizAnswered(currentAfterQuizQuestionIndex);
    updateAfterQuizProgress();
    
    if (currentAfterQuizConfidence !== null) {
        goToNextAfterQuizQuestion();
    }
}

function setAfterQuizConfidence(confidence) {
    currentAfterQuizConfidence = confidence;
    afterQuizUserConfidence[currentAfterQuizQuestionIndex] = confidence;
    updateAfterQuizConfidenceButtons();
    
    if (afterQuizUserAnswers[currentAfterQuizQuestionIndex] !== null) {
        goToNextAfterQuizQuestion();
    }
}

function updateAfterQuizConfidenceButtons() {
    const buttons = document.querySelectorAll(".confidence-btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    
    if (currentAfterQuizConfidence === "Confident") {
        document.getElementById("confident-btn").classList.add("selected");
    } else if (currentAfterQuizConfidence === "Not Sure") {
        document.getElementById("not-sure-btn").classList.add("selected");
    } else if (currentAfterQuizConfidence === "Not Confident") {
        document.getElementById("not-confident-btn").classList.add("selected");
    }
}

function goToNextAfterQuizQuestion() {
    if (afterQuizUserAnswers[currentAfterQuizQuestionIndex] !== null && 
        afterQuizUserConfidence[currentAfterQuizQuestionIndex] !== null) {
        let nextIndex = findNextAfterQuizUnanswered(currentAfterQuizQuestionIndex);
        
        if (nextIndex !== -1) {
            currentAfterQuizQuestionIndex = nextIndex;
            currentAfterQuizConfidence = afterQuizUserConfidence[nextIndex];
            updateAfterQuizQuestion();
        } else {
            document.getElementById("review-btn").disabled = false;
            showAfterQuizReviewScreen();
        }
    } else {
        alert("Please select both an answer and confidence level before proceeding.");
    }
}

function findNextAfterQuizUnanswered(current) {
    for (let i = current + 1; i < totalAfterQuizQuestions; i++) {
        if (afterQuizUserAnswers[i] === null) return i;
    }
    for (let i = 0; i < current; i++) {
        if (afterQuizUserAnswers[i] === null) return i;
    }
    return -1;
}

function markAfterQuizAnswered(index) {
    const navButtons = document.querySelectorAll(".nav-btn");
    const button = navButtons[index];
    button.classList.remove("correct", "incorrect");
    button.classList.add("answered");
}

function updateAfterQuizProgress() {
    let answeredCount = afterQuizUserAnswers.filter(answer => answer !== null).length;
    const progress = (answeredCount / totalAfterQuizQuestions) * 100;
    document.getElementById("progress-bar-filled").style.width = progress + "%";
    document.getElementById("progress-bar-filled").textContent = Math.round(progress) + "%";
}

function updateAfterQuizScore() {
    document.getElementById("score").textContent = afterQuizScore;
}

function showAfterQuizReviewScreen() {
    const quizContainer = document.querySelector(".quiz-container");
    quizContainer.innerHTML = `
        <div class="review-container">
            <h2>Review Your Answers</h2>
            <p>Check your answers before submitting. You can change any answer.</p>
            
            ${afterQuizImageSet.map((img, index) => `
                <div class="review-item">
                    <h4>Question ${index + 1}</h4>
                    <img class="review-image" src="${img.path}" alt="Question ${index + 1}">
                    <div class="review-answer">
                        Your answer: ${afterQuizUserAnswers[index] || "Not answered yet"}
                        ${afterQuizUserAnswers[index] ? `(${afterQuizUserConfidence[index] || "No confidence level"})` : ''}
                    </div>
                    <div class="review-buttons">
                        <button class="review-change-btn" data-index="${index}" data-answer="Real">Change to Real</button>
                        <button class="review-change-btn" data-index="${index}" data-answer="Fake">Change to Fake</button>
                    </div>
                </div>
            `).join('')}
            
            <div style="margin-top: 20px;">
                <button id="final-submit-btn" class="submit-btn">Submit Final Answers</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.review-change-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const answer = this.getAttribute('data-answer');
            afterQuizUserAnswers[index] = answer;
            
            const answerElements = document.querySelectorAll('.review-answer');
            if (answerElements[index]) {
                answerElements[index].textContent = `Your answer: ${answer} (${afterQuizUserConfidence[index] || "No confidence level"})`;
            }
            
            // Recalculate score
            afterQuizScore = 0;
            for (let i = 0; i < totalAfterQuizQuestions; i++) {
                if (afterQuizUserAnswers[i] === afterQuizCorrectAnswers[i]) {
                    afterQuizScore += 10;
                }
            }
        });
    });

    const submitBtn = document.getElementById('final-submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate all questions are answered
            for (let i = 0; i < totalAfterQuizQuestions; i++) {
                if (afterQuizUserAnswers[i] === null || afterQuizUserConfidence[i] === null) {
                    alert("Please answer all questions before submitting!");
                    return;
                }
            }
            
            // Calculate final score
            afterQuizScore = 0;
            for (let i = 0; i < totalAfterQuizQuestions; i++) {
                if (afterQuizUserAnswers[i] === afterQuizCorrectAnswers[i]) {
                    afterQuizScore += 10;
                }
            }
            
            // Show results
            endAfterQuiz();
        });
    }
}

function endAfterQuiz() {
    clearInterval(afterQuizTimerInterval);
    const afterQuizEndTime = Date.now();
    const timeTaken = Math.floor((afterQuizEndTime - afterQuizStartTime) / 1000);
    
    const afterQuizAnswersReport = {};
    afterQuizImageSet.forEach((img, index) => {
        afterQuizAnswersReport[index] = {
            imagePath: img.path,
            answer: afterQuizUserAnswers[index],
            confidence: afterQuizUserConfidence[index],
            correct: afterQuizUserAnswers[index] === afterQuizCorrectAnswers[index]
        };
    });

    const afterQuizFormData = JSON.parse(localStorage.getItem('formData') || {});

    const afterQuizData = {
        timestamp: new Date().toISOString(),
        age: afterQuizFormData.age || "unknown",
        profession: afterQuizFormData.profession || "unknown",
        status: afterQuizFormData.status || "unknown",
        score: afterQuizScore,
        answers: afterQuizAnswersReport,
        timeTaken: timeTaken,
        sessionId: afterQuizSessionId,
        playNumber: afterQuizPlayNumber,
        imageSet: afterQuizImageSet,
        playerId: afterQuizFormData.playerId || generateAfterQuizPlayerId()
    };

    storeAfterQuizData(afterQuizData);
    sendAfterQuizDataToGoogleSheets(afterQuizData);

    document.querySelector(".quiz-container").innerHTML = `
        <div class="result-container">
            <h2>Quiz Complete!</h2>
            <p>Score: <strong>${afterQuizScore}/100</strong></p>
            <p>Time Taken: <strong>${Math.floor(timeTaken/60)}m ${timeTaken%60}s</strong></p>
            <div class="stars">${getAfterQuizStarRating()}</div>
            <div class="end-container">
                <button class="end-btn" id="finish-btn">Finish</button>
                <button class="end-btn" id="playagain-btn">Play Again</button>
            </div>
        </div>
    `;

    document.getElementById('finish-btn').addEventListener('click', finishAfterQuizGame);
    document.getElementById('playagain-btn').addEventListener('click', playAfterQuizAgain);
}

function storeAfterQuizData(afterQuizData) {
    const playerData = JSON.parse(localStorage.getItem('playerData')) || {
        playerId: afterQuizData.playerId,
        scores: [],
        sessions: [],
        attempts: 0,
        formData: {
            age: afterQuizData.age,
            profession: afterQuizData.profession,
            status: afterQuizData.status
        }
    };
    
    playerData.scores.push(afterQuizData.score);
    playerData.sessions.push({
        sessionId: afterQuizData.sessionId,
        timestamp: afterQuizData.timestamp,
        score: afterQuizData.score,
        timeTaken: afterQuizData.timeTaken
    });
    playerData.attempts = (playerData.attempts || 0) + 1;
    
    localStorage.setItem('playerData', JSON.stringify(playerData));
    localStorage.setItem('afterQuizPerformance', JSON.stringify(afterQuizData));
}

function sendAfterQuizDataToGoogleSheets(afterQuizData) {
    const formData = new URLSearchParams();
    
    formData.append('timestamp', afterQuizData.timestamp);
    formData.append('sessionId', afterQuizData.sessionId);
    formData.append('playNumber', afterQuizData.playNumber);
    formData.append('age', afterQuizData.age);
    formData.append('profession', afterQuizData.profession);
    formData.append('status', afterQuizData.status);
    formData.append('score', afterQuizData.score);
    formData.append('timeTaken', afterQuizData.timeTaken);
    formData.append('playerId', afterQuizData.playerId);
    
    for (let i = 0; i < totalAfterQuizQuestions; i++) {
        formData.append(`q${i+1}_image`, afterQuizData.imageSet[i].path);
        formData.append(`q${i+1}_answer`, afterQuizUserAnswers[i] || '');
        formData.append(`q${i+1}_confidence`, afterQuizUserConfidence[i] || '');
        formData.append(`q${i+1}_correct`, (afterQuizUserAnswers[i] === afterQuizCorrectAnswers[i]) ? '1' : '0');
    }
    
    fetch('https://script.google.com/macros/s/AKfycbzOz4WvkQ7gDPzIfvBHLRV800CEESD02Fs0ss7tCcHo9R_hF597bYjDSrcRvKvsN65cUw/exec', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getAfterQuizStarRating() {
    return afterQuizScore >= 80 ? "⭐️⭐️⭐️" : afterQuizScore >= 50 ? "⭐️⭐️☆" : "⭐️☆☆";
}

function setAfterQuizGradientBackground() {
    const randomIndex = Math.floor(Math.random() * afterQuizColors.length);
    const gradient = `linear-gradient(to bottom, ${afterQuizColors[randomIndex][0]}, ${afterQuizColors[randomIndex][1]})`;
    document.body.style.background = gradient;
}

function setupAfterQuizEventListeners() {
    document.getElementById("real-btn").addEventListener("click", () => checkAfterQuizAnswer(true));
    document.getElementById("fake-btn").addEventListener("click", () => checkAfterQuizAnswer(false));
    
    document.getElementById("confident-btn").addEventListener("click", () => setAfterQuizConfidence("Confident"));
    document.getElementById("not-sure-btn").addEventListener("click", () => setAfterQuizConfidence("Not Sure"));
    document.getElementById("not-confident-btn").addEventListener("click", () => setAfterQuizConfidence("Not Confident"));
    
    document.getElementById("review-btn").addEventListener("click", showAfterQuizReviewScreen);
}

function playAfterQuizAgain() {
    incrementAfterQuizPlayNumber();
    let attempt = parseInt(localStorage.getItem("attempt") || "1", 10);
    attempt++;
    localStorage.setItem("attempt", attempt);
    window.location.reload();
}

function finishAfterQuizGame() {
    resetAfterQuizPlayNumber();
    localStorage.removeItem('formData');
    window.location.href = "photo-learning.html";
}