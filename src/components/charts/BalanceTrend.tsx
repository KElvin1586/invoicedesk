import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthTotal } from '../../domain/calculations';

export function BalanceTrend({ data }: { data: MonthTotal[] }) {
  let running = 0;
  const chartData = data.map((m) => {
    running += m.net;
    return { name: m.key.slice(5), balance: running / 100 };
  });
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={70} />
        <Tooltip formatter={(value: unknown) => (Number(value) ?? 0).toFixed(2)} />
        <Area type="monotone" dataKey="balance" name="Balance" stroke="#10b981" strokeWidth={2} fill="url(#balanceFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
