/** Deterministic email presentation only. It makes no eligibility decisions and performs no I/O. */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
}
export interface DetailedMedication {
  drugName: string;
  dosage?: string;
  startDate?: string;
  adherence?: string;
  frequency?: string;
  lastFillDate?: string;
  conditionTreated?: string;
}
export interface HealthMedical {
  dob: string;
  age: number;
  stateOfBirth: string;
  genderSex: string;
  medical_past12_obesity_decline_pending: boolean;
  medical_past12_consult_surgery_hospital_test: boolean;
  medical_ever_major_conditions: boolean;
  medical_past2_heart_brain_circulatory_surgery: boolean;
  medical_past3_conditions_medicated: boolean;
  medical_past5_internal_cancer: boolean;
  medical_hiv_aids: boolean;
  medical_past5_checkups_labs_consults: boolean;
  medical_past7_cardio_conditions: boolean;
  medical_past7_digestive_liver_conditions: boolean;
  medical_past7_respiratory_conditions: boolean;
  medical_sleep_apnea_6mo_not_treated: boolean;
  medical_past7_neuro_mental_conditions: boolean;
  medical_past7_renal_repro_std_conditions: boolean;
  medical_past7_connective_tissue_conditions: boolean;
  medical_past10_bp_cholesterol_meds: boolean;
  medical_past10_diabetes_cancer_cardiac: boolean;
  medical_diabetes_prior21_insulin_or_complications: boolean;
  medical_work_disability: boolean;
  medical_currently_hospitalized_or_needs_adl_help: boolean;
  medical_recent_assistive_devices: boolean;
  medical_organ_transplant: boolean;
  medical_confined_facility_now: boolean;
  medical_family_history_kidney_transplant_heart_cancer: boolean;
  medical_family_history_multiple_early_deaths: boolean;
  medical_treatment_given?: string;
  medical_current_medications: Medication[];
  conditions_triggered: string[];
  medical_other_conditions?: string;
}
export interface MentalHealth {
  mh_history_current_treatment: boolean;
  mh_conditions?: string;
  mh_mild_situational_recent: boolean;
  mh_medications?: string;
  mh_dx_date?: string;
  mh_last_seen?: string;
  mh_psychiatrist_5y: boolean;
  mh_psychiatrist_details?: string;
  mh_inpatient_5y: boolean;
  mh_inpatient_details?: string;
  mh_unable_work_5y: boolean;
  mh_unable_work_details?: string;
  mh_suicidal_thoughts: boolean;
  mh_suicide_attempt: boolean;
  mh_suicide_attempt_details?: string;
  mh_disability_history: boolean;
  mh_disability_details?: string;
  mh_selected_conditions: string[];
  mh_selected_other_text?: string;
  mh_rx_details?: string;
  mh_selected_dx_date?: string;
  mh_selected_last_seen?: string;
  mh_selected_psychiatrist_5y?: boolean;
  mh_selected_psychiatrist_details?: string;
  mh_selected_inpatient_5y?: boolean;
  mh_selected_inpatient_details?: string;
  mh_selected_unable_work_5y?: boolean;
  mh_selected_unable_work_details?: string;
  mh_selected_suicidal_thoughts?: boolean;
  mh_selected_suicide_attempt?: boolean;
  mh_selected_suicide_attempt_details?: string;
  mh_selected_disability?: boolean;
  mh_selected_disability_details?: string;
}
export interface NicotineSmoking {
  nic_ever_used?: boolean;
  nic_used_12_3_5y: boolean;
  nic_used_36m: boolean;
  nic_used_12m: boolean;
  nic_products: string[];
  nic_type_and_amount?: string;
  nic_date_last_used?: string;
}
export interface AlcoholUse {
  alc_past7_abuse_counseling: boolean;
  alc_past5_abuse_counseling: boolean;
  alc_past10_treated: boolean;
  alc_history: boolean;
  alc_infractions: boolean;
  alc_details?: string;
}
export interface RiskyBehavior {
  avi_flights_past12m: boolean;
  avi_flights_past24m: boolean;
  avi_future_2y: boolean;
  avi_future_details?: string;
  avi_license_type?: string;
  avi_accident_grounded_fined?: boolean;
  avi_accident_details?: string;
  avi_hours_pilot?: number;
  avi_hours_crew?: number;
  avi_schedule_flying_time?: string;
  avi_other_flying_details?: string;
  adv_participation: string[];
  climb_years?: string;
  climb_regions?: string;
  climb_nature?: string;
  climb_bolts?: string;
  climb_no_rope?: string;
  race_intent: string[];
  race_track?: string;
  race_professional?: boolean;
  race_last_date?: string;
  dive_certified?: boolean;
  dive_instruction_hours?: number;
  dive_certification_date?: string;
  dive_not_certified_reason?: string;
  dive_max_depth?: string;
  dive_schedule?: string;
  dive_equipment?: string;
  dive_locations: string[];
  dive_salvage_exploration?: boolean;
  dive_club_member?: boolean;
}
export interface DrivingRecord {
  drv_valid_license: boolean;
  drv_suspension_24m: boolean;
  drv_suspension_5y: boolean;
  drv_moving_violations_5y: boolean;
  drv_careless_reckless_5y: boolean;
  drv_more_than_two_violations: boolean;
  drv_accidents: boolean;
  drv_details?: string;
}
export interface CriminalRecord {
  crim_past6m_supervision: boolean;
  crim_felony_7y: boolean;
  crim_felony_10y: boolean;
  crim_supervision_10y: boolean;
  crim_current_supervision: boolean;
  crim_past5y_guilty_convicted: boolean;
  crim_ever_guilty_convicted: boolean;
  crim_details?: string;
}
export interface Bankruptcy {
  bk_has_filed: boolean;
  bk_type?: string;
  bk_chapter7_personal_or_business?: string;
  bk_discharged?: boolean;
  bk_discharge_date?: string;
  bk_in_process?: boolean;
}
export interface IllegalDrugUse {
  drug_past2y: boolean;
  drug_past5y: boolean;
  drug_ever_listed: boolean;
  drug_past7y_prescription_advice: boolean;
  drug_marijuana_24m: boolean;
  drug_past10y_treated: boolean;
  drug_current_history: boolean;
  drug_details?: string;
}
export interface ResidencyTravel {
  res_citizen_or_resident: string;
  res_non_us_status?: string;
  res_high_risk_countries_2y: boolean;
  res_high_risk_countries_details?: string;
  res_travel_outside_us_24m: boolean;
  res_travel_outside_us_details?: string;
  res_lived_us_5y: boolean;
  res_move_back_native_country: boolean;
  res_foreign_travel_details?: string;
}
export interface OccupationFinancial {
  occ_current_occupation: string;
  occ_annual_salary: number;
  occ_full_time_6mo: boolean;
  occ_weapon: boolean;
  occ_high_risk_occupation: boolean;
  occ_high_risk_details?: string;
}
export interface MilitaryService {
  mil_active_duty: boolean;
  mil_deployment?: boolean;
  mil_flying_time?: string;
  mil_flight_type: string[];
  mil_job_rank?: string;
  mil_aircraft_duties?: boolean;
}
export interface OptionalContact {
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_preferred_time?: string;
}
export interface Consents {
  consent_contact: boolean;
  consent_disclaimer: boolean;
}
export interface SeizureModule {
  seizure_diagnosis: string;
  seizure_diagnosis_date: string;
  seizure_age_at_onset: number;
  seizure_total_count: number;
  seizure_most_recent_date: string;
  seizure_frequency: string;
  seizure_treatments: string;
  seizure_medications: DetailedMedication[];
  seizure_physician_name: string;
  seizure_physician_address: string;
  seizure_physician_phone: string;
  seizure_last_visit: string;
  seizure_last_visit_reason_result: string;
  seizure_hospital_visits?: string;
  seizure_pending_tests?: string;
  seizure_classification_simple_partial_check?: boolean;
  seizure_classification_epilepsy_control?: string;
  seizure_polytherapy?: boolean;
  seizure_underlying_cause?: string;
  seizure_injuries_accidents?: string;
  seizure_driving_status?: string;
  seizure_functional_limitations?: string;
  seizure_assistance_needed?: string;
}
export interface RespiratoryModule {
  resp_diagnosis: string;
  resp_date_first_diagnosed: string;
  resp_age_at_onset: number;
  resp_symptoms_frequency: string;
  resp_treatments: string;
  resp_medications: DetailedMedication[];
  resp_physician_name: string;
  resp_physician_address: string;
  resp_physician_phone: string;
  resp_last_visit: string;
  resp_last_visit_reason_result: string;
  resp_hospital_visits?: string;
  resp_pending_tests?: string;
  copd_history?: string;
  copd_pft_results?: string;
  copd_sob?: boolean;
  copd_stairs_tolerance?: boolean;
  copd_oxygen_nebulizer_steroids?: boolean;
  copd_nicotine_history?: string;
  copd_other_conditions?: string;
  sleep_type?: string;
  sleep_confirmation_method?: string;
  sleep_ahi_rdi?: string;
  sleep_treatment: string[];
  sleep_pap_compliance?: string;
  sleep_control_status?: string;
  sleep_repeat_study?: string;
  sleep_functional_limitations?: string;
  sleep_cardio_complications?: string;
  sleep_comorbidities?: string;
  sleep_driving_restrictions?: string;
}
export interface CardioNeuroModule {
  cardio_neuro_diagnosis: string;
  cardio_neuro_date: string;
  cardio_neuro_age: number;
  cardio_neuro_episode_count: number;
  cardio_neuro_recent_date: string;
  cardio_neuro_status: string;
  cardio_neuro_hospitalization?: string;
  cardio_neuro_treatments: string;
  cardio_neuro_medications: DetailedMedication[];
  cardio_neuro_blood_thinners: boolean;
  cardio_neuro_physician_name: string;
  cardio_neuro_physician_address?: string;
  cardio_neuro_physician_phone?: string;
  cardio_neuro_last_visit?: string;
  cardio_neuro_followup_gaps?: string;
  cardio_neuro_pending_tests?: string;
  stroke_root_cause?: string;
  stroke_imaging_results?: string;
  stroke_on_anticoagulated?: boolean;
  stroke_residual_effects?: string;
  stroke_cognitive_impairment?: string;
  stroke_pfo_asd_history?: string;
  stroke_carotid_ultrasound?: string;
  stroke_therapy_last_3_12_months?: string;
  mi_supporting_evidence?: string;
  mi_procedure_details?: string;
  mi_vessels_affected?: number;
  mi_ongoing_symptoms?: string;
  mi_residual_damage?: string;
  mi_recent_workup?: string;
  cardio_limitations?: string;
  cardio_work_status?: string;
  cardio_return_to_work?: string;
  cardio_disability_benefits?: string;
  cardio_adl_iadl_help?: string;
  cardio_medical_equipment?: string;
  cardio_confinement_status?: string;
  cardio_height_weight?: string;
  cardio_weight_change_10lbs?: boolean;
  cardio_nicotine_history?: string;
  cardio_bp_history?: string;
  cardio_lipid_panel?: string;
  cardio_diabetes_history?: string;
  cardio_other_comorbidities?: string;
  cardio_family_history?: string;
}
export interface HypertensionModule {
  htn_dx_date: string;
  htn_meds_last12months: boolean;
  htn_current_meds: Medication[];
  htn_last_doctor_visit: string;
  htn_last_bp: string;
  htn_bp_normal_or_elevated_if_unknown?: string;
  htn_med_change: boolean;
  htn_med_change_details?: string;
  htn_compliant: boolean;
  htn_other_conditions?: string;
  htn_hospitalized_5y: boolean;
  htn_hospitalized_date?: string;
  htn_unable_to_work_5y: boolean;
  htn_unable_to_work_details?: string;
}
export interface DiabetesModule {
  dm_dx_date: string;
  dm_control_method: string[];
  dm_insulin_start_date?: string;
  dm_current_meds: Medication[];
  dm_last_blood_sugar: string;
  dm_last_blood_sugar_date: string;
  dm_last_a1c: string;
  dm_last_a1c_date: string;
  dm_reading_unknown?: string;
  dm_med_change: boolean;
  dm_med_change_details?: string;
  dm_compliant: boolean;
  dm_noncompliance_details?: string;
  dm_complications: string[];
  dm_er_hospital_5y: boolean;
  dm_er_hospital_details?: string;
}
export interface ArthritisModule {
  arth_type: string;
  arth_joints: string;
  arth_duration: string;
  arth_last_flare?: string;
  arth_unable_work_5y: boolean;
  arth_unable_work_details?: string;
  arth_assistive_devices?: string;
  arth_symptoms?: string;
  arth_regular_medication?: boolean;
  arth_medication_name?: string;
  arth_medication_dosage?: string;
  arth_last_doctor_visit?: string;
  arth_additional_comments?: string;
}
export interface AsthmaModule {
  asthma_dx_date: string;
  asthma_last_attack?: string;
  asthma_attacks_per_year?: number;
  asthma_triggers?: string;
  asthma_current_meds: Medication[];
  asthma_steroid_use?: boolean;
  asthma_steroid_last_used?: string;
  asthma_hospitalized_5y?: boolean;
  asthma_er_visits?: boolean;
  asthma_status_asthmaticus?: boolean;
  asthma_status_asthmaticus_date?: string;
  asthma_allergy_caused?: boolean;
}
export interface CancerModule {
  cancer_tumor_diagnosed_as_cancer: boolean;
  cancer_dx_date: string;
  cancer_location_diagnosis: string;
  cancer_stage_size_classification?: string;
  cancer_nodes_spread?: boolean;
  cancer_nodes_spread_details?: string;
  cancer_surgery_5y?: boolean;
  cancer_surgery_details?: string;
  cancer_chemo_radiation_5y?: boolean;
  cancer_last_treatment_date?: string;
  cancer_other_treatments_5y?: boolean;
  cancer_other_treatment_details?: string;
  cancer_tamoxifen_femara?: boolean;
  cancer_tamoxifen_femara_last_used?: string;
  cancer_doctor_frequency_last_seen?: string;
}
export interface EmailApplication {
  healthMedical: HealthMedical;
  mentalHealth: MentalHealth;
  nicotineSmoking: NicotineSmoking;
  alcoholUse: AlcoholUse;
  riskyBehavior: RiskyBehavior;
  drivingRecord: DrivingRecord;
  criminalRecord: CriminalRecord;
  bankruptcy: Bankruptcy;
  illegalDrugUse: IllegalDrugUse;
  residencyTravel: ResidencyTravel;
  occupationFinancial: OccupationFinancial;
  militaryService: MilitaryService;
  optionalContact: OptionalContact;
  consents: Consents;
  seizureModule?: SeizureModule;
  respiratoryModule?: RespiratoryModule;
  cardioNeuroModule?: CardioNeuroModule;
  hypertensionModule?: HypertensionModule;
  diabetesModule?: DiabetesModule;
  arthritisModule?: ArthritisModule;
  asthmaModule?: AsthmaModule;
  cancerModule?: CancerModule;
}
export type ApplicationInput = {
  [S in keyof EmailApplication]?: Partial<NonNullable<EmailApplication[S]>>;
};
export type Section = keyof EmailApplication;
export type Category = Exclude<Section, "optionalContact" | "consents" | `${string}Module`>;
export type FieldPath = {
  [S in Section]: `${S}.${Extract<keyof NonNullable<EmailApplication[S]>, string>}`;
}[Section];
type ParentCondition = {
  [S in Section]: {
    section: S;
    field: Extract<keyof NonNullable<EmailApplication[S]>, string>;
    equals?: string | boolean;
    includes?: string;
    nonempty?: boolean;
    mentalHealthText?: boolean;
  };
}[Section];
export interface FieldRule {
  /** Exact worksheet prompt or accessible control label, kept separate from the takeaway. */
  question: string;
  label: string;
  kind: "string" | "number" | "boolean" | "array" | "medications" | "detailedMedications";
  risk: "true" | "false" | "present" | "residency" | "none";
  flagLabel?: string;
  flagExplanation?: string;
  when?: readonly ParentCondition[];
}
type FieldKind<T> =
  NonNullable<T> extends boolean
    ? "boolean"
    : NonNullable<T> extends number
      ? "number"
      : NonNullable<T> extends DetailedMedication[]
        ? "detailedMedications"
        : NonNullable<T> extends Medication[]
          ? "medications"
          : NonNullable<T> extends string[]
            ? "array"
            : "string";
