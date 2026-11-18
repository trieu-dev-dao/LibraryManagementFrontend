import { useEffect } from "react";
import { applyFieldErrors } from "@/shared/api/errors";

export default function useServerErrors(error, setError) {
  useEffect(() => {
    if (error) applyFieldErrors(error, setError);
  }, [error, setError]);
}
