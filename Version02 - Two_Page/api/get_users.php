<?php
require_once '../includes/config.php';

header('Content-Type: application/json');

// Handle different request types
if (isset($_GET['stats'])) {
    // Return statistics
    $active_users = $conn->query("SELECT count_active_users() AS count")->fetch_assoc()['count'];
    $total_users = $conn->query("SELECT COUNT(*) AS count FROM users")->fetch_assoc()['count'];
    $last_added = $conn->query("SELECT name FROM users ORDER BY created_at DESC LIMIT 1")->fetch_assoc()['name'];
    
    echo json_encode([
        'active_users' => $active_users,
        'total_users' => $total_users,
        'last_added' => $last_added
    ]);
    exit();
}

if (isset($_GET['audit'])) {
    // Return audit log
    $audit_log = $conn->query("SELECT * FROM user_audit_log ORDER BY action_time DESC LIMIT 5");
    $logs = [];
    while($log = $audit_log->fetch_assoc()) {
        $logs[] = $log;
    }
    echo json_encode($logs);
    exit();
}

if (isset($_GET['id'])) {
    // Return single user
    $id = $conn->real_escape_string($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    echo json_encode([$user]);
    exit();
}

// Base query for multiple users
$query = "SELECT * FROM users WHERE 1=1";

// Apply filters
if(isset($_GET['status']) && !empty($_GET['status'])) {
    $status = $conn->real_escape_string($_GET['status']);
    $query .= " AND status = '$status'";
}

// Apply search
if(isset($_GET['search']) && !empty($_GET['search'])) {
    $search = $conn->real_escape_string($_GET['search']);
    $query .= " AND (name LIKE '%$search%' OR email LIKE '%$search%')";
}

// Apply sorting
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'name_asc';
switch($sort) {
    case 'name_asc':
        $query .= " ORDER BY name ASC";
        break;
    case 'name_desc':
        $query .= " ORDER BY name DESC";
        break;
    case 'date_asc':
        $query .= " ORDER BY created_at ASC";
        break;
    case 'date_desc':
        $query .= " ORDER BY created_at DESC";
        break;
    default:
        $query .= " ORDER BY name ASC";
}

$users = $conn->query($query);
$usersArray = [];
while($user = $users->fetch_assoc()) {
    $usersArray[] = $user;
}

echo json_encode($usersArray);