import { useFormContext, useWatch } from "react-hook-form";
import {
  YesNoField,
  TextField,
  TextAreaField,
  SelectField,
  MultiSelectField,
} from "./fields";
import { MedicationRepeater } from "./MedicationRepeater";
import { ModuleRenderer } from "./ModuleRenderer";
import { MODULE_TRIGGERS } from "./moduleSpecs";
import {
  healthQs,
  nicotineQs,
  alcoholQs,
  drivingQs,
  criminalQs,
  drugQs,
  type Q,
} from "./questions";
import {
  US_STATES,
  CONDITION_TRIGGERS,
  MENTAL_HEALTH_OPTIONS,
  NICOTINE_PRODUCTS,
} from "@/lib/practiceApplication.schema";
import {
  MENTAL_HEALTH_DETAIL_FIELDS,
  mentalHealthDetailVisible,
} from "@/lib/prepareApplication";

const YesNoList = ({ prefix, qs }: { prefix: string; qs: Q[] }) => (
  <div className="space-y-5">
    {qs.map((q) => (
      <YesNoField key={q.key} name={`${prefix}.${q.key}`} label={q.label} />
    ))}
  </div>
);

export function HealthSection() {
  const { control } = useFormContext();
  const selected: string[] =
    useWatch({ control, name: "healthMedical.conditions_triggered" }) ?? [];
  const recentCardiac = useWatch({
    control,
    name: "healthMedical.medical_past2_heart_brain_circulatory_surgery",
  });
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="healthMedical.dob" label="Date of Birth" type="date" />
        <TextField
          name="healthMedical.age"
          label="Age"
          type="number"
          hint="Enter completed years as of today (Central Time)."
        />
        <SelectField
          name="healthMedical.stateOfBirth"
          label="State of Birth"
          options={US_STATES}
        />
        <SelectField
          name="healthMedical.genderSex"
          label="Gender / Sex"
          options={["Male", "Female", "Other", "Prefer not to say"]}
        />
      </div>

      <YesNoList prefix="healthMedical" qs={healthQs} />
      <TextAreaField
        name="healthMedical.medical_treatment_given"
        label="What specific treatment was given or medication prescribed for your conditions?"
      />
      <MedicationRepeater
        name="healthMedical.medical_current_medications"
        label="All current medications, including herb and vitamin supplements"
      />

      <MultiSelectField
        name="healthMedical.conditions_triggered"
        label="Which of these conditions apply to you? (Selecting one opens follow-up questions below.)"
        options={CONDITION_TRIGGERS}
      />

      {selected.includes("Other") && (
        <TextAreaField
          name="healthMedical.medical_other_conditions"
          label="Other condition(s): diagnosis and treatment"
          hint="Describe any condition not listed above, including when it was diagnosed and how it is treated."
        />
      )}

      {MODULE_TRIGGERS.filter(
        ({ spec, triggers }) =>
          triggers.some((t) => selected.includes(t)) ||
          (spec.id === "cardioNeuroModule" && recentCardiac === true),
      ).map(({ spec }) => (
        <ModuleRenderer key={spec.id} spec={spec} />
      ))}
    </div>
  );
}

