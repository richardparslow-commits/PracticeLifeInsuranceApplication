import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  YesNoField,
  TextField,
  TextAreaField,
  SelectField,
  MultiSelectField,
} from "./fields";
import { MedicationRepeater } from "./MedicationRepeater";

export type FieldSpec = {
  key: string;
  label: string;
  type:
    | "text"
    | "longText"
    | "date"
    | "month"
    | "number"
    | "phone"
    | "yesNo"
    | "select"
    | "multi"
    | "meds"
    | "medsDetailed";
  options?: readonly string[];
  /** show only when this sibling key is truthy (true / non-empty / includes) */
  showWhen?: { key: string; equals?: unknown; includes?: string };
};

export type ModuleSpec = { id: string; title: string; fields: FieldSpec[] };

export function ModuleRenderer({ spec }: { spec: ModuleSpec }) {
  const { control } = useFormContext();
  const values = useWatch({ control, name: spec.id }) ?? {};

  const visible = (f: FieldSpec) => {
    if (!f.showWhen) return true;
    const v = values[f.showWhen.key];
    if (f.showWhen.includes)
      return Array.isArray(v) && v.includes(f.showWhen.includes);
    if ("equals" in f.showWhen) return v === f.showWhen.equals;
    return Boolean(v);
  };

  return (
    <Card className="border-l-4 border-l-primary" data-module={spec.id}>
      <CardHeader>
        <CardTitle className="text-base">{spec.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {spec.fields.filter(visible).map((f) => {
          const name = `${spec.id}.${f.key}`;
          const p = { name, label: f.label };
          switch (f.type) {
            case "yesNo":
              return <YesNoField key={name} {...p} />;
            case "longText":
              return <TextAreaField key={name} {...p} />;
            case "date":
              return <TextField key={name} {...p} type="date" />;
            case "month":
              return <TextField key={name} {...p} type="month" />;
            case "number":
              return <TextField key={name} {...p} type="number" />;
            case "phone":
              return <TextField key={name} {...p} type="tel" />;
            case "select":
              return (
                <SelectField key={name} {...p} options={f.options ?? []} />
              );
            case "multi":
              return (
                <MultiSelectField key={name} {...p} options={f.options ?? []} />
              );
            case "meds":
              return <MedicationRepeater key={name} {...p} />;
            case "medsDetailed":
              return (
                <MedicationRepeater key={name} {...p} variant="detailed" />
              );
            default:
              return <TextField key={name} {...p} />;
          }
        })}
      </CardContent>
    </Card>
  );
}
