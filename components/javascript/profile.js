document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    console.log(token);

    if (!token) {
        // Redirect to login if no token found
        window.location.href = 'login.html';
        //return;
    }
      // Fetch user profile data from server
      fetchUserProfile(token);
    
    // Get form elements
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const profileNameDisplay = document.querySelector('h4');
    const phoneContainer = document.querySelector('#phone').parentElement;
    const addressContainer = document.querySelector('#address').parentElement;
    
    // Create containers for multiple phone numbers and addresses
    const phonesContainer = document.createElement('div');
    phonesContainer.id = 'phones-container';
    phoneContainer.appendChild(phonesContainer);
    
    const addressesContainer = document.createElement('div');
    addressesContainer.id = 'addresses-container';
    addressContainer.appendChild(addressesContainer);
    
    // Add buttons for adding more phone numbers and addresses
    const addPhoneBtn = document.createElement('button');
    addPhoneBtn.type = 'button';
    addPhoneBtn.className = 'btn btn-sm btn-outline-primary mt-2';
    addPhoneBtn.textContent = 'Add Another Phone';
    phoneContainer.appendChild(addPhoneBtn);
    
    const addAddressBtn = document.createElement('button');
    addAddressBtn.type = 'button';
    addAddressBtn.className = 'btn btn-sm btn-outline-primary mt-2';
    addAddressBtn.textContent = 'Add Another Address';
    addressContainer.appendChild(addAddressBtn);
    
    // Phone number validation function
    function isValidPhoneNumber(phone) {
        // More strict phone validation - requires minimum digits
        // This pattern requires at least 10 digits in total (not counting separators)
        const phoneRegex = /^(\+\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{4,9}$/;
        
        // Count actual digits to ensure minimum length
        const digitCount = phone.replace(/\D/g, '').length;
        return phoneRegex.test(phone) && digitCount >= 10;
    }
    
    // Add validation to the main phone input
    if (phoneInput) {
        phoneInput.classList.add('phone-input'); // Add the class for form submission validation
        
        phoneInput.addEventListener('blur', function() {
            if (this.value && !isValidPhoneNumber(this.value)) {
                this.classList.add('is-invalid');
                
                // Add error message if not exists
                let errorMsg = phoneContainer.querySelector('.invalid-feedback');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'invalid-feedback';
                    errorMsg.textContent = 'Please enter a valid phone number';
                    phoneContainer.appendChild(errorMsg);
                }
            } else {
                this.classList.remove('is-invalid');
                const errorMsg = phoneContainer.querySelector('.invalid-feedback');
                if (errorMsg) errorMsg.remove();
            }
        });
    }
    
    // Function to create a new phone input
    function createPhoneInput(value = '') {
        const phoneGroup = document.createElement('div');
        phoneGroup.className = 'input-group mb-2';
        
        const phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.className = 'form-control phone-input';
        phoneInput.value = value;
        phoneInput.placeholder = 'Enter phone number';
        
        // Add validation on blur
        phoneInput.addEventListener('blur', function() {
            if (this.value && !isValidPhoneNumber(this.value)) {
                this.classList.add('is-invalid');
                
                // Add error message if not exists
                let errorMsg = phoneGroup.querySelector('.invalid-feedback');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'invalid-feedback';
                    errorMsg.textContent = 'Please enter a valid phone number';
                    phoneGroup.appendChild(errorMsg);
                }
            } else {
                this.classList.remove('is-invalid');
                const errorMsg = phoneGroup.querySelector('.invalid-feedback');
                if (errorMsg) errorMsg.remove();
            }
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.addEventListener('click', function() {
            phoneGroup.remove();
        });
        
        phoneGroup.appendChild(phoneInput);
        phoneGroup.appendChild(deleteBtn);
        
        return phoneGroup;
    }
    
    // Function to create a new address input
    function createAddressInput(value = '') {
        const addressGroup = document.createElement('div');
        addressGroup.className = 'input-group mb-2';
        
        const addressInput = document.createElement('textarea');
        addressInput.className = 'form-control address-input';
        addressInput.rows = 2;
        addressInput.value = value;
        addressInput.placeholder = 'Enter address';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.addEventListener('click', function() {
            addressGroup.remove();
        });
        
        addressGroup.appendChild(addressInput);
        addressGroup.appendChild(deleteBtn);
        
        return addressGroup;
    }
    
    // Add event listeners for adding more inputs
    addPhoneBtn.addEventListener('click', function() {
        phonesContainer.appendChild(createPhoneInput());
    });
    
    addAddressBtn.addEventListener('click', function() {
        addressesContainer.appendChild(createAddressInput());
    });
    
    
    // Handle profile image upload
    const profileImageContainer = document.querySelector('.profile-image-container');
    if (profileImageContainer) {
        profileImageContainer.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        const profileImage = document.querySelector('.profile-image');
                        profileImage.src = event.target.result;
                        
                        // In a real implementation, this would be uploaded to the server
                        // We'll implement file upload in a future update
                        const formData = new FormData();
                        formData.append('profileImage', e.target.files[0]);
                        
                        // Upload profile image to server
                        fetch('/api/user/profile/image', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to upload profile image');
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Profile image uploaded successfully');
                        })
                        .catch(error => {
                            console.error('Error uploading profile image:', error);
                            // Show error message
                            alert('Failed to upload profile image. Please try again.');
                        });
                    };
                    
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            fileInput.click();
        });
    }
    
    // Setup form submission
    const profileForm = document.querySelector('form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all phone inputs
            const phoneInputs = document.querySelectorAll('.phone-input');
            let allPhonesValid = true;
            let hasAtLeastOnePhone = false;
            
            phoneInputs.forEach(input => {
                // Force validation on all phone inputs before submission
                if (input.value.trim()) {
                    hasAtLeastOnePhone = true;
                    if (!isValidPhoneNumber(input.value)) {
                        input.classList.add('is-invalid');
                        allPhonesValid = false;
                        
                        // Make sure error message is visible
                        const parentElement = input.closest('.input-group') || phoneContainer;
                        let errorMsg = parentElement.querySelector('.invalid-feedback');
                        if (!errorMsg) {
                            errorMsg = document.createElement('div');
                            errorMsg.className = 'invalid-feedback d-block'; // d-block ensures visibility
                            errorMsg.textContent = 'Please enter a valid phone number (at least 10 digits)';
                            parentElement.appendChild(errorMsg);
                        } else {
                            errorMsg.className = 'invalid-feedback d-block';
                        }
                    }
                }
            });
            
            // Check if at least one phone number is provided
            if (!hasAtLeastOnePhone) {
                phoneInput.classList.add('is-invalid');
                let errorMsg = phoneContainer.querySelector('.invalid-feedback');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'invalid-feedback';
                    errorMsg.textContent = 'At least one phone number is required';
                    phoneContainer.appendChild(errorMsg);
                }
                return;
            }
            
            // Collect all phone numbers
            const phones = [];
            document.querySelectorAll('.phone-input').forEach(input => {
                if (input.value.trim()) {
                    phones.push(input.value.trim());
                }
            });
            
            // Collect all addresses
            const addresses = [];
            document.querySelectorAll('.address-input').forEach(input => {
                if (input.value.trim()) {
                    addresses.push(input.value.trim());
                }
            });
            
            // Format address for API
            const addressParts = addresses[0] ? addresses[0].split(',').map(part => part.trim()) : [];
            const address = {
                street: addressParts[0] || 'street',
                city: addressParts.length > 1 ? addressParts[1] : 'city',
            };
            
            // Prepare user data for API
            const userData = {
                fullname: fullNameInput.value.trim(),
                phoneNumbers: phones,
                address: address
            };
            
            // Send update to server
            updateUserProfile(token, userData);
        });
    }
    
    // Setup logout button
    const logoutBtn = document.querySelector('.btn-outline-secondary');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Call logout API endpoint
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(() => {
                // Remove token from localStorage
                localStorage.removeItem('authToken');
                // Redirect to login page
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                // Even if there's an error, remove token and redirect
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            });
        });
    }
});

