
import React from "react";
import Loading from "./Loading";

function DataTable({
  columns = [],
  data = [],
  loading = false,
  rowKey = "id",
  emptyMessage = "Không có dữ liệu",
  onRowClick,
  className = "",
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-12">
        <Loading text="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div
      className={`table-scroll surface w-full ${className}`}
      tabIndex={0} role="region" aria-label="Bảng dữ liệu, cuộn ngang để xem đầy đủ"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || column.accessorKey || index}
                scope="col"
                className={`
                  whitespace-nowrap px-5 py-3.5
                  text-xs font-semibold uppercase tracking-wide
                  text-gray-600
                  ${column.headerClassName || ""}
                `}
                style={{ textAlign: column.align || "left" }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={Math.max(columns.length, 1)}
                className="px-5 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[rowKey] ?? rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors hover:bg-gray-50
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {columns.map((column, columnIndex) => {
                  const accessor =
                    column.accessorKey || column.key;

                  const value = accessor
                    ? row[accessor]
                    : undefined;

                  return (
                    <td
                      key={accessor || columnIndex}
                      className={`
                        px-5 py-4 text-gray-700
                        ${column.cellClassName || ""}
                      `}
                      style={{ textAlign: column.align || "left" }}
                    >
                      {column.cell
                        ? column.cell(value, row, rowIndex)
                        : value ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
