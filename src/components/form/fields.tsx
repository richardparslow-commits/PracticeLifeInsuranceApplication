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
export function YesNoField(p: BaseProps) {
  const { control } = useFormContext();
  const a = useA11y(p);
  return (
    <FieldShell {...p}>
      <Controller
        name={p.name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            {...a}
            id={p.name}
            className="flex min-h-11 gap-6"
            value={
              field.value === true ? "yes" : field.value === false ? "no" : ""
            }
            onValueChange={(v) => field.onChange(v === "yes")}
            onBlur={field.onBlur}
            ref={field.ref}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id={`${p.name}-yes`} value="yes" />
              <Label htmlFor={`${p.name}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id={`${p.name}-no`} value="no" />
              <Label htmlFor={`${p.name}-no`}>No</Label>
            </div>
          </RadioGroup>
        )}
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
            <div role="group" {...a} className="grid gap-2 sm:grid-cols-2">
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
