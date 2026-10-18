import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  FIELD_REGISTRY,
  MEDICATION_LABELS,
  fallbackLabel,
  formatCurrency,
  formatPhone,
  type FieldRule,
} from "./formatApplicationEmail";
import { prepareApplication } from "./prepareApplication";
import { MODULE_TRIGGERS } from "../components/form/moduleSpecs";

export interface PrintAnswer {
  key: string;
  question: string;
  lines: string[];
}
export interface PrintSection {
  key: string;
  title: string;
  rows: PrintAnswer[];
  modules?: PrintSection[];
}
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const hasValue = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  (typeof value === "string"
    ? value.trim().length > 0
    : Array.isArray(value)
      ? value.length > 0
      : typeof value === "object"
        ? Object.keys(value).length > 0
        : true);
function scalar(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number")
    return Number.isFinite(value)
      ? String(value)
      : "Invalid number — please review";
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value.filter(hasValue).map(scalar).join("; ");
  return Object.entries(object(value))
    .filter(([, entry]) => hasValue(entry))
    .map(([key, entry]) => `${fallbackLabel(key)}: ${scalar(entry)}`)
    .join("; ");
}
function medicationLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [scalar(value)];
  return value.map((entry) => {
    const medication = object(entry);
    const name = medication.name ?? medication.drugName;
    const title =
      typeof name === "string" && name.trim()
        ? name
        : "Medication name not provided";
    const keys = [
      "dosage",
      "frequency",
      "startDate",
      "adherence",
      "lastFillDate",
      "conditionTreated",
    ] as const;
    const details = keys
      .filter((key) => hasValue(medication[key]))
      .map((key) => `${MEDICATION_LABELS[key]}: ${scalar(medication[key])}`);
    return title + (details.length ? ` — ${details.join("; ")}` : "");
  });
}
function rows(section: string, values: Record<string, unknown>): PrintAnswer[] {
  const dictionaries: Record<
    string,
    Record<string, FieldRule>
  > = FIELD_REGISTRY;
  const dictionary = Object.prototype.hasOwnProperty.call(dictionaries, section)
    ? dictionaries[section]
    : {};
  const keys = [
    ...Object.keys(dictionary),
    ...Object.keys(values).filter(
      (key) => !Object.prototype.hasOwnProperty.call(dictionary, key),
    ),
  ];
  return keys.flatMap((key) => {
    const value = values[key];
    if (!Object.prototype.hasOwnProperty.call(values, key) || !hasValue(value))
      return [];
    const rule = Object.prototype.hasOwnProperty.call(dictionary, key)
      ? dictionary[key]
      : undefined;
    let lines: string[];
    if (rule?.kind === "medications" || rule?.kind === "detailedMedications")
      lines = medicationLines(value);
    else if (
      section === "occupationFinancial" &&
      key === "occ_annual_salary" &&
      typeof value === "number" &&
      Number.isFinite(value)
    )
      lines = [formatCurrency(value)];
    else if (section === "optionalContact" && key === "contact_phone")
      lines = [formatPhone(value)];
    else
      lines = Array.isArray(value)
        ? value.filter(hasValue).map(scalar)
        : [scalar(value)];
    const question = rule
      ? /^(details|provide details)$/i.test(rule.question)
        ? `${rule.question} — ${rule.label}`
        : rule.question
      : fallbackLabel(key);
    return lines.length ? [{ key, question, lines }] : [];
  });
}
/** Active local answers only: this never uses the email audit snapshot or transmits data. */
export function buildPrintWorksheet(input: unknown): PrintSection[] {
  const prepared: Record<string, unknown> = prepareApplication(object(input));
  const modules = MODULE_TRIGGERS.flatMap(({ spec }) => {
    const answers = rows(spec.id, object(prepared[spec.id]));
    return answers.length
      ? [{ key: spec.id, title: spec.title, rows: answers }]
      : [];
  });
  const sections: PrintSection[] = CATEGORY_ORDER.map((key, index) => ({
    key,
    title: `${index + 1}. ${CATEGORY_LABELS[key]}`,
    rows: rows(key, object(prepared[key])),
    ...(key === "healthMedical" ? { modules } : {}),
  }));
  sections.push({
    key: "optionalContact",
    title: "Contact details",
    rows: rows("optionalContact", object(prepared.optionalContact)),
  });
  const consents = object(prepared.consents);
  sections.push({
    key: "consents",
    title: "Consent status",
    rows: ["consent_contact", "consent_disclaimer"].map((key) => ({
      key,
      question:
        FIELD_REGISTRY.consents[key as keyof typeof FIELD_REGISTRY.consents]
          .question,
      lines: [
        consents[key] === true
          ? "Granted"
          : consents[key] === false
            ? "Not granted"
            : "Not recorded",
      ],
    })),
  });
  return sections;
}
