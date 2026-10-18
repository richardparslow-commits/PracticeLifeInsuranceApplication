import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "./fields";
import { cn } from "@/lib/utils";

export const CONSENT_CONTACT_TEXT =
  'Consent to Contact: By checking this box and clicking "Submit / Contact Me,” I provide my express written consent to receive marketing and informational calls, text messages (SMS/MMS), and emails from Richard Francis Parslow (Life Insurance Broker Advocate / Life Policy Pilot) regarding life insurance products and services at the phone number and email address I provided above, including through the use of an automated telephone dialing system, artificial or AI-generated voice, or prerecorded message, even if my number is currently listed on any federal, state, or corporate Do-Not-Call list. I understand that my consent is not a condition of purchasing any insurance policy, goods, or services, and that I may still request a quote by emailing Richard at richardparslow@lifepolicypilot.blog to set up a Zoom appointment to complete all necessary paperwork to apply for life insurance. Message and data rates may apply. Message frequency varies. I can revoke my consent at any time by replying STOP to any text message, clicking unsubscribe in emails, or contacting richardparslow@lifepolicypilot.blog. I also acknowledge that I have read and agree to the Privacy Policy and Terms of Use.';

export const CONSENT_ACK_TEXT =
  "Acknowledgment & Consent: By checking this box (or by voluntarily emailing/sending this completed Practice Application to Richard Francis Parslow), I confirm that I have read, understand, and agree to the terms of this Disclaimer and Limited Use Authorization.";

/** Original disclaimer text, with missing sections recovered from the supplied PDF. */
export const DISCLAIMER_SECTIONS: Array<{ heading: string; body: string[] }> = [
  {
    heading:
      "PRE-UNDERWRITING PRACTICE APPLICATION DISCLAIMER & LIMITED USE AUTHORIZATION",
    body: [
      "1. Purpose & Limited Use Guarantee: If you choose to email, upload, or otherwise transmit this completed Practice Application to Richard Francis Parslow (Texas Life Agent License #3076729, General Lines License #3090432, National Producer Number #20873424, operating Life Policy Pilot and Life Insurance Broker Advocate), the information you provide will be used exclusively to evaluate your preliminary insurability, communicate with life insurance carrier underwriters and authorized brokerage general agencies on your behalf, and obtain the most accurate preliminary life insurance quotes and rate-class estimates available for your profile. Your information will never be sold, rented, or shared with third-party lead generators or unaffiliated marketers.",
      "2. Scope of Information Covered: By submitting or sending this Practice Application to Richard Francis Parslow, you voluntarily authorize the review and disclosure (on a de-identified or minimally identified basis whenever possible during informal trial inquiries) of the personal, health, lifestyle, and financial responses you provide across all twelve (12) sections of this worksheet, specifically: ⚬ Health, Medical & Family History: Date and state of birth, age, sex/gender, physical diagnoses, surgeries, hospitalizations, diagnostic tests, chronic or acute conditions (including cardiac, respiratory, neurological, metabolic, renal, oncology, sleep apnea, mobility/ADL assistance, organ transplant, and HIV/AIDS diagnosis or treatment history), current prescription medications and supplements, and family medical history. ⚬ Mental Health History: Psychological, mood, anxiety, depressive, psychiatric, or neurodevelopmental conditions, counseling, outpatient/inpatient psychiatric care, related work disability, suicidal ideation or attempts, and psychiatric medications. ⚬ Substance & Lifestyle Disclosures: Nicotine, tobacco, vaping, and oral nicotine use; alcohol consumption, treatment, counseling, or medical advice to discontinue; and past or present use or treatment regarding illegal drugs, marijuana/cannabis, or unprescribed controlled substances. ⚬ Avocations, Aviation & Military Service: Private, commercial, student, or military aviation hours and incidents; hazardous sports or avocations (including climbing, diving, skydiving, hang gliding, rodeo, and motorized racing); and active- duty U.S. Military status, rank, aviation duties, and current or ordered foreign deployments. ⚬ Driving, Criminal, Financial & Residency Records: Driver’s license status, suspensions, moving violations, accidents, and DUI/DWI history; misdemeanor or felony arrests, pleas, convictions, pending charges, probation, or parole; personal or business bankruptcy filings and discharge status; occupation, hazardous job duties, and annual income; and U.S. citizenship, permanent residency/visa classification, and past or planned foreign travel or residence. 3. Practice Worksheet Only — Not a Formal Application or Binder of Coverage: This Practice Application is a preliminary pre-underwriting triage worksheet only. Completing or sending this worksheet to Richard Francis Parslow: ⚬ Does NOT constitute a formal application for life insurance with any insurance company; ⚬ Does NOT bind, create, or guarantee any temporary or permanent life insurance coverage or lock in any premium rate; and ⚬ Does NOT authorize a hard credit inquiry or a formal third-party consumer report pull (such as MIB, Inc., formal Motor Vehicle Reports [MVR], criminal background checks, or prescription database checks under the Fair Credit Reporting Act, 15 U.S.C. § 1681 et seq.), which only occur if and when you sign a formal carrier application. ⚬ If you later submit a formal application to an insurance carrier, you must still answer all questions on that carrier’s official application completely and truthfully. Final rates and eligibility remain strictly subject to formal carrier underwriting, policy issuance, and statutory contestability provisions (Tex. Ins. Code § 705.051 and § 1101.006). 4. Email Transmission Security Notice: Standard, unencrypted email is not a fully secure medium for transmitting sensitive medical or personal data. If you choose to email this worksheet to richardparslow@lifepolicypilot.blog, you acknowledge and accept the inherent risks of standard email transmission. For maximum privacy during pre-underwriting, do not include your Social Security Number, Driver’s License Number, or actual Green Card/Visa ID Number on this practice worksheet, and feel free to use only your initials or first name when emailing the document. 5. Expiration & Right to Revoke (28 TAC § 22.55 Disclosure): In compliance with Texas Department of Insurance privacy regulations (28 TAC § 22.55), this authorization to use your information for preliminary underwriting inquiries remains valid for twelve (12) months from the date of submission (and in no event longer than the Texas statutory maximum of 24 months), unless revoked earlier. You have the right to revoke this authorization and request the permanent deletion of your Practice Application at any time by emailing richardparslow@lifepolicypilot.blog. Revocation will not affect any preliminary underwriter inquiries already conducted prior to receipt of your revocation notice.",
    ],
  },
];

