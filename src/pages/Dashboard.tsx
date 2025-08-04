
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoltageGauge from '@/components/VoltageGauge';
import VoltageChart from '@/components/VoltageChart';
import DataHistory from '@/components/DataHistory';
import SystemStatus from '@/components/SystemStatus';
import DigitalClock from '@/components/DigitalClock';
import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface VoltageReading {
  deviceId: string;
  voltage: number;
  minVoltage?: number | null;
  maxVoltage?: number | null;
  avgVoltage?: number | null;
  timestamp: string;
}

const Dashboard = ({ username, onLogout }: DashboardProps) => {
  const [currentVoltage, setCurrentVoltage] = useState(0);
  const [isSystemOn, setIsSystemOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [voltageData, setVoltageData] = useState([
    { time: '00:00', voltage: 0 },
  ]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  const [weldingRecords] = useState([
    {
      id: 'WLD001',
      timestamp: '2024-01-15 08:30:15',
      minVoltage: 22.1,
      maxVoltage: 26.8,
      avgVoltage: 24.2,
      duration: '15:32',
      operator: 'Admin'
    },
    {
      id: 'WLD002',
      timestamp: '2024-01-15 10:15:42',
      minVoltage: 21.8,
      maxVoltage: 27.2,
      avgVoltage: 23.9,
      duration: '12:18',
      operator: 'Admin'
    },
    {
      id: 'WLD003',
      timestamp: '2024-01-15 14:22:08',
      minVoltage: 23.5,
      maxVoltage: 25.9,
      avgVoltage: 24.7,
      duration: '18:45',
      operator: 'Admin'
    }
  ]);

  // WebSocket connection for real-time data
  useEffect(() => {
    if (!isSystemOn) {
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }
      setConnectionStatus('disconnected');
      return;
    }

    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data: { type: string } & VoltageReading = JSON.parse(event.data);
        console.log('Received WebSocket data:', data);
        
        if (data.type === 'voltage_update') {
          setCurrentVoltage(data.voltage);
          
          const now = new Date();
          const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          setVoltageData(prev => {
            const newData = [...prev.slice(-9), { time: timeString, voltage: data.voltage }];
            return newData;
          });
          
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
        setConnectionStatus('error');
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      setWsConnection(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    return () => {
      ws.close();
    };
  }, [isSystemOn]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/voltage/latest?limit=10');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched initial data:', data);
          
          if (data.length > 0) {
            const latestReading = data[0];
            setCurrentVoltage(latestReading.voltage);
            
            // Convert database data to chart format
            const chartData = data.reverse().map((reading: any) => {
              const timestamp = new Date(reading.timestamp);
              return {
                time: `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}`,
                voltage: reading.voltage
              };
            });
            
            setVoltageData(chartData);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    if (isSystemOn) {
      fetchLatestData();
    }
  }, [isSystemOn]);

  const handleSystemToggle = (isOn: boolean) => {
    setIsSystemOn(isOn);
    if (!isOn) {
      setCurrentVoltage(0);
      setVoltageData([{ time: '00:00', voltage: 0 }]);
    }
  };

  const maxVoltage = Math.max(...voltageData.map(d => d.voltage));
  const minVoltage = Math.min(...voltageData.map(d => d.voltage));
  const avgVoltage = voltageData.reduce((sum, d) => sum + d.voltage, 0) / voltageData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header 
        username={username}
        onLogout={onLogout}
        isSystemOn={isSystemOn}
        onSystemToggle={handleSystemToggle}
      />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Professional Header Section */}
          <div className="text-center py-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-slate-700 bg-clip-text text-transparent mb-3">
              Dashboard Monitoring Tegangan SMAW
            </h2>
            <p className="text-slate-600 text-lg">
              Pada Laboratorium Teknik Mesin Politeknik Purbaya
            </p>
            {connectionStatus === 'connected' && (
              <p className="text-green-600 text-sm mt-2">
                ✅ Terhubung dengan ESP32 - Data Real-time
              </p>
            )}
            {connectionStatus === 'disconnected' && (
              <p className="text-red-600 text-sm mt-2">
                ❌ Tidak terhubung dengan ESP32 - Periksa koneksi
              </p>
            )}
            {connectionStatus === 'error' && (
              <p className="text-orange-600 text-sm mt-2">
                ⚠️ Error koneksi ESP32 - Coba restart sistem
              </p>
            )}
          </div>

          <Tabs defaultValue="monitoring" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-xl p-1">
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">Real-time Monitoring</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">Riwayat Data</TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">Status Sistem</TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring" className="space-y-8">
              {/* Status Cards dengan warna profesional */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="bg-white shadow-xl border-0 border-l-4 border-l-blue-600 hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">
                      Tegangan Saat Ini
                    </CardTitle>
                    <Zap className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800">
                      {isSystemOn ? currentVoltage.toFixed(1) : '0.0'} V
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {isSystemOn ? (connectionStatus === 'connected' ? 'Real-time ESP32' : 'Waiting for data...') : 'System OFF'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-0 border-l-4 border-l-emerald-600 hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">
                      Tegangan Maksimum
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800">
                      {maxVoltage.toFixed(1)} V
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Nilai tertinggi sesi ini
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-0 border-l-4 border-l-amber-600 hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">
                      Tegangan Minimum
                    </CardTitle>
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800">
                      {minVoltage.toFixed(1)} V
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Nilai terendah sesi ini
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-0 border-l-4 border-l-purple-600 hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">
                      Tegangan Rata-rata
                    </CardTitle>
                    <Activity className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-800">
                      {avgVoltage.toFixed(1)} V
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Average voltage
                    </p>
                  </CardContent>
                </Card>

                {/* Digital Clock Card */}
                <DigitalClock />
              </div>

              {/* Main Monitoring Panel dengan warna yang diperbaiki */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Zap className="h-6 w-6 text-blue-600" />
                      Gauge Tegangan Real-time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <VoltageGauge voltage={isSystemOn ? currentVoltage : 0} maxVoltage={250} />
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Activity className="h-6 w-6 text-emerald-600" />
                      Grafik Tegangan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <VoltageChart data={voltageData} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <DataHistory 
                weldingRecords={weldingRecords} 
                isSystemOn={isSystemOn}
                currentVoltage={currentVoltage}
              />
            </TabsContent>

            <TabsContent value="system">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SystemStatus 
                  isSystemOn={isSystemOn} 
                  connectionStatus={connectionStatus}
                />
                
                <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-slate-800">
                      Informasi Perangkat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <strong className="text-slate-700">Mikrokontroller:</strong>
                        <span className="text-slate-600">ESP32</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <strong className="text-slate-700">Sensor:</strong>
                        <span className="text-slate-600">ZMPT101B</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <strong className="text-slate-700">Display:</strong>
                        <span className="text-slate-600">LCD 16x2 (I2C)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <strong className="text-slate-700">Metode Pengelasan:</strong>
                        <span className="text-slate-600">SMAW</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <strong className="text-slate-700">WebSocket Status:</strong>
                        <span className={`text-slate-600 ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                          {connectionStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <strong className="text-slate-700">Backend Server:</strong>
                        <span className="text-slate-600">localhost:3001</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <strong className="text-slate-700">Last Update:</strong>
                        <span className="text-slate-600">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
