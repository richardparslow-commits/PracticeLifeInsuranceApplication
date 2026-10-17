import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

const text = z.string().trim().max(500);
const longText = z.string().trim().max(5000);
const optText = text.optional().or(z.literal(""));
const optLongText = longText.optional().or(z.literal(""));
const yesNo = z.boolean();
const optYesNo = z.boolean().optional();

// Compare calendar parts explicitly: Date.parse normalizes dates such as February 30.
function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

const centralDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function todayInCentral(): string {
  const parts = centralDateFormatter.formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)!.value;
  return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD)")
  .refine(isCalendarDate, "Invalid calendar date");

const pastOrTodayDate = isoDate.refine(
  (value) => !isCalendarDate(value) || value <= todayInCentral(),
  "Date cannot be in the future"
);

// Empty strings, null and booleans must not become a newborn's age of zero.
const applicantAge = z.preprocess(
  (value) => typeof value === "number" || (typeof value === "string" && value.trim() !== "")
    ? value
    : undefined,
  z.coerce.number().int().min(0).max(120)
);

const optDate = isoDate.optional().or(z.literal(""));
const monthYear = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use month/year (YYYY-MM)");
const optMonthYear = monthYear.optional().or(z.literal(""));

const phone = z
  .string()
  .trim()
  .regex(/^[+()\-.\s\d]{7,20}$/, "Enter a valid phone number");
const optPhone = phone.optional().or(z.literal(""));
const email = z.string().trim().email("Enter a valid email address");
const optNumber = z.coerce.number().min(0).optional();

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR",
  "PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","Outside U.S.",
] as const;

/* -------------------------------------------------------------------------- */
/* Reusable repeater items                                                    */
/* -------------------------------------------------------------------------- */

export const medicationItemSchema = z.object({
  name: text.min(1, "Medication name is required"),
  dosage: optText,
  frequency: optText,
});

const detailedMedicationItemSchema = z.object({
  drugName: text.min(1, "Drug name is required"),
  dosage: optText,
  startDate: optDate,
  adherence: optText,
  frequency: optText,
  lastFillDate: optDate,
  conditionTreated: optText,
});

/* -------------------------------------------------------------------------- */
/* Trigger constants (drive conditional logic)                                */
/* -------------------------------------------------------------------------- */

export const CONDITION_TRIGGERS = [
  "Arthritis","Asthma","Cancer","Diabetes 1 or 2","High Blood Pressure","Emphysema","Sleep Apnea",
  "Asbestosis","Cystic Fibrosis","Tuberculosis","Lung Cancer","Sarcoidosis","Pulmonary Fibrosis",
  "COPD","Chronic Bronchitis","Seizure Disorder","Seizures","Stroke","TIA","Heart Attack","Other",
] as const;
export type ConditionTrigger = (typeof CONDITION_TRIGGERS)[number];

const RESPIRATORY: ConditionTrigger[] = [
  "Sleep Apnea","COPD","Emphysema","Chronic Bronchitis","Asbestosis","Cystic Fibrosis",
  "Tuberculosis","Lung Cancer","Sarcoidosis","Pulmonary Fibrosis",
];
const COPD_GROUP = RESPIRATORY.filter((c) => c !== "Sleep Apnea");
const SEIZURE: ConditionTrigger[] = ["Seizure Disorder", "Seizures"];
const CARDIO_NEURO: ConditionTrigger[] = ["Stroke", "TIA", "Heart Attack"];

export const MENTAL_HEALTH_OPTIONS = [
  "Situational anxiety","Adjustment Disorder","Panic Disorder","Depression Major","Depression",
  "Schizophrenia","Bipolar I or II","ADHD/ADD","Eating disorder","Mental Retardation","PTSD",
  "Tourette’s syndrome","Suicide attempt/ideation","Obsessive Compulsive Disorder (OCD)","Autism","Other",
] as const;

export const NICOTINE_PRODUCTS = [
  "Cigarettes","Cigars","Pipe","Chewing tobacco","Snuff","E-cigarettes","Vapes","Nicotine patch",
  "Nicotine gum","Nicotine aerosol/inhaler","Hookah","Clove","Bidis","Oral nicotine pouches",
] as const;

/* -------------------------------------------------------------------------- */
/* Health / Medical                                                           */
/* -------------------------------------------------------------------------- */

const healthMedicalBase = z.object({
  dob: pastOrTodayDate,
  age: applicantAge,
  stateOfBirth: z.enum(US_STATES),
  genderSex: z.enum(["Male", "Female", "Other", "Prefer not to say"]),

  medical_past12_obesity_decline_pending: yesNo,
  medical_past12_consult_surgery_hospital_test: yesNo,
  medical_ever_major_conditions: yesNo,
  medical_past2_heart_brain_circulatory_surgery: yesNo,
  medical_past3_conditions_medicated: yesNo,
  medical_past5_internal_cancer: yesNo,
  medical_hiv_aids: yesNo,
  medical_past5_checkups_labs_consults: yesNo,
  medical_past7_cardio_conditions: yesNo,
  medical_past7_digestive_liver_conditions: yesNo,
  medical_past7_respiratory_conditions: yesNo,
  medical_sleep_apnea_6mo_not_treated: yesNo,
  medical_past7_neuro_mental_conditions: yesNo,
  medical_past7_renal_repro_std_conditions: yesNo,
  medical_past7_connective_tissue_conditions: yesNo,
  medical_past10_bp_cholesterol_meds: yesNo,
  medical_past10_diabetes_cancer_cardiac: yesNo,
  medical_diabetes_prior21_insulin_or_complications: yesNo,
  medical_work_disability: yesNo,
  medical_currently_hospitalized_or_needs_adl_help: yesNo,
  medical_recent_assistive_devices: yesNo,
  medical_organ_transplant: yesNo,
  medical_confined_facility_now: yesNo,
  medical_family_history_kidney_transplant_heart_cancer: yesNo,
  medical_family_history_multiple_early_deaths: yesNo,

  medical_treatment_given: optLongText,
  medical_current_medications: z.array(medicationItemSchema).default([]),

  conditions_triggered: z.array(z.enum(CONDITION_TRIGGERS)).default([]),
  medical_other_conditions: optLongText,
});

