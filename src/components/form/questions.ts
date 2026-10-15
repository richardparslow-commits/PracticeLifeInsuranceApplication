export type Q = { key: string; label: string };

export const nicotineQs: Q[] = [
  { key: "nic_used_12_3_5y", label: "Has the proposed insured used nicotine, tobacco, vape, or e-cigarettes within the past 12 months, 3 years, or 5 years? (excluding occasional cigar or pipe use)" },
  { key: "nic_used_36m", label: "During the past 36 months, have you used tobacco or nicotine products in any form (excluding occasional cigar or pipe use)?" },
  { key: "nic_used_12m", label: "Have you used tobacco or any nicotine products in any form within the past twelve (12) months?" },
];

export const alcoholQs: Q[] = [
  { key: "alc_past7_abuse_counseling", label: "Within the past 7 years, have you abused alcohol, or had or been recommended treatment/counseling, or been advised to discontinue alcohol?" },
  { key: "alc_past5_abuse_counseling", label: "Within the past 5 years, have you abused alcohol or drugs, or been recommended to discontinue alcohol or have treatment/counseling?" },
  { key: "alc_past10_treated", label: "In the past 10 years, have you been treated for alcohol abuse?" },
  { key: "alc_history", label: "Any history of alcohol abuse, misuse, treatment, counseling, or being advised to discontinue alcohol?" },
  { key: "alc_infractions", label: "Any alcohol/drug related infractions (including excessive use, or admitted DWI/DUI within the last three years)?" },
];

export const drivingQs: Q[] = [
  { key: "drv_valid_license", label: "Do you currently have a valid driver’s license?" },
  { key: "drv_suspension_24m", label: "Within the past 24 months, license suspended/revoked or convicted of DUI?" },
  { key: "drv_suspension_5y", label: "Within the past 5 years, license suspended/revoked, or currently suspended/revoked?" },
  { key: "drv_moving_violations_5y", label: "Within the past 5 years, pled guilty to or convicted of any moving violations?" },
  { key: "drv_careless_reckless_5y", label: "Within the past 5 years, convicted of careless or reckless driving?" },
  { key: "drv_more_than_two_violations", label: "In the past 5 years, more than two moving violations or any alcohol/drug infractions?" },
  { key: "drv_accidents", label: "Have you ever had any motor vehicle accidents?" },
];

export const criminalQs: Q[] = [
  { key: "crim_past6m_supervision", label: "Within the past 6 months, served or been released from incarceration, probation, parole, or court-ordered supervision?" },
  { key: "crim_felony_7y", label: "Within the past 7 years, convicted of, pleaded guilty, or no contest to any felony?" },
  { key: "crim_felony_10y", label: "In the past 10 years, convicted of, pled guilty to, or awaiting trial for a felony?" },
  { key: "crim_supervision_10y", label: "In the past 10 years, served or been released from incarceration, probation, parole, or supervision?" },
  { key: "crim_current_supervision", label: "Currently under probation, parole, or other court-ordered supervision?" },
  { key: "crim_past5y_guilty_convicted", label: "Within the past 5 years, pled guilty/convicted of a felony or misdemeanor (incl. DUI/DWI) or charge pending?" },
  { key: "crim_ever_guilty_convicted", label: "Ever pled guilty to or been convicted of a felony or misdemeanor, or have a charge pending?" },
];

export const drugQs: Q[] = [
  { key: "drug_past2y", label: "Within the past 2 years, used illegal drugs, abused alcohol/drugs, or been recommended treatment/counseling or advised to discontinue?" },
  { key: "drug_past5y", label: "Within the past 5 years, used illegal drugs or abused alcohol/drugs, or been recommended to discontinue or have treatment/counseling?" },
  { key: "drug_ever_listed", label: "Ever used heroin, morphine, other narcotics, marijuana, cocaine, barbiturates, amphetamines, hallucinogens, or other habit-forming drugs except as prescribed?" },
  { key: "drug_past7y_prescription_advice", label: "Within the past 7 years, advised to have treatment for, or reduce/discontinue, prescription drugs?" },
  { key: "drug_marijuana_24m", label: "During the last 24 months, smoked marijuana recreationally?" },
  { key: "drug_past10y_treated", label: "In the past 10 years, treated for drug abuse or used any drugs not prescribed to you?" },
  { key: "drug_current_history", label: "Any history of or current treatment for drug abuse?" },
];

