// Prune inactive answers before the draft/submit schemas validate the payload.
type Answers = Record<string, any>;
export const moduleConditions: Record<string, string[]> = {
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
export function pruneHidden(input: Answers): Answers {
  const app = structuredClone(input);
  const selected = app.healthMedical?.conditions_triggered ?? [];
  if (!selected.includes("Other") && app.healthMedical)
    delete app.healthMedical.medical_other_conditions;
  for (const [key, triggers] of Object.entries(moduleConditions))
    if (
      !triggers.some((t) => selected.includes(t)) &&
      !(
        key === "cardioNeuroModule" &&
        app.healthMedical?.medical_past2_heart_brain_circulatory_surgery
      )
    )
      delete app[key];
  const companions: Record<string, Record<string, string>> = {
    hypertensionModule: {
      htn_med_change_details: "htn_med_change",
      htn_hospitalized_date: "htn_hospitalized_5y",
      htn_unable_to_work_details: "htn_unable_to_work_5y",
    },
    diabetesModule: {
      dm_med_change_details: "dm_med_change",
      dm_er_hospital_details: "dm_er_hospital_5y",
    },
    arthritisModule: {
      arth_unable_work_details: "arth_unable_work_5y",
      arth_medication_name: "arth_regular_medication",
      arth_medication_dosage: "arth_regular_medication",
    },
    asthmaModule: {
      asthma_steroid_last_used: "asthma_steroid_use",
      asthma_status_asthmaticus_date: "asthma_status_asthmaticus",
    },
    cancerModule: {
      cancer_nodes_spread_details: "cancer_nodes_spread",
      cancer_surgery_details: "cancer_surgery_5y",
      cancer_last_treatment_date: "cancer_chemo_radiation_5y",
      cancer_other_treatment_details: "cancer_other_treatments_5y",
      cancer_tamoxifen_femara_last_used: "cancer_tamoxifen_femara",
    },
    mentalHealth: {
      mh_psychiatrist_details: "mh_psychiatrist_5y",
      mh_inpatient_details: "mh_inpatient_5y",
      mh_unable_work_details: "mh_unable_work_5y",
      mh_suicide_attempt_details: "mh_suicide_attempt",
      mh_disability_details: "mh_disability_history",
      mh_selected_psychiatrist_details: "mh_selected_psychiatrist_5y",
      mh_selected_inpatient_details: "mh_selected_inpatient_5y",
      mh_selected_unable_work_details: "mh_selected_unable_work_5y",
      mh_selected_suicide_attempt_details: "mh_selected_suicide_attempt",
      mh_selected_disability_details: "mh_selected_disability",
    },
    residencyTravel: {
      res_high_risk_countries_details: "res_high_risk_countries_2y",
      res_travel_outside_us_details: "res_travel_outside_us_24m",
    },
    occupationFinancial: { occ_high_risk_details: "occ_high_risk_occupation" },
    riskyBehavior: {
      avi_future_details: "avi_future_2y",
      avi_accident_details: "avi_accident_grounded_fined",
    },
  };
  for (const [section, pairs] of Object.entries(companions))
    if (app[section])
      for (const [detail, parent] of Object.entries(pairs))
        if (app[section][parent] !== true) delete app[section][detail];
  const dm = app.diabetesModule;
  if (dm) {
    if (!dm.dm_control_method?.includes("Insulin"))
      delete dm.dm_insulin_start_date;
    if (dm.dm_compliant !== false) delete dm.dm_noncompliance_details;
  }
  const b = app.bankruptcy;
  if (b) {
    if (b.bk_has_filed !== true)
      app.bankruptcy = { bk_has_filed: b.bk_has_filed };
    else if (b.bk_type !== "Chapter 7")
      delete b.bk_chapter7_personal_or_business;
  }
  const mil = app.militaryService;
  if (mil?.mil_active_duty !== true)
    app.militaryService = { mil_active_duty: mil?.mil_active_duty };
  const n = app.nicotineSmoking;
  if (n) {
    if (n.nic_used_12m !== true) delete n.nic_type_and_amount;
    if (n.nic_used_12m !== false || n.nic_ever_used === false)
      delete n.nic_date_last_used;
    if (n.nic_ever_used === false) n.nic_products = [];
  }
  const r = app.riskyBehavior;
  if (r) {
    const activities = r.adv_participation ?? [];
    if (!(r.avi_flights_past12m || r.avi_flights_past24m || r.avi_future_2y))
      for (const k of Object.keys(r))
        if (
          k.startsWith("avi_") &&
          ![
            "avi_flights_past12m",
            "avi_flights_past24m",
            "avi_future_2y",
          ].includes(k)
        )
          delete r[k];
    if (!activities.includes("Rock or mountain climbing"))
      for (const k of Object.keys(r)) if (k.startsWith("climb_")) delete r[k];
    if (
      !activities.includes("Organized racing of any kind") &&
      !r.race_intent?.length
    )
      for (const k of Object.keys(r))
        if (k.startsWith("race_") && k !== "race_intent") delete r[k];
    if (
      !activities.some((a: string) =>
        ["Scuba diving", "Skin diving"].includes(a),
      )
    )
      for (const k of Object.keys(r)) if (k.startsWith("dive_")) delete r[k];
    if (r.dive_certified !== true) {
      delete r.dive_instruction_hours;
      delete r.dive_certification_date;
    }
    if (r.dive_certified !== false) delete r.dive_not_certified_reason;
  }
  return app;
}
export function removeEmptyStrings(input: Answers): Answers {
  const walk = (v: any): any =>
    Array.isArray(v)
      ? v.map(walk)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .filter(([, v]) => v !== "")
              .map(([k, v]) => [k, walk(v)]),
          )
        : v;
  return walk(input);
}
export const prepareApplication = (v: Answers) =>
  removeEmptyStrings(pruneHidden(v));
export const DRAFT_KEY = "practice-app-draft-v1";