/* Condition modules ------------------------------------------------------- */

export const seizureModuleSchema = z.object({
  seizure_diagnosis: text.min(1, "Required"),
  seizure_diagnosis_date: isoDate,
  seizure_age_at_onset: z.coerce.number().int().min(0).max(120),
  seizure_total_count: z.coerce.number().int().min(0),
  seizure_most_recent_date: isoDate,
  seizure_frequency: text.min(1, "Required"),
  seizure_treatments: longText.min(1, "Required"),
  seizure_medications: z.array(detailedMedicationItemSchema).default([]),
  seizure_physician_name: text.min(1, "Required"),
  seizure_physician_address: longText.min(1, "Required"),
  seizure_physician_phone: phone,
  seizure_last_visit: isoDate,
  seizure_last_visit_reason_result: longText.min(1, "Required"),
  seizure_hospital_visits: optLongText,
  seizure_pending_tests: optLongText,
  seizure_classification_simple_partial_check: optYesNo,
  seizure_classification_epilepsy_control: optText,
  seizure_polytherapy: optYesNo,
  seizure_underlying_cause: optLongText,
  seizure_injuries_accidents: optLongText,
  seizure_driving_status: optLongText,
  seizure_functional_limitations: optLongText,
  seizure_assistance_needed: optLongText,
});

export const respiratoryModuleSchema = z.object({
  resp_diagnosis: text.min(1, "Required"),
  resp_date_first_diagnosed: isoDate,
  resp_age_at_onset: z.coerce.number().int().min(0).max(120),
  resp_symptoms_frequency: longText.min(1, "Required"),
  resp_treatments: longText.min(1, "Required"),
  resp_medications: z.array(detailedMedicationItemSchema).default([]),
  resp_physician_name: text.min(1, "Required"),
  resp_physician_address: longText.min(1, "Required"),
  resp_physician_phone: phone,
  resp_last_visit: isoDate,
  resp_last_visit_reason_result: longText.min(1, "Required"),
  resp_hospital_visits: optLongText,
  resp_pending_tests: optLongText,

  // COPD / respiratory specific
  copd_history: optLongText,
  copd_pft_results: optLongText,
  copd_sob: optYesNo,
  copd_stairs_tolerance: optYesNo,
  copd_oxygen_nebulizer_steroids: optYesNo,
  copd_nicotine_history: optLongText,
  copd_other_conditions: optLongText,

  // Sleep apnea specific
  sleep_type: z.enum(["Obstructive sleep apnea", "Central sleep apnea", "Mixed"]).optional(),
  sleep_confirmation_method: z
    .enum(["Home sleep apnea test", "Attended polysomnography / sleep study", "Other"])
    .optional(),
  sleep_ahi_rdi: optText,
  sleep_treatment: z
    .array(z.enum(["CPAP","BiPAP","APAP","Oral appliance","Positional therapy","UPPP","Other surgery"]))
    .default([]),
  sleep_pap_compliance: optLongText,
  sleep_control_status: optLongText,
  sleep_repeat_study: optLongText,
  sleep_functional_limitations: optLongText,
  sleep_cardio_complications: optLongText,
  sleep_comorbidities: optLongText,
  sleep_driving_restrictions: optLongText,
});

export const cardioNeuroModuleSchema = z.object({
  cardio_neuro_diagnosis: text.min(1, "Required"),
  cardio_neuro_date: isoDate,
  cardio_neuro_age: z.coerce.number().int().min(0).max(120),
  cardio_neuro_episode_count: z.coerce.number().int().min(0),
  cardio_neuro_recent_date: isoDate,
  cardio_neuro_status: longText.min(1, "Required"),
  cardio_neuro_hospitalization: optLongText,
  cardio_neuro_treatments: longText.min(1, "Required"),
  cardio_neuro_medications: z.array(detailedMedicationItemSchema).default([]),
  cardio_neuro_blood_thinners: yesNo,
  cardio_neuro_physician_name: text.min(1, "Required"),
  cardio_neuro_physician_address: optLongText,
  cardio_neuro_physician_phone: optPhone,
  cardio_neuro_last_visit: optDate,
  cardio_neuro_followup_gaps: optLongText,
  cardio_neuro_pending_tests: optLongText,

  // Stroke / TIA
  stroke_root_cause: optLongText,
  stroke_imaging_results: optLongText,
  stroke_on_anticoagulated: optYesNo,
  stroke_residual_effects: optLongText,
  stroke_cognitive_impairment: optLongText,
  stroke_pfo_asd_history: optLongText,
  stroke_carotid_ultrasound: optLongText,
  stroke_therapy_last_3_12_months: optLongText,

  // Heart attack
  mi_supporting_evidence: optLongText,
  mi_procedure_details: optLongText,
  mi_vessels_affected: optNumber,
  mi_ongoing_symptoms: optLongText,
  mi_residual_damage: optLongText,
  mi_recent_workup: optLongText,

  // Functional / comorbidities
  cardio_limitations: optLongText,
  cardio_work_status: optLongText,
  cardio_return_to_work: optDate,
  cardio_disability_benefits: optLongText,
  cardio_adl_iadl_help: optLongText,
  cardio_medical_equipment: optLongText,
  cardio_confinement_status: optLongText,
  cardio_height_weight: optText,
  cardio_weight_change_10lbs: optYesNo,
  cardio_nicotine_history: optLongText,
  cardio_bp_history: optLongText,
  cardio_lipid_panel: optLongText,
  cardio_diabetes_history: optLongText,
  cardio_other_comorbidities: optLongText,
  cardio_family_history: optLongText,
});

