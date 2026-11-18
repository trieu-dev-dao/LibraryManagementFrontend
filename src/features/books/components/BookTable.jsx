import Button from "@/shared/components/ui/Button";

function BookTable({
  books = [],
  loading = false,
  canManage = false,
  onView,
  onEdit,
  onDelete,
  emptyMessage = 'Chưa có sách nào trong hệ thống.',
}) {

  if (loading) {
    return <div className="py-10 text-center text-gray-500">Đang tải danh sách sách...</div>;
  }

  if (books.length === 0) {
    return <div className="surface p-10 text-center text-slate-600">{emptyMessage}</div>;
  }

  return (
    <div className="table-scroll surface" tabIndex={0} role="region" aria-label="Danh sách sách, cuộn ngang để xem đầy đủ">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-5 py-4">Mã sách</th>
            <th className="px-5 py-4">Tên sách</th>
            <th className="px-5 py-4">Tác giả</th>
            <th className="px-5 py-4">Thể loại</th>
            <th className="px-5 py-4">Số bản hiện còn</th>
            <th className="px-5 py-4">Năm XB</th>
            <th className="px-5 py-4 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {books.map((book) => {
            const id = book.id;

            return (
              <tr key={id} className="hover:bg-gray-50">
                <td className="px-5 py-4">{id}</td>
                <td className="max-w-xs px-5 py-4 font-medium text-gray-900">
                  {book.title}
                </td>
                <td className="px-5 py-4">
                  {book.authorName ?? "—"}
                </td>
                <td className="px-5 py-4">
                  {book.categoryName ?? "—"}
                </td>
                <td className="px-5 py-4">{book.quantity ?? 0}</td>
                <td className="px-5 py-4">{book.publishedYear ?? "—"}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onView?.(book)}>
                      Xem
                    </Button>

                    {canManage && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEdit?.(book)}>
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete?.(id)}
                        >
                          Xóa
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BookTable;
