import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMembers } from "../hooks/useMembers";
import { canManageLibrary } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { apiError } from "@/shared/api/errors";
import Modal from "@/shared/components/ui/Modal";
import Input from "@/shared/components/ui/Input";
import Button from "@/shared/components/ui/Button";
import QueryStatus from "@/shared/components/ui/QueryStatus";
import useListPage from "@/shared/hooks/useListPage";
import ListControls from "@/shared/components/ui/ListControls";
const schema = z.object({
  fullName: z.string().trim().min(1).max(150),
  email: z.email().max(254),
  phone: z
    .string()
    .max(20)
    .refine((v) => !v || /^[+()0-9 .-]+$/.test(v))
    .transform((v) => v || null),
});
function MemberForm({ member, onSave, pending }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ...member, phone: member.phone || "" },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
      {[
        ["fullName", "Họ tên"],
        ["email", "Email"],
        ["phone", "Điện thoại"],
      ].map(([k, label]) => (
        <Input
          key={k}
          label={label}
          {...register(k)}
          error={errors[k]?.message}
          disabled={pending}
        />
      ))}
      <Button type="submit" disabled={pending}>
        Lưu hồ sơ độc giả
      </Button>
    </form>
  );
}
export default function MemberManagementPage() {
  const q = useMembers(),
    list = useListPage(q.members, ["fullName", "email", "phone"]),
    { user } = useAuth();
  const allowed = canManageLibrary(user?.role);
  const [selected, setSelected] = useState(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const save = async (data) => {
    if (q.pending || !allowed) return;
    setError("");
    try {
      await q.updateMember(selected.id, data);
      setSelected(null);
      setMessage("Đã cập nhật hồ sơ độc giả.");
    } catch (e) {
      setError(apiError(e).message);
    }
  };
  const remove = async (id) => {
    if (
      q.pending ||
      !allowed ||
      !window.confirm("Xóa hồ sơ độc giả? Tài khoản đăng nhập không bị xóa.")
    )
      return;
    setError("");
    try {
      await q.deleteMember(id);
      setMessage("Đã xóa hồ sơ độc giả.");
    } catch (e) {
      setError(apiError(e).message);
    }
  };
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Quản lý độc giả</h1>
      <p>
        Hồ sơ độc giả được tạo khi đăng ký tài khoản. Chỉnh sửa hồ sơ không thay
        đổi thông tin tài khoản đăng nhập.
      </p>
      <QueryStatus query={q} />
      <p role="status">{message}</p>
      {error && !selected && <p role="alert">{error}</p>}
      <ListControls list={list} />
      <div className="table-scroll surface" tabIndex={0} role="region" aria-label="Danh sách độc giả, cuộn ngang để xem đầy đủ">
        <table className="w-full text-left">
          <thead>
            <tr>
              {["Mã", "Họ tên", "Email", "Điện thoại", "Thao tác"].map((h) => (
                <th className="p-3" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.rows.map((m) => (
              <tr key={m.id}>
                <td className="p-3">{m.id}</td>
                <td>{m.fullName}</td>
                <td>{m.email}</td>
                <td>{m.phone || "—"}</td>
                <td>
                  {allowed && (
                    <>
                      <Button
                        disabled={q.pending}
                        onClick={() => {
                          setError("");
                          setSelected(m);
                        }}
                      >
                        Sửa
                      </Button>{" "}
                      <Button variant="danger" disabled={q.pending} onClick={() => remove(m.id)}>
                        Xóa
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {q.isSuccess && !list.total && <p>Không tìm thấy độc giả.</p>}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Hồ sơ độc giả"
        busy={q.pending}
      >
        {error && <p role="alert">{error}</p>}
        {selected && (
          <MemberForm
            key={selected.id}
            member={selected}
            onSave={save}
            pending={q.pending}
          />
        )}
      </Modal>
    </section>
  );
}
