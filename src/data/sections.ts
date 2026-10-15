import type { Section } from './types'
import { q, details, withDetails } from './helpers'
import { healthFollowUps, conditionOptions } from './followups'

const medicalYesNo: [string, string][] = [
  ['h_pending', 'Within the past 12 months, have you had surgical treatment for morbid obesity, or been declined for life insurance coverage, or had any diagnostic testing (excluding AIDS/HIV tests), surgery, or hospitalization recommended by a medical professional which has not been completed or for which the results have not been received?'],
  ['h_12mo', 'Within the past 12 months, have you consulted a medical professional, had surgery, or been hospitalized, or had diagnostic tests (excluding HIV/AIDS) such as EKG, X-ray, MRI, or CAT scan?'],
  ['h_ever_dx', 'Have you ever been medically diagnosed with or treated for angina (chest pain), stroke or TIA, cardiomyopathy, systemic lupus (SLE), cirrhosis, Hepatitis C, chronic hepatitis, chronic pancreatitis, chronic obstructive pulmonary disease (COPD), emphysema, chronic bronchitis, or required oxygen equipment to assist in breathing?'],
  ['h_2yr', 'Within the past 2 years, have you had a heart attack or aneurysm, or had or been medically advised to have any type of heart, brain or circulatory surgery (including, but not limited to a pacemaker insertion, defibrillator placement), or any procedure to improve circulation?'],
  ['h_3yr', 'Within the past 3 years, have you been treated, diagnosed, or been prescribed medication by a medical professional for chronic bronchitis, emphysema, chronic obstructive pulmonary disease (COPD), irregular heartbeat, seizures, blood clot, or aneurysm?'],
  ['h_5yr_cancer', 'Within the past 5 years, have you been treated, diagnosed, or been prescribed medication by a medical professional for internal cancer, melanoma, Hodgkin’s disease, or lymphoma?'],
  ['h_hiv', 'Have you ever been diagnosed, treated, tested positive for, or received medical advice for Human Immunodeficiency Virus (HIV) or Acquired Immune Deficiency Syndrome (AIDS)?'],
  ['h_5yr_checkups', 'Within the past 5 years, have you had any check-ups, laboratory studies (excluding tests related to HIV), or other medical consultations?'],
  ['h_7yr_heart', 'Within the past 7 years, has any Proposed Insured been diagnosed with, treated for, or prescribed medication for high blood pressure, heart attack, angina, arrhythmia, stroke, aneurysm, or any heart or circulatory disease or disorder?'],
  ['h_7yr_digestive', 'Within the past 7 years, has any Proposed Insured been diagnosed with, treated for, or prescribed medication for diabetes, cirrhosis, hepatitis, pancreatitis, Crohn’s disease, ulcerative colitis, or any digestive or liver disease or disorder?'],
  ['h_7yr_resp', 'Within the past 7 years, has any Proposed Insured been diagnosed with, treated for, or prescribed medication for asthma, emphysema, chronic obstructive pulmonary disease (COPD), sleep apnea, or any respiratory disease or disorder?'],
  ['h_sleep_apnea', 'Have you ever been diagnosed with Sleep Apnea within the last 6 months, or for which you are not being treated?'],
  ['h_7yr_cancer', 'Within the past 7 years, has any Proposed Insured been diagnosed with, treated for, or prescribed medication for cancer in any form, anemia, any seizures, bipolar disorder, schizophrenia, Alzheimer’s, dementia, or mental or nervous disorder?'],
  ['h_7yr_kidney', 'Within the past 7 years, has any Proposed Insured been diagnosed with, treated for, or prescribed medication for any disease or disorder of the kidneys, urinary bladder, prostate, reproductive organs, or sexually transmitted disease?'],
  ['h_7yr_connective', 'Within the past 7 years, has any Proposed Insured been diagnosed with, treated for, or prescribed medication for connective tissue disease, systemic lupus (SLE), arthritis, or any disorder of the back, joints, muscles, or nervous system?'],
  ['h_10yr_bp', 'In the past 10 years, have you taken medication to treat high blood pressure or an elevated cholesterol level?'],
  ['h_10yr_dx', 'In the past 10 years, have you been medically diagnosed, tested, or received treatment for diabetes, cancer, or cardiac disease (heart attack, myocardial infarct, angina, cardiac insufficiency, cerebral thrombosis, or coronary artery disease)?'],
  ['h_diabetes_21', 'Have you been treated, diagnosed, or been prescribed medication by a medical professional for diabetes prior to age 21, or do you currently take insulin shots, or been diagnosed with diabetes combined with a medical history of any of the following: retinopathy, nephropathy, neuropathy, insulin shock, or diabetic coma?'],
  ['h_unemployed', 'Are you currently unemployed due to medical reasons, or been prohibited from actively working full time (30 hours or more per week) at your regular occupation due to any illness, injury, or health-related problem, or are you currently receiving benefits, compensation, or pension for disability?'],
  ['h_hospitalized', 'Are you currently hospitalized, confined to a nursing facility, receiving Hospice Care or home health care, or do you require assistance (from anyone) with activities of daily living such as bathing, dressing, eating or toileting?'],
  ['h_devices', 'Within the past 12 months, have you used a walker, wheelchair, electric scooter, supplemental oxygen, or catheter?'],
  ['h_transplant', 'Have you been the recipient of an organ transplant?'],
  ['h_confined', 'Are you at the time of this application confined to any hospital or other medical or rehabilitation facility?'],
  ['h_fam_60', 'Has the natural parent, brother, or sister of the proposed insured ever had kidney disease, required a major organ transplant, or been diagnosed with heart disease, cerebrovascular disease, or internal cancer prior to age 60?'],
  ['h_fam_death', 'Has more than one member of your family (father, mother, brother, or sister) died before age 60 from breast, colon, intestinal, or prostate cancer, or from cardiovascular disease (heart attack, myocardial infarct, angina, cardiac insufficiency, cerebral thrombosis, or coronary artery disease)?'],
]

