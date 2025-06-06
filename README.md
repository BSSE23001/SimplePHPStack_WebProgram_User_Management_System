# User Management System

A responsive web application for managing user registrations with MySQL database integration. Available in both single-page and two-page versions.

## Features

- **User Registration**: Add new users with validation
- **User Management**: View, edit, and delete users
- **Responsive Design**: Works on all device sizes
- **Database Integration**: MySQL backend with PHP API
- **Two Versions**:
  - Single-Page: All functionality in one page
  - Two-Page: Separate pages for forms and user listing

## Requirements

- Web server (Apache, Xammp, Wamp, etc.)
- PHP 7.4+
- MySQL 5.7+
- Modern web browser

## Installation

1. Clone the repository.

2. Import the database:
   - Create a MySQL database
   - Either use the SQL schema from `includes/db_setup.php` or you can define your own

3. Configure database connection:
   Edit `includes/config.php` with your database credentials:

4. Launch the application:
   - Place files in your web server's root directory
   - Access via `http://localhost:{PORT}/User_Registration_App`

## Usage

### Single-Page Version
- All functionality is contained in `index.html`
- Form and user table appear on the same page
- Real-time updates without page reload

### Two-Page Version
- `index.html` contains the user management forms
- `users.html` displays the user table
- Navigation between pages required

## API Endpoints

- `GET get_users.php` - Retrieve all users
- `POST insert_user.php` - Add new user
- `POST update_user.php` - Update existing user
- `GET delete_user.php` - Delete user

## Customization

- Edit `css/style.css` for styling changes
- Modify form fields in `index.html` (and `users.html` for two-page version)
- Adjust validation in `js/index.js`

## Troubleshooting

- **Connection issues**: Verify database credentials in `config.php`
- **Form not submitting**: Check JavaScript console for errors
- **Data not displaying**: Ensure MySQL server is running
