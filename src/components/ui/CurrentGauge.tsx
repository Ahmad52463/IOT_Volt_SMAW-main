// src/components/CurrentGauge.tsx
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface CurrentGaugeProps {
  current: number;
  maxCurrent?: number;
}

const CurrentGauge: React.FC<CurrentGaugeProps> = ({ current, maxCurrent = 30 }) => {
  const value = Math.min(current, maxCurrent);
  const percentage = (value / maxCurrent) * 100;

  const data = [
    {
      name: 'Current',
      value: percentage,
      fill: '#3b82f6',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={20}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="value"
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={24} fill="#1e293b">
          {value.toFixed(1)} A
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default CurrentGauge;
