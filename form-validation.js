document.addEventListener("DOMContentLoaded", function() {
    // Form elements
    const submitBtn = document.getElementById("submit-btn");
    const professionInput = document.getElementById("profession");
    const ageInput = document.getElementById("age");
    const statusInput = document.getElementById("status");

    // Developer-controlled settings
    const FIXED_PLAYER_ID_PREFIX = 1000;  // Change this prefix as needed
    let playerCounter = localStorage.getItem('playerCounter') || 1;  // Load counter or start at 1

    submitBtn.addEventListener("click", function(event) {
        event.preventDefault();

        // Form validation
        let isValid = true;
        const ageValue = parseInt(ageInput.value);

        // Reset error styles
        professionInput.style.boxShadow = '';
        ageInput.style.boxShadow = '';
        professionInput.style.borderColor = '';
        ageInput.style.borderColor = '';

        // Validate profession field
        if (professionInput.value === "") {
            professionInput.style.borderColor = "red";
            professionInput.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
            isValid = false;
        }

        // Validate age field
        if (ageInput.value === "" || isNaN(ageValue) || ageValue < 10 || ageValue > 100) {
            ageInput.style.borderColor = "red";
            ageInput.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
            isValid = false;
        }

        // If form is valid, process submission
        if (isValid) {
            // Generate sequential player ID
            const playerId = FIXED_PLAYER_ID_PREFIX + parseInt(playerCounter);
            
            // Prepare form data object
            const formData = {
                profession: professionInput.value,
                age: ageInput.value,
                status: statusInput.value,
                playerId: playerId,
                registrationDate: new Date().toLocaleString()  // Simple local date format
            };

            // Store data in localStorage
            localStorage.setItem('formData', JSON.stringify(formData));
            
            // Increment and save the counter for next use
            playerCounter++;
            localStorage.setItem('playerCounter', playerCounter);

            // Prepare URL parameters
            const postData = new URLSearchParams();
            postData.append('playerId', playerId);
            postData.append('profession', professionInput.value);
            postData.append('age', ageInput.value);
            postData.append('status', statusInput.value);

            // Disable button to prevent multiple submissions
            submitBtn.disabled = true;
            
            // Redirect to quiz page
            window.location.href = "quiz.html";
        }
    });

    // Developer control function (call this in console if needed)
    window.resetPlayerCounter = function(newStart = 1) {
        playerCounter = newStart;
        localStorage.setItem('playerCounter', playerCounter);
        console.log(`Player counter reset to: ${playerCounter}`);
    };
});