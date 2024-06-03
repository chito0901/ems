<?php
session_start();
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ems_login";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (!isset($_SESSION['username'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

// Get the input data
$currentPassword = $_POST['currentPassword'];
$newPassword = $_POST['newPassword'];
$username = $_SESSION['username'];

// Validate input data
if (empty($currentPassword) || empty($newPassword)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

// Check the current password
$sql = "SELECT password FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
if ($stmt === false) {
    echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($storedPassword);
    $stmt->fetch();

    if ($currentPassword === $storedPassword) {
        $sql = "UPDATE users SET password = ? WHERE username = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("ss", $newPassword, $username);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Password change failed']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
}

$stmt->close();
$conn->close();
?>
