<?php
header('Content-Type: application/json');

class Data {
    public $link = '';

    function __construct() {
        $this->connect();
    }

    function connect() {
        $this->link = mysqli_connect('localhost', 'root', '') or die(json_encode(['error' => 'Cannot connect to the DB']));
        mysqli_select_db($this->link, 'emsdb') or die(json_encode(['error' => 'Cannot select the DB']));
    }

    function storeInDB($temperature, $humidity, $mq2Value, $waterLevel) {
        $query = "INSERT INTO data (temperature, humidity, mq2Value, waterLevel) VALUES ('$temperature', '$humidity', '$mq2Value', '$waterLevel')";
        $result = mysqli_query($this->link, $query) or die(json_encode(['error' => 'Errant query: ' . $query]));
    }

    function fetchLatest() {
        $query = "SELECT timestamp, temperature, humidity, mq2Value, waterLevel FROM data ORDER BY timestamp DESC LIMIT 1";
        $result = mysqli_query($this->link, $query) or die(json_encode(['error' => 'Errant query: ' . $query]));
        if ($result->num_rows > 0) {
            return $result->fetch_assoc();
        } else {
            return null;
        }
    }
}

$data = new Data();

if (isset($_GET['temperature']) && isset($_GET['humidity']) && isset($_GET['mq2Value']) && isset($_GET['waterLevel'])) {
    $data->storeInDB($_GET['temperature'], $_GET['humidity'], $_GET['mq2Value'], $_GET['waterLevel']);
} else {
    $latestData = $data->fetchLatest();
    if ($latestData) {
        echo json_encode($latestData);
    } else {
        echo json_encode(['error' => 'No data found']);
    }
}
?>