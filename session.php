<?php
session_start();
if (isset($_SESSION['username'])) {
    echo json_encode(["status" => "logged_in", "role" => $_SESSION['role']]);
} else {
    echo json_encode(["status" => "not_logged_in"]);
}
?>