'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarData {
  feature: string;
  count: number;
}

interface UsageBarChartProps {
  data: BarData[];
  onBarClick: (feature: string) => void;
  selectedFeature: string | null;
}

export default function UsageBarChart({ data, onBarClick, selectedFeature }: UsageBarChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={(state) => {
            if (state && state.activeLabel) {
              onBarClick(state.activeLabel);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d30" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis type="category" dataKey="feature" stroke="#94a3b8" width={100} />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ backgroundColor: '#141417', border: '1px solid #2d2d30' }}
            itemStyle={{ color: '#6366f1' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={selectedFeature === entry.feature ? '#10b981' : '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
