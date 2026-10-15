import { DIABETES_COMPLICATIONS } from "@/lib/practiceApplication.schema";
import type { ModuleSpec } from "./ModuleRenderer";

export const seizureSpec: ModuleSpec = {
  id: "seizureModule",
  title: "Seizure Disorder — Additional Questions",
  fields: [
    {
      key: "seizure_diagnosis",
      label:
        "Exact official diagnosis (epilepsy, tonic-clonic, absence, partial, single event…)",
      type: "text",
    },
    {
      key: "seizure_diagnosis_date",
      label: "Exact date of diagnosis",
      type: "date",
    },
    { key: "seizure_age_at_onset", label: "Age at onset", type: "number" },
    {
      key: "seizure_total_count",
      label: "Total seizures/episodes",
      type: "number",
    },
    {
      key: "seizure_most_recent_date",
      label: "Date of most recent seizure",
      type: "date",
    },
    {
      key: "seizure_frequency",
      label: "Frequency (daily, monthly, yearly, seizure-free duration)",
      type: "text",
    },
    {
      key: "seizure_treatments",
      label: "Past and current treatments or therapies",
      type: "longText",
    },
    {
      key: "seizure_medications",
      label: "Anticonvulsant medications (name, dosage, start date, adherence)",
      type: "medsDetailed",
    },
    {
      key: "seizure_physician_name",
      label: "Treating neurologist/physician name",
      type: "text",
    },
    {
      key: "seizure_physician_address",
      label: "Physician address",
      type: "longText",
    },
    { key: "seizure_physician_phone", label: "Physician phone", type: "phone" },
    { key: "seizure_last_visit", label: "Date of last visit", type: "date" },
    {
      key: "seizure_last_visit_reason_result",
      label: "Reason/result of last visit and monitoring frequency",
      type: "longText",
    },
    {
      key: "seizure_hospital_visits",
      label: "Hospital/ER/urgent care visits due to seizures (dates, outcomes)",
      type: "longText",
    },
    {
      key: "seizure_pending_tests",
      label: "Advised tests (EEG, MRI, CT) not completed, pending, or abnormal",
      type: "longText",
    },
    {
      key: "seizure_classification_simple_partial_check",
      label:
        "If simple/complex partial or absence: no seizures for 2+ years and no loss of consciousness?",
      type: "yesNo",
    },
    {
      key: "seizure_classification_epilepsy_control",
      label:
        "If epilepsy/tonic-clonic: how long seizure-free and controlled on medication?",
      type: "text",
    },
    {
      key: "seizure_polytherapy",
      label: "Do you require multiple anti-seizure drugs (polytherapy)?",
      type: "yesNo",
    },
    {
      key: "seizure_underlying_cause",
      label:
        "Underlying cause (head trauma, tumor, infection, stroke, withdrawal…)",
      type: "longText",
    },
    {
      key: "seizure_injuries_accidents",
      label: "Injuries, burns, or accidents resulting from a seizure",
      type: "longText",
    },
    {
      key: "seizure_driving_status",
      label:
        "License suspended/revoked/restricted? Currently permitted to drive?",
      type: "longText",
    },
    {
      key: "seizure_functional_limitations",
      label: "Limits on full-time work, machinery, or daily activities",
      type: "longText",
    },
    {
      key: "seizure_assistance_needed",
      label: "Need assistance or assistive devices for daily activities",
      type: "longText",
    },
  ],
};

