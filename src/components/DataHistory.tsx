import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Calendar as CalendarIcon, Printer } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface WeldingRecord {
  id: string;
  timestamp: string;
  minVoltage: number;
  maxVoltage: number;
  avgVoltage: number;
  duration: string;
  operator: string;
}

interface DataHistoryProps {
  weldingRecords?: WeldingRecord[];
  isSystemOn: true;
  currentVoltage: number;
}

const DataHistory = ({ isSystemOn, currentVoltage }: DataHistoryProps) => {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [storedRecords, setStoredRecords] = useState<WeldingRecord[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  const saveToServer = async (record: WeldingRecord) => {
    try {
      await fetch('http://localhost:3001/api/voltage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (error) {
      console.error('Gagal menyimpan ke server:', error);
    }
  };

  useEffect(() => {
    if (isSystemOn) {
      if (!currentSession) setCurrentSession(`SESSION_${Date.now()}`);
      const interval = setInterval(() => {
        const newRecord: WeldingRecord = {
          id: `WLD_${Date.now()}`,
          timestamp: new Date().toISOString(),
          minVoltage: Math.max(0, currentVoltage - 2),
          maxVoltage: currentVoltage + 2,
          avgVoltage: currentVoltage,
          duration: '00:03',
          operator: 'Admin',
        };
        saveToServer(newRecord);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      if (currentSession) setCurrentSession(null);
    }
  }, [isSystemOn, currentVoltage, currentSession]);

  useEffect(() => {
    fetch('http://localhost:3001/api/voltage/latest?limit=100')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item: any) => ({
          id: `DB_${item.id}`,
          timestamp: item.timestamp,
          minVoltage: item.min_voltage,
          maxVoltage: item.max_voltage,
          avgVoltage: item.avg_voltage,
          duration: '00:03',
          operator: 'Admin',
        }));
        setStoredRecords(formatted);
      });
  }, []);

  const filteredRecords = storedRecords.filter(record =>
    isSameDay(parseISO(record.timestamp), selectedDate)
  );

  const handleSelectAll = () => {
    setSelectedRecords(
      selectedRecords.length === filteredRecords.length
        ? []
        : filteredRecords.map(r => r.id)
    );
  };

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handlePrintHTML = () => {
    const selectedData = filteredRecords.filter(r => selectedRecords.includes(r.id));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = selectedData.map(record => `
      <tr>
        <td>${record.id}</td>
        <td>${format(parseISO(record.timestamp), 'dd/MM/yyyy HH:mm:ss')}</td>
        <td>${record.minVoltage.toFixed(1)}</td>
        <td>${record.maxVoltage.toFixed(1)}</td>
        <td>${record.avgVoltage.toFixed(1)}</td>
        <td>${record.duration}</td>
        <td>${record.operator}</td>
      </tr>
    `).join('');

    const catatanTable = `
      <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="width: 80%; border: 1px solid #000; padding: 10px; text-align: center;">Catatan</th>
            <th style="width: 20%; border: 1px solid #000; padding: 10px; text-align: center;">Penggunaan Ampere</th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 150px;">
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
          </tr>
        </tbody>
      </table>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Data</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .kop { display: flex; align-items: center; border-bottom: 2.5px solid #000; padding-bottom: 10px; margin-bottom: 40px; }
            .kop img { width: 80px; height: 80px; margin-right: 20px; }
            .kop-info h1 { font-size: 22px; color: #003366; margin: 0; }
            .kop-info h2 { font-size: 16px; margin: 0; color: #003366; font-weight: normal; }
            .kop-info p { font-size: 12px; margin: 0; }
            .kop-info a { color: blue; text-decoration: none; }
            table { border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; text-align: center; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 60px; font-size: 12px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="poltek.png" alt="Logo" />
            <div class="kop-info">
              <h1>POLITEKNIK PURBAYA</h1>
              <h2>POLITEKNIK TEKNOPRENEUR</h2>
              <p>
                Kampus I: Jl. Pancakarya No.1 Kajen, Talang – Tegal 52193<br />
                Kampus II: Jl. Supriyadi No. 72 Trayeman, Slawi – Tegal 52414<br />
                Telp. (0283) 4546201, HP: 0821 1146 0080<br />
                Laman: <a href="http://www.purbaya.ac.id">www.purbaya.ac.id</a>, Email: <a href="mailto:info@purbaya.ac.id">info@purbaya.ac.id</a>
              </p>
            </div>
          </div>

          <h3 style="text-align:center;">Laporan Monitoring Tegangan Pengelasan</h3>
          <p><strong>Tanggal:</strong> ${format(selectedDate, 'dd/MM/yyyy')}</p>

          <table style="width: 100%;">
            <thead>
              <tr>
                <th>ID</th>
                <th>Waktu</th>
                <th>Min (V)</th>
                <th>Max (V)</th>
                <th>Rata-rata (V)</th>
                <th>Durasi</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>

          ${catatanTable}

          <div class="footer">
            <p>Tegal, ${format(new Date(), 'dd MMMM yyyy', { locale: id })}</p>
            <p>Operator Praktik Pengelasan</p>
            <br /><br /><br />
            <p><strong>(______________________)</strong></p>
            <p>NUPTK. .....................................</p>
          </div>

          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 text-xl">
            <CalendarIcon className="h-5 w-5 text-blue-500" /> Filter Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP', { locale: id })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex gap-2 text-xl">
              <History className="h-5 w-5 text-blue-500" /> Riwayat Data Pengelasan
            </CardTitle>
            <Button
              onClick={handlePrintHTML}
              disabled={selectedRecords.length === 0}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> Cetak ({selectedRecords.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedRecords.length === filteredRecords.length}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Min (V)</TableHead>
                  <TableHead>Max (V)</TableHead>
                  <TableHead>Rata-rata (V)</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                      />
                    </TableCell>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{format(parseISO(record.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                    <TableCell>{record.minVoltage.toFixed(1)}</TableCell>
                    <TableCell>{record.maxVoltage.toFixed(1)}</TableCell>
                    <TableCell>{record.avgVoltage.toFixed(1)}</TableCell>
                    <TableCell>{record.duration}</TableCell>
                    <TableCell>{record.operator}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataHistory;
