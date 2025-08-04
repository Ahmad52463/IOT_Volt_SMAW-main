
import { useEffect, useRef } from 'react';

interface VoltageGaugeProps {
  voltage: number;
  minVoltage?: number;
  maxVoltage?: number;
}

const VoltageGauge = ({ voltage, minVoltage = 0, maxVoltage = 250 }: VoltageGaugeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer circle with elegant gradient
    const outerGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    outerGradient.addColorStop(0, '#e2e8f0');
    outerGradient.addColorStop(1, '#cbd5e1');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = outerGradient;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw voltage arc
    const normalizedVoltage = Math.min(Math.max(voltage, minVoltage), maxVoltage);
    const percentage = (normalizedVoltage - minVoltage) / (maxVoltage - minVoltage);
    const startAngle = -Math.PI;
    const endAngle = startAngle + (percentage * 2 * Math.PI);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    
    // Professional color scheme based on voltage level
    let color = '#059669'; // emerald-600 for safe levels
    if (percentage > 0.8) color = '#dc2626'; // red-600 for high voltage
    else if (percentage > 0.6) color = '#d97706'; // amber-600 for warning
    else if (percentage > 0.4) color = '#2563eb'; // blue-600 for normal operation
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw center circle with gradient
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
    centerGradient.addColorStop(0, color);
    centerGradient.addColorStop(1, color + '80');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Draw voltage text with professional styling
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage.toFixed(1)}V`, centerX, centerY - 30);

    // Draw labels with professional styling
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`${minVoltage}V`, centerX - radius + 15, centerY + 5);
    ctx.fillText(`${maxVoltage}V`, centerX + radius - 15, centerY + 5);
    
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Tegangan SMAW', centerX, centerY + 55);

  }, [voltage, minVoltage, maxVoltage]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={250}
        className="border border-slate-200 rounded-xl shadow-lg bg-gradient-to-br from-white to-slate-50"
      />
    </div>
  );
};

export default VoltageGauge;