export const respiratorySpec: ModuleSpec = {
  id: "respiratoryModule",
  title: "Sleep Apnea / COPD / Respiratory — Additional Questions",
  fields: [
    { key: "resp_diagnosis", label: "Exact official diagnosis", type: "text" },
    {
      key: "resp_date_first_diagnosed",
      label: "Date first diagnosed",
      type: "date",
    },
    { key: "resp_age_at_onset", label: "Age at onset", type: "number" },
    {
      key: "resp_symptoms_frequency",
      label: "Symptoms, frequency, and most recent flare-up",
      type: "longText",
    },
    {
      key: "resp_treatments",
      label: "Past and current treatments / management plan",
      type: "longText",
    },
    {
      key: "resp_medications",
      label: "Medications (inhalers, bronchodilators, steroids…)",
      type: "medsDetailed",
    },
    {
      key: "resp_physician_name",
      label: "Treating physician / pulmonologist / sleep specialist",
      type: "text",
    },
    {
      key: "resp_physician_address",
      label: "Physician address",
      type: "longText",
    },
    { key: "resp_physician_phone", label: "Physician phone", type: "phone" },
    { key: "resp_last_visit", label: "Date of last visit", type: "date" },
    {
      key: "resp_last_visit_reason_result",
      label: "Reason/result of last visit and monitoring frequency",
      type: "longText",
    },
    {
      key: "resp_hospital_visits",
      label: "Hospital/ER/urgent care visits (dates, outcomes)",
      type: "longText",
    },
    {
      key: "resp_pending_tests",
      label: "Pending/abnormal tests or evaluations",
      type: "longText",
    },
    {
      key: "copd_history",
      label:
        "History of emphysema, chronic bronchitis, bronchiectasis, other chronic lung disease",
      type: "longText",
    },
    {
      key: "copd_pft_results",
      label: "PFT/spirometry results (FEV1, FVC %)",
      type: "longText",
    },
    {
      key: "copd_sob",
      label: "Shortness of breath / dyspnea on exertion?",
      type: "yesNo",
    },
    {
      key: "copd_stairs_tolerance",
      label:
        "Can you climb one flight of stairs with little/no shortness of breath?",
      type: "yesNo",
    },
    {
      key: "copd_oxygen_nebulizer_steroids",
      label:
        "Ever advised to use / currently use oxygen, nebulizer, or steroids?",
      type: "yesNo",
    },
    {
      key: "copd_nicotine_history",
      label:
        "Smoking/nicotine history (type, frequency, last used, quit history)",
      type: "longText",
    },
    {
      key: "copd_other_conditions",
      label:
        "Other respiratory conditions (asthma, fibrosis, cystic fibrosis, chronic cough…)",
      type: "longText",
    },
    {
      key: "sleep_type",
      label: "Type of sleep apnea",
      type: "select",
      options: ["Obstructive sleep apnea", "Central sleep apnea", "Mixed"],
    },
    {
      key: "sleep_confirmation_method",
      label: "How was the diagnosis confirmed?",
      type: "select",
      options: [
        "Home sleep apnea test",
        "Attended polysomnography / sleep study",
        "Other",
      ],
    },
    { key: "sleep_ahi_rdi", label: "AHI / RDI score", type: "text" },
    {
      key: "sleep_treatment",
      label: "Treatment prescribed",
      type: "multi",
      options: [
        "CPAP",
        "BiPAP",
        "APAP",
        "Oral appliance",
        "Positional therapy",
        "UPPP",
        "Other surgery",
      ],
    },
    {
      key: "sleep_pap_compliance",
      label: "PAP compliance, average nightly hours, adherence data",
      type: "longText",
    },
    {
      key: "sleep_control_status",
      label:
        "Controlled, or ongoing daytime sleepiness/fatigue/witnessed apneas?",
      type: "longText",
    },
    {
      key: "sleep_repeat_study",
      label: "Repeat sleep study results",
      type: "longText",
    },
    {
      key: "sleep_functional_limitations",
      label: "Limits on exertion, work, or ADLs",
      type: "longText",
    },
    {
      key: "sleep_cardio_complications",
      label:
        "Pulmonary hypertension, cor pulmonale, AFib, high blood pressure…",
      type: "longText",
    },
    {
      key: "sleep_comorbidities",
      label:
        "Diabetes, obesity (height/weight), kidney disease, depression, anxiety",
      type: "longText",
    },
    {
      key: "sleep_driving_restrictions",
      label: "Driving/machinery restrictions due to fatigue or impairment",
      type: "longText",
    },
  ],
};

