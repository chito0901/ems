<?php
header('Content-Type: application/json');

class Data {
    public $link = '';

    function __construct() {
        $this->connect();
    }

    function connect() {
        $this->link = mysqli_connect('localhost', 'root', '') or die(json_encode(['error' => 'Cannot connect to the DB']));
        mysqli_select_db($this->link, 'emsdb3') or die(json_encode(['error' => 'Cannot select the DB']));
    }

    function fetchLatest8() {
        $query = "SELECT timestamp, temperature, humidity, mq2Value, waterLevel FROM data ORDER BY timestamp DESC LIMIT 8";
        $result = mysqli_query($this->link, $query) or die(json_encode(['error' => 'Errant query: ' . $query]));
        $readings = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $readings[] = $row;
        }
        return $readings;
    }
}

$data = new Data();

$latestReadings = $data->fetchLatest8();
echo json_encode($latestReadings);
?>
