document.addEventListener('DOMContentLoaded', function() {
    // Display quiz results
    try {
        const quizData = JSON.parse(localStorage.getItem('quizPerformance')) || {};
        const resultsDiv = document.getElementById('quiz-results');
        
        if (quizData.score !== undefined) {
            resultsDiv.innerHTML = `
                <h3>Your Quiz Results</h3>
                <p>Score: <strong>${quizData.score}/100</strong></p>
                <div class="stars">${getStarRating(quizData.score)}</div>
                <p>Time: <strong>${Math.floor(quizData.timeTaken/60)}m ${quizData.timeTaken%60}s</strong></p>
                <div class="end-container">
                    <button class="end-btn" id="playagain-btn">Play Again</button>
                </div>
            `;
            
            document.getElementById('playagain-btn').addEventListener('click', playAgain);
        } else {
            resultsDiv.innerHTML = `
                <h3>Ready to Learn?</h3>
                <p>Complete the quiz to see your results here</p>
                <div class="end-container">
                    <button class="end-btn" onclick="window.location.href='quiz.html'">Take Quiz</button>
                </div>
            `;
        }
    } catch (e) {
        console.error("Error loading quiz results:", e);
        document.getElementById('quiz-results').innerHTML = `
            <p>Error loading quiz results</p>
        `;
    }
    
    // Image viewer functionality
    const imageElement = document.getElementById('featured-image');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const counterElement = document.getElementById('image-counter');
    
    let currentImageIndex = 1;
    const totalImages = 8;
    
    function updateImage() {
        imageElement.src = `LearningFakeImage/${currentImageIndex}.jpg`;
        counterElement.textContent = `${currentImageIndex}/${totalImages}`;
        
        // Disable/enable buttons based on current image
        prevBtn.disabled = currentImageIndex === 1;
        nextBtn.disabled = currentImageIndex === totalImages;
    }
    
    prevBtn.addEventListener('click', function() {
        if (currentImageIndex > 1) {
            currentImageIndex--;
            updateImage();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentImageIndex < totalImages) {
            currentImageIndex++;
            updateImage();
        }
    });
    
    // Initialize the image viewer
    updateImage();
  
    // Track selected cards
    const selectedCards = new Set();
  
    // Add event listeners to option cards
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            
            // Toggle selection
            if (selectedCards.has(topic)) {
                this.classList.remove('selected');
                selectedCards.delete(topic);
            } else {
                this.classList.add('selected');
                selectedCards.add(topic);
            }
            
            showInfo(topic);
        });
    });
  
    // Add event listener to back button
    document.getElementById('back-btn').addEventListener('click', goBack);
});
  
function getStarRating(score) {
    const fullStars = Math.floor(score / 20);
    const halfStar = score % 20 >= 10 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '⭐'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(emptyStars);
}
  
function showInfo(topic) {
    // Hide all info sections first
    document.querySelectorAll('.info-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected info section
    const infoSection = document.getElementById(`${topic}-info`);
    if (infoSection) {
        infoSection.style.display = 'block';
        infoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
  
function goBack() {
    window.location.href = 'afterQuiz.html';
}
  
function playAgain() {
    let attempt = parseInt(localStorage.getItem("attempt") || "1", 10);
    attempt++;
    localStorage.setItem("attempt", attempt);
    window.location.href = "quiz.html";
}