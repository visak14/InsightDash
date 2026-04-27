'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  date: string;
  count: number;
  features: Record<string, number>;
}

interface TrendLineChartProps {
  data: TrendData[];
  selectedFeature: string | null;
}

export default function TrendLineChart({ data, selectedFeature }: TrendLineChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    count: selectedFeature ? (d.features[selectedFeature] || 0) : d.count,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d30" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            cursor={{ stroke: '#2d2d30', strokeWidth: 2 }}
            contentStyle={{ backgroundColor: '#141417', border: '1px solid #2d2d30' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
