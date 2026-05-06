import type { ChangeEventHandler, FocusEventHandler } from "react";

export type TextInputProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur: FocusEventHandler<HTMLInputElement>;
  error?: string;
  showError?: boolean;
};

export function TextInput({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required,
  value,
  onChange,
  onBlur,
  error,
  showError,
}: TextInputProps) {
  const invalid = Boolean(showError && error);

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block font-sans text-[1.125rem] font-semibold leading-[160%] text-slate-900">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={[
          "w-full rounded-lg border bg-white font-sans text-[1rem] font-normal leading-[160%] text-slate-900",
          "pt-4 pb-4 pl-4 pr-0",
          "placeholder:font-sans placeholder:text-[1rem] placeholder:font-normal placeholder:leading-[160%] placeholder:text-[#94A3B8]",
          "focus:outline-none focus:ring-2 focus:ring-[#00B8FF] focus:ring-offset-0",
          invalid
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-slate-200 focus:border-transparent",
        ].join(" ")}
      />
      {invalid ? (
        <p id={`${id}-error`} role="alert" className="mt-2 font-sans text-sm font-normal leading-[160%] text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
