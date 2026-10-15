import { useFieldArray, useFormContext, get } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextField } from "./fields";
export function MedicationRepeater({
  name,
  label,
  variant = "simple",
}: {
  name: string;
  label: string;
  variant?: "simple" | "detailed";
}) {
  const { control, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const nameKey = variant === "simple" ? "name" : "drugName";
  const error = get(formState.errors, name)?.message;
  return (
    <fieldset className="space-y-3" data-field={name}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {fields.map((row, i) => (
        <div
          key={row.id}
          className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
        >
          <TextField
            name={`${name}.${i}.${nameKey}`}
            label={`Medication ${i + 1}: name`}
          />
          <TextField
            name={`${name}.${i}.dosage`}
            label={`Medication ${i + 1}: dosage`}
          />
          <TextField
            name={`${name}.${i}.frequency`}
            label={`Medication ${i + 1}: frequency`}
          />
          {variant === "detailed" && (
            <>
              <TextField
                name={`${name}.${i}.startDate`}
                label={`Medication ${i + 1}: start date`}
                type="date"
              />
              <TextField
                name={`${name}.${i}.adherence`}
                label={`Medication ${i + 1}: adherence`}
              />
              <TextField
                name={`${name}.${i}.lastFillDate`}
                label={`Medication ${i + 1}: last filled`}
                type="date"
              />
              <TextField
                name={`${name}.${i}.conditionTreated`}
                label={`Medication ${i + 1}: condition treated`}
              />
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove medication ${i + 1}`}
            onClick={() => remove(i)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append(
            variant === "simple"
              ? { name: "", dosage: "", frequency: "" }
              : {
                  drugName: "",
                  dosage: "",
                  startDate: "",
                  adherence: "",
                  frequency: "",
                  lastFillDate: "",
                  conditionTreated: "",
                },
          )
        }
      >
        + Add medication
      </Button>
      {typeof error === "string" && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
