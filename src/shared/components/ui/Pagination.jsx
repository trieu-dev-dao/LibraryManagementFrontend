
import React from "react";
import Select from "./Select";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  totalItems,
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    safeTotalPages
  );

  const getPages = () => {
    const pages = [];
    const start = Math.max(1, safeCurrentPage - 1);
    const end = Math.min(
      safeTotalPages,
      safeCurrentPage + 1
    );

    if (start > 1) {
      pages.push(1);

      if (start > 2) {
        pages.push("...");
      }
    }

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (end < safeTotalPages) {
      if (end < safeTotalPages - 1) {
        pages.push("...");
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {typeof totalItems === "number" && (
          <span>
            Tổng cộng: <strong>{totalItems}</strong> bản ghi
          </span>
        )}

        {onPageSizeChange && (
          <div className="w-24">
            <Select
              aria-label="Số dòng mỗi trang"
              value={String(pageSize)}
              onChange={(event) =>
                onPageSizeChange(Number(event.target.value))
              }
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: `${size}/trang`,
              }))}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={safeCurrentPage === 1}
          onClick={() => onPageChange?.(safeCurrentPage - 1)}
          className="min-h-10 rounded-lg border border-line px-3 py-2 text-sm hover:bg-workspace disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>

        {getPages().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              aria-current={
                page === safeCurrentPage ? "page" : undefined
              }
              className={`
                min-w-9 rounded-lg px-3 py-2 text-sm
                ${
                  page === safeCurrentPage
                    ? "bg-navy-800 font-semibold text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={safeCurrentPage === safeTotalPages}
          onClick={() => onPageChange?.(safeCurrentPage + 1)}
          className="min-h-10 rounded-lg border border-line px-3 py-2 text-sm hover:bg-workspace disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default Pagination;