export const hypertensionModuleSchema = z
  .object({
    htn_dx_date: monthYear,
    htn_meds_last12months: yesNo,
    htn_current_meds: z.array(medicationItemSchema).default([]),
    htn_last_doctor_visit: isoDate,
    htn_last_bp: z.string().trim().min(1, "Required"),
    htn_bp_normal_or_elevated_if_unknown: optText,
    htn_med_change: yesNo,
    htn_med_change_details: optLongText,
    htn_compliant: yesNo,
    htn_other_conditions: optLongText,
    htn_hospitalized_5y: yesNo,
    htn_hospitalized_date: optDate,
    htn_unable_to_work_5y: yesNo,
    htn_unable_to_work_details: optLongText,
  })
  .superRefine((v, ctx) => {
    if (v.htn_med_change && !v.htn_med_change_details)
      ctx.addIssue({ code: "custom", path: ["htn_med_change_details"], message: "Describe the change" });
    if (v.htn_hospitalized_5y && !v.htn_hospitalized_date)
      ctx.addIssue({ code: "custom", path: ["htn_hospitalized_date"], message: "Provide date" });
    if (v.htn_unable_to_work_5y && !v.htn_unable_to_work_details)
      ctx.addIssue({ code: "custom", path: ["htn_unable_to_work_details"], message: "Provide dates and duration" });
  });

export const DIABETES_COMPLICATIONS = [
  "Vision changes / retinopathy","High blood pressure","Heart disease","Neuropathy",
  "Diabetic coma / insulin shock","Protein in urine","Gout","Numbness or tingling of feet or hands",
  "Amputation due to disease","Kidney disease","Skin ulcers","PAD / PVD",
] as const;

export const diabetesModuleSchema = z
  .object({
    dm_dx_date: monthYear,
    dm_control_method: z.array(z.enum(["Oral Medication", "Diet Only", "Insulin"])).min(1, "Select at least one"),
    dm_insulin_start_date: optDate,
    dm_current_meds: z.array(medicationItemSchema).default([]),
    dm_last_blood_sugar: text.min(1, "Required"),
    dm_last_blood_sugar_date: isoDate,
    dm_last_a1c: text.min(1, "Required"),
    dm_last_a1c_date: isoDate,
    dm_reading_unknown: optText,
    dm_med_change: yesNo,
    dm_med_change_details: optLongText,
    dm_compliant: yesNo,
    dm_noncompliance_details: optLongText,
    dm_complications: z.array(z.enum(DIABETES_COMPLICATIONS)).default([]),
    dm_er_hospital_5y: yesNo,
    dm_er_hospital_details: optLongText,
  })
  .superRefine((v, ctx) => {
    const medicationTreatment = v.dm_control_method.some((method) => method !== "Diet Only");
    if (medicationTreatment && v.dm_current_meds.length === 0)
      ctx.addIssue({ code: "custom", path: ["dm_current_meds"], message: "List the medication used to control diabetes" });
    if (v.dm_control_method.includes("Diet Only") && medicationTreatment)
      ctx.addIssue({ code: "custom", path: ["dm_control_method"], message: "Choose Diet Only by itself, or select the medication treatment(s) used" });
    if (v.dm_control_method.includes("Insulin") && !v.dm_insulin_start_date)
      ctx.addIssue({ code: "custom", path: ["dm_insulin_start_date"], message: "Provide insulin start date" });
    if (v.dm_med_change && !v.dm_med_change_details)
      ctx.addIssue({ code: "custom", path: ["dm_med_change_details"], message: "Please explain" });
    if (!v.dm_compliant && !v.dm_noncompliance_details)
      ctx.addIssue({ code: "custom", path: ["dm_noncompliance_details"], message: "Please explain" });
    if (v.dm_er_hospital_5y && !v.dm_er_hospital_details)
      ctx.addIssue({ code: "custom", path: ["dm_er_hospital_details"], message: "Provide details" });
  });

export const arthritisModuleSchema = z
  .object({
    arth_type: text.min(1, "Required"),
    arth_joints: text.min(1, "Required"),
    arth_duration: text.min(1, "Required"),
    arth_last_flare: optDate,
    arth_unable_work_5y: yesNo,
    arth_unable_work_details: optLongText,
    arth_assistive_devices: optText,
    arth_symptoms: optText,
    arth_regular_medication: optYesNo,
    arth_medication_name: optText,
    arth_medication_dosage: optText,
    arth_last_doctor_visit: optDate,
    arth_additional_comments: optLongText,
  })
  .superRefine((v, ctx) => {
    if (v.arth_unable_work_5y && !v.arth_unable_work_details)
      ctx.addIssue({ code: "custom", path: ["arth_unable_work_details"], message: "Provide details" });
    if (v.arth_regular_medication && !v.arth_medication_name)
      ctx.addIssue({ code: "custom", path: ["arth_medication_name"], message: "Provide medication name" });
  });

export const asthmaModuleSchema = z
  .object({
    asthma_dx_date: monthYear,
    asthma_last_attack: optMonthYear,
    asthma_attacks_per_year: optNumber,
    asthma_triggers: optLongText,
    asthma_current_meds: z.array(medicationItemSchema).default([]),
    asthma_steroid_use: optYesNo,
    asthma_steroid_last_used: optDate,
    asthma_hospitalized_5y: optYesNo,
    asthma_er_visits: optYesNo,
    asthma_status_asthmaticus: optYesNo,
    asthma_status_asthmaticus_date: optMonthYear,
    asthma_allergy_caused: optYesNo,
  })
  .superRefine((v, ctx) => {
    if (v.asthma_status_asthmaticus && !v.asthma_status_asthmaticus_date)
      ctx.addIssue({ code: "custom", path: ["asthma_status_asthmaticus_date"], message: "Provide date" });
  });