export function MentalHealthSection() {
  const { control } = useFormContext();
  const v = useWatch({ control, name: "mentalHealth" }) ?? {};
  const P = "mentalHealth";
  const sel: string[] = v.mh_selected_conditions ?? [];
  // One rule, shared with `pruneHidden`: the block is on screen exactly while the
  // saved draft and the mailed copy are allowed to carry it.
  const showDetail = mentalHealthDetailVisible(v);
  const hiddenAnswers = MENTAL_HEALTH_DETAIL_FIELDS.some((field) => {
    const value = v[field];
    return value !== undefined && value !== null && value !== false && value !== "";
  });
  return (
    <div className="space-y-5">
      <YesNoField
        name={`${P}.mh_history_current_treatment`}
        label="Do you have any history of or current treatment for psychological, mood, or anxiety disorders?"
      />
      <TextAreaField
        name={`${P}.mh_conditions`}
        label="What mental health, nervous, or psychiatric conditions apply to you?"
      />
      <YesNoField
        name={`${P}.mh_mild_situational_recent`}
        label="Diagnosed with Mild or Situational Depression or Anxiety within the last 6 months, or hospitalized for it?"
      />
      <TextAreaField
        name={`${P}.mh_medications`}
        label="Current prescription medications for this condition (names, dosage, frequency)"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name={`${P}.mh_dx_date`}
          label="When was the condition diagnosed?"
          type="date"
        />
        <TextField
          name={`${P}.mh_last_seen`}
          label="When were you last seen for it?"
          type="date"
        />
      </div>
      <YesNoField
        name={`${P}.mh_psychiatrist_5y`}
        label="Past 5 years: seen a psychiatrist or had hospital outpatient treatment?"
      />
      {v.mh_psychiatrist_5y && (
        <TextAreaField
          name={`${P}.mh_psychiatrist_details`}
          label="Date(s) and hospital/clinic"
        />
      )}
      <YesNoField
        name={`${P}.mh_inpatient_5y`}
        label="Past 5 years: inpatient at a hospital or clinic?"
      />
      {v.mh_inpatient_5y && (
        <TextAreaField
          name={`${P}.mh_inpatient_details`}
          label="Date(s) and hospital/clinic"
        />
      )}
      <YesNoField
        name={`${P}.mh_unable_work_5y`}
        label="Past 5 years: unable to work due to your condition?"
      />
      {v.mh_unable_work_5y && (
        <TextAreaField
          name={`${P}.mh_unable_work_details`}
          label="Date and duration of each absence"
        />
      )}
      <YesNoField
        name={`${P}.mh_suicidal_thoughts`}
        label="Have you had any suicidal thoughts?"
      />
      <YesNoField
        name={`${P}.mh_suicide_attempt`}
        label="Have you attempted suicide?"
      />
      {v.mh_suicide_attempt && (
        <TextAreaField
          name={`${P}.mh_suicide_attempt_details`}
          label="Full details, including date and follow-up treatment"
        />
      )}
      <YesNoField
        name={`${P}.mh_disability_history`}
        label="Have you ever been on disability?"
      />
      {v.mh_disability_history && (
        <TextAreaField
          name={`${P}.mh_disability_details`}
          label="Provide details"
        />
      )}

      <MultiSelectField
        name={`${P}.mh_selected_conditions`}
        label="Please check all conditions that apply"
        options={MENTAL_HEALTH_OPTIONS}
      />

      {showDetail && (
        <div className="space-y-5 rounded-md border-l-4 border-l-primary bg-muted/30 p-4">
          <h4 className="font-semibold">Additional Mental Health Details</h4>
          {sel.includes("Other") && (
            <TextField
              name={`${P}.mh_selected_other_text`}
              label="Other (describe)"
            />
          )}
          <TextAreaField
            name={`${P}.mh_rx_details`}
            label="Current prescription medications (RX names, dosage, how often taken)"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name={`${P}.mh_selected_dx_date`}
              label="Date of diagnosis"
              type="date"
            />
            <TextField
              name={`${P}.mh_selected_last_seen`}
              label="Date last seen for condition"
              type="date"
            />
          </div>
          <YesNoField
            name={`${P}.mh_selected_psychiatrist_5y`}
            label="Past 5 years: psychiatrist or hospital outpatient treatment?"
          />
          {v.mh_selected_psychiatrist_5y && (
            <TextAreaField
              name={`${P}.mh_selected_psychiatrist_details`}
              label="Date(s) and hospital/clinic"
            />
          )}
          <YesNoField
            name={`${P}.mh_selected_inpatient_5y`}
            label="Past 5 years: in-patient at a hospital or clinic?"
          />
          {v.mh_selected_inpatient_5y && (
            <TextAreaField
              name={`${P}.mh_selected_inpatient_details`}
              label="Date(s) and hospital/clinic"
            />
          )}
          <YesNoField
            name={`${P}.mh_selected_unable_work_5y`}
            label="Past 5 years: unable to work due to your condition?"
          />
          {v.mh_selected_unable_work_5y && (
            <TextAreaField
              name={`${P}.mh_selected_unable_work_details`}
              label="Date and duration of each absence"
            />
          )}
          <YesNoField
            name={`${P}.mh_selected_suicidal_thoughts`}
            label="Have you had any suicidal thoughts?"
          />
          <YesNoField
            name={`${P}.mh_selected_suicide_attempt`}
            label="Have you attempted suicide?"
          />
          {v.mh_selected_suicide_attempt && (
            <TextAreaField
              name={`${P}.mh_selected_suicide_attempt_details`}
              label="Full details, including date and follow-up treatment"
            />
          )}
          <YesNoField
            name={`${P}.mh_selected_disability`}
            label="Have you ever been on disability?"
          />
          {v.mh_selected_disability && (
            <TextAreaField
              name={`${P}.mh_selected_disability_details`}
              label="Provide details"
            />
          )}
        </div>
      )}
      {!showDetail && hiddenAnswers && (
        <p role="status" className="text-xs text-muted-foreground">
          You answered the hidden mental-health details, but they are not shown
          while this block is closed, so the saved draft and the copy that is sent
          leave them out. Check a condition to bring them back.
        </p>
      )}
    </div>
  );
}