export const healthQs: Q[] = [
  { key: "medical_past12_obesity_decline_pending", label: "Within the past 12 months: surgical treatment for morbid obesity, declined for life insurance, or recommended diagnostic testing/surgery/hospitalization not completed or results not received?" },
  { key: "medical_past12_consult_surgery_hospital_test", label: "Within the past 12 months: consulted a medical professional, had surgery, hospitalized, or had diagnostic tests (EKG, X-ray, MRI, CAT scan; excluding HIV/AIDS)?" },
  { key: "medical_ever_major_conditions", label: "Ever diagnosed/treated for angina, stroke or TIA, cardiomyopathy, SLE, cirrhosis, Hepatitis C, chronic hepatitis, chronic pancreatitis, COPD, emphysema, chronic bronchitis, or required oxygen?" },
  { key: "medical_past2_heart_brain_circulatory_surgery", label: "Within the past 2 years: heart attack or aneurysm, or heart/brain/circulatory surgery or procedure (incl. pacemaker, defibrillator) had or advised?" },
  { key: "medical_past3_conditions_medicated", label: "Within the past 3 years: treated/diagnosed/prescribed medication for chronic bronchitis, emphysema, COPD, irregular heartbeat, seizures, blood clot, or aneurysm?" },
  { key: "medical_past5_internal_cancer", label: "Within the past 5 years: treated for internal cancer, melanoma, Hodgkin’s disease, or lymphoma?" },
  { key: "medical_hiv_aids", label: "Ever diagnosed, treated, tested positive, or received medical advice for HIV or AIDS?" },
  { key: "medical_past5_checkups_labs_consults", label: "Within the past 5 years: any check-ups, laboratory studies (excluding HIV), or medical consultations?" },
  { key: "medical_past7_cardio_conditions", label: "Within the past 7 years: high blood pressure, heart attack, angina, arrhythmia, stroke, aneurysm, or any heart/circulatory disorder?" },
  { key: "medical_past7_digestive_liver_conditions", label: "Within the past 7 years: diabetes, cirrhosis, hepatitis, pancreatitis, Crohn’s, ulcerative colitis, or any digestive/liver disorder?" },
  { key: "medical_past7_respiratory_conditions", label: "Within the past 7 years: asthma, emphysema, COPD, sleep apnea, or any respiratory disorder?" },
  { key: "medical_sleep_apnea_6mo_not_treated", label: "Diagnosed with sleep apnea within the last 6 months, or not being treated?" },
  { key: "medical_past7_neuro_mental_conditions", label: "Within the past 7 years: cancer, anemia, seizures, bipolar, schizophrenia, Alzheimer’s, dementia, or mental/nervous disorder?" },
  { key: "medical_past7_renal_repro_std_conditions", label: "Within the past 7 years: kidney, bladder, prostate, reproductive organ disorder, or sexually transmitted disease?" },
  { key: "medical_past7_connective_tissue_conditions", label: "Within the past 7 years: connective tissue disease, SLE, arthritis, or disorder of back, joints, muscles, or nervous system?" },
  { key: "medical_past10_bp_cholesterol_meds", label: "In the past 10 years: medication for high blood pressure or elevated cholesterol?" },
  { key: "medical_past10_diabetes_cancer_cardiac", label: "In the past 10 years: diagnosed, tested, or treated for diabetes, cancer, or cardiac disease?" },
  { key: "medical_diabetes_prior21_insulin_or_complications", label: "Treated for diabetes before age 21, currently on insulin, or diabetes with retinopathy, nephropathy, neuropathy, insulin shock, or diabetic coma?" },
  { key: "medical_work_disability", label: "Currently unemployed for medical reasons, prohibited from full-time work due to illness/injury, or receiving disability benefits/pension?" },
  { key: "medical_currently_hospitalized_or_needs_adl_help", label: "Currently hospitalized, in a nursing facility, on hospice/home health care, or need assistance with bathing, dressing, eating, toileting?" },
  { key: "medical_recent_assistive_devices", label: "Within the past 12 months: used a walker, wheelchair, electric scooter, supplemental oxygen, or catheter?" },
  { key: "medical_organ_transplant", label: "Have you been the recipient of an organ transplant?" },
  { key: "medical_confined_facility_now", label: "Currently confined to any hospital or medical/rehabilitation facility?" },
  { key: "medical_family_history_kidney_transplant_heart_cancer", label: "Has a natural parent, brother, or sister had kidney disease, major organ transplant, heart disease, cerebrovascular disease, or internal cancer before age 60?" },
  { key: "medical_family_history_multiple_early_deaths", label: "Has more than one family member (father, mother, brother, sister) died before 60 from breast, colon, intestinal, or prostate cancer, or cardiovascular disease?" },
];