const health: Section = {
  id: 'health',
  title: 'Health / Medical Questions',
  description: 'Answer every question. Additional questions appear at the bottom of this section if you select certain conditions.',
  questions: [
    q('h_dob', 'What is your Date of Birth?', 'date'),
    q('h_age', 'What is your Age?', 'number'),
    q('h_birth_state', 'What is your State of Birth (or country if born outside the U.S.)?', 'text'),
    q('h_sex', 'What is your Gender/Sex?', 'select', { options: ['Male', 'Female', 'Other / Prefer not to say'] }),
    ...withDetails(medicalYesNo),
    q('h_conditions', 'Have you ever been diagnosed with, or treated for, any of the following? (Select all that apply — additional questions will appear at the bottom of this section.)', 'multiselect', { options: conditionOptions }),
    q('h_treatment', 'What specific treatment was given or medication prescribed for your conditions?', 'textarea'),
    q('h_medications', 'What are all your current medications, including herb and vitamin supplements?', 'textarea'),
  ],
  followUps: healthFollowUps,
}

const mental: Section = {
  id: 'mental',
  title: 'Mental Health Questions',
  questions: [
    q('m_history', 'Do you have any history of or current treatment for psychological, mood, or anxiety disorders?'),
    q('m_conditions', 'What mental health, nervous, or psychiatric conditions apply to you?', 'multiselect', {
      options: ['Situational anxiety', 'Adjustment disorder', 'Panic disorder', 'Depression', 'Major depression', 'Schizophrenia', 'Bipolar I', 'Bipolar II', 'ADHD/ADD', 'Eating disorder', 'Mental retardation / intellectual disability', 'PTSD', 'Tourette’s syndrome', 'Suicide attempt/ideation', 'OCD', 'Autism', 'None'],
    }),
    q('m_mild', 'Have you been diagnosed with Mild or Situational Depression or Anxiety within the last 6 months, or been hospitalized for it?'),
    details('m_mild'),
    q('m_meds', 'What are the details of your current prescription medications for this condition (names, dosage, frequency)?', 'textarea'),
    q('m_dx_date', 'When was the condition diagnosed?', 'date'),
    q('m_last_seen', 'When were you last seen for it?', 'date'),
    q('m_psych', 'Within the past 5 years, have you seen a psychiatrist or had treatment as a hospital outpatient?'),
    details('m_psych'),
    q('m_inpatient', 'Within the past 5 years, have you been an inpatient at a hospital or clinic?'),
    details('m_inpatient'),
    q('m_work', 'Within the past 5 years, have you been unable to work due to your condition?'),
    details('m_work'),
    q('m_ideation', 'Have you had any suicidal thoughts?'),
    q('m_attempt', 'Have you attempted suicide?'),
    q('m_attempt_details', 'If Yes, provide details, including date and follow-up treatment:', 'textarea', { dependsOn: { id: 'm_attempt', value: 'Yes' } }),
  ],
}

