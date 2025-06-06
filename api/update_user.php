<?php

require_once '../includes/config.php';

global $conn;

header('Content-Type: application/json');

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $conn->real_escape_string($_POST['id']);
    $name = $conn->real_escape_string($_POST['name']);
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = $conn->real_escape_string($_POST['password']);
    $password = password_hash($password, PASSWORD_DEFAULT);
    $gender = $conn->real_escape_string($_POST['gender']);
    $country = $conn->real_escape_string($_POST['country']);

    $interests = isset($_POST['interests'])
        ? $conn->real_escape_string($_POST['interests'])
        : '';

    $stmt = $conn->prepare('CALL update_user(?,?,?,?,?,?,?,?)');
    $stmt->bind_param('isssssss', $id, $name, $username, $email, $password, $gender, $country, $interests);

    if($stmt->execute()) {
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $message = $row && isset($row['message']) ? $row['message'] : 'USER UPDATED SUCCESSFULLY';
        echo json_encode(['message' => $message]);
    } else {
        echo json_encode(['message' => 'Failed to Execute update_user']);
    }
} else {
    echo json_encode(['message' => 'INVALID REQUEST']);
}