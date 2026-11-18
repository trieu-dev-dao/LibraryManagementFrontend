import {apiError} from '@/shared/api/errors';
import useListPage from '@/shared/hooks/useListPage';
import ListControls from '@/shared/components/ui/ListControls';
import {useAuthors} from '../hooks/useAuthors';
import {canManageLibrary} from '@/features/auth/permissions';
// src/features/admin/authors/pages/AuthorManagementPage.jsx
import { useState } from "react";


import { useAuth } from "@/features/auth/hooks/useAuth";

import AuthorForm from "../components/AuthorForm";
import AuthorTable from "../components/AuthorTable";

import Button from "@/shared/components/ui/Button";
import Modal from "@/shared/components/ui/Modal";

function AuthorManagementPage() {
  const {authors,loading,error,setError,fetchAuthors,createAuthor,updateAuthor,deleteAuthor,pending}=useAuthors();
  const {user} = useAuth();
  const role = user?.role;

  const canManage = canManageLibrary(role);


  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  const [modalError, setModalError] = useState("");
  const [notification, setNotification] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // GET AUTHORS
  const list=useListPage(authors,['name']);
  const handleAdd = () => {
    setSelectedAuthor(null);
    setServerError(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleEdit = (author) => {
    setSelectedAuthor(author);
    setServerError(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setSelectedAuthor(null);
    setServerError(null);
    setModalError("");
  };

  // CREATE / UPDATE
  const handleSubmit = async (formData) => {
    if (submitting || pending || !canManage) return;
    try {
      setSubmitting(true);
      setServerError(null);
      setModalError("");
      setError("");
      setNotification("");

      if (selectedAuthor) {
        const id = selectedAuthor.id;

        await updateAuthor(id, formData);

        setNotification("Cập nhật tác giả thành công.");
      } else {
        await createAuthor(formData);

        setNotification("Thêm tác giả thành công.");
      }

      setIsModalOpen(false);
      setSelectedAuthor(null);
    setServerError(null);


    } catch (err) {
      setServerError(err);

      setModalError(
        apiError(err).message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!id || pending || !canManage) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa tác giả này?");

    if (!confirmed) return;

    try {
      setError("");
      setNotification("");

      await deleteAuthor(id);

      // DELETE trả về 204 No Content
      setNotification("Xóa tác giả thành công.");


    } catch (err) {

      setError(
        apiError(err).message,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tác giả</h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các tác giả trong thư viện.
          </p>
        </div>

        {canManage && <Button disabled={pending} onClick={handleAdd}>+ Thêm tác giả</Button>}
      </div>

      {/* Notifications */}
      {notification && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notification}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span role="alert">{error}</span>

          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      <ListControls list={list}/>
      {/* Author table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách tác giả
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuthors}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <AuthorTable
          authors={list.rows}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canManage={canManage && !pending}
        />
      </div>

      {/* Create / Update Modal */}
      <Modal
        busy={submitting}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAuthor ? "Cập nhật tác giả" : "Thêm tác giả mới"}
      >
        <div className="space-y-4">
          {modalError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          )}

          <AuthorForm
            serverError={serverError}
            key={selectedAuthor?.id ?? 'new'}
            initialData={selectedAuthor}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            loading={submitting}
          />
        </div>
      </Modal>
    </div>
  );
}

export default AuthorManagementPage;
