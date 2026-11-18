// Validate at the HTTP boundary; never turn malformed payloads into empty lists.
export function parseResponse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new Error(
      "Dữ liệu máy chủ không đúng định dạng. Vui lòng thử lại hoặc liên hệ quản trị viên.",
    );
  return result.data;
}
