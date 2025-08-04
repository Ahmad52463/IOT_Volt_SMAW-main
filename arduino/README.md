
# ESP32 Voltage Monitor - Arduino Code

Kode Arduino untuk ESP32 yang menggunakan sensor ZMPT101B untuk monitoring tegangan pengelasan SMAW.

## Hardware Requirements

- ESP32 Development Board
- Sensor Tegangan ZMPT101B
- LCD 16x2 dengan I2C Module
- Resistor dan komponen pendukung

## Pin Connections

### ZMPT101B Sensor
- VCC -> 3.3V
- GND -> GND
- OUT -> GPIO A0 (ADC)

### LCD 16x2 (I2C)
- VCC -> 5V
- GND -> GND
- SDA -> GPIO 21
- SCL -> GPIO 22

## Libraries Required

Install library berikut melalui Arduino IDE Library Manager:

```
- WiFi (ESP32 built-in)
- HTTPClient (ESP32 built-in)
- ArduinoJson by Benoit Blanchon
- LiquidCrystal I2C by Frank de Brabander
```

## Configuration

1. Update WiFi credentials:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

2. Update server URL:
```cpp
const char* serverURL = "http://YOUR_SERVER_IP:3001/api/voltage";
```

3. Adjust sensor calibration if needed:
```cpp
const float voltageDivider = 11.0;  // Adjust based on your sensor
```

## Features

- Real-time voltage reading from ZMPT101B
- LCD display showing current, min, and max voltage
- WiFi connectivity
- Automatic data transmission to backend server
- Error handling and reconnection logic
- NTP time synchronization

## Installation

1. Open Arduino IDE
2. Install required libraries
3. Load the sketch
4. Update configuration variables
5. Upload to ESP32

## Calibration

Untuk kalibrasi sensor ZMPT101B:

1. Ukur tegangan sebenarnya dengan multimeter
2. Bandingkan dengan pembacaan sensor
3. Adjust nilai `voltageDivider` untuk akurasi
4. Test dengan berbagai level tegangan

## Troubleshooting

- Pastikan koneksi I2C LCD benar
- Cek alamat I2C LCD (biasanya 0x27 atau 0x3F)
- Pastikan WiFi credentials benar
- Cek koneksi internet untuk mengirim data
- Monitor Serial Monitor untuk debug info
