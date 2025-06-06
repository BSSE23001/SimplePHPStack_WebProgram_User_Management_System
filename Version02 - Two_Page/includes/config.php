<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "user_management_system";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Include database setup
require_once 'db_setup.php';

// Select database
$conn->select_db($dbname);

session_start();