<?php
require_once "config.php";

global $conn;

function setupDB($conn)
{
    $sql = "CREATE DATABASE IF NOT EXISTS user_management_sys";
    $conn->query($sql);
    $conn->select_db("user_management_sys");

    $sql = "CREATE TABLE IF NOT EXISTS user_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            gender VARCHAR(10) NOT NULL,
            country VARCHAR(50) NOT NULL,
            interests TEXT NOT NULL
        )";
    $conn->query($sql);

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
                SELECT COUNT(*) INTO user_count FROM user_details
                WHERE username = p_username OR email = p_email;
                
                IF user_count = 0 THEN
                    INSERT INTO user_details (name, username, email, password, gender, country, interests)
                    VALUES (p_name, p_username, p_email, p_password, p_gender, p_country, p_interests);
                    
                    SELECT 'User Added Successfully' AS message;
                ELSE
                    SELECT 'Username or email already exists' AS message;
                END IF;
            END";
    $conn->query($sql);

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
                SELECT COUNT(*) INTO user_count FROM user_details
                WHERE (username = p_username OR email = p_email) AND id != p_id;
                
                IF user_count = 0 THEN
                    Update user_details SET
                        name = p_name,
                        username = p_username,
                        email = p_email,
                        password = p_password,
                        gender = p_gender,
                        country = p_country,
                        interests = p_interests
                    WHERE id = p_id;
                    
                    SELECT 'User Updated Successfully' AS message;
                ELSE
                    SELECT 'Provided Username or email already exists so cannot update the desired data' AS message;
                END IF;
            END";
    $conn->query($sql);

    $sql = "DROP PROCEDURE IF EXISTS delete_user";
    $conn->query($sql);

    $sql = "CREATE PROCEDURE delete_user(IN p_id INT)
            BEGIN
                DELETE FROM user_details WHERE id = p_id;
                SELECT 'User Deleted Successfully' AS message;
            END";
    $conn->query($sql);
}

setupDB($conn);