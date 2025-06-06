document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const editID = urlParams.get('edit');

    if (editID) {
        loadUserForEdit(editID);
    } else {
        resetUserForm();
    }

    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (ValidateUserForm()) {
            const formData = new FormData(userForm);
            const id = document.getElementById('user-id').value.trim();

            // Clear any previous messages
            document.getElementById('message').style.display = 'none';

            if (id && id !== '' && !isNaN(id)) {
                updateUser(formData);
            } else {
                insertUser(formData);
            }
        }
    });

    // Add cancel button event listener
    document.getElementById('cancel-btn').addEventListener('click', (e) => {
        e.preventDefault();
        resetUserForm();
        window.history.pushState({}, document.title, window.location.pathname);
    });


    const user_inputs = userForm.querySelectorAll('input[required]');
    user_inputs.forEach(input => {
        input.addEventListener('blur', ValidateField);
        input.addEventListener('input', clearError);
    })

    const deleteForm = document.getElementById('delete-form');
    deleteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (ValidateDeleteForm()) {
            const deleteID = document.getElementById('delete_id').value;
            if (confirm(`Are You Sure You want to delete the user with ID ${deleteID}?`)) {
                deleteUser(deleteID);
            }
        }
    });
    const delete_input = document.getElementById('delete_id');
    delete_input.addEventListener('blur', ValidateDeleteID);
    delete_input.addEventListener('input', clearError);


    // Load initial data
    loadUsers();

    // Form submissions
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loadUsers();
    });

    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loadUsers();
    });

});

function resetUserForm() {
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('submit-btn').textContent = 'Add User';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('password').placeholder = '';
    document.getElementById('password').required = true;
}

function ValidateUserForm() {
    let isValid = true;
    const form = document.getElementById('user-form');

    const requiredInputs = form.querySelectorAll('input[required]');
    requiredInputs.forEach(input => {
        if (!ValidateField({target: input})) {
            isValid = false;
        }
    });

    const email = document.getElementById('email').value;
    if (email && !validateEmail(email)) {
        showFieldError('email', 'Please Enter a Valid Email');
        isValid = false;
    }

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

function ValidateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.id;

    if (field.required && !value) {
        showFieldError(fieldName, 'This Field Is Required');
        return false;
    }

    switch (fieldName) {
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

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email));
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

function ValidateDeleteForm() {
    return ValidateDeleteID({target: document.getElementById('delete_id')});
}

function ValidateDeleteID(e) {
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

// Update showFieldError for radio/checkbox groups
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);

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

function loadUserForEdit(id) {
    fetch(`api/get_users.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const user = data[0];
                document.getElementById('user-id').value = user.id;
                document.getElementById('name').value = user.name || '';
                document.getElementById('username').value = user.username || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('password').placeholder = 'Leave blank to keep current password';

                // Set gender
                if (user.gender) {
                    const genderRadio = document.querySelector(`input[name="gender"][value="${user.gender.toLowerCase()}"]`);
                    if (genderRadio) genderRadio.checked = true;
                }

                // Set interests
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
            }
        })
        .catch(error => {
            showMessage(`Error loading user data (${error})`, 'error');
        });
}


// Modified insertUser function
function insertUser(formData) {
    // Process interests
    const interests = Array.from(document.querySelectorAll('input[name="interests[]"]:checked'))
        .map(checkbox => checkbox.value);
    formData.set('interests', interests.join(','));

    fetch(`api/insert_user.php`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showMessage(data.message, 'success');
            resetUserForm();
            loadUsers(); // Refresh the user list
        })
        .catch(error => {
            showMessage(`Error inserting user: ${error.message}`, 'error');
        });
}


// Modified updateUser function
function updateUser(formData) {
    // Process interests
    const interests = Array.from(document.querySelectorAll('input[name="interests[]"]:checked'))
        .map(checkbox => checkbox.value);
    formData.set('interests', interests.join(','));

    fetch(`api/update_user.php`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showMessage(data.message, 'success');
            resetUserForm();
            loadUsers(); // Refresh the user list
        })
        .catch(error => {
            showMessage(`Error updating user: ${error.message}`, 'error');
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
            loadUsers();
        })
        .catch(error => {
            showMessage(`Error deleting user (${error})`, 'error');
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

function loadUsers() {
    const params = new URLSearchParams();

    // Add search params
    const searchValue = document.getElementById('search').value;
    if (searchValue) {
        params.append('search', searchValue);
    }

    // Add sort params
    const sortValue = document.getElementById('sort').value;
    params.append('sort', sortValue);

    fetch(`api/get_users.php?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';

            if (data.length > 0) {
                data.forEach(user => {
                    const row = document.createElement('tr');

                    // Format interests for display
                    const interestsDisplay = user.interests
                        ? user.interests.split(',').join(', ')
                        : 'None';

                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.gender}</td>
                        <td>${user.country}</td>
                        <td>${interestsDisplay}</td>
                        <td><a href="index.html?edit=${user.id}" class="btn">Edit</a></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="8">No users found</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            document.getElementById('users-table-body').innerHTML =
                '<tr><td colspan="8">Error loading users</td></tr>';
        });
}