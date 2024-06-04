#include "DHT.h"
#include <SPI.h>
#include <Ethernet.h>
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED }; //Setting MAC Address

#define DHTPIN 2            // Pin where your DHT11 is connected
#define DHTTYPE DHT11       // DHT11 sensor type
#define Threshold 400       // Threshold for detecting smoke
#define MQ2pin A0           // Analog pin where MQ2 sensor is connected
#define lowerThreshold 350  // Lower threshold for water level sensor
#define upperThreshold 420  // Upper threshold for water level sensor
#define sensorPower 7       // Pin to control power to water level sensor
#define sensorPin A1        // Analog pin where Water Level Sensor is connected

DHT dht(DHTPIN, DHTTYPE);

int val = 0;
float temperature;
float humidity;
float mq2Value;
float waterLevel;

char server[] = "192.168.254.108";
IPAddress ip(192, 168, 137, 2);
EthernetClient client;

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(sensorPower, OUTPUT);
  digitalWrite(sensorPower, LOW);
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    Ethernet.begin(mac, ip);
  }
  delay(1000);
}

void loop() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  mq2Value = analogRead(MQ2pin);
  waterLevel = readSensor();
  Sending_To_phpmyadmindatabase();
  delay(3600000);
}

void Sending_To_phpmyadmindatabase() {
  if (client.connect(server, 80)) {
    Serial.println("Connected");
    client.print("GET /sensor_data/sensor3/sensor_data3.php?humidity=");
    client.print(humidity);
    client.print("&temperature=");
    client.print(temperature);
    client.print("&mq2Value=");
    client.print(mq2Value);
    client.print("&waterLevel=");
    client.print(waterLevel);
    client.println(" HTTP/1.1");
    client.println("Host: 192.168.254.108");
    client.println("Connection: close");
    client.println();

  } else {
    Serial.println("Connection failed");
  }
}
int readSensor() {
  digitalWrite(sensorPower, HIGH);
  delay(10);
  val = analogRead(sensorPin);
  digitalWrite(sensorPower, LOW);
  return val;
}