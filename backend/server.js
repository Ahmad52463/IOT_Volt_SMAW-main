
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'voltage_data.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS voltage_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    voltage REAL NOT NULL,
    min_voltage REAL,
    max_voltage REAL,
    avg_voltage REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS welding_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    device_id TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    min_voltage REAL,
    max_voltage REAL,
    avg_voltage REAL,
    duration INTEGER,
    operator TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// WebSocket server for real-time data
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast data to all connected WebSocket clients
function broadcastData(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Receive voltage data from ESP32
app.post('/api/voltage', (req, res) => {
  const { deviceId, voltage, minVoltage, maxVoltage, avgVoltage, timestamp } = req.body;
  
  console.log('Received voltage data:', req.body);
  
  // Validate data
  if (!deviceId || voltage === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: deviceId and voltage' 
    });
  }
  
  // Insert into database
  const stmt = db.prepare(`
    INSERT INTO voltage_readings (device_id, voltage, min_voltage, max_voltage, avg_voltage, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run([
    deviceId, 
    voltage, 
    minVoltage || null, 
    maxVoltage || null, 
    avgVoltage || null,
    timestamp || new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Broadcast to WebSocket clients
    const data = {
      type: 'voltage_update',
      deviceId,
      voltage,
      minVoltage,
      maxVoltage,
      avgVoltage,
      timestamp: timestamp || new Date().toISOString()
    };
    
    broadcastData(data);
    
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Voltage data received successfully' 
    });
  });
  
  stmt.finalize();
});

// Get latest voltage readings
app.get('/api/voltage/latest', (req, res) => {
  const limit = req.query.limit || 10;
  const deviceId = req.query.deviceId;
  
  let query = `
    SELECT * FROM voltage_readings 
    ${deviceId ? 'WHERE device_id = ?' : ''}
    ORDER BY timestamp DESC 
    LIMIT ?
  `;
  
  const params = deviceId ? [deviceId, limit] : [limit];
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

// Get voltage history with pagination
app.get('/api/voltage/history', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const deviceId = req.query.deviceId;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT * FROM voltage_readings 
    ${deviceId ? 'WHERE device_id = ?' : ''}
    ORDER BY timestamp DESC 
    LIMIT ? OFFSET ?
  `;
  
  const params = deviceId ? [deviceId, limit, offset] : [limit, offset];
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM voltage_readings 
      ${deviceId ? 'WHERE device_id = ?' : ''}
    `;
    const countParams = deviceId ? [deviceId] : [];
    
    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Get voltage statistics
app.get('/api/voltage/stats', (req, res) => {
  const deviceId = req.query.deviceId;
  const timeRange = req.query.range || '24h'; // 1h, 24h, 7d, 30d
  
  let timeCondition = '';
  switch(timeRange) {
    case '1h':
      timeCondition = "AND timestamp >= datetime('now', '-1 hour')";
      break;
    case '24h':
      timeCondition = "AND timestamp >= datetime('now', '-1 day')";
      break;
    case '7d':
      timeCondition = "AND timestamp >= datetime('now', '-7 days')";
      break;
    case '30d':
      timeCondition = "AND timestamp >= datetime('now', '-30 days')";
      break;
  }
  
  let query = `
    SELECT 
      COUNT(*) as total_readings,
      MIN(voltage) as min_voltage,
      MAX(voltage) as max_voltage,
      AVG(voltage) as avg_voltage,
      MIN(timestamp) as first_reading,
      MAX(timestamp) as last_reading
    FROM voltage_readings 
    WHERE 1=1 
    ${deviceId ? 'AND device_id = ?' : ''}
    ${timeCondition}
  `;
  
  const params = deviceId ? [deviceId] : [];
  
  db.get(query, params, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(row);
  });
});

// Start welding session
app.post('/api/welding/start', (req, res) => {
  const { sessionId, deviceId, operator } = req.body;
  
  if (!sessionId || !deviceId) {
    return res.status(400).json({ 
      error: 'Missing required fields: sessionId and deviceId' 
    });
  }
  
  const stmt = db.prepare(`
    INSERT INTO welding_sessions (session_id, device_id, start_time, operator)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run([sessionId, deviceId, new Date().toISOString(), operator || 'Unknown'], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      success: true, 
      id: this.lastID,
      sessionId,
      message: 'Welding session started' 
    });
  });
  
  stmt.finalize();
});

// End welding session
app.post('/api/welding/end', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ 
      error: 'Missing required field: sessionId' 
    });
  }
  
  // Calculate session statistics
  const statsQuery = `
    SELECT 
      MIN(voltage) as min_voltage,
      MAX(voltage) as max_voltage,
      AVG(voltage) as avg_voltage
    FROM voltage_readings vr
    JOIN welding_sessions ws ON vr.device_id = ws.device_id
    WHERE ws.session_id = ? 
    AND vr.timestamp >= ws.start_time
  `;
  
  db.get(statsQuery, [sessionId], (err, stats) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const endTime = new Date().toISOString();
    
    // Update session with end time and statistics
    const updateStmt = db.prepare(`
      UPDATE welding_sessions 
      SET end_time = ?, min_voltage = ?, max_voltage = ?, avg_voltage = ?
      WHERE session_id = ?
    `);
    
    updateStmt.run([
      endTime,
      stats?.min_voltage || null,
      stats?.max_voltage || null,
      stats?.avg_voltage || null,
      sessionId
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        sessionId,
        stats,
        message: 'Welding session ended' 
      });
    });
    
    updateStmt.finalize();
  });
});

// Get welding sessions
app.get('/api/welding/sessions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  db.all(`
    SELECT * FROM welding_sessions 
    ORDER BY start_time DESC 
    LIMIT ? OFFSET ?
  `, [limit, offset], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on port 8080`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
