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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  disabled?: boolean;
  containerClassName?: string;
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
  inputMode,
  autoComplete,
  maxLength,
  pattern,
  disabled,
  containerClassName,
}: TextInputProps) {
  const invalid = Boolean(showError && error);

  return (
    <div className={["w-full", containerClassName].filter(Boolean).join(" ")}>
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
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={[
          "w-full rounded-lg border bg-white font-sans text-[1rem] font-normal leading-[160%] text-slate-900",
          "pt-4 pb-4 pl-4 pr-0",
          "placeholder:font-sans placeholder:text-[1rem] placeholder:font-normal placeholder:leading-[160%] placeholder:text-[#94A3B8]",
          "transition-[border-color,box-shadow,opacity] duration-200 ease-out",
          "hover:border-slate-300",
          "focus:outline-none focus:ring-2 focus:ring-[#00B8FF] focus:ring-offset-0",
          disabled ? "cursor-not-allowed opacity-60" : "",
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
