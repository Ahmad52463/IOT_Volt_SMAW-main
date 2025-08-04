
# SMAW Voltage Monitoring Backend

Backend API server untuk sistem monitoring tegangan pengelasan SMAW.

## Features

- REST API untuk menerima data dari ESP32
- WebSocket untuk real-time data streaming
- SQLite database untuk penyimpanan data
- Endpoint untuk statistik dan riwayat data
- Session management untuk pengelasan

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Voltage Data
- `POST /api/voltage` - Receive voltage data from ESP32
- `GET /api/voltage/latest` - Get latest readings
- `GET /api/voltage/history` - Get paginated history
- `GET /api/voltage/stats` - Get voltage statistics

### Welding Sessions
- `POST /api/welding/start` - Start welding session
- `POST /api/welding/end` - End welding session
- `GET /api/welding/sessions` - Get welding sessions

## WebSocket

Real-time data streaming available on port 8080.

## ESP32 Integration

Send POST requests to `/api/voltage` with JSON payload:
```json
{
  "deviceId": "ESP32_001",
  "voltage": 24.5,
  "minVoltage": 22.1,
  "maxVoltage": 26.8,
  "avgVoltage": 24.2,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Database Schema

### voltage_readings
- id (INTEGER PRIMARY KEY)
- device_id (TEXT)
- voltage (REAL)
- min_voltage (REAL)
- max_voltage (REAL)
- avg_voltage (REAL)
- timestamp (DATETIME)
- created_at (DATETIME)

### welding_sessions
- id (INTEGER PRIMARY KEY)
- session_id (TEXT UNIQUE)
- device_id (TEXT)
- start_time (DATETIME)
- end_time (DATETIME)
- min_voltage (REAL)
- max_voltage (REAL)
- avg_voltage (REAL)
- duration (INTEGER)
- operator (TEXT)
- created_at (DATETIME)
