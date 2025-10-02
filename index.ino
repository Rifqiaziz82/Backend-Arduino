const int LAMPU_PIN = 3;
const int SENSOR_PIN = A5;

// Konfigurasi ACS712 5A
const float VCC = 5.0;           // Tegangan Arduino
const float ZERO_POINT = VCC / 2.0; // Titik nol (2.5V)
const float SENSITIVITY = 0.185;    // 185 mV/A = 0.185 V/A (untuk ACS712 5A)

void setup() {
  Serial.begin(115200);
  pinMode(LAMPU_PIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT);
  
  digitalWrite(LAMPU_PIN, HIGH); // MATI (active-low)
  Serial.println("LED_OFF");
}

void loop() {
  // Baca sensor arus tiap 500ms
  static unsigned long lastRead = 0;
  if (millis() - lastRead > 500) {
    int sensorValue = analogRead(SENSOR_PIN);
    float voltage = sensorValue * (VCC / 1023.0);
    float current = (voltage - ZERO_POINT) / SENSITIVITY;

    // Kirim: CURRENT:1.23
    Serial.print("CURRENT:");
    Serial.println(current, 2);
    lastRead = millis();
  }

  // Terima perintah
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "ON") {
      digitalWrite(LAMPU_PIN, LOW);  // NYALA
      Serial.println("LED_ON");
    } else if (command == "OFF") {
      digitalWrite(LAMPU_PIN, HIGH); // MATI
      Serial.println("LED_OFF");
    }
    Serial.flush();
  }
}