type Missing = Array<"consent_contact" | "consent_disclaimer">;

function ConsentBox({
  name,
  text,
  flashing,
  error,
}: {
  name: "consent_contact" | "consent_disclaimer";
  text: string;
  flashing: boolean;
  error?: string;
}) {
  const { control } = useFormContext();
  const checked = useWatch({ control, name: `consents.${name}` }) === true;
  return (
    <div>
      <Controller
        name={`consents.${name}`}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <label
            htmlFor={`consents.${name}`}
            data-consent={name}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm leading-relaxed",
              flashing && !field.value && "consent-missing",
            )}
          >
            <Checkbox
              className="mt-1 bg-white"
              id={`consents.${name}`}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-label={name === "consent_contact" ? "Consent to Contact" : "Acknowledgment & Consent"}
              aria-describedby={`consent-text-${name}${error ? ` error-${name}` : ""}`}
              aria-invalid={!!error && !field.value}
              checked={field.value === true}
              onCheckedChange={(c) => field.onChange(c === true)}
            />
            <span id={`consent-text-${name}`}>{text}</span>
          </label>
        )}
      />
      {error && !checked && (
        <p
          id={`error-${name}`}
          role="alert"
          className="mt-1 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function ConsentSection({
  missing,
  errors,
}: {
  missing: Missing;
  errors: Record<string, string | undefined>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Send a copy to Richard (optional)</h3>
        <p className="text-sm text-muted-foreground">
          Saving and printing do not require contact details or consent. To send a copy and request
          a call, provide your name, email address and cell phone number, then check both boxes below.
          Your preferred contact time is optional.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="optionalContact.contact_name"
            label="Name"
            hint="Required to send a copy. Initials or first name are fine."
            autoComplete="section-practice-contact name"
          />
          <TextField
            name="optionalContact.contact_email"
            label="Email address"
            type="email"
            hint="Required to send a copy."
            autoComplete="section-practice-contact email"
          />
          <TextField
            name="optionalContact.contact_phone"
            label="Cell phone number"
            type="tel"
            hint="Required to send a copy."
            autoComplete="section-practice-contact tel"
            inputMode="tel"
          />
          <TextField
            name="optionalContact.contact_preferred_time"
            label="Preferred time for me to reach out"
            hint="Optional, including when sending a copy."
          />
        </div>
      </div>

      <ConsentBox
        name="consent_contact"
        text={CONSENT_CONTACT_TEXT}
        flashing={missing.includes("consent_contact")}
        error={errors.consent_contact}
      />

      <div
        tabIndex={0}
        role="region"
        aria-label="Practice application disclaimer"
        className="max-h-72 space-y-3 overflow-y-auto rounded-md border bg-muted/30 p-4 text-sm"
      >
        {DISCLAIMER_SECTIONS.map((s) => (
          <div key={s.heading}>
            <h4 className="font-semibold">{s.heading}</h4>
            {s.body.map((p, i) => (
              <p key={i} className="mt-2">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>

      <ConsentBox
        name="consent_disclaimer"
        text={CONSENT_ACK_TEXT}
        flashing={missing.includes("consent_disclaimer")}
        error={errors.consent_disclaimer}
      />
    </div>
  );
}
