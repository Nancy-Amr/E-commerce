document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    document.querySelector('.password-toggle').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    });

    // Form validation
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const statusMessage = document.getElementById('status-message') || createStatusMessage();

    // Create status message element if it doesn't exist
    function createStatusMessage() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'status-message';
        statusDiv.className = 'alert d-none mb-3';
        const formContainer = document.querySelector('.login-form-container');
        formContainer.insertBefore(statusDiv, form);
        return statusDiv;
    }

    // Error message display function
    function showError(input, message) {
        const formControl = input.parentElement;
        let errorElement = formControl.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message text-danger small mt-1';
            formControl.appendChild(errorElement);
        }
        
        errorElement.innerText = message;
        input.classList.add('is-invalid');
    }

    // Success state function
    function showSuccess(input) {
        const formControl = input.parentElement;
        const errorElement = formControl.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }

    // Display status message
    function displayStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `alert alert-${type} mb-3`;
        statusMessage.classList.remove('d-none');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusMessage.classList.add('d-none');
        }, 5000);
    }

    // Form submission event
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate inputs
        let isValid = true;
        
        // Validate email
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (emailInput.value.trim() === '') {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            showSuccess(emailInput);
        }
        
        // Validate password
        if (passwordInput.value === '') {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else {
            showSuccess(passwordInput);
        }
        
        if (isValid) {
            // Prepare login data for API
            const loginData = {
                email: emailInput.value.trim(),
                password: passwordInput.value
            };
            
            try {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
                submitBtn.disabled = true;
                
                // Send login request to backend API
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                const data = await response.json();
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                // Store token from API response
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                displayStatusMessage('Login successful! Redirecting...', 'success');
                window.location.href = 'profile.html';
                
                // Redirect to dashboard or home page
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
                
            } catch (error) {
                console.error('Login error:', error);
                displayStatusMessage(`Login failed: ${error.message}`, 'danger');
            }
        }
    });
    
    // Social login handlers
    /*document.getElementById('google-login').addEventListener('click', function() {
        displayStatusMessage('Google authentication is not implemented yet', 'warning');
    });
    
    document.getElementById('facebook-login').addEventListener('click', function() {
        displayStatusMessage('Facebook authentication is not implemented yet', 'warning');
    });*/
});