export const cancerModuleSchema = z
  .object({
    cancer_tumor_diagnosed_as_cancer: yesNo,
    cancer_dx_date: monthYear,
    cancer_location_diagnosis: longText.min(1, "Required"),
    cancer_stage_size_classification: optLongText,
    cancer_nodes_spread: optYesNo,
    cancer_nodes_spread_details: optLongText,
    cancer_surgery_5y: optYesNo,
    cancer_surgery_details: optLongText,
    cancer_chemo_radiation_5y: optYesNo,
    cancer_last_treatment_date: optMonthYear,
    cancer_other_treatments_5y: optYesNo,
    cancer_other_treatment_details: optLongText,
    cancer_tamoxifen_femara: optYesNo,
    cancer_tamoxifen_femara_last_used: optDate,
    cancer_doctor_frequency_last_seen: optText,
  })
  .superRefine((v, ctx) => {
    if (v.cancer_nodes_spread && !v.cancer_nodes_spread_details)
      ctx.addIssue({ code: "custom", path: ["cancer_nodes_spread_details"], message: "Provide details" });
    if (v.cancer_surgery_5y && !v.cancer_surgery_details)
      ctx.addIssue({ code: "custom", path: ["cancer_surgery_details"], message: "Provide details" });
    if (v.cancer_chemo_radiation_5y && !v.cancer_last_treatment_date)
      ctx.addIssue({ code: "custom", path: ["cancer_last_treatment_date"], message: "Provide date" });
    if (v.cancer_other_treatments_5y && !v.cancer_other_treatment_details)
      ctx.addIssue({ code: "custom", path: ["cancer_other_treatment_details"], message: "Provide details" });
    if (v.cancer_tamoxifen_femara && !v.cancer_tamoxifen_femara_last_used)
      ctx.addIssue({ code: "custom", path: ["cancer_tamoxifen_femara_last_used"], message: "Provide date" });
  });

/* -------------------------------------------------------------------------- */
/* Mental Health                                                              */
/* -------------------------------------------------------------------------- */

const mentalHealthBase = z.object({
  mh_history_current_treatment: yesNo,
  mh_conditions: longText.optional().or(z.literal("")),
  mh_mild_situational_recent: yesNo,
  mh_medications: optLongText,
  mh_dx_date: optDate,
  mh_last_seen: optDate,
  mh_psychiatrist_5y: yesNo,
  mh_psychiatrist_details: optLongText,
  mh_inpatient_5y: yesNo,
  mh_inpatient_details: optLongText,
  mh_unable_work_5y: yesNo,
  mh_unable_work_details: optLongText,
  mh_suicidal_thoughts: yesNo,
  mh_suicide_attempt: yesNo,
  mh_suicide_attempt_details: optLongText,
  mh_disability_history: yesNo,
  mh_disability_details: optLongText,

  // Detail module (bottom of section)
  mh_selected_conditions: z.array(z.enum(MENTAL_HEALTH_OPTIONS)).default([]),
  mh_selected_other_text: optText,
  mh_rx_details: optLongText,
  mh_selected_dx_date: optDate,
  mh_selected_last_seen: optDate,
  mh_selected_psychiatrist_5y: optYesNo,
  mh_selected_psychiatrist_details: optLongText,
  mh_selected_inpatient_5y: optYesNo,
  mh_selected_inpatient_details: optLongText,
  mh_selected_unable_work_5y: optYesNo,
  mh_selected_unable_work_details: optLongText,
  mh_selected_suicidal_thoughts: optYesNo,
  mh_selected_suicide_attempt: optYesNo,
  mh_selected_suicide_attempt_details: optLongText,
  mh_selected_disability: optYesNo,
  mh_selected_disability_details: optLongText,
});

/* -------------------------------------------------------------------------- */
/* Other sections                                                             */
/* -------------------------------------------------------------------------- */

const nicotineBase = z.object({
  nic_ever_used: optYesNo,
  nic_used_12_3_5y: yesNo,
  nic_used_36m: yesNo,
  nic_used_12m: yesNo,
  nic_products: z.array(z.enum(NICOTINE_PRODUCTS)).default([]),
  nic_type_and_amount: optLongText,
  nic_date_last_used: optDate,
});

const alcoholBase = z.object({
  alc_past7_abuse_counseling: yesNo,
  alc_past5_abuse_counseling: yesNo,
  alc_past10_treated: yesNo,
  alc_history: yesNo,
  alc_infractions: yesNo,
  alc_details: optLongText,
});

const riskyBase = z.object({
  avi_flights_past12m: yesNo,
  avi_flights_past24m: yesNo,
  avi_future_2y: yesNo,
  avi_future_details: optLongText,
  avi_license_type: z.enum(["Student", "Private", "Commercial", "ATP", "Other"]).optional(),
  avi_accident_grounded_fined: optYesNo,
  avi_accident_details: optLongText,
  avi_hours_pilot: optNumber,
  avi_hours_crew: optNumber,
  avi_schedule_flying_time: optLongText,
  avi_other_flying_details: optLongText,
  adv_participation: z
    .array(
      z.enum([
        "Parachuting","Hang gliding","Rock or mountain climbing","Rodeo events","Sky diving",
        "Skin diving","Scuba diving","Organized racing of any kind","Professional sport",
      ])
    )
    .default([]),
  climb_years: optText,
  climb_regions: optText,
  climb_nature: optLongText,
  climb_bolts: optText,
  climb_no_rope: optText,
  race_intent: z.array(z.enum(["Automobile", "Hydroplane"])).default([]),
  race_track: optText,
  race_professional: optYesNo,
  race_last_date: optDate,
  dive_certified: optYesNo,
  dive_instruction_hours: optNumber,
  dive_certification_date: optDate,
  dive_not_certified_reason: optText,
  dive_max_depth: optText,
  dive_schedule: optLongText,
  dive_equipment: optLongText,
  dive_locations: z
    .array(z.enum(["Lakes and Rivers", "Ocean Beaches", "Deep Sea", "Bays and Inlets", "Others"]))
    .default([]),
  dive_salvage_exploration: optYesNo,
  dive_club_member: optYesNo,
});

