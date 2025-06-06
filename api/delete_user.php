<?php

require_once '../includes/config.php';

global $conn;

header('Content-Type: application/json');

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $conn->real_escape_string($_POST['delete_id']);

    $stmt = $conn->prepare('CALL delete_user(?)');
    $stmt->bind_param('i', $id);

    if($stmt->execute()) {
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $message = $row && isset($row['message']) ? $row['message'] : 'USER DELETED SUCCESSFULLY';
        echo json_encode(['message' => $message]);
    } else {
        echo json_encode(['message' => 'Failed to Execute delete_user']);
    }
} else {
    echo json_encode(['message' => 'INVALID REQUEST']);
}