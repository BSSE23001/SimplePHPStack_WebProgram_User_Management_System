<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['delete_id'];

    $stmt = $conn->prepare("CALL delete_user(?)");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        $message = $row && isset($row['message']) ? $row['message'] : 'User deleted successfully';

        // Set session messages if needed
        $_SESSION['message'] = $message;
        $_SESSION['message_type'] = strpos($message, 'successfully') !== false ? 'success' : 'error';

        echo json_encode(['message' => $message]);
    } else {
        echo json_encode(['message' => 'Failed to execute delete_user']);
    }
} else {
    echo json_encode(['message' => 'Invalid request']);
}