
import {useId} from "react";

function Input({
  label,
  id: providedId,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full rounded-lg border bg-white px-3 py-2.5
          text-sm text-gray-900 outline-none
          placeholder:text-gray-400
          transition-colors
          focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20
          disabled:cursor-not-allowed disabled:bg-gray-100
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300"}
          ${inputClassName}
        `}
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
