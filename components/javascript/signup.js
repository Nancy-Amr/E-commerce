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

    // Form submission event
    form.addEventListener('submit', function(e) {
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
            // Store user data in localStorage (for demo purposes)
            const userData = {
                fullname: fullnameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value // In a real app, never store passwords in plain text
            };
            
            // Check if email already exists
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
            const emailExists = existingUsers.some(user => user.email === userData.email);
            
            if (emailExists) {
                showError(emailInput, 'This email is already registered');
            } else {
                // Save user
                existingUsers.push(userData);
                localStorage.setItem('users', JSON.stringify(existingUsers));
                

                // Redirect to login page
                window.location.href = 'login.html';
            }
        }
    });
});