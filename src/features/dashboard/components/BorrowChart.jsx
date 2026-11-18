
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";



function BorrowChart({ data = [] }) {
  return (
    <div className="surface p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Phiếu mượn còn lưu theo tháng
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Nhóm theo tháng ghi trong ngày mượn
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value) => [
                `${value} phiếu`,
                "Phiếu còn lưu",
              ]}
            />

            <Bar
              dataKey="borrows"
              name="Phiếu còn lưu"
              fill="#263F69"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BorrowChart;
