import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import type { TrendPoint, LoadPoint, RecoveryFactor } from '@/types';

const axisStyle = {
  fontSize: 11,
  fill: 'hsl(215 20% 65%)',
};

const gridColor = 'hsl(222 30% 18%)';

function ChartTooltip({
  active,
  payload,
  label,
  suffix = '',
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.value}
          {suffix}
        </p>
      ))}
    </div>
  );
}

export function PerformanceLineChart({
  data,
  color = 'hsl(187 92% 48%)',
}: {
  data: TrendPoint[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip suffix="" />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RecoveryLineChart({
  data,
  color = 'hsl(152 62% 44%)',
}: {
  data: TrendPoint[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip suffix="" />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LoadBarChart({
  data,
  color = 'hsl(187 92% 48%)',
}: {
  data: LoadPoint[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip suffix=" units" />} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RecoveryRadarChart({
  data,
}: {
  data: RecoveryFactor[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'hsl(215 20% 75%)' }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="hsl(187 92% 48%)"
          fill="hsl(187 92% 48%)"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip content={<ChartTooltip suffix="" />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