export function NicotineSection() {
  const { control } = useFormContext();
  const used12 = useWatch({ control, name: "nicotineSmoking.nic_used_12m" });
  const everUsed = useWatch({ control, name: "nicotineSmoking.nic_ever_used" });
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Tobacco in any form includes cigarettes, e-cigs, chewing tobacco,
        cigars, pipes, snuff, patches, gum/aerosol/inhaler, hookah, clove,
        bidis, or oral nicotine pouches.
      </p>
      <YesNoField
        name="nicotineSmoking.nic_ever_used"
        label="Have you ever used tobacco or nicotine products in any form?"
      />
      <YesNoList prefix="nicotineSmoking" qs={nicotineQs} />
      {everUsed !== false && (
        <MultiSelectField
          name="nicotineSmoking.nic_products"
          label="Products used"
          options={NICOTINE_PRODUCTS}
        />
      )}
      {used12 === true && (
        <TextAreaField
          name="nicotineSmoking.nic_type_and_amount"
          label="Type and amount"
        />
      )}
      {used12 === false && everUsed !== false && (
        <TextField
          name="nicotineSmoking.nic_date_last_used"
          label="Date last used"
          type="date"
          hint="If you have never used tobacco or nicotine, answer No to the ever-use question above. Otherwise, provide the date last used."
        />
      )}
    </div>
  );
}

export function AlcoholSection() {
  return (
    <div className="space-y-5">
      <YesNoList prefix="alcoholUse" qs={alcoholQs} />
      <TextAreaField
        name="alcoholUse.alc_details"
        label="If you answered Yes to any question, provide dates, treatment, and details"
      />
    </div>
  );
}

export function DrivingSection() {
  return (
    <div className="space-y-5">
      <YesNoList prefix="drivingRecord" qs={drivingQs} />
      <TextAreaField
        name="drivingRecord.drv_details"
        label="If Yes to any violation/accident question, provide dates, fault, and details"
      />
    </div>
  );
}

export function CriminalSection() {
  return (
    <div className="space-y-5">
      <YesNoList prefix="criminalRecord" qs={criminalQs} />
      <TextAreaField
        name="criminalRecord.crim_details"
        label="If Yes, provide date of arrest, conviction, and any jail time, probation, or parole"
      />
    </div>
  );
}

export function DrugSection() {
  return (
    <div className="space-y-5">
      <YesNoList prefix="illegalDrugUse" qs={drugQs} />
      <TextAreaField
        name="illegalDrugUse.drug_details"
        label="If Yes, provide substance, dates, and treatment"
      />
    </div>
  );
}

export function BankruptcySection() {
  const { control } = useFormContext();
  const b = useWatch({ control, name: "bankruptcy" }) ?? {};
  return (
    <div className="space-y-5">
      <YesNoField
        name="bankruptcy.bk_has_filed"
        label="Have you or your spouse filed bankruptcy before?"
      />
      {b.bk_has_filed && (
        <>
          <SelectField
            name="bankruptcy.bk_type"
            label="What type?"
            options={["Chapter 7", "Chapter 11", "Chapter 13", "Other"]}
          />
          {b.bk_type === "Chapter 7" && (
            <SelectField
              name="bankruptcy.bk_chapter7_personal_or_business"
              label="If Chapter 7, personal or business?"
              options={["Personal", "Business", "Both"]}
            />
          )}
          <YesNoField
            name="bankruptcy.bk_discharged"
            label="Has this bankruptcy been discharged?"
          />
          <TextField
            name="bankruptcy.bk_discharge_date"
            label="Date (or anticipated date) of discharge"
            type="date"
          />
          <YesNoField
            name="bankruptcy.bk_in_process"
            label="Is this bankruptcy still in process?"
          />
        </>
      )}
    </div>
  );
}

