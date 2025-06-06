<?php
$servername = "localhost";
$username = "root";
$password = "";
$db_name = "user_management_sys";

$conn = new mysqli($servername, $username, $password);

if ($conn->connect_error) {
    die("Error Connecting The Database Server" . $conn->connect_error);
}

require_once "db_setup.php";

$conn->select_db($db_name);