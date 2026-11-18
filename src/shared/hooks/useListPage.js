import { useSearchParams } from "react-router-dom";

export function paginate(rows, page, size) {
  const safeSize = Number.isInteger(size) && size > 0 ? size : 10;
  const pages = Math.max(1, Math.ceil(rows.length / safeSize));
  const requested = Number(page);
  const current = Math.min(
    Number.isInteger(requested) && requested > 0 ? requested : 1,
    pages,
  );
  return {
    rows: rows.slice((current - 1) * safeSize, current * safeSize),
    page: current,
    pages,
    total: rows.length,
  };
}

export default function useListPage(rows, fields) {
  const [params, setParams] = useSearchParams();
  const search = params.get("q") || "";
  const size = [10, 20, 50].includes(Number(params.get("size")))
    ? Number(params.get("size"))
    : 10;
  const term = search.trim().toLocaleLowerCase("vi");
  const filtered = rows.filter((row) =>
    fields.some((key) =>
      String(row[key] ?? "")
        .toLocaleLowerCase("vi")
        .includes(term),
    ),
  );
  const result = paginate(filtered, params.get("page"), size);
  const update = (key, value) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set(key, String(value));
      if (key !== "page") next.set("page", "1");
      return next;
    });
  return { ...result, search, size, update };
}
