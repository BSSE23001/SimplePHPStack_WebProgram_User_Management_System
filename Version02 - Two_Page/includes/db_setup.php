<?php
require_once 'config.php';

function setupDatabase($conn) {
    // Create database if not exists
    $sql = "CREATE DATABASE IF NOT EXISTS user_management_system";
    $conn->query($sql);
    $conn->select_db("user_management_system");

//    $sql = "DROP TABLE IF EXISTS users";
//    $conn->query($sql);

    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        country VARCHAR(50) NOT NULL,
        interests TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active'
    )";
    $conn->query($sql);
    
    // Create audit log table
    $sql = "CREATE TABLE IF NOT EXISTS user_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        details TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )";
    $conn->query($sql);
    
    // Create procedure for adding user
    $sql = "DROP PROCEDURE IF EXISTS add_user";
    $conn->query($sql);
    
    $sql = "CREATE PROCEDURE add_user(
    IN p_name VARCHAR(100),
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_country VARCHAR(50),
    IN p_interests TEXT
    )
    BEGIN
        DECLARE user_count INT;
        
        SELECT COUNT(*) INTO user_count FROM users 
        WHERE username = p_username OR email = p_email;
        
        IF user_count = 0 THEN
            INSERT INTO users (name, username, email, password, gender, country, interests) 
            VALUES (p_name, p_username, p_email, p_password, p_gender, p_country, p_interests);
            
            INSERT INTO user_audit_log (user_id, action, details)
            VALUES (LAST_INSERT_ID(), 'create', CONCAT('User ', p_username, ' created'));
            
            SELECT 'User added successfully' AS message;
        ELSE
            SELECT 'Username or email already exists' AS message;
        END IF;
    END";
    $conn->query($sql);
    
    // Create procedure for updating user
    $sql = "DROP PROCEDURE IF EXISTS update_user";
    $conn->query($sql);
    
    $sql = "CREATE PROCEDURE update_user(
        IN p_id INT,
        IN p_name VARCHAR(100),
        IN p_username VARCHAR(50),
        IN p_email VARCHAR(100),
        IN p_password VARCHAR(255),
        IN p_gender VARCHAR(10),
        IN p_country VARCHAR(50),
        IN p_interests TEXT
    )
    BEGIN
        DECLARE user_count INT;
        
        SELECT COUNT(*) INTO user_count FROM users 
        WHERE (username = p_username OR email = p_email) AND id != p_id;
        
        IF user_count = 0 THEN
            UPDATE users SET 
                name = p_name,
                username = p_username,
                email = p_email,
                password = p_password,
                gender = p_gender,
                country = p_country,
                interests = p_interests
            WHERE id = p_id;
            
            INSERT INTO user_audit_log (user_id, action, details)
            VALUES (p_id, 'update', CONCAT('User ', p_username, ' updated'));
            
            SELECT 'User updated successfully' AS message;
        ELSE
            SELECT 'Username or email already exists' AS message;
        END IF;
    END";
    $conn->query($sql);
    
    // Create procedure for deleting user
    $sql = "DROP PROCEDURE IF EXISTS delete_user";
    $conn->query($sql);
    
    $sql = "CREATE PROCEDURE delete_user(IN p_id INT)
    BEGIN
        DECLARE p_username VARCHAR(50);
        
        SELECT username INTO p_username FROM users WHERE id = p_id;
        
        DELETE FROM users WHERE id = p_id;
        
        INSERT INTO user_audit_log (user_id, action, details)
        VALUES (NULL, 'delete', CONCAT('User ', p_username, ' deleted'));
        
        SELECT 'User deleted successfully' AS message;
    END";
    $conn->query($sql);
    
    // Create view for active users
    $sql = "DROP VIEW IF EXISTS active_users_view";
    $conn->query($sql);
    
    $sql = "CREATE VIEW active_users_view AS
            SELECT id, name, username, email, created_at 
            FROM users 
            WHERE status = 'active'";
    $conn->query($sql);
    
    // Create trigger for password hashing
    $sql = "DROP TRIGGER IF EXISTS before_user_insert";
    $conn->query($sql);
    
    $sql = "CREATE TRIGGER before_user_insert
            BEFORE INSERT ON users
            FOR EACH ROW
            BEGIN
                SET NEW.password = SHA2(NEW.password, 256);
            END";
    $conn->query($sql);
    
    $sql = "DROP TRIGGER IF EXISTS before_user_update";
    $conn->query($sql);
    
    $sql = "CREATE TRIGGER before_user_update
            BEFORE UPDATE ON users
            FOR EACH ROW
            BEGIN
                IF NEW.password != OLD.password THEN
                    SET NEW.password = SHA2(NEW.password, 256);
                END IF;
            END";
    $conn->query($sql);
    
    // Create function to count active users
    $sql = "DROP FUNCTION IF EXISTS count_active_users";
    $conn->query($sql);
    
    $sql = "CREATE FUNCTION count_active_users() 
            RETURNS INT
            DETERMINISTIC
            BEGIN
                DECLARE active_count INT;
                SELECT COUNT(*) INTO active_count FROM users WHERE status = 'active';
                RETURN active_count;
            END";
    $conn->query($sql);
}

// Initialize database
setupDatabase($conn);