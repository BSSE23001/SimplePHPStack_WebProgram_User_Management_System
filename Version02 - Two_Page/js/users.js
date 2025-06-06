document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validations
    initSearchFormValidation();
    initFilterFormValidation();

    // Load initial data
    loadUsers();
    loadAuditLog();

    // Form submissions
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateSearchForm()) {
            loadUsers();
        }
    });

    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateFilterForm()) {
            loadUsers();
        }
    });

    // If forms are reset via clear buttons
    document.querySelectorAll('.btn[href="users.html"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.getAttribute('href') === 'users.html') {
                e.preventDefault();
                searchForm.reset();
                filterForm.reset();
                clearFormErrors();
                loadUsers();
            }
        });
    });
});

function initSearchFormValidation() {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', function() {
        if (this.value.trim().length > 0 && this.value.trim().length < 2) {
            showFieldError('search', 'Search term must be at least 2 characters');
        } else {
            clearError({ target: this });
        }
    });
}

function initFilterFormValidation() {
    // No specific validations needed for filter form
    // All fields have predefined values
}

function validateSearchForm() {
    const searchInput = document.getElementById('search');
    const searchTerm = searchInput.value.trim();

    if (searchTerm && searchTerm.length < 2) {
        showFieldError('search', 'Search term must be at least 2 characters');
        return false;
    }

    return true;
}

function validateFilterForm() {
    // All filter fields are selects with predefined values
    // No validation needed beyond default values
    return true;
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
}

// Reuse the same field error functions from main.js
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`) || createErrorElement(field, fieldName);

    field.classList.add('error');
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

function clearError(e) {
    const field = e.target;
    const fieldName = field.id;
    const errorElement = document.getElementById(`${fieldName}-error`);

    field.classList.remove('error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function loadUsers() {
    const searchForm = document.getElementById('search-form');
    const filterForm = document.getElementById('filter-form');
    
    const params = new URLSearchParams();
    
    // Add search params
    const searchValue = document.getElementById('search').value;
    if (searchValue) {
        params.append('search', searchValue);
    }
    
    // Add filter params
    const statusValue = document.getElementById('status').value;
    if (statusValue) {
        params.append('status', statusValue);
    }
    
    // Add sort params
    const sortValue = document.getElementById('sort').value;
    params.append('sort', sortValue);
    
    fetch(`api/get_users.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';
            
            if (data.length > 0) {
                data.forEach(user => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td><a href="index.html?edit=${user.id}" class="btn">Edit</a></td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            document.getElementById('users-table-body').innerHTML = 
                '<tr><td colspan="7">Error loading users</td></tr>';
        });
}

function loadAuditLog() {
    fetch('api/get_users.php?audit=true')
        .then(response => response.json())
        .then(data => {
            const auditList = document.getElementById('audit-log-list');
            auditList.innerHTML = '';
            
            if (data.length > 0) {
                data.forEach(log => {
                    const item = document.createElement('li');
                    item.textContent = `${formatDate(log.action_time)} - ${log.action}: ${log.details}`;
                    auditList.appendChild(item);
                });
            } else {
                auditList.innerHTML = '<li>No activities logged yet.</li>';
            }
        })
        .catch(error => {
            console.error('Error loading audit log:', error);
            document.getElementById('audit-log-list').innerHTML = 
                '<li>Error loading activities</li>';
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}