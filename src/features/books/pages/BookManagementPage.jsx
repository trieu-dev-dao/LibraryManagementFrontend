import {apiError} from '@/shared/api/errors';
import useListPage from '@/shared/hooks/useListPage';
import ListControls from '@/shared/components/ui/ListControls';
import {canManageLibrary} from '@/features/auth/permissions';

import { useState } from "react";

import { useBooks } from "@/features/books/hooks/useBooks";
import BookForm from "@/features/books/components/BookForm";
import BookTable from "@/features/books/components/BookTable";
import BookDetails from "@/features/books/components/BookDetails";

import Button from "@/shared/components/ui/Button";
import Modal from "@/shared/components/ui/Modal";
import { useAuth } from "@/features/auth/hooks/useAuth";

function deleteErrorMessage(error) {
  const data = error?.response?.data;
  const backendMessage = typeof data === 'string' ? data : data?.detail ?? data?.message ?? data?.title;
  if (typeof backendMessage === 'string' && /FK_BorrowRecords_Books_BookId|REFERENCE constraint.*BorrowRecords/i.test(backendMessage)) {
    return 'Không thể xóa sách vì sách đã có phiếu mượn (lỗi ràng buộc từ máy chủ).';
  }
  if (error?.response?.status === 404) return 'Không tìm thấy sách để xóa trên máy chủ.';
  if (typeof backendMessage === 'string' && backendMessage.trim() && !/<[a-z][\s\S]*>/i.test(backendMessage)) {
    return `Máy chủ từ chối xóa sách: ${backendMessage.trim()}`;
  }
  return apiError(error).message;
}

function BookManagementPage() {
  const {
    books,
    pending,
    loading,
    error,
    setError,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  } = useBooks();

  const {user} = useAuth();
  const role = user?.role;
  const canManage = canManageLibrary(role);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState("");
  const [formError, setFormError] = useState("");
  const [refreshError, setRefreshError] = useState("");



  const list=useListPage(books,['title','authorName','categoryName']);
  const handleAdd = () => {
    setSelectedBook(null);
    setServerError(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setServerError(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleView = (book) => {
    setSelectedBook(book);
    setIsDetailOpen(true);
  };

  const handleCloseForm = () => {
    if (submitting) return;

    setIsFormOpen(false);
    setSelectedBook(null);
    setServerError(null);
    setFormError("");
  };

  const handleSubmit = async (formData) => {
    if (submitting || pending || !canManage) return;
    try {
      setSubmitting(true);
      setServerError(null);
      setFormError("");
      setError("");
      setNotification("");
      setRefreshError("");

      if (selectedBook) {
        const id = selectedBook.id;
        const result = await updateBook(id, formData);
        if (result.refreshError) setRefreshError(apiError(result.refreshError).message);
        setNotification("Cập nhật sách thành công.");
      } else {
        const result = await createBook(formData);
        if (result.refreshError) setRefreshError(apiError(result.refreshError).message);
        setNotification("Thêm sách thành công.");
      }

      setIsFormOpen(false);
      setSelectedBook(null);
    setServerError(null);
    } catch (err) {
      setServerError(err);

      setFormError(
        apiError(err).message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || pending || !canManage) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa sách này?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotification("");
      setRefreshError("");

      const result = await deleteBook(id);
      if (result.refreshError) setRefreshError(apiError(result.refreshError).message);
      if (list.rows.length === 1 && list.page > 1) list.update('page', list.page - 1);
      setNotification("Xóa sách thành công.");
    } catch (err) {

      setError(
        deleteErrorMessage(err)
      );
    }
  };

  const handleRefresh = async () => {
    const failure = await fetchBooks();
    if (failure) {
      if (refreshError) setRefreshError(apiError(failure).message);
      else setError(apiError(failure).message);
    } else {
      setRefreshError("");
      setError("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý sách
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh sách sách trong thư viện.
          </p>
        </div>

        {canManage && (
          <Button disabled={pending} onClick={handleAdd}>
            + Thêm sách
          </Button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notification}
        </div>
      )}

      {refreshError && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Thao tác đã được lưu, nhưng không tải lại được danh sách sách: {refreshError} Hãy chọn Làm mới để kiểm tra; không cần thực hiện lại thao tác.
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span role="alert">{error}</span>
          <button aria-label="Đóng thông báo" onClick={() => setError("")}>×</button>
        </div>
      )}

      <ListControls list={list}/>
      {/* Book List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Danh sách sách ({list.total})
          </h2>
          <Button size="sm" variant="outline" onClick={handleRefresh} loading={loading}>Làm mới</Button>
        </div>
        <BookTable books={list.rows} loading={loading} emptyMessage={books.length ? 'Không tìm thấy sách phù hợp.' : 'Chưa có sách nào trong hệ thống.'} canManage={canManage && !pending}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}/>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        busy={submitting}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedBook ? "Cập nhật sách" : "Thêm sách mới"}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <BookForm
            serverError={serverError}
            key={selectedBook?.id ?? 'new'}
            initialData={selectedBook}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            loading={submitting}
          />
        </div>
      </Modal>

      {/* Book Details Modal */}
      <BookDetails
        book={selectedBook}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}

export default BookManagementPage;
