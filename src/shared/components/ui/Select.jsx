
import {useId} from "react";

function Select({
  label,
  id: providedId,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Vui lòng chọn",
  error,
  required = false,
  disabled = false,
  className = "",
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

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full rounded-lg border bg-white px-3 py-2.5
          text-sm text-gray-700 outline-none
          focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20
          disabled:cursor-not-allowed disabled:bg-gray-100
          ${error ? "border-red-500" : "border-gray-300"}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options.map((option, index) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option
              key={item.value ?? index}
              value={item.value}
              disabled={item.disabled}
            >
              {item.label}
            </option>
          );
        })}
      </select>

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
