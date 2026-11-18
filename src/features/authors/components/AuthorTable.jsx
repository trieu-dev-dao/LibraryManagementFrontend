import React from "react";

import DataTable from "@/shared/components/ui/DataTable";
import Button from "@/shared/components/ui/Button";

function AuthorTable({
  authors = [],
  loading = false,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const columns = [
    {
      key: "id",
      header: "Mã tác giả",
      accessorKey: "id",
      cell: (value) => value ?? "—",
    },
    {
      key: "name",
      header: "Tên tác giả",
      accessorKey: "name",
      cell: (value) => (
        <span className="font-medium text-gray-900">
          {value ?? "—"}
        </span>
      ),
    },
    {
      key: "bio",
      header: "Tiểu sử",
      accessorKey: "bio",
      cell: (value) => (
        <span className="block max-w-md truncate text-gray-600">
          {value ?? "Chưa có thông tin"}
        </span>
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Thao tác",
            align: "center",
            cell: (_, row) => (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(row)}
                >
                  Sửa
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete?.(row.id)}
                >
                  Xóa
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={authors}
      loading={loading}
      rowKey="id"
      emptyMessage="Chưa có tác giả nào trong hệ thống."
    />
  );
}

export default AuthorTable;