// Function to fetch user profile from database
function fetchUserProfile(token) {
    // Clear any example data first
    //document.querySelector('h4').textContent = 'Loading...';
    //document.getElementById('fullName').value = '';
    //document.getElementById('email').value = '';
   // document.getElementById('phone').value = '';
  //  document.getElementById('address').value = '';
    
    fetch('/api/user/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid, redirect to login
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to fetch profile');
        }
        return response.json();
    })
    .then(data => {
        if (!data.success || !data.user) {
            throw new Error('Invalid response from server');
        }
        
        const userData = data.user;
        
        // Populate the form with user data
        document.querySelector('h4').textContent = userData.fullname || 'User';
        document.getElementById('fullName').value = userData.fullname || '';
        document.getElementById('email').value = userData.email || '';
        
        // Set the main phone number
        if (userData.phoneNumbers && userData.phoneNumbers.length > 0) {
            document.getElementById('phone').value = userData.phoneNumbers[0] || '';
            
            // Add additional phone numbers
            const phonesContainer = document.getElementById('phones-container');
            for (let i = 1; i < userData.phoneNumbers.length; i++) {
                phonesContainer.appendChild(createPhoneInput(userData.phoneNumbers[i]));
            }
        }
        
        // Format address if available
        let addressText = '';
        if (userData.address) {
            const addr = userData.address;
            addressText = [
                addr.street,
                addr.city,
                addr.state,
                addr.zipCode,
                addr.country
            ].filter(Boolean).join(', ');
        }
        document.getElementById('address').value = addressText;
        
        // Update profile image if available
        if (userData.profilePicture && userData.profilePicture !== 'default-profile.png') {
            document.querySelector('.profile-image').src = `/uploads/profiles/${userData.profilePicture}`;
        }
        
        // Disable email field (as it shouldn't be editable)
        document.getElementById('email').disabled = true;
        document.getElementById('email').classList.add('bg-light');
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        // Create an alert for error message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = 'Failed to load profile. Please try again later.';
        
        // Insert after the form
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alertDiv, form.nextSibling);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    });
}

// Function to update user profile in database
function updateUserProfile(token, userData) {
    fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid, redirect to login
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to update profile');
        }
        return response.json();
    })
    .then(data => {
        // Update the profile name display
        document.querySelector('h4').textContent = userData.fullname;
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.textContent = 'Profile updated successfully!';
        
        // Insert after the form
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alertDiv, form.nextSibling);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        
        // Show error message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = 'Failed to update profile. Please try again.';
        
        // Insert after the form
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alertDiv, form.nextSibling);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    });
}