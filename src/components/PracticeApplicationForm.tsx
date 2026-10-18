import { useCallback, useEffect, useRef, useState } from "react";
import {
  FormProvider,
  useForm,
  useWatch,
  get,
  type FieldValues,
} from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  practiceApplicationDraftSchema,
  practiceApplicationSubmitSchema,
  getMissingConsents,
  canTransmit,
} from "@/lib/practiceApplication.schema";
import {
  HealthSection,
  MentalHealthSection,
  NicotineSection,
  AlcoholSection,
  DrivingSection,
  CriminalSection,
  DrugSection,
  BankruptcySection,
  ResidencySection,
  OccupationSection,
  MilitarySection,
} from "./form/sections";
import { RiskySection } from "./form/RiskySection";
import { ConsentSection } from "./form/ConsentSection";
import { PrintableWorksheet } from "./form/PrintableWorksheet";
import {
  healthQs,
  nicotineQs,
  alcoholQs,
  drivingQs,
  criminalQs,
  drugQs,
} from "./form/questions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { preserveEmailDisclosures } from "@/lib/formatApplicationEmail";
import {
  DRAFT_KEY,
  moduleConditions,
  draftSnapshotForStorage,
  prepareApplication,
  sanitizeResidency,
} from "@/lib/prepareApplication";
export const SECTIONS = [
  {
    id: "health",
    prefix: "healthMedical",
    title: "1. Health / Medical",
    node: <HealthSection />,
  },
  {
    id: "mental",
    prefix: "mentalHealth",
    title: "2. Mental Health",
    node: <MentalHealthSection />,
  },
  {
    id: "nicotine",
    prefix: "nicotineSmoking",
    title: "3. Nicotine / Smoking",
    node: <NicotineSection />,
  },
  {
    id: "alcohol",
    prefix: "alcoholUse",
    title: "4. Alcohol",
    node: <AlcoholSection />,
  },
  {
    id: "risky",
    prefix: "riskyBehavior",
    title: "5. Risky Behavior",
    node: <RiskySection />,
  },
  {
    id: "driving",
    prefix: "drivingRecord",
    title: "6. Driving Record",
    node: <DrivingSection />,
  },
  {
    id: "criminal",
    prefix: "criminalRecord",
    title: "7. Arrest / Criminal Record",
    node: <CriminalSection />,
  },
  {
    id: "bankruptcy",
    prefix: "bankruptcy",
    title: "8. Bankruptcy",
    node: <BankruptcySection />,
  },
  {
    id: "drugs",
    prefix: "illegalDrugUse",
    title: "9. Illegal Drug Use",
    node: <DrugSection />,
  },
  {
    id: "residency",
    prefix: "residencyTravel",
    title: "10. Residency & Foreign Travel",
    node: <ResidencySection />,
  },
  {
    id: "occupation",
    prefix: "occupationFinancial",
    title: "11. Occupation & Financial",
    node: <OccupationSection />,
  },
  {
    id: "military",
    prefix: "militaryService",
    title: "12. Military Service",
    node: <MilitarySection />,
  },
];
const EMPTY: FieldValues = {
  ...Object.fromEntries(SECTIONS.map((s) => [s.prefix, {}])),
  healthMedical: { conditions_triggered: [], medical_current_medications: [] },
  mentalHealth: { mh_selected_conditions: [] },
  nicotineSmoking: { nic_products: [] },
  riskyBehavior: { adv_participation: [], race_intent: [], dive_locations: [] },
  militaryService: { mil_flight_type: [] },
  optionalContact: {},
  consents: { consent_contact: false, consent_disclaimer: false },
};
function loadDraft() {
  const empty = { answers: EMPTY, cleanedDraft: null as string | null };
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return empty;
    const sanitized = sanitizeResidency(raw);
    const cleanedDraft =
      JSON.stringify(raw) === JSON.stringify(sanitized)
        ? null
        : JSON.stringify(sanitized);
    const result = practiceApplicationDraftSchema.safeParse(sanitized);
    return {
      answers: result.success
        ? {
            ...EMPTY,
            ...result.data,
            consents: { consent_contact: false, consent_disclaimer: false },
          }
        : EMPTY,
      cleanedDraft,
    };
  } catch {
    return empty;
  }
}
const progressKeys = [
  ...healthQs.map((q) => "healthMedical." + q.key),
  ...nicotineQs.map((q) => "nicotineSmoking." + q.key),
  "nicotineSmoking.nic_ever_used",
  ...alcoholQs.map((q) => "alcoholUse." + q.key),
  ...drivingQs.map((q) => "drivingRecord." + q.key),
  ...criminalQs.map((q) => "criminalRecord." + q.key),
  ...drugQs.map((q) => "illegalDrugUse." + q.key),
  "healthMedical.dob",
  "healthMedical.age",
  "healthMedical.stateOfBirth",
  "healthMedical.genderSex",
  "bankruptcy.bk_has_filed",
  "militaryService.mil_active_duty",
  "occupationFinancial.occ_current_occupation",
  "occupationFinancial.occ_annual_salary",
];
/** The worksheet section a validation path belongs to, so every error has a home. */
function sectionForPath(path: string) {
  const prefix = path.split(".")[0];
  const direct = SECTIONS.find((section) => section.prefix === prefix);
  if (direct) return { id: direct.id, title: direct.title };
  if (prefix.endsWith("Module"))
    return SECTIONS.find((section) => section.id === "health");
  return undefined;
}
/** Consent + contact answers live outside the 12 sections, in their own block. */
const CONTACT_BUCKET = { id: "contact", title: "Send a copy & consent" };
/** Flatten react-hook-form's nested error object into dotted field paths. */
function collectErrorPaths(
  errors: Record<string, unknown>,
  prefix = "",
): string[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!value || typeof value !== "object") return [];
    if (typeof (value as { message?: unknown }).message === "string")
      return [path];
    return collectErrorPaths(value as Record<string, unknown>, path);
  });
}
/** Group unresolved items by section, in worksheet order, for the jump list. */
function summarizeErrors(paths: string[]) {
  const rows = new Map<
    string,
    { id: string; title: string; count: number; firstPath: string }
  >();
  for (const path of paths) {
    const bucket = sectionForPath(path) ?? CONTACT_BUCKET;
    const existing = rows.get(bucket.id);
    if (existing) existing.count += 1;
    else
      rows.set(bucket.id, {
        id: bucket.id,
        title: bucket.title,
        count: 1,
        firstPath: path,
      });
  }
  const order = [...SECTIONS.map((section) => section.id), CONTACT_BUCKET.id];
  return {
    total: paths.length,
    rows: [...rows.values()].sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    ),
  };
}
/** Map a blurred control back to its field path (both radio halves share one). */
function pathFromTarget(target: EventTarget | null) {
  const id = (target as HTMLElement | null)?.id ?? "";
  return id ? id.replace(/-(yes|no)$/, "") : "";
}
/** What was held back, said plainly: the draft is saving, one answer is not in it. */
function incompleteAnswersCopy(count: number) {
  return count === 1
    ? "1 incomplete answer is not in the draft yet and will be added once it is valid."
    : `${count} incomplete answers are not in the draft yet and will be added once they are valid.`;
}
export default function PracticeApplicationForm() {
  const [generation, setGeneration] = useState(0);
  return (
    <Worksheet
      key={generation}
      cleared={generation > 0}
      onClear={() => setGeneration((previous) => previous + 1)}
    />
  );
}
function Worksheet({
  cleared,
  onClear,
}: {
  cleared: boolean;
  onClear: () => void;
}) {
  const [restored] = useState(loadDraft);
  const initial = restored.answers;
  const methods = useForm<FieldValues>({
    defaultValues: initial,
    // An answer reports itself once the user has left it, then stays live while
    // they edit. Submit still runs the full strict parse below.
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const {
    control,
    setError,
    clearErrors,
    getValues,
    reset,
    unregister,
    setValue,
  } = methods;
  const { isDirty } = methods.formState;
  const all = useWatch({ control });
  const [open, setOpen] = useState<string[]>(["health"]);
  const [sectionVersions, setSectionVersions] = useState<
    Record<string, number>
  >({});
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [cleanupWarning, setCleanupWarning] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState(
    cleared ? "Draft cleared." : "",
  );
  useEffect(() => {
    if (restored.cleanedDraft === null) return;
    try {
      // Rewrite only the removed residency details; preserve other saved answers.
      localStorage.setItem(DRAFT_KEY, restored.cleanedDraft);
    } catch {
      setDraftStatus(
        "This browser could not remove private residency details from the older saved draft. Select Save draft to try again.",
      );
    }
  }, [restored.cleanedDraft]);
  const sendingRef = useRef(false);
  const sentRef = useRef(false);
  const hasEdited = useRef(false);
  /** Field paths whose inline message this component owns (it clears them again). */
  const inlineManaged = useRef<Set<string>>(new Set());
  /** Field paths the user has already left, tracked independently of the library. */
  const visited = useRef<Set<string>>(new Set());
  const attemptedRef = useRef(false);
  // A reset section starts untouched, even after an earlier submission attempt.
  const resetValidation = useRef(new Set<string>());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const consents = all?.consents ?? {};
  const missing =
    attempted && !resetValidation.current.has("consents")
      ? getMissingConsents(consents)
      : [];
  const saveDraft = (manual = false) => {
    if (sentRef.current) return;
    try {
      const { consents: unused, ...rest } = prepareApplication(getValues());
      void unused;
      // Incomplete answers are held out of the snapshot instead of blocking the
      // whole save: a half-typed email must not cost the visitor the answers they
      // already gave. The strict schema still gates the resume above and the send
      // below, so nothing here weakens what is restored or what is transmitted.
      const { snapshot, dropped } = draftSnapshotForStorage(rest);
      if (!snapshot) {
        setDraftStatus(
          "Draft could not be saved. Keep this tab open or print a copy.",
        );
        return;
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
      setDraftStatus(
        (manual
          ? "Draft saved on this device."
          : "Draft saved automatically on this device.") +
          (dropped.length ? " " + incompleteAnswersCopy(dropped.length) : ""),
      );
    } catch {
      setDraftStatus(
        "This browser could not save the draft. Keep this tab open or print a copy.",
      );
    }
  };
  useEffect(() => {
    if (isDirty) hasEdited.current = true;
    if (sent || !hasEdited.current) return;
    const timer = setTimeout(() => saveDraft(), 600);
    return () => clearTimeout(timer);
  }, [all, sent, isDirty]);
  /**
   * Validate the whole worksheet but surface only the problems the user already
   * has context for: an answer reports itself after they leave it, and from then
   * on as they type. Consent and contact answers stay owned by the send gate,
   * which explains why they are required and marks the exact boxes. Submit is
   * untouched: it still runs the full strict parse and blocks the send.
   */
  const applyAnswerErrors = useCallback(() => {
    if (sentRef.current) return;
    const parsed = practiceApplicationSubmitSchema.safeParse(
      prepareApplication(getValues()),
    );
    const occurred = inlineManaged.current;
    const next = new Set<string>();
    if (!parsed.success) {
      const touched = methods.formState.touchedFields as Record<
        string,
        unknown
      >;
      const isTouched = (issuePath: (string | number)[]) => {
        let node: unknown = touched;
        for (const key of issuePath) {
          if (node === null || typeof node !== "object") return false;
          node = (node as Record<string | number, unknown>)[key];
        }
        return node === true;
      };
      for (const issue of parsed.error.issues) {
        const top = String(issue.path[0] ?? "");
        const path = issue.path.join(".");
        // Contact/consent errors begin at the send gate. Once submitted, keep
        // their messages until the answer validates, rather than clearing them
        // merely because the inline pass normally skips those fields.
        if ((top === "consents" || top === "optionalContact") && !occurred.has(path)) continue;
        if (
          (!attemptedRef.current || resetValidation.current.has(top)) &&
          !isTouched(issue.path) &&
          !visited.current.has(path)
        )
          continue;
        next.add(path);
        setError(path, { message: issue.message });
      }
    }
    const healed = [...occurred].filter((path) => !next.has(path));
    if (healed.length) clearErrors(healed);
    inlineManaged.current = next;
  }, [clearErrors, getValues, methods, setError]);
  useEffect(() => {
    if (sent) return;
    if (inlineManaged.current.size === 0 && !attempted) return;
    const timer = setTimeout(() => applyAnswerErrors(), 300);
    return () => clearTimeout(timer);
  }, [all, sent, attempted, applyAnswerErrors]);
  function handleBlur(event: React.FocusEvent<HTMLFormElement>) {
    const path = pathFromTarget(event.target);
    if (path) visited.current.add(path);
    applyAnswerErrors();
  }
  function resetSection(id: string, title: string, prefixes: string[]) {
    if (sendingRef.current || sentRef.current) return;
    if (
      !window.confirm(
        `Reset only ${title}? Its answers and follow-up details will be cleared. All other sections will be kept.`,
      )
    )
      return;
    try {
      // Remove these roots from the existing snapshot first. Even if another
      // unfinished answer cannot be saved, a reset must not restore old data.
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved !== null) {
        const draft = JSON.parse(saved);
        if (!draft || typeof draft !== "object" || Array.isArray(draft))
          throw new Error("Invalid draft");
        for (const prefix of prefixes) delete draft[prefix];
        delete draft.consents;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    } catch {
      setBanner(
        `This browser could not reset the saved answers for ${title}. Your answers have been kept. Please try again.`,
      );
      return;
    }
    // Unregister also removes hidden values, restored defaults, touched state
    // and errors. Remount only this section's controls so old DOM/array values
    // cannot reappear; the other sections keep their values and field state.
    unregister(prefixes);
    for (const prefix of prefixes) {
      resetValidation.current.add(prefix);
      if (EMPTY[prefix])
        setValue(prefix, structuredClone(EMPTY[prefix]), { shouldDirty: true });
    }
    const belongs = (path: string) =>
      prefixes.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}.`),
      );
    visited.current = new Set(
      [...visited.current].filter((path) => !belongs(path)),
    );
    inlineManaged.current = new Set(
      [...inlineManaged.current].filter((path) => !belongs(path)),
    );
    clearErrors(prefixes);
    hasEdited.current = true;
    setSectionVersions((previous) => ({
      ...previous,
      [id]: (previous[id] ?? 0) + 1,
    }));
    setBanner(null);
    setResetNotice(`${title} reset. All other sections have been kept.`);
    saveDraft();
  }
  function deleteSubmittedDraft(retry = false) {
    let warning: string | null = null;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      warning = retry
        ? "This browser still could not delete the saved draft."
        : "This browser could not delete the saved draft.";
    }
    if (mounted.current) setCleanupWarning(warning);
  }
  function reveal(path: string) {
    const section = sectionForPath(path)?.id;
    if (section) setOpen((prev) => [...new Set([...prev, section])]);
    setTimeout(() => {
      const target =
        document.querySelector<HTMLElement>(
          `[data-field="${path}"], [data-consent="${path.split(".").pop()}"]`,
        ) ||
        document.querySelector<HTMLElement>(
          `[data-field^="${path.split(".").slice(0, 2).join(".")}"]`,
        );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target
        ?.querySelector<HTMLElement>("input,textarea,select,button")
        ?.focus({ preventScroll: true });
    }, 50);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sendingRef.current) return;
    resetValidation.current.clear();
    setResetNotice(null);
    attemptedRef.current = true;
    setAttempted(true);
    clearErrors();
    setBanner(null);
    const values = getValues();
    // Consent is checked before full validation and before any network call.
    if (!canTransmit(values.consents ?? {})) {
      const absent = getMissingConsents(values.consents ?? {});
      for (const key of absent)
        setError(`consents.${key}`, {
          message:
            key === "consent_contact"
              ? "You must consent to contact before submitting."
              : "You must acknowledge the disclaimer before submitting.",
        });
      setBanner(
        "Both consent boxes must be checked before anything can be sent.",
      );
      reveal("consents." + absent[0]);
      return;
    }
    const parsed = practiceApplicationSubmitSchema.safeParse(
      prepareApplication(values),
    );
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        setError(issue.path.join("."), { message: issue.message });
      // From here on the inline pass owns these messages, so correcting an
      // answer clears its highlight without another submit.
      inlineManaged.current = new Set(
        parsed.error.issues.map((issue) => issue.path.join(".")),
      );
      setBanner(
        `Please fix ${parsed.error.issues.length} highlighted item(s). Nothing has been sent.`,
      );
      reveal(parsed.error.issues[0].path.join("."));
      return;
    }
    if (!supabase) {
      setBanner(
        "Online sending is not connected yet. Your answers remain on this device. Save your draft or print a copy.",
      );
      return;
    }
    sendingRef.current = true;
    setSending(true);
    // Persist the submitted answers before waiting for the network, even if
    // the normal autosave debounce has not elapsed yet.
    saveDraft();
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-practice-application",
        {
          body: {
            submittedAt: new Date().toISOString(),
            application: preserveEmailDisclosures(parsed.data, values),
          },
        },
      );
      if (error || data?.ok !== true) throw new Error("Delivery not confirmed");
      sentRef.current = true;
      deleteSubmittedDraft();
      reset(EMPTY);
      inlineManaged.current = new Set();
      visited.current = new Set();
      attemptedRef.current = false;
      if (mounted.current) setSent(true);
    } catch {
      if (mounted.current)
        setBanner(
          "Sending could not be confirmed. Your draft has been kept. Please try again or contact Richard.",
        );
    } finally {
      sendingRef.current = false;
      if (mounted.current) setSending(false);
    }
  }
  if (sent)
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Alert className="bg-white p-8" role="status">
          <AlertTitle>Sent — thank you!</AlertTitle>
          <AlertDescription>
            <p>
              Your practice worksheet was accepted by the email service for
              delivery to Richard. This does not create insurance coverage.
            </p>
            {!cleanupWarning && (
              <p className="mt-3">Saved draft removed from this browser.</p>
            )}
          </AlertDescription>
        </Alert>
        {cleanupWarning && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Saved draft could not be deleted</AlertTitle>
            <AlertDescription>
              <p>{cleanupWarning}</p>
              <p className="mt-2">
                Your saved health and financial answers may still be on this
                device. Retry deleting the saved draft. This will not resend
                your worksheet.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => deleteSubmittedDraft(true)}
              >
                Retry deleting saved draft
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  const errs = methods.formState.errors as Record<string, any>;
  const summary = summarizeErrors(collectErrorPaths(errs));
  const answered = progressKeys.filter((k) => {
    const v = get(all, k);
    return v !== undefined && v !== "";
  }).length;
  const percent = Math.round((answered / progressKeys.length) * 100);
  return (
    <FormProvider {...methods}>
      <form
        data-practice-worksheet=""
        onSubmit={submit}
        onBlur={handleBlur}
        noValidate
        autoComplete="off"
        aria-busy={sending}
        className="mx-auto max-w-3xl space-y-6 pb-16"
      >
        <Alert className="bg-secondary">
          <AlertTitle>
            Practice worksheet only — not a formal application; does not bind
            coverage.
          </AlertTitle>
          <AlertDescription>
            Do not enter SSN, driver’s license, or Green Card/Visa ID numbers.
            This worksheet does not guarantee approval or pricing.
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          Your draft is saved automatically in this browser, including health
          and financial answers. Use a private device. Consent checkboxes are
          never saved. Sending a copy is optional. Sending requires your name, email address and cell phone number.
        </p>
        <div className="no-print sticky top-0 z-10 space-y-2 border-b bg-background/95 py-3 backdrop-blur">
          <div className="flex justify-between gap-4 text-sm">
            <span>Main questions answered</span>
            <span>
              {answered} / {progressKeys.length}
            </span>
          </div>
          <progress
            aria-label="Main questions answered"
            max={100}
            value={percent}
            className="h-2 w-full accent-primary"
          />
          <p role="status" className="text-xs text-muted-foreground">
            {draftStatus}
          </p>
        </div>
        {resetNotice && (
          <p role="status" className="no-print text-sm">
            {resetNotice}
          </p>
        )}
        {banner && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertTitle>Check your worksheet</AlertTitle>
            <AlertDescription>{banner}</AlertDescription>
          </Alert>
        )}
        {summary.rows.length > 0 && (
          <div
            role="status"
            data-error-summary=""
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              attempted
                ? "border-destructive/50 text-destructive"
                : "bg-secondary text-foreground",
            )}
          >
            <p className="font-medium">
              {attempted
                ? `${summary.total} highlighted item${summary.total === 1 ? "" : "s"} — nothing has been sent`
                : `${summary.total} item${summary.total === 1 ? "" : "s"} still need${summary.total === 1 ? "s" : ""} an answer`}
            </p>
            <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto">
              {summary.rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    aria-label={`Go to ${row.title}`}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded px-1 text-left underline underline-offset-4 hover:bg-accent hover:no-underline"
                    onClick={() => reveal(row.firstPath)}
                  >
                    <span>{row.title}</span>
                    <span className="shrink-0 text-xs">
                      {row.count} item{row.count === 1 ? "" : "s"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {sending && (
          <p role="status">
            Sending your worksheet. Editing will resume if sending fails.
          </p>
        )}
        <fieldset disabled={sending} className="screen-form min-w-0">
          <Accordion
            type="multiple"
            value={open}
            onValueChange={setOpen}
            className="space-y-3"
          >
            {SECTIONS.map((s) => (
              <AccordionItem
                key={s.id}
                value={s.id}
                className="rounded-xl border bg-card px-4 shadow-sm sm:px-6"
              >
                <AccordionTrigger className="text-left text-base font-semibold">
                  {s.title}
                </AccordionTrigger>
                <AccordionContent className="pt-3">
                  <div className="no-print mb-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sending}
                      aria-label={`Reset ${s.title}`}
                      onClick={() =>
                        resetSection(
                          s.id,
                          s.title,
                          s.id === "health"
                            ? [s.prefix, ...Object.keys(moduleConditions)]
                            : [s.prefix],
                        )
                      }
                    >
                      Reset section
                    </Button>
                  </div>
                  <div key={sectionVersions[s.id] ?? 0}>{s.node}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 rounded-xl border bg-card p-4 sm:p-6">
            <div className="no-print mb-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={sending}
                aria-label="Reset contact details and consents"
                onClick={() =>
                  resetSection("contact", "Contact details and consents", [
                    "optionalContact",
                    "consents",
                  ])
                }
              >
                Reset section
              </Button>
            </div>
            <ConsentSection
              key={sectionVersions.contact ?? 0}
              missing={missing}
              errors={
                {
                  consent_contact: errs.consents?.consent_contact?.message,
                  consent_disclaimer:
                    errs.consents?.consent_disclaimer?.message,
                } as Record<string, string | undefined>
              }
            />
          </div>
        </fieldset>
        <PrintableWorksheet application={all} />
        <div className="no-print flex flex-wrap gap-3">
          <Button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Submit / Contact Me"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={sending}
            onClick={() => saveDraft(true)}
          >
            Save draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={sending}
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={sending}
            onClick={() => {
              if (
                window.confirm(
                  "Clear this worksheet and delete its saved draft from this device?",
                )
              ) {
                try {
                  localStorage.removeItem(DRAFT_KEY);
                } catch {
                  setBanner(
                    "This browser could not delete the saved draft. Your worksheet has been kept so you can try again.",
                  );
                  return;
                }
                // A fresh form instance clears uncontrolled inputs, Controller
                // defaults, collapsed sections, and pending autosave timers.
                onClear();
              }
            }}
          >
            Clear draft
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
