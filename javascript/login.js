document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.querySelector('.password-toggle');
    const passwordField = document.getElementById('password');
    
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = this.querySelector('i');
            eyeIcon.classList.toggle('bi-eye');
            eyeIcon.classList.toggle('bi-eye-slash');
        });
    }
    
    // Form submission
    const loginForm = document.querySelector('form');
    
    if (loginForm) {
        // Remove the onclick attribute from the button to prevent default navigation
        const loginButton = document.querySelector('.login-btn');
        if (loginButton) {
            loginButton.removeAttribute('onclick');
        }
        
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            

            
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Store current user in session storage
                sessionStorage.setItem('currentUser', JSON.stringify({
                    fullname: user.fullname,
                    email: user.email
                }));
            
                window.location.href = 'profile.html';
            } else {
                // Show error message
                alert('Invalid email or password');
            }
        });
    }
    
    // Social login buttons (for demonstration)
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.textContent.trim();
            console.log(`Attempting to login with ${provider}`);
            alert(`${provider} login functionality would be implemented here`);
            
            // For demo purposes, simulate successful login with social media
            sessionStorage.setItem('currentUser', JSON.stringify({
                fullname: 'Social Media User',
                email: 'social@example.com'
            }));
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    });
    
    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            alert('Password reset functionality would be implemented here');
        });
    }
});