const nicotine: Section = {
  id: 'nicotine',
  title: 'Nicotine / Smoking Use Questions',
  questions: [
    q('n_current', 'Do you currently use any tobacco or nicotine products (cigarettes, cigars, cigarillos, pipe, chewing tobacco, snuff, e-cigarettes/vapes, nicotine patches, gum or lozenges)?'),
    q('n_types', 'Which products do you use?', 'multiselect', { options: ['Cigarettes', 'Cigars', 'Cigarillos', 'Pipe', 'Chewing tobacco/snuff', 'E-cigarettes/vapes', 'Nicotine patches/gum/lozenges', 'Marijuana (smoked or vaped)'], dependsOn: { id: 'n_current', value: 'Yes' } }),
    q('n_amount', 'How much and how often do you use them (e.g., packs per day, cigars per month)?', 'text', { dependsOn: { id: 'n_current', value: 'Yes' } }),
    q('n_past', 'Have you used any tobacco or nicotine products in the past 12, 24, or 36 months?'),
    q('n_last', 'What was the exact date of last use?', 'date', { dependsOn: { id: 'n_past', value: 'Yes' } }),
    q('n_years', 'How many years have you used tobacco or nicotine in total?', 'number'),
    q('n_quit', 'If you quit, when and how did you quit?', 'textarea'),
    q('n_cotinine', 'Do you understand that a nicotine/cotinine test may be required, and that use may be detected?'),
  ],
}

const alcohol: Section = {
  id: 'alcohol',
  title: 'Alcohol Use Questions',
  questions: [
    q('a_use', 'Do you currently consume alcohol?'),
    q('a_amount', 'On average, how many drinks do you consume per week?', 'number', { dependsOn: { id: 'a_use', value: 'Yes' } }),
    ...withDetails([
      ['a_treatment', 'Have you ever been advised by a medical professional to reduce or stop drinking, or received treatment, counseling or attended a program (such as Alcoholics Anonymous) for alcohol use?'],
      ['a_dui', 'Have you ever been arrested or convicted for driving under the influence or any other alcohol-related offense?'],
      ['a_liver', 'Have you ever been diagnosed with a liver or other medical condition related to alcohol use?'],
      ['a_relapse', 'Have you consumed alcohol after completing treatment or a recovery program?'],
    ]),
    q('a_last_drink', 'If you previously abstained or quit, what is the date of your last drink?', 'date'),
  ],
}

const risky: Section = {
  id: 'risky',
  title: 'Risky Behavior / Occupation Questions',
  questions: [
    ...withDetails([
      ['r_aviation', 'Within the past 5 years, have you piloted or been a crew member of any aircraft, or do you intend to (including private, ultralight, helicopter, or glider)?'],
      ['r_skydive', 'Do you participate in, or intend to participate in, skydiving, parachuting, BASE jumping, hang gliding, or paragliding?'],
      ['r_scuba', 'Do you participate in scuba or deep-sea diving, or free diving? (Include maximum depth in details.)'],
      ['r_racing', 'Do you participate in motor racing of any kind (auto, motorcycle, boat, off-road, drag)?'],
      ['r_climb', 'Do you participate in rock/mountain climbing, ice climbing, mountaineering, or caving?'],
      ['r_other', 'Do you participate in any other hazardous activity such as bungee jumping, rodeo, martial arts competition, extreme skiing/snowboarding, or white-water rafting?'],
      ['r_hazard_job', 'Does your occupation involve exposure to hazards such as heights, explosives, firearms, chemicals, underground work, logging, commercial fishing, or offshore work?'],
    ]),
  ],
}

const driving: Section = {
  id: 'driving',
  title: 'Driving Record Questions',
  questions: [
    q('d_license', 'Do you have a valid driver’s license?'),
    q('d_license_state', 'State of issue and license number:', 'text', { dependsOn: { id: 'd_license', value: 'Yes' } }),
    ...withDetails([
      ['d_dui', 'Within the past 10 years, have you been convicted of or pled guilty to driving under the influence (DUI/DWI) or reckless driving?'],
      ['d_suspend', 'Within the past 5 years, has your driver’s license been suspended, revoked, or restricted?'],
      ['d_moving', 'Within the past 3 years, have you had 3 or more moving violations?'],
      ['d_accident', 'Within the past 3 years, have you had 2 or more at-fault accidents?'],
      ['d_sr22', 'Are you required to carry SR-22 insurance?'],
    ]),
  ],
}

const criminal: Section = {
  id: 'criminal',
  title: 'Arrest / Criminal Record Questions',
  questions: [
    ...withDetails([
      ['c_arrest', 'Have you ever been arrested or charged with a felony or misdemeanor (excluding minor traffic violations)?'],
      ['c_convicted', 'Have you ever been convicted of, or pled guilty or no contest to, a felony?'],
      ['c_probation', 'Are you currently on probation or parole, or do you have any pending criminal charges?'],
      ['c_incarcerated', 'Have you been incarcerated within the past 10 years, or are you awaiting trial or sentencing?'],
    ]),
  ],
}

