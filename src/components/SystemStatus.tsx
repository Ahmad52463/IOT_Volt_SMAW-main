
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Database, Shield, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
  isSystemOn: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

const SystemStatus = ({ isSystemOn, connectionStatus }: SystemStatusProps) => {
  const getStatusColor = () => {
    if (!isSystemOn) return 'bg-gray-500';
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isSystemOn) return 'System OFF';
    switch (connectionStatus) {
      case 'connected': return 'Terhubung';
      case 'disconnected': return 'Terputus';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    if (!isSystemOn) return <WifiOff className="h-4 w-4" />;
    switch (connectionStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800">
          Status Sistem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Koneksi ESP32</span>
          <Badge className={`${getStatusColor()} text-white flex items-center gap-1`}>
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Database</span>
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <Database className="h-4 w-4" />
            Online
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Keamanan</span>
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Aman
          </Badge>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Info:</strong> Sistem monitoring tegangan SMAW menggunakan sensor ZMPT101B 
            terhubung melalui ESP32 untuk pengambilan data real-time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
