<?php
session_start();
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ems_login";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get and sanitize input
$user = isset($_POST['username']) ? trim($_POST['username']) : '';
$pass = isset($_POST['password']) ? trim($_POST['password']) : '';

// Check if input is not empty
if ($user === '' || $pass === '') {
    echo json_encode(["status" => "error", "message" => "Please enter both username and password."]);
    exit;
}

// Prepare and bind
$stmt = $conn->prepare("SELECT * FROM users WHERE username=? AND password=?");
$stmt->bind_param("ss", $user, $pass);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $_SESSION['username'] = $row['username'];
    $_SESSION['role'] = $row['role'];
    echo json_encode(["status" => "success", "role" => $row['role']]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid login credentials"]);
}

$stmt->close();
$conn->close();
?>