const bankruptcy: Section = {
  id: 'bankruptcy',
  title: 'Bankruptcy Questions',
  questions: [
    q('b_filed', 'Have you ever filed for bankruptcy?'),
    q('b_type', 'Type of bankruptcy:', 'select', { options: ['Chapter 7', 'Chapter 11', 'Chapter 13', 'Other'], dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_filed_date', 'Date filed:', 'date', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_discharged', 'Date discharged or dismissed:', 'date', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_current', 'Is any bankruptcy proceeding currently pending or in process?', 'yesno', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_reason', 'Briefly explain the reason for the bankruptcy:', 'textarea', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_intend', 'Do you intend to file for bankruptcy in the next 12 months?'),
  ],
}

const drugs: Section = {
  id: 'drugs',
  title: 'Illegal Drug Use Questions',
  questions: [
    ...withDetails([
      ['i_use', 'Within the past 10 years, have you used any illegal drug, or any controlled substance not prescribed to you (including cocaine, heroin, methamphetamine, LSD, hallucinogens, or misuse of opioids)?'],
      ['i_marijuana', 'Do you currently use marijuana/cannabis in any form (including medical use)? If yes, how often?'],
      ['i_treatment', 'Have you ever received treatment, counseling or been advised by a medical professional to seek treatment for drug use?'],
      ['i_inject', 'Have you ever used intravenous (IV) drugs not prescribed by a physician?'],
      ['i_arrest', 'Have you ever been arrested or convicted for a drug-related offense?'],
    ]),
    q('i_last', 'Date of last use of any illegal drug or non-prescribed controlled substance (if applicable):', 'date'),
  ],
}

const travel: Section = {
  id: 'travel',
  title: 'Residency and Foreign Travel Questions',
  questions: [
    q('t_citizen', 'Are you a U.S. citizen?'),
    q('t_status', 'If not a U.S. citizen, what is your immigration status (e.g., permanent resident, visa type)?', 'text', { dependsOn: { id: 't_citizen', value: 'No' } }),
    q('t_years', 'How many years have you resided in the U.S.?', 'number', { dependsOn: { id: 't_citizen', value: 'No' } }),
    q('t_ssn', 'Do you have a valid Social Security Number?'),
    ...withDetails([
      ['t_intend_leave', 'Do you intend to move, reside, or work outside the U.S. in the next 24 months?'],
      ['t_travel', 'Within the past 24 months have you traveled outside the U.S./Canada, or do you plan to travel outside the U.S./Canada within the next 24 months?'],
      ['t_hazard', 'Have you or do you plan to travel to a country with a travel advisory, active conflict, or elevated health risk?'],
    ]),
  ],
}

const financial: Section = {
  id: 'financial',
  title: 'Occupation & Financial Questions',
  questions: [
    q('f_employer', 'Current employer:', 'text'),
    q('f_occupation', 'Occupation / job title:', 'text'),
    q('f_duties', 'Describe your duties:', 'textarea'),
    q('f_years', 'Years in current occupation:', 'number'),
    q('f_income', 'Annual earned income ($):', 'number'),
    q('f_unearned', 'Annual unearned income ($):', 'number'),
    q('f_networth', 'Estimated net worth ($):', 'number'),
    q('f_coverage', 'Amount of life insurance coverage requested ($):', 'number'),
    q('f_existing', 'Total existing life insurance in force ($):', 'number'),
    ...withDetails([
      ['f_replace', 'Will this policy replace or change any existing life insurance or annuity?'],
      ['f_other_apps', 'Do you have any other life insurance applications pending?'],
      ['f_premium', 'Will anyone other than the owner be paying premiums?'],
    ]),
    q('f_purpose', 'Purpose of insurance:', 'select', { options: ['Family protection', 'Final expense', 'Mortgage protection', 'Business', 'Estate planning', 'Other'] }),
  ],
}

const military: Section = {
  id: 'military',
  title: 'Military Service',
  questions: [
    q('ms_served', 'Are you currently serving, or have you previously served, in any branch of the military?'),
    q('ms_branch', 'Branch of service:', 'select', { options: ['Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force', 'National Guard', 'Reserves'], dependsOn: { id: 'ms_served', value: 'Yes' } }),
    q('ms_status', 'Current status:', 'select', { options: ['Active duty', 'Reserve/National Guard', 'Veteran/Retired', 'Discharged'], dependsOn: { id: 'ms_served', value: 'Yes' } }),
    q('ms_discharge', 'Type of discharge (if applicable):', 'select', { options: ['Honorable', 'General', 'Other than honorable', 'Dishonorable', 'Medical', 'Not applicable'], dependsOn: { id: 'ms_served', value: 'Yes' } }),
    ...withDetails([
      ['ms_deploy', 'Have you been deployed to, or do you have orders to deploy to, a combat zone or hazardous area?'],
      ['ms_disability', 'Do you receive or have you applied for VA disability benefits?'],
      ['ms_orders', 'Have you received orders for active duty, deployment or relocation within the next 12 months?'],
    ]),
  ],
}

export const sections: Section[] = [
  health, mental, nicotine, alcohol, risky, driving, criminal, bankruptcy, drugs, travel, financial, military,
]
