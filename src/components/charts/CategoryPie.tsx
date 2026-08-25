import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { CategoryTotal } from '../../domain/calculations';

export function CategoryPie({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No expenses yet in this period.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90}>
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: unknown) => ((Number(value) ?? 0) / 100).toFixed(2)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
