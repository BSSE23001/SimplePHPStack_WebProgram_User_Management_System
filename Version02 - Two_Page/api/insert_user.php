<?php

require_once '../includes/config.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $name = $conn->real_escape_string($_POST['name'] ?? '');
    $username = $conn->real_escape_string($_POST['username'] ?? '');
    $email = $conn->real_escape_string($_POST['email'] ?? '');
    $password = $conn->real_escape_string($_POST['password'] ?? '');
    $gender = $conn->real_escape_string($_POST['gender'] ?? '');
    $country = $conn->real_escape_string($_POST['country'] ?? '');
    $interests = $conn->real_escape_string($_POST['interests'] ?? '');

    if (empty($name) || empty($username) || empty($email) || empty($password)) {
        throw new Exception('All required fields must be filled');
    }

    $stmt = $conn->prepare("CALL add_user(?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $name, $username, $email, $password, $gender, $country, $interests);

    if (!$stmt->execute()) {
        throw new Exception('Failed to execute database procedure');
    }

    $result = $stmt->get_result();
    $message = $result ? $result->fetch_assoc()['message'] : 'User added successfully';

    echo json_encode([
        'success' => true,
        'message' => $message
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}