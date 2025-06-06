document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in edit mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        loadUserForEdit(editId);
    }

    // Load stats
    loadStats();

    // Initialize form validations
    initUserFormValidation();
    initDeleteFormValidation();

    // Form submission for add/update
    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (validateUserForm()) {
            const formData = new FormData(userForm);
            const id = document.getElementById('user-id').value;

            if (id) {
                await updateUser(formData);
            } else {
                await addUser(formData);
            }
        }
    });

    // Delete form submission
    const deleteForm = document.getElementById('delete-form');
    deleteForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateDeleteForm()) {
            const deleteId = document.getElementById('delete_id').value;
            if (confirm(`Are you sure you want to delete user with ID ${deleteId}?`)) {
                deleteUser(deleteId);
            }
        }
    });
});

function initUserFormValidation() {
    const form = document.getElementById('user-form');
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function() {
        const strength = checkPasswordStrength(this.value);
        updatePasswordStrengthIndicator(strength);
    });
}

function initDeleteFormValidation() {
    const deleteInput = document.getElementById('delete_id');
    deleteInput.addEventListener('blur', validateDeleteId);
    deleteInput.addEventListener('input', clearError);
}

function validateUserForm() {
    let isValid = true;
    const form = document.getElementById('user-form');

    // Validate required fields
    const requiredInputs = form.querySelectorAll('input[required]');
    requiredInputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    // Validate email format
    const email = document.getElementById('email').value;
    if (email && !validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password strength in add mode
    if (!document.getElementById('user-id').value) {
        const password = document.getElementById('password').value;
        if (password && checkPasswordStrength(password) < 3) {
            showFieldError('password', 'Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols');
            isValid = false;
        }
    }

    const genderSelected = document.querySelector('input[name="gender"]:checked');
    if (!genderSelected) {
        showFieldError('gender', 'Please select a gender');
        isValid = false;
    }

    const interestsSelected = document.querySelectorAll('input[name="interests[]"]:checked');
    if (interestsSelected.length === 0) {
        showFieldError('interests', 'Please select at least one interest');
        isValid = false;
    }

    const country = document.getElementById('country').value;
    if (!country) {
        showFieldError('country', 'Please select a country');
        isValid = false;
    }

    return isValid;
}

function validateDeleteForm() {
    return validateDeleteId({ target: document.getElementById('delete_id') });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.id;

    if (field.required && !value) {
        showFieldError(fieldName, 'This field is required');
        return false;
    }

    // Specific field validations
    switch(fieldName) {
        case 'email':
            if (value && !validateEmail(value)) {
                showFieldError(fieldName, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'username':
            if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
                showFieldError(fieldName, 'Username can only contain letters, numbers, and underscores');
                return false;
            }
            break;
    }

    clearError(e);
    return true;
}

function validateDeleteId(e) {
    const field = e.target;
    const value = field.value.trim();

    if (!value) {
        showFieldError('delete_id', 'User ID is required');
        return false;
    }

    if (isNaN(value) || value <= 0) {
        showFieldError('delete_id', 'Please enter a valid user ID (positive number)');
        return false;
    }

    clearError(e);
    return true;
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

function checkPasswordStrength(password) {
    let strength = 0;

    // Length >= 8
    if (password.length >= 8) strength++;

    // Contains both lower and upper case
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;

    // Contains numbers
    if (/\d/.test(password)) strength++;

    // Contains special chars
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
}

function updatePasswordStrengthIndicator(strength) {
    const indicator = document.getElementById('password-strength') || createPasswordStrengthIndicator();
    const colors = ['#ff0000', '#ff5a00', '#ffb400', '#a0ff00', '#00ff00'];
    const texts = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];

    indicator.style.width = `${(strength / 4) * 100}%`;
    indicator.style.backgroundColor = colors[Math.min(strength, 4)];
    indicator.setAttribute('data-strength', texts[Math.min(strength, 4)]);
}

function createPasswordStrengthIndicator() {
    const container = document.createElement('div');
    container.className = 'password-strength-container';
    container.style.marginTop = '5px';
    container.style.height = '5px';
    container.style.backgroundColor = '#eee';
    container.style.borderRadius = '3px';
    container.style.overflow = 'hidden';

    const indicator = document.createElement('div');
    indicator.id = 'password-strength';
    indicator.style.height = '100%';
    indicator.style.width = '0%';
    indicator.style.transition = 'width 0.3s, background-color 0.3s';

    container.appendChild(indicator);

    const tooltip = document.createElement('div');
    tooltip.className = 'password-strength-tooltip';
    tooltip.style.fontSize = '0.8em';
    tooltip.style.color = '#666';
    tooltip.style.marginTop = '3px';

    container.appendChild(tooltip);

    document.getElementById('password').parentNode.appendChild(container);
    return indicator;
}

// Update showFieldError for radio/checkbox groups
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`) || document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`) || createErrorElement(field, fieldName);

    if (field.type === 'radio' || field.type === 'checkbox') {
        // For radio/checkbox, add error class to the container
        const container = field.closest('.radio-group') || field.closest('.checkbox-group');
        if (container) container.classList.add('error');
    } else {
        field.classList.add('error');
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function createErrorElement(field, fieldName) {
    const errorElement = document.createElement('div');
    errorElement.id = `${fieldName}-error`;
    errorElement.className = 'error-message';
    errorElement.style.color = '#e8491d';
    errorElement.style.fontSize = '0.8em';
    errorElement.style.marginTop = '5px';
    errorElement.style.display = 'none';

    field.parentNode.appendChild(errorElement);
    return errorElement;
}

// Update clearError function to handle new fields
function clearError(e) {
    const field = e.target;
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(`${fieldName}-error`);

    if (field.type === 'radio' || field.type === 'checkbox') {
        // For radio/checkbox, we need to get the container
        const container = field.closest('.radio-group') || field.closest('.checkbox-group');
        if (container) container.classList.remove('error');
    } else {
        field.classList.remove('error');
    }

    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

async function loadUserForEdit(id) {
    try {
        const response = await fetch(`api/get_users.php?id=${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error('User not found');
        }

        const user = data[0];
        document.getElementById('form-title').textContent = 'Edit User';
        document.getElementById('user-id').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('password').placeholder = 'Leave blank to keep current password';

        // Set radio button
        if (user.gender) {
            document.querySelector(`input[name="gender"][value="${user.gender}"]`).checked = true;
        }

        // Set checkboxes
        if (user.interests) {
            const interests = user.interests.split(',');
            document.querySelectorAll('input[name="interests[]"]').forEach(checkbox => {
                checkbox.checked = interests.includes(checkbox.value);
            });
        }

        // Set country
        if (user.country) {
            document.getElementById('country').value = user.country;
        }

        document.getElementById('submit-btn').textContent = 'Update User';
        document.getElementById('cancel-btn').style.display = 'inline-block';
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('Error loading user data: ' + error.message, 'error');
    }
}

// Update addUser and updateUser functions
async function addUser(formData) {
    try {
        // Get the form from the FormData object (works in modern browsers)
        const userForm = formData.form || document.getElementById('user-form');
        // Get all selected checkboxes
        const interests = [];
        document.querySelectorAll('input[name="interests[]"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });

        // Replace the interests in FormData
        formData.set('interests', interests.join(','));

        const response = await fetch('api/insert_user.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        showMessage(data.message, data.message.includes('successfully') ? 'success' : 'error');

        if (data.message.includes('successfully')) {
            userForm.reset();
            loadStats();
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showMessage('Failed to add user. Please try again.', 'error');
    }
}

async function updateUser(formData) {
    document.querySelectorAll('input[name="interests[]"]:checked').forEach(checkbox => {
        formData.append('interests[]', checkbox.value);
    });

    const gender = document.querySelector('input[name="gender"]:checked');
    if (gender) {
        formData.append('gender', gender.value);
    }

    const country = document.getElementById('country').value;
    formData.append('country', country);
    fetch('api/update_user.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message, data.message.includes('successfully') ? 'success' : 'error');
        if (data.message.includes('successfully')) {
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        showMessage('Error updating user', 'error');
    });
}

function deleteUser(id) {
    const formData = new FormData();
    formData.append('delete_id', id);
    
    fetch('api/delete_user.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message, data.message.includes('successfully') ? 'success' : 'error');
        if (data.message.includes('successfully')) {
            document.getElementById('delete-form').reset();
            loadStats();
        }
    })
    .catch(error => {
        showMessage('Error deleting user', 'error');
    });
}

function loadStats() {
    fetch('api/get_users.php?stats=true')
        .then(response => response.json())
        .then(data => {
            document.getElementById('active-users').textContent = data.active_users;
            document.getElementById('total-users').textContent = data.total_users;
            document.getElementById('last-added').textContent = data.last_added || 'None';
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}