export const hypertensionSpec: ModuleSpec = {
  id: "hypertensionModule",
  title: "High Blood Pressure — Additional Questions",
  fields: [
    { key: "htn_dx_date", label: "Date hypertension diagnosed", type: "month" },
    {
      key: "htn_meds_last12months",
      label: "Taken BP medication within the last 12 months?",
      type: "yesNo",
    },
    {
      key: "htn_current_meds",
      label: "Current prescription medications",
      type: "meds",
    },
    {
      key: "htn_last_doctor_visit",
      label: "Date of last doctor visit",
      type: "date",
    },
    {
      key: "htn_last_bp",
      label: "Last blood pressure reading (e.g., 128/82)",
      type: "text",
    },
    {
      key: "htn_bp_normal_or_elevated_if_unknown",
      label: "If unknown, reported as normal or elevated?",
      type: "text",
    },
    {
      key: "htn_med_change",
      label: "Any change/increase in medication in the last 12 months?",
      type: "yesNo",
    },
    {
      key: "htn_med_change_details",
      label: "What was the change?",
      type: "longText",
      showWhen: { key: "htn_med_change" },
    },
    {
      key: "htn_compliant",
      label: "Compliant with medications as directed?",
      type: "yesNo",
    },
    {
      key: "htn_other_conditions",
      label:
        "Other conditions from hypertension in last 2 years (kidney disease, proteinuria, heart/circulatory)",
      type: "longText",
    },
    {
      key: "htn_hospitalized_5y",
      label: "Hospitalized due to blood pressure in the last 5 years?",
      type: "yesNo",
    },
    {
      key: "htn_hospitalized_date",
      label: "Date of hospitalization",
      type: "date",
      showWhen: { key: "htn_hospitalized_5y" },
    },
    {
      key: "htn_unable_to_work_5y",
      label: "Unable to work due to high blood pressure in the past 5 years?",
      type: "yesNo",
    },
    {
      key: "htn_unable_to_work_details",
      label: "Dates and duration of absences",
      type: "longText",
      showWhen: { key: "htn_unable_to_work_5y" },
    },
  ],
};

export const diabetesSpec: ModuleSpec = {
  id: "diabetesModule",
  title: "Diabetes — Additional Questions",
  fields: [
    { key: "dm_dx_date", label: "Date diabetes diagnosed", type: "month" },
    {
      key: "dm_control_method",
      label: "How is the condition controlled?",
      type: "multi",
      options: ["Oral Medication", "Diet Only", "Insulin"],
    },
    {
      key: "dm_insulin_start_date",
      label: "Date insulin use began",
      type: "date",
      showWhen: { key: "dm_control_method", includes: "Insulin" },
    },
    { key: "dm_current_meds", label: "All current medications", type: "meds" },
    {
      key: "dm_last_blood_sugar",
      label: "Last blood sugar reading",
      type: "text",
    },
    {
      key: "dm_last_blood_sugar_date",
      label: "Date of that reading",
      type: "date",
    },
    { key: "dm_last_a1c", label: "Last A1C reading", type: "text" },
    { key: "dm_last_a1c_date", label: "Date of that A1C", type: "date" },
    {
      key: "dm_reading_unknown",
      label: "If unknown, reported as elevated or normal?",
      type: "text",
    },
    {
      key: "dm_med_change",
      label: "Medication change/increase in last 12 months?",
      type: "yesNo",
    },
    {
      key: "dm_med_change_details",
      label: "Please explain",
      type: "longText",
      showWhen: { key: "dm_med_change" },
    },
    {
      key: "dm_compliant",
      label: "Compliant with medications as directed?",
      type: "yesNo",
    },
    {
      key: "dm_noncompliance_details",
      label: "Please explain",
      type: "longText",
      showWhen: { key: "dm_compliant", equals: false },
    },
    {
      key: "dm_complications",
      label: "Ever had or been advised you have:",
      type: "multi",
      options: DIABETES_COMPLICATIONS,
    },
    {
      key: "dm_er_hospital_5y",
      label: "Hospitalized or ER visit due to diabetes in the past 5 years?",
      type: "yesNo",
    },
    {
      key: "dm_er_hospital_details",
      label: "Details",
      type: "longText",
      showWhen: { key: "dm_er_hospital_5y" },
    },
  ],
};

