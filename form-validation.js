document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.getElementById("submit-btn");
    const professionInput = document.getElementById("profession");
    const ageInput = document.getElementById("age");
    const statusInput = document.getElementById("status");

    submitBtn.addEventListener("click", function(event) {
        event.preventDefault();

        let isValid = true;
        const ageValue = parseInt(ageInput.value);

        // Reset error styles
        professionInput.style.boxShadow = '';
        ageInput.style.boxShadow = '';
        professionInput.style.borderColor = '';
        ageInput.style.borderColor = '';

        if (professionInput.value === "") {
            professionInput.style.borderColor = "red";
            professionInput.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
            isValid = false;
        }

        if (ageInput.value === "" || isNaN(ageValue) || ageValue < 10 || ageValue > 100) {
            ageInput.style.borderColor = "red";
            ageInput.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
            isValid = false;
        }

        if (isValid) {
            // Generate a simple player ID (timestamp + random number)
            const playerId = Date.now() + Math.floor(Math.random() * 1000);
            
            // Prepare form data as URL parameters
            const formData = new URLSearchParams();
            formData.append('timestamp', new Date().toISOString());
            formData.append('playerId', playerId);
            formData.append('profession', professionInput.value);
            formData.append('age', ageInput.value);
            formData.append('status', statusInput.value);

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";

            // Send data to Google Sheets
            fetch('https://script.google.com/macros/s/AKfycbx6VJxfGM61Ro1tD1QIxeCu5Vsho0FW2eXyaQG-1Ciyb-OtKDNB-Sfc0m8Jle3HRG6-/exec', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Store player ID in session storage
                    sessionStorage.setItem('playerId', data.playerId);
                    // Redirect to quiz page
                    window.location.href = "quiz.html";
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting form: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit";
            });
        }
    });
});