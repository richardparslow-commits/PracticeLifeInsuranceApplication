import { Controller, useFormContext, get } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
type BaseProps = {
  name: string;
  label: string;
  hint?: string;
  className?: string;
};
function useFieldError(name: string) {
  const { formState } = useFormContext();
  return get(formState.errors, name)?.message as string | undefined;
}
function FieldShell({
  name,
  label,
  hint,
  className,
  children,
}: BaseProps & { children: ReactNode }) {
  const error = useFieldError(name);
  return (
    <div className={cn("space-y-2", className)} data-field={name}>
      <Label
        id={`${name}-label`}
        htmlFor={name}
        className="text-sm font-medium leading-snug"
      >
        {label}
      </Label>
      {hint && (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
function useA11y(p: BaseProps) {
  const error = useFieldError(p.name);
  return {
    "aria-invalid": !!error,
    "aria-labelledby": `${p.name}-label`,
    "aria-describedby":
      [p.hint ? `${p.name}-hint` : null, error ? `${p.name}-error` : null]
        .filter(Boolean)
        .join(" ") || undefined,
  };
}
const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

/**
 * Segmented Yes / No control.
 *
 * Each answer is a full-width half of one card (>=48px tall), so the whole
 * segment is the tap target on a phone. The Radix radio stays in the DOM as a
 * transparent overlay covering its own half: it keeps the accessible name from
 * the label, the `role="radio"` semantics, arrow-key behaviour, the submitted
 * boolean and the ids (`<name>-yes` / `<name>-no`) used elsewhere.
 */
export function YesNoField(p: BaseProps) {
  const { control } = useFormContext();
  const a = useA11y(p);
  const error = useFieldError(p.name);
  return (
    <FieldShell {...p}>
      <Controller
        name={p.name}
        control={control}
        render={({ field }) => {
          const picked =
            field.value === true ? "yes" : field.value === false ? "no" : null;
          return (
            <RadioGroup
              {...a}
              id={p.name}
              className={cn(
                "grid grid-cols-2 divide-x divide-input overflow-hidden rounded-lg border border-input bg-background shadow-sm",
                error && "border-destructive",
              )}
              value={picked ?? ""}
              onValueChange={(v) => field.onChange(v === "yes")}
              onBlur={field.onBlur}
              ref={field.ref}
            >
              {YES_NO_OPTIONS.map((option) => {
                const selected = picked === option.value;
                return (
                  <div
                    key={option.value}
                    data-segment={option.value}
                    data-selected={selected ? "true" : "false"}
                    className={cn(
                      "relative transition-colors focus-within:z-10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
                      selected ? "bg-primary" : "hover:bg-accent",
                    )}
                  >
                    <RadioGroupItem
                      id={`${p.name}-${option.value}`}
                      value={option.value}
                      className="absolute inset-0 h-full w-full rounded-none border-0 opacity-0 shadow-none"
                    />
                    <Label
                      htmlFor={`${p.name}-${option.value}`}
                      className={cn(
                        "pointer-events-none flex min-h-12 w-full items-center justify-center gap-2 px-3 text-sm font-medium",
                        selected ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-3.5 w-3.5 shrink-0 place-content-center rounded-full border border-current"
                      >
                        {selected && (
                          <span className="block h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          );
        }}
      />
    </FieldShell>
  );
}
export function TextField(
  p: BaseProps & {
    type?: "text" | "date" | "month" | "number" | "tel" | "email";
  },
) {
  const { register } = useFormContext();
  const a = useA11y(p);
  return (
    <FieldShell {...p}>
      <Input
        {...a}
        id={p.name}
        type={p.type ?? "text"}
        maxLength={500}
        min={p.type === "number" ? 0 : undefined}
        step={p.type === "number" ? "any" : undefined}
        {...register(p.name, {
          setValueAs: (v) =>
            p.type === "number" ? (v === "" ? undefined : Number(v)) : v,
        })}
      />
    </FieldShell>
  );
}
export function TextAreaField(p: BaseProps) {
  const { register } = useFormContext();
  const a = useA11y(p);
  return (
    <FieldShell {...p}>
      <Textarea
        {...a}
        id={p.name}
        rows={3}
        maxLength={5000}
        {...register(p.name)}
      />
    </FieldShell>
  );
}
export function SelectField(p: BaseProps & { options: readonly string[] }) {
  const { control } = useFormContext();
  const a = useA11y(p);
  return (
    <FieldShell {...p}>
      <Controller
        name={p.name}
        control={control}
        render={({ field }) => (
          <select
            {...a}
            id={p.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value || undefined)}
            className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select…</option>
            {p.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
      />
    </FieldShell>
  );
}
export function MultiSelectField(
  p: BaseProps & { options: readonly string[] },
) {
  const { control } = useFormContext();
  const a = useA11y(p);
  return (
    <FieldShell {...p}>
      <Controller
        name={p.name}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const value: string[] = field.value ?? [];
          return (
            <div
              role="group"
              {...a}
              className="grid gap-2 sm:grid-cols-2"
              onBlur={field.onBlur}
            >
              {p.options.map((o, i) => (
                <label
                  key={o}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border bg-muted/20 p-2 text-sm"
                >
                  <Checkbox
                    ref={i === 0 ? field.ref : undefined}
                    checked={value.includes(o)}
                    onCheckedChange={(c) =>
                      field.onChange(
                        c === true
                          ? [...new Set([...value, o])]
                          : value.filter((v) => v !== o),
                      )
                    }
                  />
                  {o}
                </label>
              ))}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}