const drivingBase = z.object({
  drv_valid_license: yesNo,
  drv_no_valid_license_details: optLongText,
  drv_suspension_24m: yesNo,
  drv_suspension_5y: yesNo,
  drv_moving_violations_5y: yesNo,
  drv_careless_reckless_5y: yesNo,
  drv_more_than_two_violations: yesNo,
  drv_accidents: yesNo,
  drv_details: optLongText,
});

const criminalBase = z.object({
  crim_past6m_supervision: yesNo,
  crim_felony_7y: yesNo,
  crim_felony_10y: yesNo,
  crim_supervision_10y: yesNo,
  crim_current_supervision: yesNo,
  crim_past5y_guilty_convicted: yesNo,
  crim_ever_guilty_convicted: yesNo,
  crim_details: optLongText,
});

const bankruptcyBase = z.object({
  bk_has_filed: yesNo,
  bk_type: z.enum(["Chapter 7", "Chapter 11", "Chapter 13", "Other"]).optional(),
  bk_chapter7_personal_or_business: z.enum(["Personal", "Business", "Both"]).optional(),
  bk_discharged: optYesNo,
  bk_discharge_date: optDate,
  bk_in_process: optYesNo,
});

const drugBase = z.object({
  drug_past2y: yesNo,
  drug_past5y: yesNo,
  drug_ever_listed: yesNo,
  drug_past7y_prescription_advice: yesNo,
  drug_marijuana_24m: yesNo,
  drug_past10y_treated: yesNo,
  drug_current_history: yesNo,
  drug_details: optLongText,
});

const residencyBase = z.object({
  res_citizen_or_resident: z.enum(["U.S. Citizen", "Permanent Resident", "Other"]),
  res_non_us_status: optText,
  res_high_risk_countries_2y: yesNo,
  res_high_risk_countries_details: optLongText,
  res_travel_outside_us_24m: yesNo,
  res_travel_outside_us_details: optLongText,
  res_lived_us_5y: yesNo,
  res_lived_us_5y_details: optLongText,
  res_move_back_native_country: yesNo,
  res_foreign_travel_details: optLongText,
});

const occupationBase = z.object({
  occ_current_occupation: text.min(1, "Required"),
  occ_annual_salary: z.coerce.number().min(0, "Enter a valid amount"),
  occ_full_time_6mo: yesNo,
  occ_full_time_6mo_details: optLongText,
  occ_weapon: yesNo,
  occ_high_risk_occupation: yesNo,
  occ_high_risk_details: optLongText,
});

const militaryBase = z.object({
  mil_active_duty: yesNo,
  mil_deployment: optYesNo,
  mil_flying_time: optLongText,
  mil_flight_type: z
    .array(
      z.enum([
        "Combat Tactical/Recon","Combat Transport/Support/Supply","Non-Combat Recon",
        "Non-Combat Transport","Proficiency only",
      ])
    )
    .default([]),
  mil_job_rank: optText,
  mil_aircraft_duties: optYesNo,
});

/* -------------------------------------------------------------------------- */
/* Optional contact + consents                                                */
/* -------------------------------------------------------------------------- */

const optionalContactBase = z.object({
  contact_name: optText,
  contact_email: email.optional().or(z.literal("")),
  contact_phone: optPhone,
  contact_preferred_time: optText,
});

const consentsBase = z.object({
  consent_contact: z.boolean().default(false),
  consent_disclaimer: z.boolean().default(false),
});

/* -------------------------------------------------------------------------- */
/* Whole-form shape                                                           */
/* -------------------------------------------------------------------------- */

const shape = {
  healthMedical: healthMedicalBase,
  seizureModule: seizureModuleSchema.partial().optional(),
  respiratoryModule: respiratoryModuleSchema.partial().optional(),
  cardioNeuroModule: cardioNeuroModuleSchema.partial().optional(),
  hypertensionModule: z.any().optional(),
  diabetesModule: z.any().optional(),
  arthritisModule: z.any().optional(),
  asthmaModule: z.any().optional(),
  cancerModule: z.any().optional(),
  mentalHealth: mentalHealthBase,
  nicotineSmoking: nicotineBase,
  alcoholUse: alcoholBase,
  riskyBehavior: riskyBase,
  drivingRecord: drivingBase,
  criminalRecord: criminalBase,
  bankruptcy: bankruptcyBase,
  illegalDrugUse: drugBase,
  residencyTravel: residencyBase,
  occupationFinancial: occupationBase,
  militaryService: militaryBase,
  optionalContact: optionalContactBase,
  consents: consentsBase,
};

/* -------------------------------------------------------------------------- */
/* Conditional-logic helpers                                                  */
/* -------------------------------------------------------------------------- */

const hasAny = (selected: readonly string[] = [], targets: readonly string[]) =>
  targets.some((t) => selected.includes(t));

const MH_TRIGGER_WORDS = [
  "anxiety","depression","eating disorder","suicid","adjustment","schizophrenia","mental retardation",
  "ocd","panic","bipolar","ptsd","adhd","add","tourette",
];

function addModuleIssues(
  ctx: z.RefinementCtx,
  moduleKey: string,
  schema: z.ZodTypeAny,
  value: unknown
) {
  const result = schema.safeParse(value ?? {});
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({ ...issue, path: [moduleKey, ...issue.path] } as z.IssueData);
    }
  }
}

/** Required-when-parent-is-Yes helper */
function requireIf(
  ctx: z.RefinementCtx,
  condition: boolean | undefined,
  path: (string | number)[],
  value: unknown,
  message = "This field is required"
) {
  const empty =
    value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  if (condition && empty) ctx.addIssue({ code: "custom", path, message });
}

