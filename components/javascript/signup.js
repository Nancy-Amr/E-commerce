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
    
    function isStrongPassword(password) {
        // Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

    document.querySelector('.password-toggle-confirm').addEventListener('click', function() {
        const passwordInput = document.getElementById('confirm-password');
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
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
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
        
        // Validate password strength
        let passwordValid = true;
        if (!isStrongPassword(passwordInput.value)) {
            showError(passwordInput, 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character');
            passwordValid = false;
        } else {
            showSuccess(passwordInput);
        }
        
        // Check if passwords match
        let passwordsMatch = true;
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Passwords do not match');
            passwordsMatch = false;
        } else {
            showSuccess(confirmPasswordInput);
        }
        
        // Check terms agreement
        let termsValid = true;
        if (!termsCheckbox.checked) {
            showError(termsCheckbox, 'You must agree to the terms and conditions');
            termsValid = false;
        } else {
            showSuccess(termsCheckbox);
        }
        
        if (passwordValid && passwordsMatch && termsValid) {
            // Prepare user data for API
            const userData = {
                fullname: fullnameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            };
            
            try {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';
                submitBtn.disabled = true;
                
                // Send registration request to backend API
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
            
                displayStatusMessage('Account created successfully! Redirecting...', 'success');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                console.error('Registration error:', error);
                displayStatusMessage(`Registration failed: ${error.message}`, 'danger');
            }
        }
    });
    
    // Social login handlers
    document.getElementById('google-signup').addEventListener('click', function() {
        // For testing purposes
        displayStatusMessage('Google authentication is not implemented in this demo', 'warning');
        // In a real implementation, you would redirect to Google OAuth endpoint
        // window.location.href = '/api/auth/google';
    });
    
    document.getElementById('facebook-signup').addEventListener('click', function() {
        // For testing purposes
        displayStatusMessage('Facebook authentication is not implemented in this demo', 'warning');
        // In a real implementation, you would redirect to Facebook OAuth endpoint
        // window.location.href = '/api/auth/facebook';
    });
});