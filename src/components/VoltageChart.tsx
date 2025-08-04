
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VoltageData {
  time: string;
  voltage: number;
}

interface VoltageChartProps {
  data: VoltageData[];
}

const VoltageChart = ({ data }: VoltageChartProps) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b"
            fontSize={12}
            fontFamily="system-ui, -apple-system, sans-serif"
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            fontFamily="system-ui, -apple-system, sans-serif"
            domain={[0, 250]}
            label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}V`, 'Tegangan']}
            labelFormatter={(label) => `Waktu: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="voltage" 
            stroke="#2563eb" 
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoltageChart;
