
import Button from "@/shared/components/ui/Button";

function CategoryTable({
  categories = [],
  canManage = false,
  loading = false,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Đang tải danh sách thể loại...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center text-gray-500">
        Chưa có thể loại nào trong hệ thống.
      </div>
    );
  }

  return (
    <div className="table-scroll surface" tabIndex={0} role="region" aria-label="Danh sách thể loại, cuộn ngang để xem đầy đủ">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-5 py-4">Mã thể loại</th>
            <th className="px-5 py-4">Tên thể loại</th>
            <th className="px-5 py-4 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {categories.map((category) => {
            const id = category.id;
            const name = category.name;

            return (
              <tr key={id} className="hover:bg-gray-50">
                <td className="px-5 py-4">{id}</td>

                <td className="px-5 py-4 font-medium text-gray-900">
                  {name}
                </td>

                <td className="px-5 py-4">
                  {canManage && <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(category)}
                    >
                      Sửa
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete?.(id)}
                    >
                      Xóa
                    </Button>
                  </div>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;
