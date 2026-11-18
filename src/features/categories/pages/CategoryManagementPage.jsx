import {apiError} from '@/shared/api/errors';
import useListPage from '@/shared/hooks/useListPage';
import ListControls from '@/shared/components/ui/ListControls';
import {useCategories} from '../hooks/useCategories';
import {canManageLibrary} from '@/features/auth/permissions';

import { useState } from "react";


import { useAuth } from "@/features/auth/hooks/useAuth";

import CategoryForm from "../components/CategoryForm";
import CategoryTable from "../components/CategoryTable";

import Button from "@/shared/components/ui/Button";
import Modal from "@/shared/components/ui/Modal";

function CategoryManagementPage() {
  const {categories,loading,error,setError,fetchCategories,createCategory,updateCategory,deleteCategory,pending}=useCategories();

  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  const [modalError, setModalError] = useState("");
  const [notification, setNotification] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {user} = useAuth();
  const role = user?.role;
  const canManage = canManageLibrary(role);

  const list=useListPage(categories,['name']);
  const handleAdd = () => {
    setSelectedCategory(null);
    setServerError(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setSelectedCategory(null);
    setServerError(null);
    setModalError("");
  };

  const handleSubmit = async (formData) => {
    if (submitting || pending || !canManage) return;
    try {
      setSubmitting(true);
      setServerError(null);
      setModalError("");
      setNotification("");

      if (selectedCategory) {
        const id = selectedCategory.id;

        await updateCategory(id, formData);
        setNotification("Cập nhật thể loại thành công.");
      } else {
        await createCategory(formData);
        setNotification("Thêm thể loại thành công.");
      }

      setIsModalOpen(false);
      setSelectedCategory(null);
    setServerError(null);


    } catch (err) {
      setServerError(err);

      setModalError(
        apiError(err).message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || pending || !canManage) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa thể loại này?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotification("");

      await deleteCategory(id);

      setNotification("Xóa thể loại thành công.");

    } catch (err) {

      setError(
        apiError(err).message
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý thể loại
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý các thể loại sách trong thư viện.
          </p>
        </div>

        {canManage && (
          <Button disabled={pending} onClick={handleAdd}>
            + Thêm thể loại
          </Button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notification}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span role="alert">{error}</span>

          <button aria-label="Đóng thông báo" onClick={() => setError("")}>×</button>
        </div>
      )}

      <ListControls list={list}/>
      {/* Category Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách thể loại
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <CategoryTable
          categories={list.rows}
          canManage={canManage && !pending}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        busy={submitting}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedCategory
            ? "Cập nhật thể loại"
            : "Thêm thể loại mới"
        }
      >
        <div className="space-y-4">
          {modalError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          )}

          <CategoryForm
            serverError={serverError}
            key={selectedCategory?.id ?? 'new'}
            initialData={selectedCategory}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            loading={submitting}
          />
        </div>
      </Modal>
    </div>
  );
}

export default CategoryManagementPage;
