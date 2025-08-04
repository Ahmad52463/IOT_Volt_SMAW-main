#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <UniversalTelegramBot.h>
#include <Wire.h>
#include <hd44780.h>
#include <hd44780ioClass/hd44780_I2Cexp.h>
#include <time.h>

// --- Konfigurasi WiFi ---
const char* ssid = "iot";
const char* password = "12345678";

// --- Konfigurasi Telegram ---
const char* botToken = "7736997193:AAGUJ40CNqCFYX5ZBIWxv_CcyTtlEIgjjmg";
const char* chatID = "1576101845";
WiFiClientSecure telegramClient;
UniversalTelegramBot bot(botToken, telegramClient);

// --- Konfigurasi server website ---
const char* serverURL = "http://192.168.152.141:3001/api/voltage";

// --- LCD ---
hd44780_I2Cexp lcd;

// --- Sensor ---
#define SENSOR_PIN 34
float minVoltage = 999.0;
float maxVoltage = 0.0;
float totalVoltage = 0.0;
int readingCount = 0;

// --- Waktu ---
unsigned long lastSendTime = 1000;
const unsigned long sendInterval = 1000;

void setup() {
  Serial.begin(115200);

  // Inisialisasi LCD
  int status = lcd.begin(16, 2);
  if (status) {
    Serial.println("LCD init failed!");
    while (1);
  }
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  // Koneksi WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  Serial.println("WiFi Connected");
  delay(1000);
  lcd.clear();

  telegramClient.setInsecure(); // Telegram HTTPS
  configTime(25200, 0, "pool.ntp.org"); // GMT+7
}

void loop() {
  float voltage = getVoltageAC();
  updateStats(voltage);
  updateLCD(voltage);

  // Kirim ke Telegram jika > 3V
  if (voltage > 3.0) {
    String msg = "⚠️ *Tegangan terdeteksi!*\nTegangan: " + String(voltage, 2) + " V";
    bot.sendMessage(chatID, msg, "Markdown");
    delay(5000); // Hindari spam
  }

  // Kirim ke server setiap 3 detik
  if (millis() - lastSendTime >= sendInterval) {
    sendToServer(voltage);
    lastSendTime = millis();
  }

  delay(1000);
}

float getVoltageAC() {
  const int sampleCount = 1000;
  int sensorValue;
  float maxVal = 0, minVal = 4096;

  for (int i = 0; i < sampleCount; i++) {
    sensorValue = analogRead(SENSOR_PIN);
    if (sensorValue > maxVal) maxVal = sensorValue;
    if (sensorValue < minVal) minVal = sensorValue;
    delayMicroseconds(100);
  }

  float peakToPeak = maxVal - minVal;
  float voltage = (peakToPeak * 3.3 / 4096.0) / 2.0 * 1.414;  // RMS
  voltage = voltage * 220.0;  // Sesuaikan dengan penguatan sensor
  return voltage;
}

void updateStats(float voltage) {
  if (voltage < minVoltage) minVoltage = voltage;
  if (voltage > maxVoltage) maxVoltage = voltage;
  totalVoltage += voltage;
  readingCount++;
}

void updateLCD(float voltage) {
  lcd.setCursor(0, 0);
  lcd.print("Voltage:       ");
  lcd.setCursor(0, 1);
  lcd.print(voltage, 2);
  lcd.print(" V     ");
}

String getTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "1970-01-01T00:00:00Z";
  char timestamp[30];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(timestamp);
}

void sendToServer(float voltage) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    float avgVoltage = (readingCount > 0) ? totalVoltage / readingCount : 0;

    String json = "{";
    json += "\"deviceId\":\"ESP32_001\",";
    json += "\"voltage\":" + String(voltage, 2) + ",";
    json += "\"minVoltage\":" + String(minVoltage, 2) + ",";
    json += "\"maxVoltage\":" + String(maxVoltage, 2) + ",";
    json += "\"avgVoltage\":" + String(avgVoltage, 2) + ",";
    json += "\"timestamp\":\"" + getTimestamp() + "\"";
    json += "}";

    Serial.println("Sending data: " + json);
    int httpResponseCode = http.POST(json);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("✅ Sent to server: " + response);
    } else {
      Serial.println("❌ Server error: " + String(httpResponseCode));
    }
    http.end();
  } else {
    Serial.println("❌ WiFi not connected");
  }
}
