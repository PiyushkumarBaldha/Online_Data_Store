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
            
            // Store form data in localStorage
            const formData = {
                profession: professionInput.value,
                age: ageInput.value,
                status: statusInput.value,
                playerId: playerId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('formData', JSON.stringify(formData));

            // Prepare form data as URL parameters
            const postData = new URLSearchParams();
            postData.append('timestamp', new Date().toISOString());
            postData.append('playerId', playerId);
            postData.append('profession', professionInput.value);
            postData.append('age', ageInput.value);
            postData.append('status', statusInput.value);

            // Show loading state
            submitBtn.disabled = true;
            window.location.href = "quiz.html";
        
        
        }
    });
});