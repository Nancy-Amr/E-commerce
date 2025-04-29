document.addEventListener('DOMContentLoaded', function() {
    // Get current user from session storage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get form elements
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const profileNameDisplay = document.querySelector('.col-md-4.text-center h4');
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
    
    // Populate form with user data
    if (currentUser) {
        fullNameInput.value = currentUser.fullname || '';
        emailInput.value = currentUser.email || '';
        
        // Update the profile name display
        if (profileNameDisplay) {
            profileNameDisplay.textContent = currentUser.fullname || 'User';
        }
        
        // Disable email field (as requested)
        emailInput.disabled = true;
        emailInput.classList.add('bg-light');
        
        // Get additional user data from localStorage if available
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userDetails = users.find(user => user.email === currentUser.email);
        
        if (userDetails) {
            // If we have additional details stored, populate them
            // Set the first phone number in the main input
            if (userDetails.phones && userDetails.phones.length > 0) {
                phoneInput.value = userDetails.phones[0] || '';
                
                // Add additional phone numbers
                for (let i = 1; i < userDetails.phones.length; i++) {
                    phonesContainer.appendChild(createPhoneInput(userDetails.phones[i]));
                }
            } else {
                phoneInput.value = userDetails.phone || '';
            }
            
            // Set the first address in the main input
            if (userDetails.addresses && userDetails.addresses.length > 0) {
                addressInput.value = userDetails.addresses[0] || '';
                
                // Add additional addresses
                for (let i = 1; i < userDetails.addresses.length; i++) {
                    addressesContainer.appendChild(createAddressInput(userDetails.addresses[i]));
                }
            } else {
                addressInput.value = userDetails.address || '';
            }
        }
    }
    
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
                        
                        // Store profile image in localStorage
                        localStorage.setItem(`profileImage_${currentUser.email}`, event.target.result);
                    };
                    
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            fileInput.click();
        });
        
        // Load profile image if previously uploaded
        const savedProfileImage = localStorage.getItem(`profileImage_${currentUser.email}`);
        if (savedProfileImage) {
            const profileImage = document.querySelector('.profile-image');
            if (profileImage) {
                profileImage.src = savedProfileImage;
            }
        }
    }
    
    // Handle form submission
    const profileForm = document.querySelector('#personal form');
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
                alert('Please provide at least one phone number');
                return;
            }
            
            if (!allPhonesValid) {
                alert('Please correct the invalid phone numbers');
                return;
            }
            
            // Get updated values
            const updatedFullName = fullNameInput.value.trim();
            
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
            
            // Update current user in session storage
            currentUser.fullname = updatedFullName;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(user => user.email === currentUser.email);
            
            if (userIndex !== -1) {
                // Update existing user
                users[userIndex].fullname = updatedFullName;
                users[userIndex].phones = phones;
                users[userIndex].addresses = addresses;
                // Remove old single values if they exist
                delete users[userIndex].phone;
                delete users[userIndex].address;
            }
            
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update profile name display
            if (profileNameDisplay) {
                profileNameDisplay.textContent = updatedFullName;
            }
            
            // Show success message
            alert('Profile updated successfully!');
        });
    }
    
    // Handle logout
    const logoutButton = document.querySelector('a.btn.btn-outline-secondary.profile-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            // Clear session storage
            sessionStorage.removeItem('currentUser');
        });
    }
    
    // Fix the order.html link if it's incorrect
    const ordersTab = document.getElementById('orders-tab');
    if (ordersTab && ordersTab.getAttribute('href') === 'order.html') {
        ordersTab.setAttribute('href', 'orders.html');
    }
});