/* -------------------------------------------------------------------------- */
/* DRAFT schema (lenient – used for save/resume and section navigation)       */
/* -------------------------------------------------------------------------- */

// Saving work in progress must not require a medication name yet. Reuse the
// submitted row shapes so field types, length limits and unknown-key stripping
// stay in place; the submission schemas above continue requiring names.
const draftMedicationItemSchema = medicationItemSchema.extend({ name: optText });
const draftDetailedMedicationItemSchema = detailedMedicationItemSchema.extend({ drugName: optText });

export const practiceApplicationDraftSchema = z
  .object({
    healthMedical: healthMedicalBase.extend({
      medical_current_medications: z.array(draftMedicationItemSchema).default([]),
    }).partial(),
    seizureModule: seizureModuleSchema.extend({
      seizure_medications: z.array(draftDetailedMedicationItemSchema).default([]),
    }).partial().optional(),
    respiratoryModule: respiratoryModuleSchema.extend({
      resp_medications: z.array(draftDetailedMedicationItemSchema).default([]),
    }).partial().optional(),
    cardioNeuroModule: cardioNeuroModuleSchema.extend({
      cardio_neuro_medications: z.array(draftDetailedMedicationItemSchema).default([]),
    }).partial().optional(),
    hypertensionModule: z.record(z.any()).optional(),
    diabetesModule: z.record(z.any()).optional(),
    arthritisModule: z.record(z.any()).optional(),
    asthmaModule: z.record(z.any()).optional(),
    cancerModule: z.record(z.any()).optional(),
    mentalHealth: mentalHealthBase.partial(),
    nicotineSmoking: nicotineBase.partial(),
    alcoholUse: alcoholBase.partial(),
    riskyBehavior: riskyBase.partial(),
    drivingRecord: drivingBase.partial(),
    criminalRecord: criminalBase.partial(),
    bankruptcy: bankruptcyBase.partial(),
    illegalDrugUse: drugBase.partial(),
    residencyTravel: residencyBase.partial(),
    occupationFinancial: occupationBase.partial(),
    militaryService: militaryBase.partial(),
    optionalContact: optionalContactBase.partial(),
    consents: consentsBase.partial(),
  })
  .partial();

/* -------------------------------------------------------------------------- */
/* SUBMIT schema (strict – conditional rules + consent gating)                */
/* -------------------------------------------------------------------------- */