export const arthritisSpec: ModuleSpec = {
  id: "arthritisModule",
  title: "Arthritis — Additional Questions",
  fields: [
    {
      key: "arth_type",
      label: "Type (osteoarthritis, rheumatoid, other)",
      type: "text",
    },
    { key: "arth_joints", label: "Which joints?", type: "text" },
    {
      key: "arth_duration",
      label: "How long have you had arthritis?",
      type: "text",
    },
    { key: "arth_last_flare", label: "Date of last flare-up", type: "date" },
    {
      key: "arth_unable_work_5y",
      label:
        "Unable to work, perform normal activities, or confined at home in past 5 years?",
      type: "yesNo",
    },
    {
      key: "arth_unable_work_details",
      label: "Details",
      type: "longText",
      showWhen: { key: "arth_unable_work_5y" },
    },
    {
      key: "arth_assistive_devices",
      label: "Need canes, crutches, or a wheelchair?",
      type: "text",
    },
    {
      key: "arth_symptoms",
      label: "Symptoms (swollen joints, limited motion…)",
      type: "text",
    },
    {
      key: "arth_regular_medication",
      label: "Regular medication or injections?",
      type: "yesNo",
    },
    {
      key: "arth_medication_name",
      label: "Medication name",
      type: "text",
      showWhen: { key: "arth_regular_medication" },
    },
    {
      key: "arth_medication_dosage",
      label: "Dosage",
      type: "text",
      showWhen: { key: "arth_regular_medication" },
    },
    {
      key: "arth_last_doctor_visit",
      label: "Date of last visit with this doctor",
      type: "date",
    },
    {
      key: "arth_additional_comments",
      label: "Additional comments",
      type: "longText",
    },
  ],
};

export const asthmaSpec: ModuleSpec = {
  id: "asthmaModule",
  title: "Asthma — Additional Questions",
  fields: [
    {
      key: "asthma_dx_date",
      label: "When was asthma diagnosed?",
      type: "month",
    },
    { key: "asthma_last_attack", label: "Date of last attack", type: "month" },
    {
      key: "asthma_attacks_per_year",
      label: "Attacks per year",
      type: "number",
    },
    {
      key: "asthma_triggers",
      label: "What precipitates the attacks?",
      type: "longText",
    },
    {
      key: "asthma_current_meds",
      label: "Current prescription medications",
      type: "meds",
    },
    {
      key: "asthma_steroid_use",
      label: "Ever used steroid medication (e.g., Prednisone)?",
      type: "yesNo",
    },
    {
      key: "asthma_steroid_last_used",
      label: "Date last used (and how long)",
      type: "date",
      showWhen: { key: "asthma_steroid_use" },
    },
    {
      key: "asthma_hospitalized_5y",
      label: "Hospitalized for asthma in past 5 years?",
      type: "yesNo",
    },
    {
      key: "asthma_er_visits",
      label: "Seen in the ER for asthma?",
      type: "yesNo",
    },
    {
      key: "asthma_status_asthmaticus",
      label: "Ever diagnosed with status asthmaticus?",
      type: "yesNo",
    },
    {
      key: "asthma_status_asthmaticus_date",
      label: "Date",
      type: "month",
      showWhen: { key: "asthma_status_asthmaticus" },
    },
    {
      key: "asthma_allergy_caused",
      label: "Described as caused by an allergy?",
      type: "yesNo",
    },
  ],
};

