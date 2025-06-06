<?php

require_once '../includes/config.php';

global $conn;

header('Content-Type: application/json');

if(isset($_GET['id'])) {
    $id = $conn->real_escape_string($_GET['id']);

    $stmt = $conn->prepare('SELECT * FROM user_details WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    echo json_encode([$user]);
    exit();
}

$sql_query = "SELECT * FROM user_details WHERE 1=1";

if(isset($_GET['search']) && !empty($_GET['search'])) {
    $search = $conn->real_escape_string($_GET['search']);
    $sql_query .= " AND (name LIKE '%$search%' OR email LIKE '%$search%')";
}

$sort = isset($_GET['sort']) ? $_GET['sort'] : 'name_asc';
switch($sort) {
    case 'name_asc':
        $sql_query .= " ORDER BY name ASC";
        break;
    case 'name_desc':
        $sql_query .= " ORDER BY name DESC";
        break;
    default:
        $sql_query .= " ORDER BY name ASC";
}

$users = $conn->query($sql_query);
$users_array = [];
while($user = $users->fetch_assoc()) {
    $users_array[] = $user;
}

echo json_encode($users_array);