export const practiceApplicationSubmitSchema = z
  .object(shape)
  .superRefine((app, ctx) => {
    const today = todayInCentral();
    const { dob, age } = app.healthMedical;
    if (isCalendarDate(dob) && dob <= today) {
      // Completed years; a February 29 birthday advances on March 1 in non-leap years.
      const expectedAge = Number(today.slice(0, 4)) - Number(dob.slice(0, 4))
        - (today.slice(5) < dob.slice(5) ? 1 : 0);
      if (age !== expectedAge)
        ctx.addIssue({
          code: "custom",
          path: ["healthMedical", "age"],
          message: "Age must match your date of birth as of today (Central Time).",
        });
    }

    const sel = app.healthMedical.conditions_triggered;

    /* ---- Health condition modules ---- */
    if (hasAny(sel, SEIZURE))
      addModuleIssues(ctx, "seizureModule", seizureModuleSchema, app.seizureModule);

    if (hasAny(sel, RESPIRATORY))
      addModuleIssues(ctx, "respiratoryModule", respiratoryModuleSchema, app.respiratoryModule);

    const cardioTriggered =
      hasAny(sel, CARDIO_NEURO) || app.healthMedical.medical_past2_heart_brain_circulatory_surgery;
    if (cardioTriggered)
      addModuleIssues(ctx, "cardioNeuroModule", cardioNeuroModuleSchema, app.cardioNeuroModule);

    if (sel.includes("High Blood Pressure"))
      addModuleIssues(ctx, "hypertensionModule", hypertensionModuleSchema, app.hypertensionModule);
    if (sel.includes("Diabetes 1 or 2"))
      addModuleIssues(ctx, "diabetesModule", diabetesModuleSchema, app.diabetesModule);
    if (sel.includes("Arthritis"))
      addModuleIssues(ctx, "arthritisModule", arthritisModuleSchema, app.arthritisModule);
    if (sel.includes("Asthma"))
      addModuleIssues(ctx, "asthmaModule", asthmaModuleSchema, app.asthmaModule);
    if (sel.includes("Cancer"))
      addModuleIssues(ctx, "cancerModule", cancerModuleSchema, app.cancerModule);

    // If any top-level "Yes" in a medical condition question, user should select the specific conditions
    const anyMedicalYes =
      app.healthMedical.medical_ever_major_conditions ||
      app.healthMedical.medical_past3_conditions_medicated ||
      app.healthMedical.medical_past7_cardio_conditions ||
      app.healthMedical.medical_past7_respiratory_conditions ||
      app.healthMedical.medical_past7_neuro_mental_conditions ||
      app.healthMedical.medical_past10_diabetes_cancer_cardiac;
    if (anyMedicalYes && sel.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["healthMedical", "conditions_triggered"],
        message: "Select the specific condition(s) that apply so we can show follow-up questions",
      });
    }

    requireIf(ctx, sel.includes("Other"), ["healthMedical", "medical_other_conditions"], app.healthMedical.medical_other_conditions, "Describe the other condition(s), diagnosis, and treatment");

    /* ---- Mental health ---- */
    const mh = app.mentalHealth;
    const mhText = (mh.mh_conditions ?? "").toLowerCase();
    const mhTriggered =
      mh.mh_history_current_treatment ||
      mh.mh_selected_conditions.length > 0 ||
      MH_TRIGGER_WORDS.some((w) => mhText.includes(w));

    requireIf(ctx, mh.mh_history_current_treatment, ["mentalHealth", "mh_conditions"], mh.mh_conditions);
    requireIf(ctx, mh.mh_psychiatrist_5y, ["mentalHealth", "mh_psychiatrist_details"], mh.mh_psychiatrist_details, "Provide date(s) and facility");
    requireIf(ctx, mh.mh_inpatient_5y, ["mentalHealth", "mh_inpatient_details"], mh.mh_inpatient_details, "Provide date(s) and facility");
    requireIf(ctx, mh.mh_unable_work_5y, ["mentalHealth", "mh_unable_work_details"], mh.mh_unable_work_details, "Provide date and duration");
    requireIf(ctx, mh.mh_suicide_attempt, ["mentalHealth", "mh_suicide_attempt_details"], mh.mh_suicide_attempt_details, "Provide full details");
    requireIf(ctx, mh.mh_disability_history, ["mentalHealth", "mh_disability_details"], mh.mh_disability_details, "Provide details");

    if (mhTriggered) {
      requireIf(ctx, true, ["mentalHealth", "mh_selected_conditions"], mh.mh_selected_conditions, "Check all conditions that apply");
      requireIf(ctx, true, ["mentalHealth", "mh_selected_dx_date"], mh.mh_selected_dx_date, "Provide date of diagnosis");
      requireIf(ctx, true, ["mentalHealth", "mh_selected_last_seen"], mh.mh_selected_last_seen, "Provide date last seen");
      requireIf(ctx, mh.mh_selected_conditions.includes("Other"), ["mentalHealth", "mh_selected_other_text"], mh.mh_selected_other_text, "Describe 'Other'");
      requireIf(ctx, mh.mh_selected_psychiatrist_5y, ["mentalHealth", "mh_selected_psychiatrist_details"], mh.mh_selected_psychiatrist_details);
      requireIf(ctx, mh.mh_selected_inpatient_5y, ["mentalHealth", "mh_selected_inpatient_details"], mh.mh_selected_inpatient_details);
      requireIf(ctx, mh.mh_selected_unable_work_5y, ["mentalHealth", "mh_selected_unable_work_details"], mh.mh_selected_unable_work_details);
      requireIf(ctx, mh.mh_selected_suicide_attempt, ["mentalHealth", "mh_selected_suicide_attempt_details"], mh.mh_selected_suicide_attempt_details);
      requireIf(ctx, mh.mh_selected_disability, ["mentalHealth", "mh_selected_disability_details"], mh.mh_selected_disability_details);
    }

    /* ---- Nicotine ---- */
    const n = app.nicotineSmoking;
    requireIf(ctx, n.nic_used_12m, ["nicotineSmoking", "nic_type_and_amount"], n.nic_type_and_amount, "Provide type and amount");
    if (n.nic_ever_used === false && (n.nic_used_12m || n.nic_used_36m || n.nic_used_12_3_5y))
      ctx.addIssue({ code: "custom", path: ["nicotineSmoking", "nic_ever_used"], message: "Never-use conflicts with the recent-use answers. Please review your nicotine history" });
    // Existing drafts with a last-use date remain valid without the new ever-use answer.
    requireIf(ctx, !n.nic_used_12m && n.nic_ever_used === undefined && !n.nic_date_last_used, ["nicotineSmoking", "nic_ever_used"], n.nic_ever_used, "Answer whether you have ever used tobacco or nicotine");
    requireIf(ctx, !n.nic_used_12m && n.nic_ever_used === true, ["nicotineSmoking", "nic_date_last_used"], n.nic_date_last_used, "Provide date last used");

    /* ---- Alcohol ---- */
    const a = app.alcoholUse;
    const alcYes =
      a.alc_past7_abuse_counseling || a.alc_past5_abuse_counseling || a.alc_past10_treated ||
      a.alc_history || a.alc_infractions;
    requireIf(ctx, alcYes, ["alcoholUse", "alc_details"], a.alc_details, "Provide dates, treatment, and details");

    /* ---- Risky behavior ---- */
    const r = app.riskyBehavior;
    requireIf(ctx, r.avi_future_2y, ["riskyBehavior", "avi_future_details"], r.avi_future_details);
    requireIf(ctx, r.avi_accident_grounded_fined, ["riskyBehavior", "avi_accident_details"], r.avi_accident_details);
    const pilotActivity = r.avi_flights_past12m || r.avi_flights_past24m || r.avi_future_2y;
    requireIf(ctx, pilotActivity, ["riskyBehavior", "avi_license_type"], r.avi_license_type, "Select certificate/license type");
    requireIf(ctx, pilotActivity, ["riskyBehavior", "avi_schedule_flying_time"], r.avi_schedule_flying_time, "Provide flying schedule");
    if (r.adv_participation.includes("Rock or mountain climbing")) {
      requireIf(ctx, true, ["riskyBehavior", "climb_years"], r.climb_years);
      requireIf(ctx, true, ["riskyBehavior", "climb_nature"], r.climb_nature);
    }
    if (r.adv_participation.includes("Organized racing of any kind") || r.race_intent.length) {
      requireIf(ctx, true, ["riskyBehavior", "race_track"], r.race_track);
      requireIf(ctx, true, ["riskyBehavior", "race_last_date"], r.race_last_date);
    }
    if (r.adv_participation.some((p) => p === "Scuba diving" || p === "Skin diving")) {
      requireIf(ctx, r.dive_certified === undefined, ["riskyBehavior", "dive_certified"], undefined);
      requireIf(ctx, r.dive_certified, ["riskyBehavior", "dive_certification_date"], r.dive_certification_date);
      requireIf(ctx, r.dive_certified, ["riskyBehavior", "dive_instruction_hours"], r.dive_instruction_hours);
      requireIf(ctx, r.dive_certified === false, ["riskyBehavior", "dive_not_certified_reason"], r.dive_not_certified_reason, "Explain why not certified");
      requireIf(ctx, true, ["riskyBehavior", "dive_max_depth"], r.dive_max_depth);
    }

    /* ---- Driving ---- */
    const d = app.drivingRecord;
    requireIf(ctx, d.drv_valid_license === false, ["drivingRecord", "drv_no_valid_license_details"], d.drv_no_valid_license_details, "Please explain your current license status.");
    const drvYes =
      d.drv_suspension_24m || d.drv_suspension_5y || d.drv_moving_violations_5y ||
      d.drv_careless_reckless_5y || d.drv_more_than_two_violations || d.drv_accidents;
    requireIf(ctx, drvYes, ["drivingRecord", "drv_details"], d.drv_details, "Provide dates, fault, and details");

    /* ---- Criminal ---- */
    const c = app.criminalRecord;
    const crimYes =
      c.crim_past6m_supervision || c.crim_felony_7y || c.crim_felony_10y || c.crim_supervision_10y ||
      c.crim_current_supervision || c.crim_past5y_guilty_convicted || c.crim_ever_guilty_convicted;
    requireIf(ctx, crimYes, ["criminalRecord", "crim_details"], c.crim_details, "Provide arrest/conviction dates and any jail, probation, or parole");

    /* ---- Bankruptcy ---- */
    const b = app.bankruptcy;
    requireIf(ctx, b.bk_has_filed, ["bankruptcy", "bk_type"], b.bk_type, "Select bankruptcy type");
    requireIf(ctx, b.bk_type === "Chapter 7", ["bankruptcy", "bk_chapter7_personal_or_business"], b.bk_chapter7_personal_or_business);
    requireIf(ctx, b.bk_has_filed, ["bankruptcy", "bk_discharged"], b.bk_discharged);
    requireIf(ctx, b.bk_has_filed, ["bankruptcy", "bk_in_process"], b.bk_in_process);
    requireIf(ctx, b.bk_has_filed && b.bk_discharged !== undefined, ["bankruptcy", "bk_discharge_date"], b.bk_discharge_date, "Provide discharge or anticipated discharge date");

    /* ---- Drugs ---- */
    const g = app.illegalDrugUse;
    const drugYes =
      g.drug_past2y || g.drug_past5y || g.drug_ever_listed || g.drug_past7y_prescription_advice ||
      g.drug_marijuana_24m || g.drug_past10y_treated || g.drug_current_history;
    requireIf(ctx, drugYes, ["illegalDrugUse", "drug_details"], g.drug_details, "Provide substance, dates, and treatment");

    /* ---- Residency ---- */
    const rs = app.residencyTravel;
    requireIf(ctx, rs.res_lived_us_5y === false, ["residencyTravel", "res_lived_us_5y_details"], rs.res_lived_us_5y_details, "Please describe where you lived during the past five years.");
    requireIf(ctx, rs.res_citizen_or_resident === "Other", ["residencyTravel", "res_non_us_status"], rs.res_non_us_status, "Provide immigration status or visa type");
    requireIf(ctx, rs.res_high_risk_countries_2y, ["residencyTravel", "res_high_risk_countries_details"], rs.res_high_risk_countries_details, "Provide countries, dates, and purpose");
    requireIf(ctx, rs.res_travel_outside_us_24m, ["residencyTravel", "res_travel_outside_us_details"], rs.res_travel_outside_us_details, "Where?");

    /* ---- Occupation ---- */
    requireIf(ctx, app.occupationFinancial.occ_full_time_6mo === false, ["occupationFinancial", "occ_full_time_6mo_details"], app.occupationFinancial.occ_full_time_6mo_details, "Please explain your employment status during the past six months.");
    requireIf(ctx, app.occupationFinancial.occ_high_risk_occupation, ["occupationFinancial", "occ_high_risk_details"], app.occupationFinancial.occ_high_risk_details, "Provide details");

    /* ---- Military ---- */
    const m = app.militaryService;
    if (m.mil_active_duty) {
      requireIf(ctx, true, ["militaryService", "mil_deployment"], m.mil_deployment);
      requireIf(ctx, true, ["militaryService", "mil_job_rank"], m.mil_job_rank, "Provide job title and rank");
      requireIf(ctx, true, ["militaryService", "mil_aircraft_duties"], m.mil_aircraft_duties);
    }

    /* ---- Transmission / consent gating ---- */
    const ct = app.optionalContact;
    requireIf(ctx, true, ["optionalContact", "contact_name"], ct.contact_name, "Name is required to send a copy");
    requireIf(ctx, true, ["optionalContact", "contact_email"], ct.contact_email, "Email is required to send a copy");
    requireIf(ctx, true, ["optionalContact", "contact_phone"], ct.contact_phone, "Cell phone is required to send a copy");

    if (!app.consents.consent_contact)
      ctx.addIssue({
        code: "custom",
        path: ["consents", "consent_contact"],
        message: "You must consent to contact before submitting",
      });
    if (!app.consents.consent_disclaimer)
      ctx.addIssue({
        code: "custom",
        path: ["consents", "consent_disclaimer"],
        message: "You must acknowledge the disclaimer before submitting",
      });
  });

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PracticeApplicationDraft = z.infer<typeof practiceApplicationDraftSchema>;
export type PracticeApplicationSubmit = z.infer<typeof practiceApplicationSubmitSchema>;
export type MedicationItem = z.infer<typeof medicationItemSchema>;

/* -------------------------------------------------------------------------- */
/* Consent helper for the flashing red/blue UI                                */
/* -------------------------------------------------------------------------- */

export function getMissingConsents(consents: { consent_contact?: boolean; consent_disclaimer?: boolean }) {
  const missing: Array<"consent_contact" | "consent_disclaimer"> = [];
  if (!consents.consent_contact) missing.push("consent_contact");
  if (!consents.consent_disclaimer) missing.push("consent_disclaimer");
  return missing;
}

export const canTransmit = (consents: Parameters<typeof getMissingConsents>[0]) =>
  getMissingConsents(consents).length === 0;