export const cancerSpec: ModuleSpec = {
  id: "cancerModule",
  title: "Cancer / Tumor — Additional Questions",
  fields: [
    {
      key: "cancer_tumor_diagnosed_as_cancer",
      label: "Was your tumor diagnosed as cancer?",
      type: "yesNo",
    },
    { key: "cancer_dx_date", label: "When was it diagnosed?", type: "month" },
    {
      key: "cancer_location_diagnosis",
      label: "Location and diagnosis",
      type: "longText",
    },
    {
      key: "cancer_stage_size_classification",
      label: "Stage, size, classification (Dukes, Gleason…) if known",
      type: "longText",
    },
    {
      key: "cancer_nodes_spread",
      label: "Did it spread to lymph nodes or elsewhere?",
      type: "yesNo",
    },
    {
      key: "cancer_nodes_spread_details",
      label: "Details",
      type: "longText",
      showWhen: { key: "cancer_nodes_spread" },
    },
    {
      key: "cancer_surgery_5y",
      label: "Surgery to remove the tumor in past 5 years?",
      type: "yesNo",
    },
    {
      key: "cancer_surgery_details",
      label: "Details",
      type: "longText",
      showWhen: { key: "cancer_surgery_5y" },
    },
    {
      key: "cancer_chemo_radiation_5y",
      label: "Chemotherapy or radiation in past 5 years?",
      type: "yesNo",
    },
    {
      key: "cancer_last_treatment_date",
      label: "Date of last treatment",
      type: "month",
      showWhen: { key: "cancer_chemo_radiation_5y" },
    },
    {
      key: "cancer_other_treatments_5y",
      label: "Any other treatments in past 5 years?",
      type: "yesNo",
    },
    {
      key: "cancer_other_treatment_details",
      label: "Details",
      type: "longText",
      showWhen: { key: "cancer_other_treatments_5y" },
    },
    {
      key: "cancer_tamoxifen_femara",
      label: "Used Tamoxifen or Femara?",
      type: "yesNo",
    },
    {
      key: "cancer_tamoxifen_femara_last_used",
      label: "Date last used",
      type: "date",
      showWhen: { key: "cancer_tamoxifen_femara" },
    },
    {
      key: "cancer_doctor_frequency_last_seen",
      label: "How often do you see your doctor, and date last seen",
      type: "text",
    },
  ],
};

