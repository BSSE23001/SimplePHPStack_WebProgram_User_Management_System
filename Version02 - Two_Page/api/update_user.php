<?php
require_once '../includes/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $conn->real_escape_string($_POST['id']);
    $name = $conn->real_escape_string($_POST['name']);
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = $conn->real_escape_string($_POST['password']);

    $gender = $conn->real_escape_string($_POST['gender'] ?? '');
    $country = $conn->real_escape_string($_POST['country'] ?? '');
    $interests = isset($_POST['interests']) ?
        $conn->real_escape_string(implode(',', $_POST['interests'])) : '';

    $stmt = $conn->prepare("CALL update_user(?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssss", $id, $name, $username, $email, $password, $gender, $country, $interests);

    $stmt->execute();

    $result = $stmt->get_result();
    $message = $result ? $result->fetch_assoc()['message'] : 'User updated successfully';

    echo json_encode([
        'message' => $message
    ]);
}
