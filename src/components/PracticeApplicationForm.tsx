import { useEffect, useRef, useState } from "react";
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
import {
  healthQs,
  nicotineQs,
  alcoholQs,
  drivingQs,
  criminalQs,
  drugQs,
} from "./form/questions";
import { supabase } from "@/integrations/supabase/client";
import { preserveEmailDisclosures } from "@/lib/formatApplicationEmail";
import { DRAFT_KEY, prepareApplication, sanitizeResidency } from "@/lib/prepareApplication";
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
      JSON.stringify(raw) === JSON.stringify(sanitized) ? null : JSON.stringify(sanitized);
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
function Worksheet({ cleared, onClear }: {
  cleared: boolean;
  onClear: () => void;
}) {
  const [restored] = useState(loadDraft);
  const initial = restored.answers;
  const methods = useForm<FieldValues>({
    defaultValues: initial,
    mode: "onSubmit",
    shouldUnregister: false,
  });
  const { control, setError, clearErrors, getValues, reset } = methods;
  const { isDirty } = methods.formState;
  const all = useWatch({ control });
  const [open, setOpen] = useState<string[]>(["health"]);
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [cleanupWarning, setCleanupWarning] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState(cleared ? "Draft cleared." : "");
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
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const consents = all?.consents ?? {};
  const missing = attempted ? getMissingConsents(consents) : [];
  const saveDraft = (manual = false) => {
    if (sentRef.current) return;
    try {
      const { consents: unused, ...rest } = prepareApplication(getValues());
      void unused;
      const parsed = practiceApplicationDraftSchema.safeParse(rest);
      if (!parsed.success) {
        setDraftStatus(
          "Draft contains incomplete or invalid entries. Finish those fields to save the latest changes.",
        );
        return;
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(parsed.data));
      setDraftStatus(
        manual
          ? "Draft saved on this device."
          : "Draft saved automatically on this device.",
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
    const prefix = path.split(".")[0];
    const section =
      SECTIONS.find((s) => s.prefix === prefix)?.id ||
      (prefix.endsWith("Module") ? "health" : undefined);
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
              Your practice worksheet was accepted by the email service for delivery
              to Richard. This does not create insurance coverage.
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
                Your saved health and financial answers may still be on this device.
                Retry deleting the saved draft. This will not resend your worksheet.
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
  const answered = progressKeys.filter((k) => {
    const v = get(all, k);
    return v !== undefined && v !== "";
  }).length;
  const percent = Math.round((answered / progressKeys.length) * 100);
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={submit}
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
          never saved. Sending a copy is optional.
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
        {banner && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertTitle>Check your worksheet</AlertTitle>
            <AlertDescription>{banner}</AlertDescription>
          </Alert>
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
                <AccordionContent className="pt-3">{s.node}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 rounded-xl border bg-card p-4 sm:p-6">
            <ConsentSection
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
        <div className="print-values hidden">
          <h2 className="text-2xl">
            Practice worksheet — not a formal application
          </h2>
          <pre className="whitespace-pre-wrap break-words text-xs">
            {JSON.stringify(prepareApplication(all), null, 2)}
          </pre>
        </div>
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