/** Which module to show for which selected condition(s). Mirrors the schema's trigger groups. */
export const MODULE_TRIGGERS: Array<{ spec: ModuleSpec; triggers: string[] }> =
  [
    { spec: seizureSpec, triggers: ["Seizure Disorder", "Seizures"] },
    {
      spec: respiratorySpec,
      triggers: [
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
    },
    { spec: hypertensionSpec, triggers: ["High Blood Pressure"] },
    { spec: diabetesSpec, triggers: ["Diabetes 1 or 2"] },
    { spec: arthritisSpec, triggers: ["Arthritis"] },
    { spec: asthmaSpec, triggers: ["Asthma"] },
    { spec: cancerSpec, triggers: ["Cancer"] },
  ];
export const cardioNeuroSpec: ModuleSpec = {
  id: "cardioNeuroModule",
  title: "Stroke / TIA / Heart Attack — Additional Questions",
  fields: [
    {
      key: "cardio_neuro_diagnosis",
      label: "Exact diagnosis",
      type: "text",
    },
    {
      key: "cardio_neuro_date",
      label: "Date of diagnosis or onset",
      type: "date",
    },
    {
      key: "cardio_neuro_age",
      label: "Age at event",
      type: "number",
    },
    {
      key: "cardio_neuro_episode_count",
      label: "Number of episodes/occurrences",
      type: "number",
    },
    {
      key: "cardio_neuro_recent_date",
      label: "Date of most recent episode",
      type: "date",
    },
    {
      key: "cardio_neuro_status",
      label: "Current status / last symptoms",
      type: "longText",
    },
    {
      key: "cardio_neuro_hospitalization",
      label: "Hospitalization / ER dates",
      type: "longText",
    },
    {
      key: "cardio_neuro_treatments",
      label: "Past and current treatments",
      type: "longText",
    },
    {
      key: "cardio_neuro_medications",
      label: "Medications",
      type: "medsDetailed",
    },
    {
      key: "cardio_neuro_blood_thinners",
      label: "Currently taking anticoagulant or antiplatelet blood thinners?",
      type: "yesNo",
    },
    {
      key: "cardio_neuro_physician_name",
      label: "Attending physician / specialist",
      type: "text",
    },
    {
      key: "cardio_neuro_physician_address",
      label: "Physician address",
      type: "longText",
    },
    {
      key: "cardio_neuro_physician_phone",
      label: "Physician phone number",
      type: "phone",
    },
    {
      key: "cardio_neuro_last_visit",
      label: "Date of last visit/check-up",
      type: "date",
    },
    {
      key: "cardio_neuro_followup_gaps",
      label: "Gaps in medical follow-up or noncompliance",
      type: "longText",
    },
    {
      key: "cardio_neuro_pending_tests",
      label: "Pending or abnormal tests / evaluations / surgeries",
      type: "longText",
    },
    {
      key: "stroke_root_cause",
      label: "Underlying root cause",
      type: "longText",
    },
    {
      key: "stroke_imaging_results",
      label: "Imaging findings",
      type: "longText",
    },
    {
      key: "stroke_on_anticoagulated",
      label: "Did the stroke/TIA occur while adequately anticoagulated?",
      type: "yesNo",
    },
    {
      key: "stroke_residual_effects",
      label: "Residual effects / deficits / weakness / speech issues",
      type: "longText",
    },
    {
      key: "stroke_cognitive_impairment",
      label: "Cognitive impairment / memory loss / impaired reasoning",
      type: "longText",
    },
    {
      key: "stroke_pfo_asd_history",
      label: "PFO / ASD history and closure status",
      type: "longText",
    },
    {
      key: "stroke_carotid_ultrasound",
      label: "Carotid ultrasound / stenosis / intervention status",
      type: "longText",
    },
    {
      key: "stroke_therapy_last_3_12_months",
      label:
        "Physical / occupational / speech therapy in the last 3 to 12 months",
      type: "longText",
    },
    {
      key: "mi_supporting_evidence",
      label: "Chest pain / EKG changes / elevated enzymes",
      type: "longText",
    },
    {
      key: "mi_procedure_details",
      label: "Heart/circulatory surgery or procedure details and date",
      type: "longText",
    },
    {
      key: "mi_vessels_affected",
      label: "Number of coronary vessels affected or bypassed",
      type: "number",
    },
    {
      key: "mi_ongoing_symptoms",
      label: "Ongoing cardiac symptoms",
      type: "longText",
    },
    {
      key: "mi_residual_damage",
      label: "Residual heart damage / CHF / EF <45%",
      type: "longText",
    },
    {
      key: "mi_recent_workup",
      label: "Recent cardiac workup and test results",
      type: "longText",
    },
    {
      key: "cardio_limitations",
      label: "Limitations on physical or daily activities",
      type: "longText",
    },
    {
      key: "cardio_work_status",
      label: "Work disability / unemployed / restricted from full-time work",
      type: "longText",
    },
    {
      key: "cardio_return_to_work",
      label: "Return to work date",
      type: "date",
    },
    {
      key: "cardio_disability_benefits",
      label: "Disability benefits or compensation",
      type: "longText",
    },
    {
      key: "cardio_adl_iadl_help",
      label: "ADL/IADL assistance or device support",
      type: "longText",
    },
    {
      key: "cardio_medical_equipment",
      label: "Medical equipment or mobility devices used in the past 12 months",
      type: "longText",
    },
    {
      key: "cardio_confinement_status",
      label:
        "Confinement to hospital/nursing home/assisted living/rehab/hospice/home health",
      type: "longText",
    },
    {
      key: "cardio_height_weight",
      label: "Current height and weight",
      type: "text",
    },
    {
      key: "cardio_weight_change_10lbs",
      label:
        "Has there been any weight change of more than 10 pounds in the past year?",
      type: "yesNo",
    },
    {
      key: "cardio_nicotine_history",
      label: "Tobacco / nicotine history",
      type: "longText",
    },
    {
      key: "cardio_bp_history",
      label:
        "Current and historical blood pressure readings and treatment status",
      type: "longText",
    },
    {
      key: "cardio_lipid_panel",
      label: "Most recent lipid panel readings",
      type: "longText",
    },
    {
      key: "cardio_diabetes_history",
      label: "Diabetes / pre-diabetes history and complications",
      type: "longText",
    },
    {
      key: "cardio_other_comorbidities",
      label: "Other cardiovascular, vascular, or systemic conditions",
      type: "longText",
    },
    {
      key: "cardio_family_history",
      label:
        "Family history of cardiovascular disease, stroke, diabetes, kidney disease, or cancer",
      type: "longText",
    },
  ],
};

MODULE_TRIGGERS.push({
  spec: cardioNeuroSpec,
  triggers: ["Stroke", "TIA", "Heart Attack"],
});
