<?php

$link = mysqli_connect('localhost', 'root', '', 'emsdb3') or die('Cannot connect to the DB');
$date = isset($_GET['date']) ? $_GET['date'] : '';
$recordsPerPage = 25;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $recordsPerPage;

if ($date) {
    $query = "SELECT * FROM data WHERE DATE(timestamp) = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?";
    $stmt = $link->prepare($query);
    $stmt->bind_param("sii", $date, $recordsPerPage, $offset);
} else {
    $query = "SELECT * FROM data ORDER BY timestamp DESC LIMIT ? OFFSET ?";
    $stmt = $link->prepare($query);
    $stmt->bind_param("ii", $recordsPerPage, $offset);
}

$stmt->execute();
$result = $stmt->get_result();
$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

if ($date) {
    $totalQuery = "SELECT COUNT(*) as total FROM data WHERE DATE(timestamp) = ?";
    $totalStmt = $link->prepare($totalQuery);
    $totalStmt->bind_param("s", $date);
} else {
    $totalQuery = "SELECT COUNT(*) as total FROM data";
    $totalStmt = $link->prepare($totalQuery);
}

$totalStmt->execute();
$totalResult = $totalStmt->get_result();
$totalRow = $totalResult->fetch_assoc();
$totalPages = ceil($totalRow['total'] / $recordsPerPage);

mysqli_close($link);

header('Content-Type: application/json');
echo json_encode(['reports' => $data, 'totalPages' => $totalPages]);

?>