export function ResidencySection() {
  const { control } = useFormContext();
  const r = useWatch({ control, name: "residencyTravel" }) ?? {};
  const P = "residencyTravel";
  return (
    <div className="space-y-5">
      <SelectField
        name={`${P}.res_citizen_or_resident`}
        label="Is the Proposed Insured a U.S. Citizen or Permanent Resident?"
        options={["U.S. Citizen", "Permanent Resident", "Other"]}
      />
      {r.res_citizen_or_resident === "Other" && (
        <TextField
          name={`${P}.res_non_us_status`}
          label="Immigration status or visa type"
          hint="Enter the status or visa type only; do not enter document or ID numbers."
        />
      )}
      <YesNoField
        name={`${P}.res_high_risk_countries_2y`}
        label="Within the next 2 years, do you intend to work, travel, or reside in Saudi Arabia, Iraq, Afghanistan, Syria, Somalia, Sudan, or Yemen for more than 30 days, or reside outside the U.S. more than 180 days?"
      />
      {r.res_high_risk_countries_2y && (
        <TextAreaField
          name={`${P}.res_high_risk_countries_details`}
          label="Countries, dates, and purpose"
        />
      )}
      <YesNoField
        name={`${P}.res_travel_outside_us_24m`}
        label="Within the next 24 months, do you intend to work, travel, or reside outside the U.S. for more than 30 days?"
      />
      {r.res_travel_outside_us_24m && (
        <TextAreaField
          name={`${P}.res_travel_outside_us_details`}
          label="Where?"
        />
      )}
      <YesNoField
        name={`${P}.res_lived_us_5y`}
        label="Has the Proposed Insured lived consistently in the USA for the past 5 years?"
      />
      <YesNoField
        name={`${P}.res_move_back_native_country`}
        label="Does the Proposed Insured plan to move back to their native country?"
      />
      <TextAreaField
        name={`${P}.res_foreign_travel_details`}
        label="Previous and future foreign travel/residence (dates, countries, regions, reason, frequency, duration) — last 2 years"
      />
    </div>
  );
}

export function OccupationSection() {
  const { control } = useFormContext();
  const hr = useWatch({
    control,
    name: "occupationFinancial.occ_high_risk_occupation",
  });
  const P = "occupationFinancial";
  return (
    <div className="space-y-5">
      <TextField
        name={`${P}.occ_current_occupation`}
        label="Current occupation"
      />
      <TextField
        name={`${P}.occ_annual_salary`}
        label="Annual salary (USD)"
        type="number"
      />
      <YesNoField
        name={`${P}.occ_full_time_6mo`}
        label="Working full-time (30+ hours/week) for the past six months?"
      />
      <YesNoField
        name={`${P}.occ_weapon`}
        label="Do you carry a weapon in your occupation?"
      />
      <YesNoField
        name={`${P}.occ_high_risk_occupation`}
        label="Member of a high-risk occupation (blaster/explosives, iron/structural worker, underground miner, professional athlete, casino worker, firefighter, etc.)?"
      />
      {hr && (
        <TextAreaField
          name={`${P}.occ_high_risk_details`}
          label="Provide details"
        />
      )}
    </div>
  );
}

export function MilitarySection() {
  const { control } = useFormContext();
  const active = useWatch({ control, name: "militaryService.mil_active_duty" });
  const P = "militaryService";
  return (
    <div className="space-y-5">
      <YesNoField
        name={`${P}.mil_active_duty`}
        label="Are you a member of the United States Military on active duty?"
      />
      {active && (
        <div className="space-y-5 rounded-md border-l-4 border-l-primary bg-muted/30 p-4">
          <YesNoField
            name={`${P}.mil_deployment`}
            label="Currently deployed or have orders to deploy to Saudi Arabia, Iraq, Afghanistan, Syria, Somalia, Sudan, or Yemen?"
          />
          <TextAreaField
            name={`${P}.mil_flying_time`}
            label="Complete schedule of flying time (military aviation)"
          />
          <MultiSelectField
            name={`${P}.mil_flight_type`}
            label="Type of flying"
            options={[
              "Combat Tactical/Recon",
              "Combat Transport/Support/Supply",
              "Non-Combat Recon",
              "Non-Combat Transport",
              "Proficiency only",
            ]}
          />
          <TextField
            name={`${P}.mil_job_rank`}
            label="Job title and current rank"
          />
          <YesNoField
            name={`${P}.mil_aircraft_duties`}
            label="Are you assigned duties aboard the aircraft?"
          />
        </div>
      )}
    </div>
  );
}