type TypedFieldRule<T> = Omit<FieldRule, "kind"> & { kind: FieldKind<T> };
export type FieldRegistry = {
  [S in Section]-?: {
    [K in keyof NonNullable<EmailApplication[S]>]-?: TypedFieldRule<
      NonNullable<EmailApplication[S]>[K]
    >;
  };
};
export const FIELD_REGISTRY = {
  healthMedical: {
    dob: {
      question: "Date of Birth",
      label: "Date of Birth",
      kind: "string",
      risk: "none",
    },
    age: {
      question: "Age",
      label: "Age",
      kind: "number",
      risk: "none",
    },
    stateOfBirth: {
      question: "State of Birth",
      label: "Birth State",
      kind: "string",
      risk: "none",
    },
    genderSex: {
      question: "Gender / Sex",
      label: "Gender / Sex",
      kind: "string",
      risk: "none",
    },
    medical_past12_obesity_decline_pending: {
      question:
        "Within the past 12 months: surgical treatment for morbid obesity, declined for life insurance, or recommended diagnostic testing/surgery/hospitalization not completed or results not received?",
      label: "Past 12 Mo: Obesity Surgery, Prior Insurance Decline, or Pending Tests / Surgery",
      kind: "boolean",
      risk: "true",
    },
    medical_past12_consult_surgery_hospital_test: {
      question:
        "Within the past 12 months: consulted a medical professional, had surgery, hospitalized, or had diagnostic tests (EKG, X-ray, MRI, CAT scan; excluding HIV/AIDS)?",
      label: "Past 12 Mo: Medical Consultation, Surgery, Hospitalization, or Diagnostic Tests",
      kind: "boolean",
      risk: "true",
    },
    medical_ever_major_conditions: {
      question:
        "Ever diagnosed/treated for angina, stroke or TIA, cardiomyopathy, SLE, cirrhosis, Hepatitis C, chronic hepatitis, chronic pancreatitis, COPD, emphysema, chronic bronchitis, or required oxygen?",
      label: "History of Major Heart, Neurologic, Liver, or Respiratory Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_past2_heart_brain_circulatory_surgery: {
      question:
        "Within the past 2 years: heart attack or aneurysm, or heart/brain/circulatory surgery or procedure (incl. pacemaker, defibrillator) had or advised?",
      label: "Past 2 Yr: Heart Attack, Aneurysm, or Heart / Brain / Circulatory Procedure",
      kind: "boolean",
      risk: "true",
    },
    medical_past3_conditions_medicated: {
      question:
        "Within the past 3 years: treated/diagnosed/prescribed medication for chronic bronchitis, emphysema, COPD, irregular heartbeat, seizures, blood clot, or aneurysm?",
      label: "Past 3 Yr: Respiratory, Heart Rhythm, Seizure, Clot, or Aneurysm Treatment",
      kind: "boolean",
      risk: "true",
    },
    medical_past5_internal_cancer: {
      question:
        "Within the past 5 years: treated for internal cancer, melanoma, Hodgkin’s disease, or lymphoma?",
      label: "Past 5 Yr: Internal Cancer, Melanoma, Hodgkin's Disease, or Lymphoma",
      kind: "boolean",
      risk: "true",
    },
    medical_hiv_aids: {
      question:
        "Ever diagnosed, treated, tested positive, or received medical advice for HIV or AIDS?",
      label: "HIV / AIDS Diagnosis, Positive Test, Treatment, or Advice",
      kind: "boolean",
      risk: "true",
    },
    medical_past5_checkups_labs_consults: {
      question:
        "Within the past 5 years: any check-ups, laboratory studies (excluding HIV), or medical consultations?",
      label: "Past 5 Yr: Checkups, Laboratory Studies, or Medical Consultations",
      kind: "boolean",
      risk: "true",
    },
    medical_past7_cardio_conditions: {
      question:
        "Within the past 7 years: high blood pressure, heart attack, angina, arrhythmia, stroke, aneurysm, or any heart/circulatory disorder?",
      label: "Past 7 Yr: Blood Pressure, Heart, Stroke, or Circulatory Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_past7_digestive_liver_conditions: {
      question:
        "Within the past 7 years: diabetes, cirrhosis, hepatitis, pancreatitis, Crohn’s, ulcerative colitis, or any digestive/liver disorder?",
      label: "Past 7 Yr: Diabetes, Digestive, Pancreatic, or Liver Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_past7_respiratory_conditions: {
      question:
        "Within the past 7 years: asthma, emphysema, COPD, sleep apnea, or any respiratory disorder?",
      label: "Past 7 Yr: Asthma, Emphysema, COPD, Sleep Apnea, or Respiratory Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_sleep_apnea_6mo_not_treated: {
      question: "Diagnosed with sleep apnea within the last 6 months, or not being treated?",
      label: "Sleep Apnea Diagnosed in Past 6 Mo or Not Being Treated",
      kind: "boolean",
      risk: "true",
    },
    medical_past7_neuro_mental_conditions: {
      question:
        "Within the past 7 years: cancer, anemia, seizures, bipolar, schizophrenia, Alzheimer’s, dementia, or mental/nervous disorder?",
      label: "Past 7 Yr: Cancer, Anemia, Seizures, Cognitive, Mental, or Nervous Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_past7_renal_repro_std_conditions: {
      question:
        "Within the past 7 years: kidney, bladder, prostate, reproductive organ disorder, or sexually transmitted disease?",
      label:
        "Past 7 Yr: Kidney, Bladder, Prostate, Reproductive, or Sexually Transmitted Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_past7_connective_tissue_conditions: {
      question:
        "Within the past 7 years: connective tissue disease, SLE, arthritis, or disorder of back, joints, muscles, or nervous system?",
      label:
        "Past 7 Yr: Connective Tissue, Lupus, Arthritis, Back, Joint, Muscle, or Nerve Conditions",
      kind: "boolean",
      risk: "true",
    },
    medical_past10_bp_cholesterol_meds: {
      question: "In the past 10 years: medication for high blood pressure or elevated cholesterol?",
      label: "Past 10 Yr: Blood Pressure or Cholesterol Medication",
      kind: "boolean",
      risk: "true",
    },
    medical_past10_diabetes_cancer_cardiac: {
      question:
        "In the past 10 years: diagnosed, tested, or treated for diabetes, cancer, or cardiac disease?",
      label: "Past 10 Yr: Diabetes, Cancer, or Cardiac Disease",
      kind: "boolean",
      risk: "true",
    },
    medical_diabetes_prior21_insulin_or_complications: {
      question:
        "Treated for diabetes before age 21, currently on insulin, or diabetes with retinopathy, nephropathy, neuropathy, insulin shock, or diabetic coma?",
      label: "Diabetes Before Age 21, Insulin Use, or Diabetic Complications",
      kind: "boolean",
      risk: "true",
    },
    medical_work_disability: {
      question:
        "Currently unemployed for medical reasons, prohibited from full-time work due to illness/injury, or receiving disability benefits/pension?",
      label: "Medical Unemployment, Work Restrictions, or Disability Benefits",
      kind: "boolean",
      risk: "true",
    },
    medical_currently_hospitalized_or_needs_adl_help: {
      question:
        "Currently hospitalized, in a nursing facility, on hospice/home health care, or need assistance with bathing, dressing, eating, toileting?",
      label: "Currently Hospitalized or Requires ADL Assistance",
      kind: "boolean",
      risk: "true",
    },
    medical_recent_assistive_devices: {
      question:
        "Within the past 12 months: used a walker, wheelchair, electric scooter, supplemental oxygen, or catheter?",
      label: "Past 12 Mo: Mobility Aids, Oxygen, or Catheter",
      kind: "boolean",
      risk: "true",
    },
    medical_organ_transplant: {
      question: "Have you been the recipient of an organ transplant?",
      label: "Organ Transplant Recipient",
      kind: "boolean",
      risk: "true",
    },
    medical_confined_facility_now: {
      question: "Currently confined to any hospital or medical/rehabilitation facility?",
      label: "Currently Confined to a Medical or Rehabilitation Facility",
      kind: "boolean",
      risk: "true",
    },
    medical_family_history_kidney_transplant_heart_cancer: {
      question:
        "Has a natural parent, brother, or sister had kidney disease, major organ transplant, heart disease, cerebrovascular disease, or internal cancer before age 60?",
      label:
        "Family Kidney Disease, Transplant, Heart / Cerebrovascular Disease, or Cancer Before 60",
      kind: "boolean",
      risk: "true",
    },
    medical_family_history_multiple_early_deaths: {
      question:
        "Has more than one family member (father, mother, brother, sister) died before 60 from breast, colon, intestinal, or prostate cancer, or cardiovascular disease?",
      label: "Multiple Family Deaths Before 60 from Specified Cancers or Cardiovascular Disease",
      kind: "boolean",
      risk: "true",
    },
    medical_treatment_given: {
      question: "What specific treatment was given or medication prescribed for your conditions?",
      label: "Medical Treatment Details",
      kind: "string",
      risk: "none",
    },
    medical_current_medications: {
      question: "All current medications, including herb and vitamin supplements",
      label: "Current Medications",
      kind: "medications",
      risk: "present",
    },
    conditions_triggered: {
      question:
        "Which of these conditions apply to you? (Selecting one opens follow-up questions below.)",
      label: "Disclosed Medical Conditions",
      kind: "array",
      risk: "present",
    },
    medical_other_conditions: {
      question: "Other condition(s): diagnosis and treatment",
      label: "Other Medical Conditions, Diagnosis, and Treatment",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Other" }],
    },
  },
  mentalHealth: {
    mh_history_current_treatment: {
      question:
        "Do you have any history of or current treatment for psychological, mood, or anxiety disorders?",
      label: "Mental Health History or Current Treatment",
      kind: "boolean",
      risk: "true",
    },
    mh_conditions: {
      question: "What mental health, nervous, or psychiatric conditions apply to you?",
      label: "Mental Health Conditions and History",
      kind: "string",
      risk: "none",
    },
    mh_mild_situational_recent: {
      question:
        "Diagnosed with Mild or Situational Depression or Anxiety within the last 6 months, or hospitalized for it?",
      label: "Recent Mild or Situational Mental Health Symptoms",
      kind: "boolean",
      risk: "true",
    },
    mh_medications: {
      question: "Current prescription medications for this condition (names, dosage, frequency)",
      label: "Mental Health Medications",
      kind: "string",
      risk: "none",
    },
    mh_dx_date: {
      question: "When was the condition diagnosed?",
      label: "Mental Health Diagnosis Date",
      kind: "string",
      risk: "none",
    },
    mh_last_seen: {
      question: "When were you last seen for it?",
      label: "Mental Health Last Visit",
      kind: "string",
      risk: "none",
    },
    mh_psychiatrist_5y: {
      question: "Past 5 years: seen a psychiatrist or had hospital outpatient treatment?",
      label: "Past 5 Yr: Psychiatrist Care",
      kind: "boolean",
      risk: "true",
    },
    mh_psychiatrist_details: {
      question: "Date(s) and hospital/clinic",
      label: "Psychiatrist Care Dates and Facility",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_psychiatrist_5y", equals: true }],
    },
    mh_inpatient_5y: {
      question: "Past 5 years: inpatient at a hospital or clinic?",
      label: "Past 5 Yr: Psychiatric Inpatient Care",
      kind: "boolean",
      risk: "true",
    },
    mh_inpatient_details: {
      question: "Date(s) and hospital/clinic",
      label: "Psychiatric Inpatient Dates and Facility",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_inpatient_5y", equals: true }],
    },
    mh_unable_work_5y: {
      question: "Past 5 years: unable to work due to your condition?",
      label: "Past 5 Yr: Unable to Work Due to Mental Health",
      kind: "boolean",
      risk: "true",
    },
    mh_unable_work_details: {
      question: "Date and duration of each absence",
      label: "Mental Health Work Disability Dates and Duration",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_unable_work_5y", equals: true }],
    },
    mh_suicidal_thoughts: {
      question: "Have you had any suicidal thoughts?",
      label: "Suicidal Thoughts",
      kind: "boolean",
      risk: "true",
    },
    mh_suicide_attempt: {
      question: "Have you attempted suicide?",
      label: "Suicide Attempt History",
      kind: "boolean",
      risk: "true",
    },
    mh_suicide_attempt_details: {
      question: "Full details, including date and follow-up treatment",
      label: "Suicide Attempt Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_suicide_attempt", equals: true }],
    },
    mh_disability_history: {
      question: "Have you ever been on disability?",
      label: "Mental Health Disability History",
      kind: "boolean",
      risk: "true",
    },
    mh_disability_details: {
      question: "Provide details",
      label: "Mental Health Disability Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_disability_history", equals: true }],
    },
    mh_selected_conditions: {
      question: "Please check all conditions that apply",
      label: "Selected Mental Health Conditions",
      kind: "array",
      risk: "present",
    },
    mh_selected_other_text: {
      question: "Other (describe)",
      label: "Other Mental Health Condition",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_selected_conditions", includes: "Other" }],
    },
    mh_rx_details: {
      question: "Current prescription medications (RX names, dosage, how often taken)",
      label: "Mental Health Prescription Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_dx_date: {
      question: "Date of diagnosis",
      label: "Selected Condition Diagnosis Date",
      kind: "string",
      risk: "none",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_last_seen: {
      question: "Date last seen for condition",
      label: "Selected Condition Last Visit",
      kind: "string",
      risk: "none",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_psychiatrist_5y: {
      question: "Past 5 years: psychiatrist or hospital outpatient treatment?",
      label: "Selected Condition: Psychiatrist Care in Past 5 Yr",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_psychiatrist_details: {
      question: "Date(s) and hospital/clinic",
      label: "Selected Condition: Psychiatrist Care Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_selected_psychiatrist_5y", equals: true }],
    },
    mh_selected_inpatient_5y: {
      question: "Past 5 years: in-patient at a hospital or clinic?",
      label: "Selected Condition: Inpatient Care in Past 5 Yr",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_inpatient_details: {
      question: "Date(s) and hospital/clinic",
      label: "Selected Condition: Inpatient Care Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_selected_inpatient_5y", equals: true }],
    },
    mh_selected_unable_work_5y: {
      question: "Past 5 years: unable to work due to your condition?",
      label: "Selected Condition: Unable to Work in Past 5 Yr",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_unable_work_details: {
      question: "Date and duration of each absence",
      label: "Selected Condition: Work Disability Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_selected_unable_work_5y", equals: true }],
    },
    mh_selected_suicidal_thoughts: {
      question: "Have you had any suicidal thoughts?",
      label: "Selected Condition: Suicidal Thoughts",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_suicide_attempt: {
      question: "Have you attempted suicide?",
      label: "Selected Condition: Suicide Attempt",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_suicide_attempt_details: {
      question: "Full details, including date and follow-up treatment",
      label: "Selected Condition: Suicide Attempt Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_selected_suicide_attempt", equals: true }],
    },
    mh_selected_disability: {
      question: "Have you ever been on disability?",
      label: "Selected Condition: Disability",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "mentalHealth", field: "mh_history_current_treatment", equals: true },
        { section: "mentalHealth", field: "mh_selected_conditions", nonempty: true },
        { section: "mentalHealth", field: "mh_conditions", mentalHealthText: true },
      ],
    },
    mh_selected_disability_details: {
      question: "Provide details",
      label: "Selected Condition: Disability Details",
      kind: "string",
      risk: "none",
      when: [{ section: "mentalHealth", field: "mh_selected_disability", equals: true }],
    },
  },
  nicotineSmoking: {
    nic_ever_used: {
      question: "Have you ever used tobacco or nicotine products in any form?",
      label: "Ever Used Tobacco or Nicotine",
      kind: "boolean",
      risk: "true",
    },
    nic_used_12_3_5y: {
      question:
        "Has the proposed insured used nicotine, tobacco, vape, or e-cigarettes within the past 12 months, 3 years, or 5 years? (excluding occasional cigar or pipe use)",
      label: "Tobacco / Nicotine Use in Stated 12-Month, 3-Year, or 5-Year Period",
      kind: "boolean",
      risk: "true",
    },
    nic_used_36m: {
      question:
        "During the past 36 months, have you used tobacco or nicotine products in any form (excluding occasional cigar or pipe use)?",
      label: "Tobacco / Nicotine Use in Past 36 Months",
      kind: "boolean",
      risk: "true",
    },
    nic_used_12m: {
      question:
        "Have you used tobacco or any nicotine products in any form within the past twelve (12) months?",
      label: "Tobacco / Nicotine Use in Past 12 Months",
      kind: "boolean",
      risk: "true",
    },
    nic_products: {
      question: "Products used",
      label: "Tobacco / Nicotine Products Used",
      kind: "array",
      risk: "present",
      when: [
        { section: "nicotineSmoking", field: "nic_ever_used", equals: true },
        { section: "nicotineSmoking", field: "nic_used_12m", equals: true },
        { section: "nicotineSmoking", field: "nic_used_36m", equals: true },
        { section: "nicotineSmoking", field: "nic_used_12_3_5y", equals: true },
      ],
    },
    nic_type_and_amount: {
      question: "Type and amount",
      label: "Tobacco / Nicotine Type and Amount",
      kind: "string",
      risk: "none",
      when: [{ section: "nicotineSmoking", field: "nic_used_12m", equals: true }],
    },
    nic_date_last_used: {
      question: "Date last used",
      label: "Tobacco / Nicotine Last Use Date",
      kind: "string",
      risk: "none",
      when: [{ section: "nicotineSmoking", field: "nic_ever_used", equals: true }],
    },
  },
  alcoholUse: {
    alc_past7_abuse_counseling: {
      question:
        "Within the past 7 years, have you abused alcohol, or had or been recommended treatment/counseling, or been advised to discontinue alcohol?",
      label: "Past 7 Yr: Alcohol Abuse or Counseling",
      kind: "boolean",
      risk: "true",
    },
    alc_past5_abuse_counseling: {
      question:
        "Within the past 5 years, have you abused alcohol or drugs, or been recommended to discontinue alcohol or have treatment/counseling?",
      label: "Past 5 Yr: Alcohol Abuse or Counseling",
      kind: "boolean",
      risk: "true",
    },
    alc_past10_treated: {
      question: "In the past 10 years, have you been treated for alcohol abuse?",
      label: "Past 10 Yr: Alcohol Treatment",
      kind: "boolean",
      risk: "true",
    },
    alc_history: {
      question:
        "Any history of alcohol abuse, misuse, treatment, counseling, or being advised to discontinue alcohol?",
      label: "Alcohol Abuse History",
      kind: "boolean",
      risk: "true",
    },
    alc_infractions: {
      question:
        "Any alcohol/drug related infractions (including excessive use, or admitted DWI/DUI within the last three years)?",
      label: "Alcohol-Related Infractions",
      kind: "boolean",
      risk: "true",
    },
    alc_details: {
      question: "If you answered Yes to any question, provide dates, treatment, and details",
      label: "Alcohol Dates, Treatment, and Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "alcoholUse", field: "alc_past7_abuse_counseling", equals: true },
        { section: "alcoholUse", field: "alc_past5_abuse_counseling", equals: true },
        { section: "alcoholUse", field: "alc_past10_treated", equals: true },
        { section: "alcoholUse", field: "alc_history", equals: true },
        { section: "alcoholUse", field: "alc_infractions", equals: true },
      ],
    },
  },
  riskyBehavior: {
    avi_flights_past12m: {
      question: "Flights as pilot, student pilot, or crew in the past 12 months?",
      label: "Pilot / Crew Flights in Past 12 Months",
      kind: "boolean",
      risk: "true",
    },
    avi_flights_past24m: {
      question:
        "Flights made or contemplated as pilot, student pilot, or crew in the past 24 months?",
      label: "Pilot / Crew Flights in Past 24 Months",
      kind: "boolean",
      risk: "true",
    },
    avi_future_2y: {
      question: "Do you expect to fly in the next two years?",
      label: "Planned Pilot / Crew Flying in Next 2 Years",
      kind: "boolean",
      risk: "true",
    },
    avi_future_details: {
      question: "Future flying: aircraft, purpose, locations, and frequency",
      label: "Planned Aviation Details",
      kind: "string",
      risk: "none",
      when: [{ section: "riskyBehavior", field: "avi_future_2y", equals: true }],
    },
    avi_license_type: {
      question: "Certificate / license",
      label: "Aviation Certificate / License Type",
      kind: "string",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "avi_flights_past12m", equals: true },
        { section: "riskyBehavior", field: "avi_flights_past24m", equals: true },
        { section: "riskyBehavior", field: "avi_future_2y", equals: true },
      ],
    },
    avi_accident_grounded_fined: {
      question: "Aircraft accident, grounded, fined, or reprimanded?",
      label: "Aviation Accident, Grounding, or Fine",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "riskyBehavior", field: "avi_flights_past12m", equals: true },
        { section: "riskyBehavior", field: "avi_flights_past24m", equals: true },
        { section: "riskyBehavior", field: "avi_future_2y", equals: true },
      ],
    },
    avi_accident_details: {
      question: "Incident dates and details",
      label: "Aviation Accident, Grounding, or Fine Details",
      kind: "string",
      risk: "none",
      when: [{ section: "riskyBehavior", field: "avi_accident_grounded_fined", equals: true }],
    },
    avi_hours_pilot: {
      question: "Total pilot hours",
      label: "Pilot Flight Hours",
      kind: "number",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "avi_flights_past12m", equals: true },
        { section: "riskyBehavior", field: "avi_flights_past24m", equals: true },
        { section: "riskyBehavior", field: "avi_future_2y", equals: true },
      ],
    },
    avi_hours_crew: {
      question: "Total crew hours",
      label: "Crew Flight Hours",
      kind: "number",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "avi_flights_past12m", equals: true },
        { section: "riskyBehavior", field: "avi_flights_past24m", equals: true },
        { section: "riskyBehavior", field: "avi_future_2y", equals: true },
      ],
    },
    avi_schedule_flying_time: {
      question: "Schedule of flying time by category",
      label: "Flying Schedule and Time",
      kind: "string",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "avi_flights_past12m", equals: true },
        { section: "riskyBehavior", field: "avi_flights_past24m", equals: true },
        { section: "riskyBehavior", field: "avi_future_2y", equals: true },
      ],
    },
    avi_other_flying_details: {
      question: "Other types of flying and aircraft flown",
      label: "Other Aviation Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "avi_flights_past12m", equals: true },
        { section: "riskyBehavior", field: "avi_flights_past24m", equals: true },
        { section: "riskyBehavior", field: "avi_future_2y", equals: true },
      ],
    },
    adv_participation: {
      question: "Select all activities that apply (leave empty if none)",
      label: "Hazardous Sports / Activities",
      kind: "array",
      risk: "present",
    },
    climb_years: {
      question: "Years climbing and frequency",
      label: "Years of Rock / Mountain Climbing",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Rock or mountain climbing",
        },
      ],
    },
    climb_regions: {
      question: "Locations / regions",
      label: "Climbing Regions",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Rock or mountain climbing",
        },
      ],
    },
    climb_nature: {
      question: "Terrain, difficulty, height, and seasons",
      label: "Nature of Climbing",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Rock or mountain climbing",
        },
      ],
    },
    climb_bolts: {
      question: "Proportion on bolt-protected routes",
      label: "Climbing Bolts / Protection",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Rock or mountain climbing",
        },
      ],
    },
    climb_no_rope: {
      question: "Solo climbing or climbing without rope",
      label: "Climbing Without a Rope",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Rock or mountain climbing",
        },
      ],
    },
    race_intent: {
      question: "Automobile or hydroplane racing (leave empty if none)",
      label: "Planned Racing Types",
      kind: "array",
      risk: "present",
    },
    race_track: {
      question: "Track type",
      label: "Racing Track / Course",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Organized racing of any kind",
        },
        { section: "riskyBehavior", field: "race_intent", includes: "Automobile" },
        { section: "riskyBehavior", field: "race_intent", includes: "Hydroplane" },
      ],
    },
    race_professional: {
      question: "Professional racing or racing for cash prizes?",
      label: "Professional Racing",
      kind: "boolean",
      risk: "true",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Organized racing of any kind",
        },
        { section: "riskyBehavior", field: "race_intent", includes: "Automobile" },
        { section: "riskyBehavior", field: "race_intent", includes: "Hydroplane" },
      ],
    },
    race_last_date: {
      question: "Date of last race",
      label: "Most Recent Race",
      kind: "string",
      risk: "none",
      when: [
        {
          section: "riskyBehavior",
          field: "adv_participation",
          includes: "Organized racing of any kind",
        },
        { section: "riskyBehavior", field: "race_intent", includes: "Automobile" },
        { section: "riskyBehavior", field: "race_intent", includes: "Hydroplane" },
      ],
    },
    dive_certified: {
      question: "Certified skin / scuba diver?",
      flagExplanation: "Applicant is not a certified skin / scuba diver",
      label: "Diving Certification",
      kind: "boolean",
      risk: "false",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
      flagLabel: "Diving Certification",
    },
    dive_instruction_hours: {
      question: "Hours of instruction",
      label: "Diving Instruction Hours",
      kind: "number",
      risk: "none",
      when: [{ section: "riskyBehavior", field: "dive_certified", equals: true }],
    },
    dive_certification_date: {
      question: "Certification date",
      label: "Diving Certification Date",
      kind: "string",
      risk: "none",
      when: [{ section: "riskyBehavior", field: "dive_certified", equals: true }],
    },
    dive_not_certified_reason: {
      question: "Reason not certified",
      label: "Reason Not Certified for Diving",
      kind: "string",
      risk: "none",
      when: [{ section: "riskyBehavior", field: "dive_certified", equals: false }],
    },
    dive_max_depth: {
      question: "Maximum depth (include units)",
      label: "Maximum Diving Depth",
      kind: "string",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
    },
    dive_schedule: {
      question: "Number of dives and average time underwater by depth",
      label: "Diving Schedule",
      kind: "string",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
    },
    dive_equipment: {
      question: "Equipment used",
      label: "Diving Equipment",
      kind: "string",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
    },
    dive_locations: {
      question: "Diving locations",
      label: "Diving Locations",
      kind: "array",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
    },
    dive_salvage_exploration: {
      question: "Salvage / exploration diving?",
      label: "Diving for Salvage / Exploration",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
    },
    dive_club_member: {
      question: "Organized diving club membership?",
      label: "Diving Club Membership",
      kind: "boolean",
      risk: "none",
      when: [
        { section: "riskyBehavior", field: "adv_participation", includes: "Scuba diving" },
        { section: "riskyBehavior", field: "adv_participation", includes: "Skin diving" },
      ],
    },
  },
  drivingRecord: {
    drv_valid_license: {
      question: "Do you currently have a valid driver’s license?",
      flagExplanation: "Applicant does not hold a valid driver's license",
      label: "Holds a Valid Driver's License",
      kind: "boolean",
      risk: "false",
      flagLabel: "Does NOT hold a valid driver's license",
    },
    drv_suspension_24m: {
      question: "Within the past 24 months, license suspended/revoked or convicted of DUI?",
      label: "Past 24 Mo: License Suspension / Revocation or DUI",
      kind: "boolean",
      risk: "true",
    },
    drv_suspension_5y: {
      question:
        "Within the past 5 years, license suspended/revoked, or currently suspended/revoked?",
      label: "Past 5 Yr: License Suspension / Revocation",
      kind: "boolean",
      risk: "true",
    },
    drv_moving_violations_5y: {
      question: "Within the past 5 years, pled guilty to or convicted of any moving violations?",
      label: "Past 5 Yr: Moving Violations",
      kind: "boolean",
      risk: "true",
    },
    drv_careless_reckless_5y: {
      question: "Within the past 5 years, convicted of careless or reckless driving?",
      label: "Past 5 Yr: Careless / Reckless Driving Conviction",
      kind: "boolean",
      risk: "true",
    },
    drv_more_than_two_violations: {
      question:
        "In the past 5 years, more than two moving violations or any alcohol/drug infractions?",
      label: "Past 5 Yr: More Than Two Moving Violations or Alcohol / Drug Infractions",
      kind: "boolean",
      risk: "true",
    },
    drv_accidents: {
      question: "Have you ever had any motor vehicle accidents?",
      label: "Motor Vehicle Accident History",
      kind: "boolean",
      risk: "true",
    },
    drv_details: {
      question: "If Yes to any violation/accident question, provide dates, fault, and details",
      label: "Driving Dates, Fault, and Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "drivingRecord", field: "drv_suspension_24m", equals: true },
        { section: "drivingRecord", field: "drv_suspension_5y", equals: true },
        { section: "drivingRecord", field: "drv_moving_violations_5y", equals: true },
        { section: "drivingRecord", field: "drv_careless_reckless_5y", equals: true },
        { section: "drivingRecord", field: "drv_more_than_two_violations", equals: true },
        { section: "drivingRecord", field: "drv_accidents", equals: true },
      ],
    },
  },
  criminalRecord: {
    crim_past6m_supervision: {
      question:
        "Within the past 6 months, served or been released from incarceration, probation, parole, or court-ordered supervision?",
      label: "Past 6 Mo: Incarceration, Probation, Parole, or Court Supervision",
      kind: "boolean",
      risk: "true",
    },
    crim_felony_7y: {
      question:
        "Within the past 7 years, convicted of, pleaded guilty, or no contest to any felony?",
      label: "Past 7 Yr: Felony Conviction or Plea",
      kind: "boolean",
      risk: "true",
    },
    crim_felony_10y: {
      question:
        "In the past 10 years, convicted of, pled guilty to, or awaiting trial for a felony?",
      label: "Past 10 Yr: Felony Conviction, Plea, or Pending Trial",
      kind: "boolean",
      risk: "true",
    },
    crim_supervision_10y: {
      question:
        "In the past 10 years, served or been released from incarceration, probation, parole, or supervision?",
      label: "Past 10 Yr: Incarceration, Probation, Parole, or Supervision",
      kind: "boolean",
      risk: "true",
    },
    crim_current_supervision: {
      question: "Currently under probation, parole, or other court-ordered supervision?",
      label: "Current Probation, Parole, or Court Supervision",
      kind: "boolean",
      risk: "true",
    },
    crim_past5y_guilty_convicted: {
      question:
        "Within the past 5 years, pled guilty/convicted of a felony or misdemeanor (incl. DUI/DWI) or charge pending?",
      label: "Past 5 Yr: Felony / Misdemeanor Conviction, Plea, or Pending Charge",
      kind: "boolean",
      risk: "true",
    },
    crim_ever_guilty_convicted: {
      question:
        "Ever pled guilty to or been convicted of a felony or misdemeanor, or have a charge pending?",
      label: "Any Felony / Misdemeanor Conviction, Plea, or Pending Charge",
      kind: "boolean",
      risk: "true",
    },
    crim_details: {
      question:
        "If Yes, provide date of arrest, conviction, and any jail time, probation, or parole",
      label: "Arrest, Conviction, Incarceration, and Supervision Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "criminalRecord", field: "crim_past6m_supervision", equals: true },
        { section: "criminalRecord", field: "crim_felony_7y", equals: true },
        { section: "criminalRecord", field: "crim_felony_10y", equals: true },
        { section: "criminalRecord", field: "crim_supervision_10y", equals: true },
        { section: "criminalRecord", field: "crim_current_supervision", equals: true },
        { section: "criminalRecord", field: "crim_past5y_guilty_convicted", equals: true },
        { section: "criminalRecord", field: "crim_ever_guilty_convicted", equals: true },
      ],
    },
  },
  bankruptcy: {
    bk_has_filed: {
      question: "Have you or your spouse filed bankruptcy before?",
      label: "Bankruptcy Filing History",
      kind: "boolean",
      risk: "true",
    },
    bk_type: {
      question: "What type?",
      label: "Bankruptcy Chapter",
      kind: "string",
      risk: "none",
      when: [{ section: "bankruptcy", field: "bk_has_filed", equals: true }],
    },
    bk_chapter7_personal_or_business: {
      question: "If Chapter 7, personal or business?",
      label: "Chapter 7: Personal or Business",
      kind: "string",
      risk: "none",
      when: [{ section: "bankruptcy", field: "bk_type", equals: "Chapter 7" }],
    },
    bk_discharged: {
      question: "Has this bankruptcy been discharged?",
      flagExplanation: "Bankruptcy has not been discharged",
      label: "Bankruptcy Discharged",
      kind: "boolean",
      risk: "false",
      when: [{ section: "bankruptcy", field: "bk_has_filed", equals: true }],
      flagLabel: "Bankruptcy NOT Discharged",
    },
    bk_discharge_date: {
      question: "Date (or anticipated date) of discharge",
      label: "Bankruptcy Discharge / Anticipated Discharge Date",
      kind: "string",
      risk: "none",
      when: [{ section: "bankruptcy", field: "bk_has_filed", equals: true }],
    },
    bk_in_process: {
      question: "Is this bankruptcy still in process?",
      label: "Bankruptcy Currently in Process",
      kind: "boolean",
      risk: "true",
      when: [{ section: "bankruptcy", field: "bk_has_filed", equals: true }],
    },
  },
  illegalDrugUse: {
    drug_past2y: {
      question:
        "Within the past 2 years, used illegal drugs, abused alcohol/drugs, or been recommended treatment/counseling or advised to discontinue?",
      label: "Past 2 Yr: Drug Use, Abuse, or Recommended Treatment",
      kind: "boolean",
      risk: "true",
    },
    drug_past5y: {
      question:
        "Within the past 5 years, used illegal drugs or abused alcohol/drugs, or been recommended to discontinue or have treatment/counseling?",
      label: "Past 5 Yr: Drug Use, Abuse, or Recommended Treatment",
      kind: "boolean",
      risk: "true",
    },
    drug_ever_listed: {
      question:
        "Ever used heroin, morphine, other narcotics, marijuana, cocaine, barbiturates, amphetamines, hallucinogens, or other habit-forming drugs except as prescribed?",
      label: "History of Listed Non-Prescribed or Habit-Forming Drugs",
      kind: "boolean",
      risk: "true",
    },
    drug_past7y_prescription_advice: {
      question:
        "Within the past 7 years, advised to have treatment for, or reduce/discontinue, prescription drugs?",
      label: "Past 7 Yr: Advice to Treat, Reduce, or Stop Prescription Drug Use",
      kind: "boolean",
      risk: "true",
    },
    drug_marijuana_24m: {
      question: "During the last 24 months, smoked marijuana recreationally?",
      label: "Recreational Marijuana Use in Past 24 Months",
      kind: "boolean",
      risk: "true",
    },
    drug_past10y_treated: {
      question:
        "In the past 10 years, treated for drug abuse or used any drugs not prescribed to you?",
      label: "Past 10 Yr: Drug Abuse Treatment or Non-Prescribed Drugs",
      kind: "boolean",
      risk: "true",
    },
    drug_current_history: {
      question: "Any history of or current treatment for drug abuse?",
      label: "Drug Abuse History or Current Treatment",
      kind: "boolean",
      risk: "true",
    },
    drug_details: {
      question: "If Yes, provide substance, dates, and treatment",
      label: "Substances, Dates, and Treatment Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "illegalDrugUse", field: "drug_past2y", equals: true },
        { section: "illegalDrugUse", field: "drug_past5y", equals: true },
        { section: "illegalDrugUse", field: "drug_ever_listed", equals: true },
        { section: "illegalDrugUse", field: "drug_past7y_prescription_advice", equals: true },
        { section: "illegalDrugUse", field: "drug_marijuana_24m", equals: true },
        { section: "illegalDrugUse", field: "drug_past10y_treated", equals: true },
        { section: "illegalDrugUse", field: "drug_current_history", equals: true },
      ],
    },
  },
  residencyTravel: {
    res_citizen_or_resident: {
      question: "Is the Proposed Insured a U.S. Citizen or Permanent Resident?",
      label: "Citizenship / Residency Status",
      kind: "string",
      risk: "residency",
    },
    res_non_us_status: {
      question: "Immigration status or visa type",
      label: "Immigration Status / Visa Type",
      kind: "string",
      risk: "none",
      when: [{ section: "residencyTravel", field: "res_citizen_or_resident", equals: "Other" }],
    },
    res_high_risk_countries_2y: {
      question:
        "Within the next 2 years, do you intend to work, travel, or reside in Saudi Arabia, Iraq, Afghanistan, Syria, Somalia, Sudan, or Yemen for more than 30 days, or reside outside the U.S. more than 180 days?",
      label:
        "Next 2 Yr: Intended Extended Work, Travel, or Residence in Listed High-Risk Countries / Outside U.S.",
      kind: "boolean",
      risk: "true",
    },
    res_high_risk_countries_details: {
      question: "Countries, dates, and purpose",
      label: "High-Risk Countries, Dates, and Purpose",
      kind: "string",
      risk: "none",
      when: [{ section: "residencyTravel", field: "res_high_risk_countries_2y", equals: true }],
    },
    res_travel_outside_us_24m: {
      question:
        "Within the next 24 months, do you intend to work, travel, or reside outside the U.S. for more than 30 days?",
      label: "Next 24 Mo: Intended Work, Travel, or Residence Outside U.S. for More Than 30 Days",
      kind: "boolean",
      risk: "true",
    },
    res_travel_outside_us_details: {
      question: "Where?",
      label: "Travel Outside U.S. Details",
      kind: "string",
      risk: "none",
      when: [{ section: "residencyTravel", field: "res_travel_outside_us_24m", equals: true }],
    },
    res_lived_us_5y: {
      question: "Has the Proposed Insured lived consistently in the USA for the past 5 years?",
      flagExplanation: "Applicant has not lived consistently in the U.S. for the past 5 years",
      label: "Lived in U.S. for Past 5 Years",
      kind: "boolean",
      risk: "false",
      flagLabel: "Has NOT lived in the U.S. for the past 5 years",
    },
    res_move_back_native_country: {
      question: "Does the Proposed Insured plan to move back to their native country?",
      label: "Plans to Move Back to Native Country",
      kind: "boolean",
      risk: "true",
    },
    // Explicit user requirement: annotate populated general travel text when both future toggles are No.
    // It may legitimately describe history, so show a context note and never infer a contradiction or add a risk flag.
    res_foreign_travel_details: {
      question:
        "Previous and future foreign travel/residence (dates, countries, regions, reason, frequency, duration) — last 2 years",
      label: "Foreign Travel / Residency Details",
      kind: "string",
      risk: "none",
      when: [
        { section: "residencyTravel", field: "res_travel_outside_us_24m", equals: true },
        { section: "residencyTravel", field: "res_high_risk_countries_2y", equals: true },
      ],
    },
  },
  occupationFinancial: {
    occ_current_occupation: {
      question: "Current occupation",
      label: "Current Occupation",
      kind: "string",
      risk: "none",
    },
    occ_annual_salary: {
      question: "Annual salary (USD)",
      label: "Annual Salary",
      kind: "number",
      risk: "none",
    },
    occ_full_time_6mo: {
      question: "Working full-time (30+ hours/week) for the past six months?",
      flagExplanation: "Applicant has not worked full-time for the past 6 months",
      label: "Worked Full-Time for Past 6 Months",
      kind: "boolean",
      risk: "false",
      flagLabel: "Has NOT worked full-time for the past 6 months",
    },
    occ_weapon: {
      question: "Do you carry a weapon in your occupation?",
      label: "Carries a Weapon at Work",
      kind: "boolean",
      risk: "true",
    },
    occ_high_risk_occupation: {
      question:
        "Member of a high-risk occupation (blaster/explosives, iron/structural worker, underground miner, professional athlete, casino worker, firefighter, etc.)?",
      label: "High-Risk Occupation",
      kind: "boolean",
      risk: "true",
    },
    occ_high_risk_details: {
      question: "Provide details",
      label: "High-Risk Occupation Details",
      kind: "string",
      risk: "none",
      when: [{ section: "occupationFinancial", field: "occ_high_risk_occupation", equals: true }],
    },
  },
  militaryService: {
    mil_active_duty: {
      question: "Are you a member of the United States Military on active duty?",
      label: "Active Military Duty",
      kind: "boolean",
      risk: "true",
    },
    mil_deployment: {
      question:
        "Currently deployed or have orders to deploy to Saudi Arabia, Iraq, Afghanistan, Syria, Somalia, Sudan, or Yemen?",
      label: "Military Deployment",
      kind: "boolean",
      risk: "true",
      when: [{ section: "militaryService", field: "mil_active_duty", equals: true }],
    },
    mil_flying_time: {
      question: "Complete schedule of flying time (military aviation)",
      label: "Military Flying Time",
      kind: "string",
      risk: "none",
      when: [{ section: "militaryService", field: "mil_active_duty", equals: true }],
    },
    mil_flight_type: {
      question: "Type of flying",
      label: "Military Flight Types",
      kind: "array",
      risk: "none",
      when: [{ section: "militaryService", field: "mil_active_duty", equals: true }],
    },
    mil_job_rank: {
      question: "Job title and current rank",
      label: "Military Job Title and Rank",
      kind: "string",
      risk: "none",
      when: [{ section: "militaryService", field: "mil_active_duty", equals: true }],
    },
    mil_aircraft_duties: {
      question: "Are you assigned duties aboard the aircraft?",
      label: "Military Aircraft Duties",
      kind: "boolean",
      risk: "true",
      when: [{ section: "militaryService", field: "mil_active_duty", equals: true }],
    },
  },
  optionalContact: {
    contact_name: {
      question: "Name",
      label: "Contact Name",
      kind: "string",
      risk: "none",
    },
    contact_email: {
      question: "Email address",
      label: "Contact Email",
      kind: "string",
      risk: "none",
    },
    contact_phone: {
      question: "Cell phone number",
      label: "Contact Phone",
      kind: "string",
      risk: "none",
    },
    contact_preferred_time: {
      question: "Preferred time for me to reach out",
      label: "Preferred Contact Time",
      kind: "string",
      risk: "none",
    },
  },
  consents: {
    consent_contact: {
      question: "Consent to Contact",
      flagExplanation: "Contact consent has not been granted",
      label: "Contact Consent",
      kind: "boolean",
      risk: "false",
    },
    consent_disclaimer: {
      question: "Acknowledgment & Consent",
      flagExplanation: "Disclaimer acknowledgment has not been granted",
      label: "Practice Worksheet Disclaimer Acknowledgment",
      kind: "boolean",
      risk: "false",
    },
  },
  seizureModule: {
    seizure_diagnosis: {
      question:
        "Exact official diagnosis (epilepsy, tonic-clonic, absence, partial, single event…)",
      label: "Seizure Diagnosis",
      kind: "string",
      risk: "none",
    },
    seizure_diagnosis_date: {
      question: "Exact date of diagnosis",
      label: "Seizure Diagnosis Date",
      kind: "string",
      risk: "none",
    },
    seizure_age_at_onset: {
      question: "Age at onset",
      label: "Age at Seizure Onset",
      kind: "number",
      risk: "none",
    },
    seizure_total_count: {
      question: "Total seizures/episodes",
      label: "Total Seizure Count",
      kind: "number",
      risk: "none",
    },
    seizure_most_recent_date: {
      question: "Date of most recent seizure",
      label: "Most Recent Seizure",
      kind: "string",
      risk: "none",
    },
    seizure_frequency: {
      question: "Frequency (daily, monthly, yearly, seizure-free duration)",
      label: "Seizure Frequency",
      kind: "string",
      risk: "none",
    },
    seizure_treatments: {
      question: "Past and current treatments or therapies",
      label: "Seizure Treatments",
      kind: "string",
      risk: "none",
    },
    seizure_medications: {
      question:
        "Anticonvulsant medications (leave empty if none; otherwise include name, dosage, start date, adherence)",
      label: "Seizure Medications",
      kind: "detailedMedications",
      risk: "none",
    },
    seizure_physician_name: {
      question: "Treating neurologist/physician name",
      label: "Seizure Treating Physician",
      kind: "string",
      risk: "none",
    },
    seizure_physician_address: {
      question: "Physician address",
      label: "Seizure Physician Address",
      kind: "string",
      risk: "none",
    },
    seizure_physician_phone: {
      question: "Physician phone",
      label: "Seizure Physician Phone",
      kind: "string",
      risk: "none",
    },
    seizure_last_visit: {
      question: "Date of last visit",
      label: "Last Seizure-Related Visit",
      kind: "string",
      risk: "none",
    },
    seizure_last_visit_reason_result: {
      question: "Reason/result of last visit and monitoring frequency",
      label: "Seizure Visit Reason and Result",
      kind: "string",
      risk: "none",
    },
    seizure_hospital_visits: {
      question: "Hospital/ER/urgent care visits due to seizures (dates, outcomes)",
      label: "Seizure Hospital Visits",
      kind: "string",
      risk: "none",
    },
    seizure_pending_tests: {
      question: "Advised tests (EEG, MRI, CT) not completed, pending, or abnormal",
      label: "Pending Seizure Tests",
      kind: "string",
      risk: "none",
    },
    seizure_classification_simple_partial_check: {
      question:
        "If simple/complex partial or absence: no seizures for 2+ years and no loss of consciousness?",
      flagExplanation: "Applicant does not meet the stated partial / absence seizure-control check",
      label: "Partial / Absence: Seizure-Free for 2+ Years Without Loss of Consciousness",
      kind: "boolean",
      risk: "false",
      flagLabel: "Does NOT Meet the Stated Partial / Absence Seizure-Control Check",
    },
    seizure_classification_epilepsy_control: {
      question: "If epilepsy/tonic-clonic: how long seizure-free and controlled on medication?",
      label: "Epilepsy Classification and Control",
      kind: "string",
      risk: "none",
    },
    seizure_polytherapy: {
      question: "Do you require multiple anti-seizure drugs (polytherapy)?",
      label: "Multiple Seizure Medications",
      kind: "boolean",
      risk: "true",
    },
    seizure_underlying_cause: {
      question: "Underlying cause (head trauma, tumor, infection, stroke, withdrawal…)",
      label: "Underlying Seizure Cause",
      kind: "string",
      risk: "none",
    },
    seizure_injuries_accidents: {
      question: "Injuries, burns, or accidents resulting from a seizure",
      label: "Seizure Injuries / Accidents",
      kind: "string",
      risk: "none",
    },
    seizure_driving_status: {
      question: "License suspended/revoked/restricted? Currently permitted to drive?",
      label: "Seizure-Related Driving Status",
      kind: "string",
      risk: "none",
    },
    seizure_functional_limitations: {
      question: "Limits on full-time work, machinery, or daily activities",
      label: "Seizure Functional Limitations",
      kind: "string",
      risk: "none",
    },
    seizure_assistance_needed: {
      question: "Need assistance or assistive devices for daily activities",
      label: "Seizure Assistance Needed",
      kind: "string",
      risk: "none",
    },
  },
  respiratoryModule: {
    resp_diagnosis: {
      question: "Exact official diagnosis",
      label: "Respiratory Diagnosis",
      kind: "string",
      risk: "none",
    },
    resp_date_first_diagnosed: {
      question: "Date first diagnosed",
      label: "First Respiratory Diagnosis Date",
      kind: "string",
      risk: "none",
    },
    resp_age_at_onset: {
      question: "Age at onset",
      label: "Age at Respiratory Onset",
      kind: "number",
      risk: "none",
    },
    resp_symptoms_frequency: {
      question: "Symptoms, frequency, and most recent flare-up",
      label: "Respiratory Symptoms and Frequency",
      kind: "string",
      risk: "none",
    },
    resp_treatments: {
      question: "Past and current treatments / management plan",
      label: "Respiratory Treatments",
      kind: "string",
      risk: "none",
    },
    resp_medications: {
      question: "Medications (inhalers, bronchodilators, steroids…)",
      label: "Respiratory Medications",
      kind: "detailedMedications",
      risk: "none",
    },
    resp_physician_name: {
      question: "Treating physician / pulmonologist / sleep specialist",
      label: "Respiratory Treating Physician",
      kind: "string",
      risk: "none",
    },
    resp_physician_address: {
      question: "Physician address",
      label: "Respiratory Physician Address",
      kind: "string",
      risk: "none",
    },
    resp_physician_phone: {
      question: "Physician phone",
      label: "Respiratory Physician Phone",
      kind: "string",
      risk: "none",
    },
    resp_last_visit: {
      question: "Date of last visit",
      label: "Last Respiratory Visit",
      kind: "string",
      risk: "none",
    },
    resp_last_visit_reason_result: {
      question: "Reason/result of last visit and monitoring frequency",
      label: "Respiratory Visit Reason and Result",
      kind: "string",
      risk: "none",
    },
    resp_hospital_visits: {
      question: "Hospital/ER/urgent care visits (dates, outcomes)",
      label: "Respiratory Hospital Visits",
      kind: "string",
      risk: "none",
    },
    resp_pending_tests: {
      question: "Pending/abnormal tests or evaluations",
      label: "Pending Respiratory Tests",
      kind: "string",
      risk: "none",
    },
    copd_history: {
      question:
        "History of emphysema, chronic bronchitis, bronchiectasis, other chronic lung disease",
      label: "COPD / Respiratory History",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    copd_pft_results: {
      question: "PFT/spirometry results (FEV1, FVC %)",
      label: "Pulmonary Function Test Results",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    copd_sob: {
      question: "Shortness of breath / dyspnea on exertion?",
      label: "Shortness of Breath",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    copd_stairs_tolerance: {
      question: "Can you climb one flight of stairs with little/no shortness of breath?",
      flagExplanation:
        "Applicant cannot climb one flight of stairs with little or no shortness of breath",
      label: "Can Climb One Flight of Stairs with Little / No Shortness of Breath",
      kind: "boolean",
      risk: "false",
      flagLabel: "Limited Stair-Climbing Tolerance",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    copd_oxygen_nebulizer_steroids: {
      question: "Ever advised to use / currently use oxygen, nebulizer, or steroids?",
      label: "Oxygen, Nebulizer, or Steroid Treatment",
      kind: "boolean",
      risk: "true",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    copd_nicotine_history: {
      question: "Smoking/nicotine history (type, frequency, last used, quit history)",
      label: "COPD Nicotine History",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    copd_other_conditions: {
      question: "Other respiratory conditions (asthma, fibrosis, cystic fibrosis, chronic cough…)",
      label: "Other COPD-Related Conditions",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "COPD" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Emphysema" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Chronic Bronchitis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Asbestosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Cystic Fibrosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Tuberculosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Lung Cancer" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Sarcoidosis" },
        { section: "healthMedical", field: "conditions_triggered", includes: "Pulmonary Fibrosis" },
      ],
    },
    sleep_type: {
      question: "Type of sleep apnea",
      label: "Sleep Apnea Type",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_confirmation_method: {
      question: "How was the diagnosis confirmed?",
      label: "Sleep Apnea Confirmation Method",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_ahi_rdi: {
      question: "AHI / RDI score",
      label: "Sleep Apnea AHI / RDI",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_treatment: {
      question: "Treatment prescribed",
      label: "Sleep Apnea Treatment",
      kind: "array",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_pap_compliance: {
      question: "PAP compliance, average nightly hours, adherence data",
      label: "PAP Treatment Adherence",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_control_status: {
      question: "Controlled, or ongoing daytime sleepiness/fatigue/witnessed apneas?",
      label: "Sleep Apnea Control",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_repeat_study: {
      question: "Repeat sleep study results",
      label: "Repeat Sleep Study",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_functional_limitations: {
      question: "Limits on exertion, work, or ADLs",
      label: "Sleep Apnea Functional Limitations",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_cardio_complications: {
      question: "Pulmonary hypertension, cor pulmonale, AFib, high blood pressure…",
      label: "Sleep Apnea Cardiovascular Complications",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_comorbidities: {
      question: "Diabetes, obesity (height/weight), kidney disease, depression, anxiety",
      label: "Sleep Apnea Comorbidities",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
    sleep_driving_restrictions: {
      question: "Driving/machinery restrictions due to fatigue or impairment",
      label: "Sleep Apnea Driving Restrictions",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Sleep Apnea" }],
    },
  },
  cardioNeuroModule: {
    cardio_neuro_diagnosis: {
      question: "Exact diagnosis",
      label: "Cardiac / Neurologic Diagnosis",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_date: {
      question: "Date of diagnosis or onset",
      label: "Cardiac / Neurologic Diagnosis Date",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_age: {
      question: "Age at event",
      label: "Age at Cardiac / Neurologic Onset",
      kind: "number",
      risk: "none",
    },
    cardio_neuro_episode_count: {
      question: "Number of episodes/occurrences",
      label: "Cardiac / Neurologic Episode Count",
      kind: "number",
      risk: "none",
    },
    cardio_neuro_recent_date: {
      question: "Date of most recent episode",
      label: "Most Recent Cardiac / Neurologic Episode",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_status: {
      question: "Current status / last symptoms",
      label: "Current Cardiac / Neurologic Status",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_hospitalization: {
      question: "Hospitalization / ER dates",
      label: "Cardiac / Neurologic Hospitalizations",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_treatments: {
      question: "Past and current treatments",
      label: "Cardiac / Neurologic Treatments",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_medications: {
      question: "Medications",
      label: "Cardiac / Neurologic Medications",
      kind: "detailedMedications",
      risk: "none",
    },
    cardio_neuro_blood_thinners: {
      question: "Currently taking anticoagulant or antiplatelet blood thinners?",
      label: "Blood-Thinner Treatment",
      kind: "boolean",
      risk: "none",
    },
    cardio_neuro_physician_name: {
      question: "Attending physician / specialist",
      label: "Cardiac / Neurologic Treating Physician",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_physician_address: {
      question: "Physician address",
      label: "Cardiac / Neurologic Physician Address",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_physician_phone: {
      question: "Physician phone number",
      label: "Cardiac / Neurologic Physician Phone",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_last_visit: {
      question: "Date of last visit/check-up",
      label: "Last Cardiac / Neurologic Visit",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_followup_gaps: {
      question: "Gaps in medical follow-up or noncompliance",
      label: "Cardiac / Neurologic Follow-Up Gaps",
      kind: "string",
      risk: "none",
    },
    cardio_neuro_pending_tests: {
      question: "Pending or abnormal tests / evaluations / surgeries",
      label: "Pending Cardiac / Neurologic Tests",
      kind: "string",
      risk: "none",
    },
    stroke_root_cause: {
      question: "Underlying root cause",
      label: "Stroke / TIA Root Cause",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_imaging_results: {
      question: "Imaging findings",
      label: "Stroke / TIA Imaging Results",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_on_anticoagulated: {
      question: "Did the stroke/TIA occur while adequately anticoagulated?",
      label: "Stroke / TIA Anticoagulant Treatment",
      kind: "boolean",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_residual_effects: {
      question: "Residual effects / deficits / weakness / speech issues",
      label: "Stroke / TIA Residual Effects",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_cognitive_impairment: {
      question: "Cognitive impairment / memory loss / impaired reasoning",
      label: "Stroke / TIA Cognitive Impairment",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_pfo_asd_history: {
      question: "PFO / ASD history and closure status",
      label: "PFO / ASD History",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_carotid_ultrasound: {
      question: "Carotid ultrasound / stenosis / intervention status",
      label: "Carotid Ultrasound Results",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    stroke_therapy_last_3_12_months: {
      question: "Physical / occupational / speech therapy in the last 3 to 12 months",
      label: "Stroke Therapy in Past 3–12 Months",
      kind: "string",
      risk: "none",
      when: [
        { section: "healthMedical", field: "conditions_triggered", includes: "Stroke" },
        { section: "healthMedical", field: "conditions_triggered", includes: "TIA" },
      ],
    },
    mi_supporting_evidence: {
      question: "Chest pain / EKG changes / elevated enzymes",
      label: "Heart Attack Supporting Evidence",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Heart Attack" }],
    },
    mi_procedure_details: {
      question: "Heart/circulatory surgery or procedure details and date",
      label: "Heart Attack Procedure Details",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Heart Attack" }],
    },
    mi_vessels_affected: {
      question: "Number of coronary vessels affected or bypassed",
      label: "Number of Coronary Vessels Affected",
      kind: "number",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Heart Attack" }],
    },
    mi_ongoing_symptoms: {
      question: "Ongoing cardiac symptoms",
      label: "Ongoing Heart Attack Symptoms",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Heart Attack" }],
    },
    mi_residual_damage: {
      question: "Residual heart damage / CHF / EF <45%",
      label: "Residual Heart Damage",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Heart Attack" }],
    },
    mi_recent_workup: {
      question: "Recent cardiac workup and test results",
      label: "Recent Cardiac Workup",
      kind: "string",
      risk: "none",
      when: [{ section: "healthMedical", field: "conditions_triggered", includes: "Heart Attack" }],
    },
    cardio_limitations: {
      question: "Limitations on physical or daily activities",
      label: "Cardiovascular Functional Limitations",
      kind: "string",
      risk: "none",
    },
    cardio_work_status: {
      question: "Work disability / unemployed / restricted from full-time work",
      label: "Cardiovascular Work Status",
      kind: "string",
      risk: "none",
    },
    cardio_return_to_work: {
      question: "Return to work date",
      label: "Return-to-Work Date",
      kind: "string",
      risk: "none",
    },
    cardio_disability_benefits: {
      question: "Disability benefits or compensation",
      label: "Cardiovascular Disability Benefits",
      kind: "string",
      risk: "none",
    },
    cardio_adl_iadl_help: {
      question: "ADL/IADL assistance or device support",
      label: "ADL / IADL Assistance",
      kind: "string",
      risk: "none",
    },
    cardio_medical_equipment: {
      question: "Medical equipment or mobility devices used in the past 12 months",
      label: "Medical Equipment",
      kind: "string",
      risk: "none",
    },
    cardio_confinement_status: {
      question: "Confinement to hospital/nursing home/assisted living/rehab/hospice/home health",
      label: "Medical Confinement Status",
      kind: "string",
      risk: "none",
    },
    cardio_height_weight: {
      question: "Current height and weight",
      label: "Height and Weight",
      kind: "string",
      risk: "none",
    },
    cardio_weight_change_10lbs: {
      question: "Has there been any weight change of more than 10 pounds in the past year?",
      label: "Weight Change of at Least 10 Pounds",
      kind: "boolean",
      risk: "true",
    },
    cardio_nicotine_history: {
      question: "Tobacco / nicotine history",
      label: "Cardiovascular Nicotine History",
      kind: "string",
      risk: "none",
    },
    cardio_bp_history: {
      question: "Current and historical blood pressure readings and treatment status",
      label: "Blood Pressure History",
      kind: "string",
      risk: "none",
    },
    cardio_lipid_panel: {
      question: "Most recent lipid panel readings",
      label: "Lipid Panel Results",
      kind: "string",
      risk: "none",
    },
    cardio_diabetes_history: {
      question: "Diabetes / pre-diabetes history and complications",
      label: "Diabetes History",
      kind: "string",
      risk: "none",
    },
    cardio_other_comorbidities: {
      question: "Other cardiovascular, vascular, or systemic conditions",
      label: "Other Cardiovascular Comorbidities",
      kind: "string",
      risk: "none",
    },
    cardio_family_history: {
      question:
        "Family history of cardiovascular disease, stroke, diabetes, kidney disease, or cancer",
      label: "Cardiovascular Family History",
      kind: "string",
      risk: "none",
    },
  },
  hypertensionModule: {
    htn_dx_date: {
      question: "Date hypertension diagnosed",
      label: "Hypertension Diagnosis Month",
      kind: "string",
      risk: "none",
    },
    htn_meds_last12months: {
      question: "Taken BP medication within the last 12 months?",
      label: "Blood Pressure Medication in Past 12 Months",
      kind: "boolean",
      risk: "true",
    },
    htn_current_meds: {
      question: "Current prescription medications (leave empty if none)",
      label: "Current Blood Pressure Medications",
      kind: "medications",
      risk: "none",
      when: [{ section: "hypertensionModule", field: "htn_meds_last12months", equals: true }],
    },
    htn_last_doctor_visit: {
      question: "Date of last doctor visit",
      label: "Last Blood Pressure Visit",
      kind: "string",
      risk: "none",
    },
    htn_last_bp: {
      question: "Last blood pressure reading (e.g., 128/82)",
      label: "Latest Blood Pressure Reading",
      kind: "string",
      risk: "none",
    },
    htn_bp_normal_or_elevated_if_unknown: {
      question: "If unknown, reported as normal or elevated?",
      label: "Blood Pressure Control if Reading Unknown",
      kind: "string",
      risk: "none",
    },
    htn_med_change: {
      question: "Any change/increase in medication in the last 12 months?",
      label: "Blood Pressure Medication Change",
      kind: "boolean",
      risk: "true",
    },
    htn_med_change_details: {
      question: "What was the change?",
      label: "Blood Pressure Medication Change Details",
      kind: "string",
      risk: "none",
      when: [{ section: "hypertensionModule", field: "htn_med_change", equals: true }],
    },
    htn_compliant: {
      question: "Compliant with medications as directed?",
      flagExplanation: "Applicant is not following blood pressure medication directions",
      label: "Following Blood Pressure Treatment as Prescribed",
      kind: "boolean",
      risk: "false",
      flagLabel: "NOT Following Blood Pressure Treatment as Prescribed",
    },
    htn_other_conditions: {
      question:
        "Other conditions from hypertension in last 2 years (kidney disease, proteinuria, heart/circulatory)",
      label: "Hypertension Other Conditions",
      kind: "string",
      risk: "none",
    },
    htn_hospitalized_5y: {
      question: "Hospitalized due to blood pressure in the last 5 years?",
      label: "Past 5 Yr: Hypertension Hospitalization",
      kind: "boolean",
      risk: "true",
    },
    htn_hospitalized_date: {
      question: "Date of hospitalization",
      label: "Hypertension Hospitalization Date",
      kind: "string",
      risk: "none",
      when: [{ section: "hypertensionModule", field: "htn_hospitalized_5y", equals: true }],
    },
    htn_unable_to_work_5y: {
      question: "Unable to work due to high blood pressure in the past 5 years?",
      label: "Past 5 Yr: Hypertension Work Disability",
      kind: "boolean",
      risk: "true",
    },
    htn_unable_to_work_details: {
      question: "Dates and duration of absences",
      label: "Hypertension Work Disability Details",
      kind: "string",
      risk: "none",
      when: [{ section: "hypertensionModule", field: "htn_unable_to_work_5y", equals: true }],
    },
  },
  diabetesModule: {
    dm_dx_date: {
      question: "Date diabetes diagnosed",
      label: "Diabetes Diagnosis Month",
      kind: "string",
      risk: "none",
    },
    dm_control_method: {
      question: "How is the condition controlled?",
      label: "Diabetes Control Methods",
      kind: "array",
      risk: "none",
    },
    dm_insulin_start_date: {
      question: "Date insulin use began",
      label: "Insulin Start Date",
      kind: "string",
      risk: "none",
      when: [{ section: "diabetesModule", field: "dm_control_method", includes: "Insulin" }],
    },
    dm_current_meds: {
      question: "All current medications (leave empty if none)",
      label: "Current Diabetes Medications",
      kind: "medications",
      risk: "none",
      when: [
        { section: "diabetesModule", field: "dm_control_method", includes: "Oral Medication" },
        { section: "diabetesModule", field: "dm_control_method", includes: "Insulin" },
      ],
    },
    dm_last_blood_sugar: {
      question: "Last blood sugar reading",
      label: "Latest Blood Sugar Reading",
      kind: "string",
      risk: "none",
    },
    dm_last_blood_sugar_date: {
      question: "Date of that reading",
      label: "Latest Blood Sugar Date",
      kind: "string",
      risk: "none",
    },
    dm_last_a1c: {
      question: "Last A1C reading",
      label: "Latest A1C Reading",
      kind: "string",
      risk: "none",
    },
    dm_last_a1c_date: {
      question: "Date of that A1C",
      label: "Latest A1C Date",
      kind: "string",
      risk: "none",
    },
    dm_reading_unknown: {
      question: "If unknown, reported as elevated or normal?",
      label: "Diabetes Reading Unknown Details",
      kind: "string",
      risk: "none",
    },
    dm_med_change: {
      question: "Medication change/increase in last 12 months?",
      label: "Diabetes Medication Change",
      kind: "boolean",
      risk: "true",
    },
    dm_med_change_details: {
      question: "Please explain",
      label: "Diabetes Medication Change Details",
      kind: "string",
      risk: "none",
      when: [{ section: "diabetesModule", field: "dm_med_change", equals: true }],
    },
    dm_compliant: {
      question: "Compliant with medications as directed?",
      flagExplanation: "Applicant is not following diabetes medication directions",
      label: "Following Diabetes Treatment as Prescribed",
      kind: "boolean",
      risk: "false",
      flagLabel: "NOT Following Diabetes Treatment as Prescribed",
    },
    dm_noncompliance_details: {
      question: "Please explain",
      label: "Diabetes Treatment Nonadherence Details",
      kind: "string",
      risk: "none",
      when: [{ section: "diabetesModule", field: "dm_compliant", equals: false }],
    },
    dm_complications: {
      question: "Ever had or been advised you have:",
      label: "Diabetes Complications",
      kind: "array",
      risk: "present",
    },
    dm_er_hospital_5y: {
      question: "Hospitalized or ER visit due to diabetes in the past 5 years?",
      label: "Past 5 Yr: Diabetes ER Visit / Hospitalization",
      kind: "boolean",
      risk: "true",
    },
    dm_er_hospital_details: {
      question: "Details",
      label: "Diabetes ER / Hospital Details",
      kind: "string",
      risk: "none",
      when: [{ section: "diabetesModule", field: "dm_er_hospital_5y", equals: true }],
    },
  },
  arthritisModule: {
    arth_type: {
      question: "Type (osteoarthritis, rheumatoid, other)",
      label: "Arthritis Type",
      kind: "string",
      risk: "none",
    },
    arth_joints: {
      question: "Which joints?",
      label: "Arthritis Affected Joints",
      kind: "string",
      risk: "none",
    },
    arth_duration: {
      question: "How long have you had arthritis?",
      label: "Arthritis Duration",
      kind: "string",
      risk: "none",
    },
    arth_last_flare: {
      question: "Date of last flare-up",
      label: "Last Arthritis Flare",
      kind: "string",
      risk: "none",
    },
    arth_unable_work_5y: {
      question: "Unable to work, perform normal activities, or confined at home in past 5 years?",
      label: "Past 5 Yr: Arthritis Work Disability",
      kind: "boolean",
      risk: "true",
    },
    arth_unable_work_details: {
      question: "Details",
      label: "Arthritis Work Disability Details",
      kind: "string",
      risk: "none",
      when: [{ section: "arthritisModule", field: "arth_unable_work_5y", equals: true }],
    },
    arth_assistive_devices: {
      question: "Need canes, crutches, or a wheelchair?",
      label: "Arthritis Assistive Devices",
      kind: "string",
      risk: "none",
    },
    arth_symptoms: {
      question: "Symptoms (swollen joints, limited motion…)",
      label: "Arthritis Symptoms",
      kind: "string",
      risk: "none",
    },
    arth_regular_medication: {
      question: "Regular medication or injections?",
      label: "Regular Arthritis Medication",
      kind: "boolean",
      risk: "true",
    },
    arth_medication_name: {
      question: "Medication name",
      label: "Arthritis Medication Name",
      kind: "string",
      risk: "none",
      when: [{ section: "arthritisModule", field: "arth_regular_medication", equals: true }],
    },
    arth_medication_dosage: {
      question: "Dosage",
      label: "Arthritis Medication Dosage",
      kind: "string",
      risk: "none",
      when: [{ section: "arthritisModule", field: "arth_regular_medication", equals: true }],
    },
    arth_last_doctor_visit: {
      question: "Date of last visit with this doctor",
      label: "Last Arthritis Visit",
      kind: "string",
      risk: "none",
    },
    arth_additional_comments: {
      question: "Additional comments",
      label: "Additional Arthritis Comments",
      kind: "string",
      risk: "none",
    },
  },
  asthmaModule: {
    asthma_dx_date: {
      question: "When was asthma diagnosed?",
      label: "Asthma Diagnosis Month",
      kind: "string",
      risk: "none",
    },
    asthma_last_attack: {
      question: "Date of last attack",
      label: "Last Asthma Attack Month",
      kind: "string",
      risk: "none",
    },
    asthma_attacks_per_year: {
      question: "Attacks per year",
      label: "Asthma Attacks per Year",
      kind: "number",
      risk: "none",
    },
    asthma_triggers: {
      question: "What precipitates the attacks?",
      label: "Asthma Triggers",
      kind: "string",
      risk: "none",
    },
    asthma_current_meds: {
      question: "Current prescription medications",
      label: "Current Asthma Medications",
      kind: "medications",
      risk: "none",
    },
    asthma_steroid_use: {
      question: "Ever used steroid medication (e.g., Prednisone)?",
      label: "Asthma Steroid Use",
      kind: "boolean",
      risk: "true",
    },
    asthma_steroid_last_used: {
      question: "Date last used (and how long)",
      label: "Last Asthma Steroid Use",
      kind: "string",
      risk: "none",
      when: [{ section: "asthmaModule", field: "asthma_steroid_use", equals: true }],
    },
    asthma_hospitalized_5y: {
      question: "Hospitalized for asthma in past 5 years?",
      label: "Past 5 Yr: Asthma Hospitalization",
      kind: "boolean",
      risk: "true",
    },
    asthma_er_visits: {
      question: "Seen in the ER for asthma?",
      label: "Asthma ER Visits",
      kind: "boolean",
      risk: "true",
    },
    asthma_status_asthmaticus: {
      question: "Ever diagnosed with status asthmaticus?",
      label: "Status Asthmaticus History",
      kind: "boolean",
      risk: "true",
    },
    asthma_status_asthmaticus_date: {
      question: "Date",
      label: "Status Asthmaticus Month",
      kind: "string",
      risk: "none",
      when: [{ section: "asthmaModule", field: "asthma_status_asthmaticus", equals: true }],
    },
    asthma_allergy_caused: {
      question: "Described as caused by an allergy?",
      label: "Allergy-Triggered Asthma",
      kind: "boolean",
      risk: "true",
    },
  },
  cancerModule: {
    cancer_tumor_diagnosed_as_cancer: {
      question: "Was your tumor diagnosed as cancer?",
      label: "Tumor Diagnosed as Cancer",
      kind: "boolean",
      risk: "true",
    },
    cancer_dx_date: {
      question: "When was it diagnosed?",
      label: "Cancer Diagnosis Month",
      kind: "string",
      risk: "none",
    },
    cancer_location_diagnosis: {
      question: "Location and diagnosis",
      label: "Cancer Location and Diagnosis",
      kind: "string",
      risk: "none",
    },
    cancer_stage_size_classification: {
      question: "Stage, size, classification (Dukes, Gleason…) if known",
      label: "Cancer Stage, Size, and Classification",
      kind: "string",
      risk: "none",
    },
    cancer_nodes_spread: {
      question: "Did it spread to lymph nodes or elsewhere?",
      label: "Cancer Spread to Nodes / Other Sites",
      kind: "boolean",
      risk: "true",
    },
    cancer_nodes_spread_details: {
      question: "Details",
      label: "Cancer Spread Details",
      kind: "string",
      risk: "none",
      when: [{ section: "cancerModule", field: "cancer_nodes_spread", equals: true }],
    },
    cancer_surgery_5y: {
      question: "Surgery to remove the tumor in past 5 years?",
      label: "Past 5 Yr: Cancer Surgery",
      kind: "boolean",
      risk: "true",
    },
    cancer_surgery_details: {
      question: "Details",
      label: "Cancer Surgery Details",
      kind: "string",
      risk: "none",
      when: [{ section: "cancerModule", field: "cancer_surgery_5y", equals: true }],
    },
    cancer_chemo_radiation_5y: {
      question: "Chemotherapy or radiation in past 5 years?",
      label: "Past 5 Yr: Chemotherapy / Radiation",
      kind: "boolean",
      risk: "true",
    },
    cancer_last_treatment_date: {
      question: "Date of last treatment",
      label: "Last Cancer Treatment Month",
      kind: "string",
      risk: "none",
      when: [{ section: "cancerModule", field: "cancer_chemo_radiation_5y", equals: true }],
    },
    cancer_other_treatments_5y: {
      question: "Any other treatments in past 5 years?",
      label: "Past 5 Yr: Other Cancer Treatments",
      kind: "boolean",
      risk: "true",
    },
    cancer_other_treatment_details: {
      question: "Details",
      label: "Other Cancer Treatment Details",
      kind: "string",
      risk: "none",
      when: [{ section: "cancerModule", field: "cancer_other_treatments_5y", equals: true }],
    },
    cancer_tamoxifen_femara: {
      question: "Used Tamoxifen or Femara?",
      label: "Tamoxifen / Femara Use",
      kind: "boolean",
      risk: "true",
    },
    cancer_tamoxifen_femara_last_used: {
      question: "Date last used",
      label: "Last Tamoxifen / Femara Use",
      kind: "string",
      risk: "none",
      when: [{ section: "cancerModule", field: "cancer_tamoxifen_femara", equals: true }],
    },
    cancer_doctor_frequency_last_seen: {
      question: "How often do you see your doctor, and date last seen",
      label: "Cancer Physician Visit Frequency / Last Seen",
      kind: "string",
      risk: "none",
    },
  },
} as const satisfies FieldRegistry;
export const MEDICATION_LABELS = {
  startDate: "Medication Start Date",
  conditionTreated: "Condition Treated",
  name: "Medication Name",
  adherence: "Medication Adherence",
  drugName: "Drug Name",
  lastFillDate: "Last Fill Date",
  dosage: "Dosage",
  frequency: "Frequency",
} satisfies Record<keyof Medication | keyof DetailedMedication, string>;
const MODULE_TRIGGERS: Partial<Record<Section, readonly string[]>> = {
  seizureModule: ["Seizure Disorder", "Seizures"],
  respiratoryModule: [
    "Sleep Apnea",
    "COPD",
    "Emphysema",
    "Chronic Bronchitis",
    "Asbestosis",
    "Cystic Fibrosis",
    "Tuberculosis",
    "Lung Cancer",
    "Sarcoidosis",
    "Pulmonary Fibrosis",
  ],
  cardioNeuroModule: ["Stroke", "TIA", "Heart Attack"],
  hypertensionModule: ["High Blood Pressure"],
  diabetesModule: ["Diabetes 1 or 2"],
  arthritisModule: ["Arthritis"],
  asthmaModule: ["Asthma"],
  cancerModule: ["Cancer"],
};
export const CATEGORY_LABELS: Record<Category, string> = {
  healthMedical: "Health & Medical",
  mentalHealth: "Mental Health",
  nicotineSmoking: "Nicotine / Smoking",
  alcoholUse: "Alcohol Use",
  riskyBehavior: "Risky Behavior",
  drivingRecord: "Driving Record",
  criminalRecord: "Criminal Record",
  bankruptcy: "Bankruptcy",
  illegalDrugUse: "Illegal Drug Use",
  residencyTravel: "Residency & Travel",
  occupationFinancial: "Occupation & Financial",
  militaryService: "Military Service",
};
export const CATEGORY_ORDER = [
  "healthMedical",
  "mentalHealth",
  "nicotineSmoking",
  "alcoholUse",
  "riskyBehavior",
  "drivingRecord",
  "criminalRecord",
  "bankruptcy",
  "illegalDrugUse",
  "residencyTravel",
  "occupationFinancial",
  "militaryService",
] as const;

const OPTIONAL_FIELDS = new Set<string>([
  "healthMedical.medical_treatment_given",
  "healthMedical.medical_other_conditions",
  "mentalHealth.mh_conditions",
  "mentalHealth.mh_medications",
  "mentalHealth.mh_dx_date",
  "mentalHealth.mh_last_seen",
  "mentalHealth.mh_psychiatrist_details",
  "mentalHealth.mh_inpatient_details",
  "mentalHealth.mh_unable_work_details",
  "mentalHealth.mh_suicide_attempt_details",
  "mentalHealth.mh_disability_details",
  "mentalHealth.mh_selected_other_text",
  "mentalHealth.mh_rx_details",
  "mentalHealth.mh_selected_dx_date",
  "mentalHealth.mh_selected_last_seen",
  "mentalHealth.mh_selected_psychiatrist_5y",
  "mentalHealth.mh_selected_psychiatrist_details",
  "mentalHealth.mh_selected_inpatient_5y",
  "mentalHealth.mh_selected_inpatient_details",
  "mentalHealth.mh_selected_unable_work_5y",
  "mentalHealth.mh_selected_unable_work_details",
  "mentalHealth.mh_selected_suicidal_thoughts",
  "mentalHealth.mh_selected_suicide_attempt",
  "mentalHealth.mh_selected_suicide_attempt_details",
  "mentalHealth.mh_selected_disability",
  "mentalHealth.mh_selected_disability_details",
  "nicotineSmoking.nic_ever_used",
  "nicotineSmoking.nic_type_and_amount",
  "nicotineSmoking.nic_date_last_used",
  "alcoholUse.alc_details",
  "riskyBehavior.avi_future_details",
  "riskyBehavior.avi_license_type",
  "riskyBehavior.avi_accident_grounded_fined",
  "riskyBehavior.avi_accident_details",
  "riskyBehavior.avi_hours_pilot",
  "riskyBehavior.avi_hours_crew",
  "riskyBehavior.avi_schedule_flying_time",
  "riskyBehavior.avi_other_flying_details",
  "riskyBehavior.climb_years",
  "riskyBehavior.climb_regions",
  "riskyBehavior.climb_nature",
  "riskyBehavior.climb_bolts",
  "riskyBehavior.climb_no_rope",
  "riskyBehavior.race_track",
  "riskyBehavior.race_professional",
  "riskyBehavior.race_last_date",
  "riskyBehavior.dive_certified",
  "riskyBehavior.dive_instruction_hours",
  "riskyBehavior.dive_certification_date",
  "riskyBehavior.dive_not_certified_reason",
  "riskyBehavior.dive_max_depth",
  "riskyBehavior.dive_schedule",
  "riskyBehavior.dive_equipment",
  "riskyBehavior.dive_salvage_exploration",
  "riskyBehavior.dive_club_member",
  "drivingRecord.drv_details",
  "criminalRecord.crim_details",
  "bankruptcy.bk_type",
  "bankruptcy.bk_chapter7_personal_or_business",
  "bankruptcy.bk_discharged",
  "bankruptcy.bk_discharge_date",
  "bankruptcy.bk_in_process",
  "illegalDrugUse.drug_details",
  "residencyTravel.res_non_us_status",
  "residencyTravel.res_high_risk_countries_details",
  "residencyTravel.res_travel_outside_us_details",
  "residencyTravel.res_foreign_travel_details",
  "occupationFinancial.occ_high_risk_details",
  "militaryService.mil_deployment",
  "militaryService.mil_flying_time",
  "militaryService.mil_job_rank",
  "militaryService.mil_aircraft_duties",
  "optionalContact.contact_name",
  "optionalContact.contact_email",
  "optionalContact.contact_phone",
  "optionalContact.contact_preferred_time",
  "seizureModule.seizure_hospital_visits",
  "seizureModule.seizure_pending_tests",
  "seizureModule.seizure_classification_simple_partial_check",
  "seizureModule.seizure_classification_epilepsy_control",
  "seizureModule.seizure_polytherapy",
  "seizureModule.seizure_underlying_cause",
  "seizureModule.seizure_injuries_accidents",
  "seizureModule.seizure_driving_status",
  "seizureModule.seizure_functional_limitations",
  "seizureModule.seizure_assistance_needed",
  "respiratoryModule.resp_hospital_visits",
  "respiratoryModule.resp_pending_tests",
  "respiratoryModule.copd_history",
  "respiratoryModule.copd_pft_results",
  "respiratoryModule.copd_sob",
  "respiratoryModule.copd_stairs_tolerance",
  "respiratoryModule.copd_oxygen_nebulizer_steroids",
  "respiratoryModule.copd_nicotine_history",
  "respiratoryModule.copd_other_conditions",
  "respiratoryModule.sleep_type",
  "respiratoryModule.sleep_confirmation_method",
  "respiratoryModule.sleep_ahi_rdi",
  "respiratoryModule.sleep_pap_compliance",
  "respiratoryModule.sleep_control_status",
  "respiratoryModule.sleep_repeat_study",
  "respiratoryModule.sleep_functional_limitations",
  "respiratoryModule.sleep_cardio_complications",
  "respiratoryModule.sleep_comorbidities",
  "respiratoryModule.sleep_driving_restrictions",
  "cardioNeuroModule.cardio_neuro_hospitalization",
  "cardioNeuroModule.cardio_neuro_physician_address",
  "cardioNeuroModule.cardio_neuro_physician_phone",
  "cardioNeuroModule.cardio_neuro_last_visit",
  "cardioNeuroModule.cardio_neuro_followup_gaps",
  "cardioNeuroModule.cardio_neuro_pending_tests",
  "cardioNeuroModule.stroke_root_cause",
  "cardioNeuroModule.stroke_imaging_results",
  "cardioNeuroModule.stroke_on_anticoagulated",
  "cardioNeuroModule.stroke_residual_effects",
  "cardioNeuroModule.stroke_cognitive_impairment",
  "cardioNeuroModule.stroke_pfo_asd_history",
  "cardioNeuroModule.stroke_carotid_ultrasound",
  "cardioNeuroModule.stroke_therapy_last_3_12_months",
  "cardioNeuroModule.mi_supporting_evidence",
  "cardioNeuroModule.mi_procedure_details",
  "cardioNeuroModule.mi_vessels_affected",
  "cardioNeuroModule.mi_ongoing_symptoms",
  "cardioNeuroModule.mi_residual_damage",
  "cardioNeuroModule.mi_recent_workup",
  "cardioNeuroModule.cardio_limitations",
  "cardioNeuroModule.cardio_work_status",
  "cardioNeuroModule.cardio_return_to_work",
  "cardioNeuroModule.cardio_disability_benefits",
  "cardioNeuroModule.cardio_adl_iadl_help",
  "cardioNeuroModule.cardio_medical_equipment",
  "cardioNeuroModule.cardio_confinement_status",
  "cardioNeuroModule.cardio_height_weight",
  "cardioNeuroModule.cardio_weight_change_10lbs",
  "cardioNeuroModule.cardio_nicotine_history",
  "cardioNeuroModule.cardio_bp_history",
  "cardioNeuroModule.cardio_lipid_panel",
  "cardioNeuroModule.cardio_diabetes_history",
  "cardioNeuroModule.cardio_other_comorbidities",
  "cardioNeuroModule.cardio_family_history",
  "hypertensionModule.htn_bp_normal_or_elevated_if_unknown",
  "hypertensionModule.htn_med_change_details",
  "hypertensionModule.htn_other_conditions",
  "hypertensionModule.htn_hospitalized_date",
  "hypertensionModule.htn_unable_to_work_details",
  "diabetesModule.dm_insulin_start_date",
  "diabetesModule.dm_reading_unknown",
  "diabetesModule.dm_med_change_details",
  "diabetesModule.dm_noncompliance_details",
  "diabetesModule.dm_er_hospital_details",
  "arthritisModule.arth_last_flare",
  "arthritisModule.arth_unable_work_details",
  "arthritisModule.arth_assistive_devices",
  "arthritisModule.arth_symptoms",
  "arthritisModule.arth_regular_medication",
  "arthritisModule.arth_medication_name",
  "arthritisModule.arth_medication_dosage",
  "arthritisModule.arth_last_doctor_visit",
  "arthritisModule.arth_additional_comments",
  "asthmaModule.asthma_last_attack",
  "asthmaModule.asthma_attacks_per_year",
  "asthmaModule.asthma_triggers",
  "asthmaModule.asthma_steroid_use",
  "asthmaModule.asthma_steroid_last_used",
  "asthmaModule.asthma_hospitalized_5y",
  "asthmaModule.asthma_er_visits",
  "asthmaModule.asthma_status_asthmaticus",
  "asthmaModule.asthma_status_asthmaticus_date",
  "asthmaModule.asthma_allergy_caused",
  "cancerModule.cancer_stage_size_classification",
  "cancerModule.cancer_nodes_spread",
  "cancerModule.cancer_nodes_spread_details",
  "cancerModule.cancer_surgery_5y",
  "cancerModule.cancer_surgery_details",
  "cancerModule.cancer_chemo_radiation_5y",
  "cancerModule.cancer_last_treatment_date",
  "cancerModule.cancer_other_treatments_5y",
  "cancerModule.cancer_other_treatment_details",
  "cancerModule.cancer_tamoxifen_femara",
  "cancerModule.cancer_tamoxifen_femara_last_used",
  "cancerModule.cancer_doctor_frequency_last_seen",
]);

export const DISCLOSURE =
  "Practice worksheet only — not a formal application; does not bind coverage.";
export const ORPHAN_BADGE = "[Note: Populated while parent toggle is No]";
export interface QuestionAnswer {
  question: string;
  applicantAnswer: string;
  underwritingStatus:
    "CLEAR" | "Not answered" | "Not provided" | `Flag: ${string}` | `Note: ${string}`;
  /** Individually escaped medication lines for list rendering. */
  answerItems?: string[];
}
/** `flagCount` counts kind=flag only. Inconsistency notes also appear in `flags` for audit. */
export interface TriggeredFlag extends QuestionAnswer {
  kind: "flag" | "note";
  category: Category | "consents" | "other";
  section: string;
  key: string;
  label: string;
  value: unknown;
  displayValue: string;
  note?: string;
  explanation?: string;
}
interface SummaryAnswer extends QuestionAnswer {
  category: Category | "consents" | "other";
  section: string;
  key: string;
  value: unknown;
  flagged: boolean;
  note?: string;
}
export interface FormattedApplicationEmail {
  subject: string;
  html: string;
  text: string;
  flagCount: number;
  flags: TriggeredFlag[];
}
const registry: FieldRegistry = FIELD_REGISTRY;
const object = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const own = (v: object, k: PropertyKey) => Object.prototype.hasOwnProperty.call(v, k);
const populated = (v: unknown): boolean =>
  typeof v === "string"
    ? v.trim().length > 0
    : Array.isArray(v)
      ? v.some(populated)
      : v !== null && typeof v === "object"
        ? Object.values(v).some(populated)
        : typeof v === "number"
          ? Number.isFinite(v)
          : v === true;
export function escapeHtml(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
/** Used only for future, unregistered keys; current underwriting labels are all explicit. */
export function fallbackLabel(key: string): string {
  return (
    key
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .trim() || "Unrecognized Field"
  );
}
export function formatCurrency(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)
    : "Not Provided";
}
export function formatPhone(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  const digits = text.replace(/\D/g, "");
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : text || "Not Provided";
}
export function formatReceivedAt(receivedAt: string | Date): {
  central: string;
  utc: string;
  shortDate: string;
} {
  const date = new Date(receivedAt);
  if (Number.isNaN(date.getTime())) throw new TypeError("receivedAt must be a valid timestamp");
  const common: Intl.DateTimeFormatOptions = {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return {
    central: new Intl.DateTimeFormat("en-US", {
      ...common,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(date),
    utc: date.toISOString(),
    shortDate: new Intl.DateTimeFormat("en-US", common).format(date),
  };
}
function display(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "Not Provided";
  if (Array.isArray(value)) return value.length ? value.map(display).join("; ") : "None";
  if (typeof value === "object")
    return Object.entries(object(value))
      .map(
        ([k, v]) =>
          `${own(MEDICATION_LABELS, k) ? MEDICATION_LABELS[k as keyof typeof MEDICATION_LABELS] : fallbackLabel(k)}: ${display(v)}`,
      )
      .join(", ");
  return String(value);
}
function categoryFor(section: string): Category | "consents" | "other" {
  return own(CATEGORY_LABELS, section)
    ? (section as Category)
    : own(MODULE_TRIGGERS, section)
      ? "healthMedical"
      : section === "consents"
        ? "consents"
        : "other";
}
function categoryLabel(category: TriggeredFlag["category"]): string {
  return category === "consents"
    ? "Consents"
    : category === "other"
      ? "Additional Disclosures"
      : CATEGORY_LABELS[category];
}
// Keep this trigger vocabulary in parity with the production schema and visible MH detail panel.
const MENTAL_HEALTH_TRIGGER_WORDS = [
  "anxiety",
  "depression",
  "eating disorder",
  "suicid",
  "adjustment",
  "schizophrenia",
  "mental retardation",
  "ocd",
  "panic",
  "bipolar",
  "ptsd",
  "adhd",
  "add",
  "tourette",
];
function parentMatches(input: Record<string, unknown>, p: ParentCondition): boolean {
  const value = object(input[p.section])[p.field];
  if (p.mentalHealthText)
    return (
      typeof value === "string" &&
      MENTAL_HEALTH_TRIGGER_WORDS.some((word) => value.toLowerCase().includes(word))
    );
  if (p.nonempty) return Array.isArray(value) && value.length > 0;
  return p.includes !== undefined
    ? Array.isArray(value) && value.includes(p.includes)
    : value === p.equals;
}
function parentNote(
  input: Record<string, unknown>,
  rule: FieldRule,
  depth = 0,
): string | undefined {
  if (!rule.when?.length || depth > 8) return;
  const matching = rule.when.filter((p) => parentMatches(input, p));
  if (matching.length) {
    const inherited = matching.map((p) =>
      parentNote(input, (registry[p.section] as Record<string, FieldRule>)[p.field], depth + 1),
    );
    return inherited.some((n) => !n) ? undefined : inherited[0];
  }
  if (rule.when.every((p) => object(input[p.section])[p.field] === undefined))
    return "[Note: Populated while parent answer is missing]";
  if (rule.when.every((p) => p.equals === true && object(input[p.section])[p.field] === false))
    return ORPHAN_BADGE;
  if (rule.when.every((p) => p.equals === false && object(input[p.section])[p.field] === true))
    return "[Note: Populated while parent toggle is Yes]";
  return "[Note: Populated while parent condition is inactive]";
}
function moduleActive(section: Section, input: Record<string, unknown>): boolean {
  const triggers = MODULE_TRIGGERS[section];
  if (!triggers) return true;
  const health = object(input.healthMedical);
  const selected = health.conditions_triggered;
  return (
    (Array.isArray(selected) && triggers.some((t) => selected.includes(t))) ||
    (section === "cardioNeuroModule" &&
      health.medical_past2_heart_brain_circulatory_surgery === true)
  );
}
function checkedValue(value: unknown, rule: FieldRule): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (rule.kind === "string" && typeof value === "string" && value.length <= 5000) return value;
  if (rule.kind === "number" && typeof value === "number" && Number.isFinite(value)) return value;
  if (rule.kind === "boolean" && typeof value === "boolean") return value;
  if (
    rule.kind === "array" &&
    Array.isArray(value) &&
    value.every((v) => typeof v === "string" && v.length <= 5000)
  )
    return [...value];
  if (
    (rule.kind === "medications" || rule.kind === "detailedMedications") &&
    Array.isArray(value)
  ) {
    const keys =
      rule.kind === "medications"
        ? ["name", "dosage", "frequency"]
        : [
            "drugName",
            "dosage",
            "startDate",
            "adherence",
            "frequency",
            "lastFillDate",
            "conditionTreated",
          ];
    return value.map((v) => {
      if (v === null || typeof v !== "object" || Array.isArray(v))
        throw new TypeError("Invalid disclosed medication");
      const result: Record<string, string> = {};
      for (const key of keys)
        if (own(v, key)) {
          const field = object(v)[key];
          if (typeof field !== "string" || field.length > 5000)
            throw new TypeError("Invalid disclosed medication field");
          result[key] = field;
        }
      return result;
    });
  }
  throw new TypeError("Invalid disclosed answer type or length");
}
/**
 * Validation still uses the existing pruned schema. This separate presentation snapshot
 * restores schema-known child disclosures omitted by pruning; it never copies unknown
 * fields (including the retired document ID). Validated scalar values always win; a populated child array is restored over a pruned/default empty array.
 * Used at both the client snapshot and server boundary; invalid disclosure types fail explicitly.
 */
export function preserveEmailDisclosures<T extends ApplicationInput>(
  validated: T,
  original: unknown,
): T {
  const result: Record<string, unknown> = {};
  const clean = object(validated);
  const source = object(original);
  for (const section of Object.keys(registry) as Section[]) {
    const supplied = object(source[section]);
    const existing = object(clean[section]);
    const target: Record<string, unknown> = {};
    for (const [key, rule] of Object.entries(registry[section])) {
      const validatedField = own(existing, key);
      if (!validatedField && !own(supplied, key)) continue;
      const restoreArray =
        ["array", "medications", "detailedMedications"].includes(rule.kind) &&
        !populated(existing[key]) &&
        populated(supplied[key]);
      const value = checkedValue(
        validatedField && !restoreArray ? existing[key] : supplied[key],
        rule,
      );
      if (value !== undefined && (validatedField || populated(value) || typeof value === "boolean"))
        target[key] = value;
    }
    if (Object.keys(target).length) result[section] = target;
  }
  return result as T;
}
function headerValue(value: unknown, limit = 80): string {
  const cleaned = Array.from(typeof value === "string" ? value : "")
    .map((char) => {
      const code = char.codePointAt(0)!;
      return code < 32 ||
        (code >= 127 && code <= 159) ||
        [
          0x2028, 0x2029, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
        ].includes(code)
        ? " "
        : char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(cleaned).slice(0, limit).join("");
}
const textOr = (v: unknown, fallback = "Not Provided") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;
const styles = {
  page: "margin:0;padding:16px;background:#f1f5f9;color:#172033;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;",
  card: "padding:16px;margin:16px 0;border:1px solid #cbd5e1;border-radius:8px;background:#ffffff;",
  table:
    "width:100%;table-layout:fixed;border-collapse:collapse;overflow-wrap:anywhere;word-break:break-word;",
  heading: "font-size:18px;margin:0 0 10px;break-after:avoid;page-break-after:avoid;",
};
function medicationAnswers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const medication = object(entry);
    const name = textOr(medication.name ?? medication.drugName, "Medication name not provided");
    const fields = [
      "dosage",
      "frequency",
      "startDate",
      "adherence",
      "lastFillDate",
      "conditionTreated",
    ] as const;
    const detail = fields
      .filter((key) => populated(medication[key]))
      .map((key) => `${MEDICATION_LABELS[key]}: ${display(medication[key])}`);
    return `${name}${detail.length ? ` (${detail.join(", ")})` : ""}`;
  });
}
function describeAnswer(
  section: Section,
  key: string,
  value: unknown,
  rule: FieldRule,
  risk: boolean,
  note?: string,
): QuestionAnswer {
  const absent = value === undefined || value === null || value === "";
  const answerItems =
    rule.kind === "medications" || rule.kind === "detailedMedications"
      ? medicationAnswers(value)
      : undefined;
  const applicantAnswer = absent
    ? rule.kind === "boolean"
      ? "Not answered"
      : "Not provided"
    : answerItems
      ? answerItems.join("\n") || "None"
      : section === "occupationFinancial" && key === "occ_annual_salary"
        ? formatCurrency(value)
        : section === "optionalContact" && key === "contact_phone"
          ? formatPhone(value)
          : display(value);
  return {
    question: rule.question,
    applicantAnswer,
    underwritingStatus: risk
      ? `Flag: ${rule.flagExplanation ?? rule.flagLabel ?? rule.label}`
      : note
        ? `Note: ${note.replace(/^\[Note:\s*|\]$/g, "")}`
        : absent
          ? rule.kind === "boolean"
            ? "Not answered"
            : "Not provided"
          : "CLEAR",
    ...(answerItems ? { answerItems } : {}),
  };
}
function answerHtml(item: QuestionAnswer): string {
  return item.answerItems?.length
    ? `<ul style="margin:0;padding-left:16px;">${item.answerItems.map((line) => `<li style="margin:0 0 5px;">${escapeHtml(line)}</li>`).join("")}</ul>`
    : escapeHtml(item.applicantAnswer).replace(/\n/g, "<br>");
}
function answerText(item: QuestionAnswer): string {
  return item.answerItems?.length
    ? item.answerItems.map((line) => `  • ${line}`).join("\n")
    : item.applicantAnswer;
}
function itemText(item: TriggeredFlag): string {
  return `Question Asked: ${item.question}\nApplicant's Answer: ${answerText(item)}\nUnderwriting Takeaway: ${item.underwritingStatus}${item.explanation ? `\n${item.explanation}` : ""}`;
}
/** Pure, dependency-free formatter. The sender must still enforce validation and both consents. */
export function formatApplicationEmail(
  payload: ApplicationInput,
  receivedAt: string | Date,
): FormattedApplicationEmail {
  const input = object(payload);
  for (const section of Object.keys(registry) as Section[]) {
    for (const [key, rule] of Object.entries(registry[section])) {
      const value = object(input[section])[key];
      if (value !== undefined && value !== null && value !== "") checkedValue(value, rule);
    }
  }
  const stamp = formatReceivedAt(receivedAt);
  const flags: TriggeredFlag[] = [];
  const medicationDetails: TriggeredFlag[] = [];
  const summaryAnswers: SummaryAnswer[] = [];
  const stats = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, { total: 0, clear: 0, missing: 0 }]),
  ) as Record<Category, { total: number; clear: number; missing: number }>;
  for (const section of Object.keys(registry) as Section[]) {
    const values = object(input[section]);
    const active = moduleActive(section, input);
    const category = categoryFor(section);
    for (const [key, rule] of Object.entries(registry[section])) {
      const value = values[key];
      const localNote = parentNote(input, rule);
      const note =
        !active && (populated(value) || (value === false && rule.risk === "false"))
          ? "[Note: Populated while condition follow-up is inactive]"
          : localNote;
      const contextActive = active && !localNote;
      const consent = section === "consents";
      const rawRisk =
        rule.risk === "true"
          ? value === true
          : rule.risk === "false"
            ? consent
              ? value !== true
              : value === false && contextActive
            : rule.risk === "present"
              ? populated(value)
              : rule.risk === "residency"
                ? typeof value === "string" &&
                  ![
                    "U.S. Citizen",
                    "Permanent Resident",
                    "Permanent Resident (Green Card)",
                  ].includes(value)
                : false;
      const risk = rawRisk && (consent || contextActive);
      if (
        category !== "consents" &&
        category !== "other" &&
        rule.risk !== "none" &&
        contextActive
      ) {
        // Optional follow-ups are counted only when answered or their parent is active.
        if (
          !OPTIONAL_FIELDS.has(`${section}.${key}`) ||
          value !== undefined ||
          (rule.when && contextActive)
        ) {
          stats[category].total++;
          if (value === undefined || value === null || value === "") stats[category].missing++;
          else if (!risk) stats[category].clear++;
        }
      }
      const hasDisclosure = populated(value) || (value === false && rule.risk === "false");
      const answer = describeAnswer(section, key, value, rule, risk, note);
      if (
        category !== "consents" &&
        category !== "other" &&
        (contextActive || (hasDisclosure && note))
      ) {
        summaryAnswers.push({
          ...answer,
          category,
          section,
          key,
          value,
          flagged: risk,
          ...(note ? { note } : {}),
        });
      }
      if (risk || (hasDisclosure && note)) {
        const isMissingConsent = consent && value !== true;
        flags.push({
          kind: risk ? "flag" : "note",
          category,
          section,
          key,
          ...answer,
          label: risk ? (rule.flagLabel ?? rule.label) : rule.label,
          value: value === undefined ? null : value,
          displayValue: isMissingConsent
            ? "Missing"
            : risk && rule.risk === "false" && value === false
              ? "No (Flag)"
              : display(value),
          ...(note ? { note } : {}),
          ...(key === "res_foreign_travel_details" && note === ORPHAN_BADGE
            ? {
                explanation:
                  "This general field can contain historical travel. No to future travel does not by itself establish a contradiction; this note does not increase the underwriting flag count.",
              }
            : {}),
        });
      } else if (
        hasDisclosure &&
        (rule.kind === "medications" || rule.kind === "detailedMedications")
      ) {
        medicationDetails.push({
          kind: "note",
          category,
          section,
          key,
          ...answer,
          label: rule.label,
          value,
          displayValue: display(value),
        });
      }
    }
    // A future key is never assigned underwriting meaning by string manipulation.
    for (const [key, value] of Object.entries(values))
      if (!own(registry[section], key) && populated(value)) {
        // Retired IDs are not part of the supported schema and must never be emailed.
        if (key === "res_green_card_or_visa_id") continue;
        flags.push({
          kind: "note",
          category,
          section,
          key,
          label: fallbackLabel(key),
          question: fallbackLabel(key),
          applicantAnswer: display(value),
          underwritingStatus: "Note: Unmapped field; manual review required",
          value,
          displayValue: display(value),
          note: "[Note: Unmapped field; manual review required]",
        });
      }
  }
  for (const [section, value] of Object.entries(input))
    if (!own(registry, section) && populated(value)) {
      flags.push({
        kind: "note",
        category: "other",
        section,
        key: section,
        label: fallbackLabel(section),
        question: fallbackLabel(section),
        applicantAnswer: display(value),
        underwritingStatus: "Note: Unmapped section; manual review required",
        value,
        displayValue: display(value),
        note: "[Note: Unmapped section; manual review required]",
      });
    }
  const flagCount = flags.filter((f) => f.kind === "flag").length;
  const noteCount = flags.filter((f) => f.kind === "note" || f.note).length;
  const missing = Object.values(stats).reduce((sum, s) => sum + s.missing, 0);
  const health = object(input.healthMedical),
    contact = object(input.optionalContact),
    occupation = object(input.occupationFinancial),
    residency = object(input.residencyTravel),
    consents = object(input.consents);
  const name = headerValue(contact.contact_name) || "Anonymous";
  const age =
    typeof health.age === "number" && Number.isFinite(health.age) ? String(health.age) : "?";
  const gender = headerValue(health.genderSex, 1).toUpperCase() || "?";
  const state = headerValue(health.stateOfBirth, 20) || "Unknown";
  const subject = `[Practice App] ${name} | ${age}${gender} - ${state} | ${flagCount} Flag${flagCount === 1 ? "" : "s"} (${stamp.shortDate})`;
  const profile: [string, string][] = [
    ["Name", textOr(contact.contact_name)],
    ["DOB / Age", `${textOr(health.dob)} (Age ${age})`],
    ["Email", textOr(contact.contact_email)],
    ["Gender / Birth State", `${textOr(health.genderSex)} / ${textOr(health.stateOfBirth)}`],
    ["Phone", formatPhone(contact.contact_phone)],
    ["Citizenship / Status", textOr(residency.res_citizen_or_resident)],
    ["Occupation", textOr(occupation.occ_current_occupation)],
    ["Annual Salary", formatCurrency(occupation.occ_annual_salary)],
    ["Contact Consent", consents.consent_contact === true ? "✅ Granted" : "❌ Missing"],
    ["Disclaimer Consent", consents.consent_disclaimer === true ? "✅ Granted" : "❌ Missing"],
  ];
  if (populated(contact.contact_preferred_time))
    profile.push(["Preferred Contact Time", display(contact.contact_preferred_time)]);
  const cell = ([label, value]: [string, string]) => {
    let html = escapeHtml(value);
    if (
      label === "Email" &&
      !Array.from(value).some((c) => c.charCodeAt(0) < 32) &&
      /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value)
    )
      html = `<a href="mailto:${escapeHtml(encodeURIComponent(value))}" style="color:#1d4ed8;">${html}</a>`;
    if (label.endsWith("Consent"))
      html = `<span style="color:${value.includes("Granted") ? "#166534" : "#991b1b"};">${html}</span>`;
    return `<td width="50%" valign="top" style="padding:7px 8px;overflow-wrap:anywhere;word-break:break-word;"><strong>${escapeHtml(label)}:</strong> ${html}</td>`;
  };
  let profileRows = "";
  for (let i = 0; i < profile.length; i += 2)
    profileRows += `<tr>${cell(profile[i])}${profile[i + 1] ? cell(profile[i + 1]) : "<td></td>"}</tr>`;
  const banner = flagCount
    ? `${flagCount} Underwriting Flag${flagCount === 1 ? "" : "s"} Triggered`
    : missing
      ? `No flags in answered questions; ${missing} flag question(s) not answered`
      : "✅ No Underwriting Flags Triggered Across All 12 Categories";
  const noteBanner = noteCount
    ? `${noteCount} Disclosed Context Note${noteCount === 1 ? "" : "s"}`
    : "";
  // Routine follow-up answers are shown once in Section B. Section A is
  // reserved for triggered rules, medication disclosures and explicit notes.
  const allItems = [...flags, ...medicationDetails];
  const groups = [...CATEGORY_ORDER, "consents", "other"] as const;
  const moduleTitles: Partial<Record<Section, string>> = {
    seizureModule: "Seizure Disorder",
    respiratoryModule: "Sleep Apnea / COPD / Respiratory",
    cardioNeuroModule: "Stroke / TIA / Heart Attack",
    hypertensionModule: "High Blood Pressure",
    diabetesModule: "Diabetes",
    arthritisModule: "Arthritis",
    asthmaModule: "Asthma",
    cancerModule: "Cancer",
  };
  const contextHtml = (section: string) =>
    moduleTitles[section as Section]
      ? `<div style="font-size:10px;color:#64748b;margin-bottom:3px;">${escapeHtml(moduleTitles[section as Section])}</div>`
      : "";
  const ordered = groups.flatMap((category) =>
    allItems.filter((item) => item.category === category),
  );
  const flagRows = ordered
    .map(
      (
        item,
      ) => `<tr valign="top" style="break-inside:avoid;border-bottom:1px solid #e2e8f0;background:${item.kind === "flag" ? "#fff7ed" : "#ffffff"};">
    <td>${escapeHtml(categoryLabel(item.category))}</td>
    <td>${contextHtml(item.section)}${escapeHtml(item.question)}</td>
    <td>${answerHtml(item)}</td>
    <td style="color:${item.kind === "flag" ? "#9a3412" : "#475569"};">${escapeHtml(item.note ?? item.underwritingStatus)}${item.explanation ? `<p style="font-size:11px;margin:5px 0 0;">${escapeHtml(item.explanation)}</p>` : ""}</td>
  </tr>`,
    )
    .join("");
  const flagsHtml = ordered.length
    ? `<table aria-label="Underwriting flags and disclosed details" cellpadding="7" cellspacing="0" style="${styles.table}font-size:12px;line-height:1.4;">
    <thead style="display:table-header-group;"><tr style="background:#e2e8f0;text-align:left;">
      <th scope="col" width="17%">Category</th>
      <th scope="col" width="35%">Question Asked</th>
      <th scope="col" width="23%">Applicant's Answer</th>
      <th scope="col" width="25%">Underwriting Takeaway</th>
    </tr></thead><tbody>${flagRows}</tbody></table>`
    : "<p>No additional details disclosed.</p>";
  const flagsText = ordered
    .map(
      (item) =>
        `${categoryLabel(item.category)}${moduleTitles[item.section as Section] ? ` / ${moduleTitles[item.section as Section]}` : ""}\n${itemText(item)}`,
    )
    .join("\n\n");
  let breakdownHtml = "",
    breakdownText = "";
  for (const category of CATEGORY_ORDER) {
    const triggered = flags.filter((item) => item.category === category && item.kind === "flag");
    const notes = flags.filter(
      (item) => item.category === category && (item.kind === "note" || item.note),
    ).length;
    const s = stats[category];
    const row = triggered.length
      ? `${CATEGORY_LABELS[category]} — ${triggered.length} flag(s); ${s.clear} clear, ${s.missing} not answered`
      : s.missing
        ? `○ ${CATEGORY_LABELS[category]} — No flags in answered questions (${s.missing} not answered)`
        : notes
          ? `ℹ️ ${CATEGORY_LABELS[category]} — No rule flags; ${notes} disclosed note(s) (0/${s.total} flags)`
          : `✅ ${CATEGORY_LABELS[category]} — All Clear (0/${s.total} flags)`;
    const answers = summaryAnswers.filter((answer) => answer.category === category);
    const rows = answers
      .map((answer) => {
        const clear = typeof answer.value === "boolean" && answer.underwritingStatus === "CLEAR";
        const tag = answer.flagged ? " (Flag)" : clear ? " (Clear)" : "";
        return `<tr valign="top" style="break-inside:avoid;border-bottom:1px solid #e2e8f0;${answer.flagged ? "background:#fff7ed;color:#7c2d12;" : ""}"><td>${moduleTitles[answer.section as Section] ? `<small>${escapeHtml(moduleTitles[answer.section as Section])}</small><br>` : ""}${escapeHtml(answer.question)}</td><td>${answerHtml(answer)}${tag ? escapeHtml(tag) : ""}${answer.note ? `<div style="font-size:10px;color:#854d0e;">${escapeHtml(answer.note)}</div>` : ""}</td></tr>`;
      })
      .join("");
    breakdownHtml += `<h3 style="font-size:14px;margin:16px 0 5px;padding:7px 8px;background:${triggered.length ? "#fff7ed" : s.missing || notes ? "#f1f5f9" : "#f0fdf4"};color:${triggered.length ? "#9a3412" : s.missing || notes ? "#475569" : "#166534"};break-after:avoid;page-break-after:avoid;">${escapeHtml(row)}</h3><table aria-label="${escapeHtml(CATEGORY_LABELS[category])} questions and answers" cellpadding="3" cellspacing="0" style="${styles.table}font-size:11px;line-height:1.35;color:#475569;"><thead style="display:table-header-group;"><tr style="text-align:left;background:#f8fafc;"><th scope="col" width="72%">Question Asked</th><th scope="col" width="28%">Applicant's Answer</th></tr></thead><tbody>${rows}</tbody></table>`;
    breakdownText += `${row}\n${answers.map((answer) => `${moduleTitles[answer.section as Section] ? `${moduleTitles[answer.section as Section]} — ` : ""}${answer.question}\n  ${answerText(answer)}${answer.flagged ? " (Flag)" : typeof answer.value === "boolean" && answer.underwritingStatus === "CLEAR" ? " (Clear)" : ""}${answer.note ? `\n  ${answer.note}` : ""}`).join("\n")}\n\n`;
  }
  // Known privacy-retired field is removed even when this pure function is called directly.
  const auditPayload = structuredClone(payload);
  if (auditPayload.residencyTravel)
    delete (auditPayload.residencyTravel as unknown as Record<string, unknown>)
      .res_green_card_or_visa_id;
  // Keep the complete supported audit payload; compact formatting avoids the
  // many one-key-per-line pages Gmail prints when it expands <details>.
  const raw = JSON.stringify(auditPayload);
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Practice Application Summary</title></head>
<body style="${styles.page}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;table-layout:fixed;"><tr><td>
<div style="padding:18px;background:#142d4e;color:#ffffff;border-radius:8px;"><h1 style="font-size:22px;margin:0 0 8px;">Practice Life Insurance Application — Triage Summary</h1><strong>${DISCLOSURE}</strong><p style="margin:8px 0 0;">Received: ${escapeHtml(stamp.central)}<br><span style="font-family:monospace;font-size:12px;">UTC: ${escapeHtml(stamp.utc)}</span></p></div>
<div style="${styles.card}"><h2 style="${styles.heading}">Applicant &amp; Contact Profile</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">${profileRows}</table></div>
<div style="${styles.card}"><h2 style="${styles.heading}">A — Underwriting Flags &amp; Disclosed Notes</h2>
<p style="margin:0 0 8px;padding:9px;background:${flagCount ? "#fff7ed" : "#f0fdf4"};color:${flagCount ? "#9a3412" : "#166534"};font-weight:bold;break-inside:avoid;page-break-inside:avoid;">${escapeHtml(banner)}</p>
${noteCount ? `<p style="margin:0 0 10px;padding:7px 9px;background:#f1f5f9;font-weight:bold;">${escapeHtml(noteBanner)}</p>` : ""}${flagsHtml}</div>
<div style="${styles.card}"><h2 style="${styles.heading}">B — Full Question &amp; Answer Summary</h2>${breakdownHtml}</div>
<div style="${styles.card}"><h2 style="${styles.heading}">C — Raw Payload</h2><details><summary style="font-weight:bold;cursor:pointer;">View Raw JSON Payload</summary><pre style="font-size:10px;line-height:1.25;white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;margin:8px 0 0;">${escapeHtml(raw)}</pre></details></div>
</td></tr></table></td></tr></table></body></html>`;
  const text = `Practice Life Insurance Application — Triage Summary\n${DISCLOSURE}\nReceived: ${stamp.central}\nUTC: ${stamp.utc}\n\nAPPLICANT & CONTACT PROFILE\n${profile.map(([key, value]) => `${key}: ${value}`).join("\n")}\n\nA — UNDERWRITING FLAGS & DISCLOSED NOTES\n${banner}${noteBanner ? `\n${noteBanner}` : ""}\n\n${flagsText || "No additional details disclosed."}\n\nB — FULL QUESTION & ANSWER SUMMARY\n${breakdownText}\nC — AUDIT\nView Raw JSON Payload\n${raw}\n`;
  return { subject, html, text, flagCount, flags };
}
