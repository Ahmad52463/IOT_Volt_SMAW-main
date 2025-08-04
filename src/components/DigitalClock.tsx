
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DigitalClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-white shadow-lg border-l-4 border-l-indigo-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          Waktu Sistem
        </CardTitle>
        <Clock className="h-4 w-4 text-indigo-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800 font-mono">
          {formatTime(currentTime)}
        </div>
        <p className="text-xs text-slate-600 mt-1">
          {formatDate(currentTime)}
        </p>
      </CardContent>
    </Card>
  );
};

export default DigitalClock;
