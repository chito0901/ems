<--- ARDUINO SIDE --->

Base on arduino sensors usually connected to these pins:

#define DHTPIN 2            // Pin where your DHT11 is connected
#define DHTTYPE DHT11       // DHT11 sensor type
#define Threshold 400       // Threshold for detecting smoke
#define MQ2pin A0           // Analog pin where MQ2 sensor is connected
#define lowerThreshold 350  // Lower threshold for water level sensor
#define upperThreshold 420  // Upper threshold for water level sensor
#define sensorPower 7       // Pin to control power to water level sensor
#define sensorPin A1        // Analog pin where Water Level Sensor is connected

char server[] = "192.168.254.108";
-- Change to your Device IP 

IPAddress ip(192, 168, 137, 2);
-- Change to the Arduino IP

client.print("GET /sensor_data/sensor3/sensor_data3.php?humidity="); 
-- Change sensor and sensor_data for each code

client.println("Host: 192.168.254.108"); 
-- Change to your Device IP 

<--- phpMyAdmin SIDE --->

On SQL use this command:

-- to create the sensor database

CREATE TABLE your_table_name (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,
    humidity FLOAT NULL DEFAULT NULL,
    temperature FLOAT NULL DEFAULT NULL,
    mq2Value FLOAT NULL DEFAULT NULL,
    waterLevel FLOAT NULL DEFAULT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

For each of the sensors database, the structure should be like:
    Name            Type            Null            Default             Extra            
    id              bigint(20)      No              None                AUTO_INCREMENT
    humidity        float           Yes             Null     
    temperature     float           Yes             Null               
    mq2Value        float           Yes             Null
    waterLevel      float           Yes             Null
    timestamp       timestamp       No              Current_timestamp


-- to create the account database

CREATE TABLE account (
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL,
    PRIMARY KEY (id)
);

For the account database, the structure should be like:
    Name            Type            Null            Default             Extra            
    id              int(11)         No              None                AUTO_INCREMENT
    username        varchar(50)     No              None     
    password        varchar(255)    No              None               
    role            varchar(10)     No              None


<--- PHP SIDE --->

On all the graph.php, reports.php, and sensor_data.php:

-- graph.php -- 
    mysqli_select_db($this->link, '//emsdb//') or die(json_encode(['error' => 'Cannot select the DB']));

-- reports.php -- 
    $link = mysqli_connect('localhost', 'root', '', '//emsdb//') or die('Cannot connect to the DB');

-- sensor_data.php -- 
    mysqli_select_db($this->link, '//emsdb//') or die(json_encode(['error' => 'Cannot select the DB']));

-- Change emsdb to your database name

-- graph.php --
    $query = "SELECT timestamp, temperature, humidity, mq2Value, waterLevel FROM //data// ORDER BY timestamp DESC LIMIT 8";

    $//data// = new Data();

    $latestReadings = $//data//->fetchLatest8();

-- reports.php -- 
    $query = "SELECT * FROM //data// WHERE DATE(timestamp) = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?";

    $query = "SELECT * FROM //data// ORDER BY timestamp DESC LIMIT ? OFFSET ?";

    $stmt->execute();
    $result = $stmt->get_result();
    $//data// = array();
    while ($row = $result->fetch_assoc()) {
        $//data//[] = $row;
    }

    $totalQuery = "SELECT COUNT(*) as total FROM //data// WHERE DATE(timestamp) = ?";

    $totalQuery = "SELECT COUNT(*) as total FROM //data//";

    echo json_encode(['reports' => $//data//, 'totalPages' => $totalPages]);

-- sensor_data.php --
    $query = "INSERT INTO //data// (temperature, humidity, mq2Value, waterLevel) VALUES ('$temperature', '$humidity', '$mq2Value', '$waterLevel')";

    $query = "SELECT timestamp, temperature, humidity, mq2Value, waterLevel FROM //data// ORDER BY timestamp DESC LIMIT 1";

    $//data// = new Data();

    if (isset($_GET['temperature']) && isset($_GET['humidity']) && isset($_GET['mq2Value']) && isset($_GET['waterLevel'])) {
        $//data//->storeInDB($_GET['temperature'], $_GET['humidity'], $_GET['mq2Value'], $_GET['waterLevel']);
    } else {
        $latestData = $//data//->fetchLatest();
        if ($latestData) {
            echo json_encode($latestData);
        } else {
            echo json_encode(['error' => 'No data found']);
        }
    }

-- Change all data to your database's table name

-- login.php --
    $dbname = "//ems_login//";
    $stmt = $conn->prepare("SELECT * FROM //users// WHERE username=? AND password=?");

-- change_password.php --
    $dbname = "ems_login";
    $sql = "SELECT password FROM //users// WHERE username = ?";
    $sql = "UPDATE //users// SET password = ? WHERE username = ?";

-- Change ems_login to your database name for accounts
-- Change users to your database's table name for accounts

!! If your trying to change the folder structure and move the php files change_password, login, logout, and session, check on script.js for 'url' and adjust the code.
