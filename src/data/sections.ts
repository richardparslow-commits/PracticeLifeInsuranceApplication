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
  followUpQuestionId: 'h_conditions',
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
  description: 'Select all applicable conditions. Additional questions appear at the bottom of this section when a listed condition applies.',
  followUpQuestionId: 'm_conditions',
  questions: [
    q('m_history', 'Do you have any history of or current treatment for psychological, mood, or anxiety disorders?'),
    q('m_conditions', 'What mental health, nervous, or psychiatric conditions apply to you?', 'multiselect', {
      options: ['Anxiety', 'Situational anxiety', 'Adjustment disorder', 'Panic disorder', 'Depression', 'Major depression', 'Schizophrenia', 'Bipolar I or II', 'ADHD/ADD', 'Eating disorder', 'Mental retardation / intellectual disability', 'PTSD', 'Tourette’s syndrome', 'Suicide attempt/ideation', 'Obsessive Compulsive Disorder (OCD)', 'Autism', 'Other', 'None'],
    }),
    q('m_mild', 'Have you been diagnosed with Mild or Situational Depression or Anxiety within the last 6 months, or been hospitalized for it?'),
    details('m_mild'),
  ],
  followUps: [{
    id: 'mental-details',
    title: 'Additional Mental Health Questions',
    triggers: ['Anxiety', 'Situational anxiety', 'Major depression', 'Depression', 'Eating disorder', 'Suicide attempt/ideation', 'Adjustment disorder', 'Schizophrenia', 'Mental retardation / intellectual disability', 'Obsessive Compulsive Disorder (OCD)', 'Panic disorder', 'Bipolar I or II', 'PTSD', 'ADHD/ADD', 'Tourette’s syndrome'],
    questions: [
      q('m_other', 'If Other applies, please describe:', 'textarea', { dependsOn: { id: 'm_conditions', value: 'Other' } }),
      q('m_meds', 'Provide details of your current prescription medications (RX names, dosage, how often taken):', 'textarea'),
      q('m_dx_date', 'Provide date of diagnosis:', 'date'),
      q('m_last_seen', 'Provide date last seen for condition:', 'date'),
      q('m_psych', 'Within the past 5 years, have you seen a psychiatrist or had treatment as a hospital outpatient?'),
      q('m_psych_details', 'If yes, provide date(s) and name of hospital or clinic:', 'textarea', { dependsOn: { id: 'm_psych', value: 'Yes' } }),
      q('m_inpatient', 'Within the past 5 years, have you been an inpatient at a hospital or clinic?'),
      q('m_inpatient_details', 'If yes, provide date(s) and name of hospital or clinic:', 'textarea', { dependsOn: { id: 'm_inpatient', value: 'Yes' } }),
      q('m_work', 'Within the past 5 years, have you been unable to work due to your condition?'),
      q('m_work_details', 'If yes, include date and duration of each absence:', 'textarea', { dependsOn: { id: 'm_work', value: 'Yes' } }),
      q('m_ideation', 'Have you had any suicidal thoughts?'),
      q('m_attempt', 'Have you attempted suicide?'),
      q('m_attempt_details', 'If yes, provide full details including the date when this occurred and any follow-up treatment:', 'textarea', { dependsOn: { id: 'm_attempt', value: 'Yes' } }),
      q('m_disability', 'Have you ever been on disability?'),
      q('m_disability_details', 'Provide details:', 'textarea', { dependsOn: { id: 'm_disability', value: 'Yes' } }),
    ],
  }],
}

const nicotine: Section = {
  id: 'nicotine',
  title: 'Nicotine / Smoking Use Questions',
  questions: [
    q('n_current', 'Do you currently use any tobacco or nicotine products (cigarettes, cigars, cigarillos, pipe, chewing tobacco, snuff, e-cigarettes/vapes, nicotine patches, gum or lozenges)?'),
    q('n_types', 'Which products do you use?', 'multiselect', { options: ['Cigarettes', 'Cigars', 'Cigarillos', 'Pipe', 'Chewing tobacco/snuff', 'E-cigarettes/vapes', 'Nicotine patches/gum/lozenges', 'Marijuana (smoked or vaped)'], dependsOn: { id: 'n_current', value: 'Yes' } }),
    q('n_amount', 'How much and how often do you use them (e.g., packs per day, cigars per month)?', 'text', { dependsOn: { id: 'n_current', value: 'Yes' } }),
    q('n_past', 'Has the proposed insured used nicotine, tobacco, vape, or e-cigarettes within the past 12 months, 3 years, or 5 years (excluding occasional cigar or pipe use)? Tobacco in any form includes cigarettes, electronic cigarettes/e-cigs, chewing tobacco, cigars, pipes, snuff, nicotine patch, nicotine gum/aerosol/inhaler, hookah pipe, clove or bidis cigarettes, or oral nicotine pouches.'),
    q('n_last', 'If yes, what type and amount? If no, what was the date last used?', 'textarea'),
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
      ['a_dui', 'Have you ever had any alcohol/drug-related infractions, including excessive alcohol use or an admitted DWI or DUI within the last 3 years?'],
      ['a_liver', 'Have you ever been diagnosed with a liver or other medical condition related to alcohol use?'],
      ['a_relapse', 'Have you consumed alcohol after completing treatment or a recovery program?'],
      ['a_7yr', 'Within the past 7 years, have you abused alcohol or had, or been recommended to have, treatment or counseling for alcohol use, or been advised to discontinue use of alcohol?'],
      ['a_5yr', 'Within the past 5 years, have you abused alcohol or drugs, or had or been recommended by a medical professional or a licensed counselor to discontinue the use of alcohol or to have treatment or counseling for alcohol?'],
      ['a_10yr', 'In the past 10 years, have you been treated for alcohol abuse?'],
      ['a_history', 'Do you have any history of alcohol abuse, misuse, treatment, or counseling, or having been advised to discontinue the use of alcohol?'],
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
      ['r_skydive', 'Within the past 2 years, or within the next 2 years do you intend to participate in, parachuting, hang gliding, sky diving, rodeo events, or any professional sport?'],
      ['r_scuba', 'Within the past 2 years, or within the next 2 years do you intend to participate in, skin or scuba diving?'],
      ['r_racing', 'Have you engaged in, or do you within the next 2 years intend on engaging in, any form of organized racing, including automobile or hydroplane racing?'],
      ['r_climb', 'Within the past 2 years, or within the next 2 years do you intend to participate in, rock or mountain climbing?'],
      ['r_other', 'Within the past 2 years, or within the next 2 years do you intend to participate in any other hazardous activity (including BASE jumping, paragliding, caving, bungee jumping, martial arts competition, extreme skiing/snowboarding, or white-water rafting)?'],
      ['r_hazard_job', 'Does your occupation involve exposure to hazards such as heights, explosives, firearms, chemicals, underground work, logging, commercial fishing, or offshore work?'],
    ]),
    q('r_aviation_12', 'Within the past 12 months, have you made any flights as a pilot, student pilot, or crew member of any aircraft?'),
    q('r_aviation_24', 'Within the past 24 months, have you made or contemplated making any flights as a pilot, student pilot, or crew member of any aircraft?'),
    q('r_fly_future', 'Do you expect to fly in the future within the next 2 years? If yes, will the type of flying differ from past flying? Provide details.', 'textarea'),
    q('r_certificate', 'What type of certificate or license do you have now (Student, Private, Commercial, ATP, Other)?', 'text'),
    q('r_air_accident', 'Have you ever had an aircraft accident, been grounded, fined, or reprimanded for violation of air regulations?'),
    details('r_air_accident'),
    q('r_flight_hours', 'Provide the total of all hours flown as pilot and crew member, and a complete schedule of flying time (Commercial, Company-owned, Student Instruction, Pleasure, Military Combat/Non-Combat, etc.):', 'textarea'),
    q('r_other_flying', 'Provide details of any other flying not specifically classified above (e.g., crop dusting, mapping, surveying, testing) and type of aircraft flown (e.g., glider, helicopter, lighter-than-air):', 'textarea'),
    q('r_climb_years', 'For how many years have you been climbing regularly, and how often do you climb?', 'textarea', { dependsOn: { id: 'r_climb', value: 'Yes' } }),
    q('r_climb_areas', 'Do you climb in North America (Mt McKinley or elsewhere), Europe (Alps), Africa, the Himalayas/Karakoram, or other areas? List them:', 'textarea', { dependsOn: { id: 'r_climb', value: 'Yes' } }),
    q('r_climb_nature', 'Describe your climbing: terrain (rock, snow/ice, artificial), degree of difficulty, maximum height, and season(s):', 'textarea', { dependsOn: { id: 'r_climb', value: 'Yes' } }),
    q('r_climb_bolts', 'What proportion of your climbing is on routes protected by climbing bolts?', 'text', { dependsOn: { id: 'r_climb', value: 'Yes' } }),
    q('r_climb_solo', 'Do you ever climb alone or without a rope? If yes, how often, where, and at what degree of difficulty?', 'textarea', { dependsOn: { id: 'r_climb', value: 'Yes' } }),
    q('r_race_track', 'Over what type of track do you race (e.g., oval, simulated road)?', 'text', { dependsOn: { id: 'r_racing', value: 'Yes' } }),
    q('r_race_pro', 'Do you race professionally or for cash prizes?', 'yesno', { dependsOn: { id: 'r_racing', value: 'Yes' } }),
    q('r_race_date', 'Provide the date of your last race:', 'date', { dependsOn: { id: 'r_racing', value: 'Yes' } }),
    q('r_dive_cert', 'Are you a certified skin/scuba diver? If yes, provide hours of instruction and date of certification. If no, why?', 'textarea', { dependsOn: { id: 'r_scuba', value: 'Yes' } }),
    q('r_dive_depth', 'What is the maximum depth obtained on your dives? Specify pleasure or commercial, number of dives, and average time underwater for less than 40ft, 40–60ft, 60–100ft, and 100+ ft in the last 12 months and contemplated next 12 months:', 'textarea', { dependsOn: { id: 'r_scuba', value: 'Yes' } }),
    q('r_dive_equipment', 'What types of equipment do you use (scuba, number of tanks, type of air supply, wet suit, others)?', 'textarea', { dependsOn: { id: 'r_scuba', value: 'Yes' } }),
    q('r_dive_locations', 'What are the locations of your diving activities (lakes and rivers, ocean beaches, deep sea, bays and inlets, or others)?', 'textarea', { dependsOn: { id: 'r_scuba', value: 'Yes' } }),
    q('r_dive_salvage', 'Do you dive for salvage or exploration?', 'yesno', { dependsOn: { id: 'r_scuba', value: 'Yes' } }),
    q('r_club', 'Are you a member of an organized club for your climbing or diving activities?', 'yesno'),
  ],
}

const driving: Section = {
  id: 'driving',
  title: 'Driving Record Questions',
  questions: [
    q('d_license', 'Do you have a valid driver’s license?'),
    q('d_license_state', 'State of issue and license number:', 'text', { dependsOn: { id: 'd_license', value: 'Yes' } }),
    ...withDetails([
      ['d_dui', 'Within the past 24 months, have you had your driver’s license suspended or revoked, or been convicted of driving under the influence of alcohol or drugs?'],
      ['d_suspend', 'Within the past 5 years, has your driver’s license been suspended or revoked, or is it currently suspended or revoked?'],
      ['d_moving', 'Within the past 5 years, have you pled guilty to or been convicted of any moving violations?'],
      ['d_reckless', 'Within the past 5 years, have you been convicted of careless or reckless driving?'],
      ['d_multiple', 'In the past 5 years, have you had more than two moving motor vehicle violations or any alcohol/drug-related infractions?'],
      ['d_accident', 'Have you ever had any motor vehicle accidents? If yes, provide details, including fault.'],
      ['d_sr22', 'Are you required to carry SR-22 insurance?'],
    ]),
  ],
}

const criminal: Section = {
  id: 'criminal',
  title: 'Arrest / Criminal Record Questions',
  questions: [
    ...withDetails([
      ['c_6mo_supervision', 'Within the past 6 months, have you served or been released from incarceration, probation, parole, or other court-ordered supervision for a misdemeanor or felony conviction?'],
      ['c_7yr_felony', 'Within the past 7 years, have you been convicted of, pleaded guilty to, or entered a plea of no contest to any felony?'],
      ['c_10yr_felony', 'In the past 10 years, have you been convicted of, pled guilty to, or are you currently awaiting trial for a felony?'],
      ['c_10yr_supervision', 'In the past 10 years, have you served or been released from incarceration, probation, parole, or other court-ordered supervision for a misdemeanor or felony conviction?'],
      ['c_current_supervision', 'Are you currently under an order for probation, parole, or other court-ordered supervision for a misdemeanor or felony conviction?'],
      ['c_5yr_charge', 'Within the past 5 years, have you pled guilty to or been convicted of a felony or misdemeanor (including DUI or DWI), or do you have such a charge currently pending against you?'],
      ['c_ever', 'Have you ever pled guilty to, or been convicted of, a felony or misdemeanor, or have such a charge currently pending? If yes, provide date of arrest, conviction, and any jail time, probation, or parole.'],
    ]),
  ],
}

const bankruptcy: Section = {
  id: 'bankruptcy',
  title: 'Bankruptcy Questions',
  questions: [
    q('b_filed', 'Have you or your spouse filed bankruptcy before?'),
    q('b_type', 'Type of bankruptcy:', 'select', { options: ['Chapter 7', 'Chapter 11', 'Chapter 13', 'Other'], dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_ch7_type', 'If Chapter 7, was this personal or business?', 'select', { options: ['Personal', 'Business', 'Both'], dependsOn: { id: 'b_type', value: 'Chapter 7' } }),
    q('b_filed_date', 'Date filed:', 'date', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_has_discharged', 'Has this bankruptcy been discharged?', 'yesno', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_discharged', 'What was the date or anticipated date of discharge?', 'date', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
    q('b_current', 'Is this bankruptcy still in process?', 'yesno', { dependsOn: { id: 'b_filed', value: 'Yes' } }),
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
      ['i_2yr', 'Within the past 2 years, have you used illegal drugs, abused alcohol or drugs, had or been recommended by a medical professional to have treatment or counseling for alcohol or drug use, or been advised to discontinue the use of alcohol or drugs?'],
      ['i_5yr', 'Within the past 5 years, have you used illegal drugs or abused alcohol or drugs, or had or been recommended by a medical professional or a licensed counselor to discontinue the use of alcohol or drugs, or to have treatment or counseling for alcohol or drugs?'],
      ['i_ever_drugs', 'Have you ever used heroin, morphine, other narcotics, marijuana, cocaine, barbiturates, amphetamines, hallucinogenic drugs, or other habit-forming drugs except as prescribed by a physician?'],
      ['i_rx_advice', 'Within the past 7 years, have you been advised by a medical professional to have treatment for, or reduce/discontinue the intake of prescription drugs?'],
      ['i_marijuana', 'During the last 24 months, have you smoked marijuana for recreational purposes?'],
      ['i_treatment', 'Have you ever received treatment, counseling or been advised by a medical professional to seek treatment for drug use?'],
      ['i_history', 'Do you have any history of or current treatment for drug abuse?'],
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
    q('t_permanent', 'Is the proposed insured a U.S. permanent resident? (For privacy, do not enter a Visa or Green Card ID number.)', 'yesno', { dependsOn: { id: 't_citizen', value: 'No' } }),
    q('t_status', 'If not a U.S. citizen, what is your immigration status or visa type?', 'text', { dependsOn: { id: 't_citizen', value: 'No' } }),
    q('t_years', 'How many years have you resided in the U.S.?', 'number', { dependsOn: { id: 't_citizen', value: 'No' } }),
    q('t_consistent', 'Has the proposed insured lived consistently in the USA for the past 5 years?'),
    q('t_native', 'Does the proposed insured plan to move back to their native country?'),
    q('t_ssn', 'Do you have a valid Social Security Number?'),
    ...withDetails([
      ['t_intend_leave', 'Do you intend to move, reside, or work outside the U.S. in the next 24 months?'],
      ['t_travel', 'Within the past 24 months have you traveled outside the U.S./Canada, or do you plan to travel outside the U.S./Canada within the next 24 months?'],
      ['t_hazard', 'Have you or do you plan to travel to a country with a travel advisory, active conflict, or elevated health risk?'],
      ['t_restricted_travel', 'Within the next 2 years, do you intend to work, travel, or reside in Saudi Arabia, Iraq, Afghanistan, Syria, Somalia, Sudan, or Yemen for more than 30 days, or reside outside the United States at any location more than 180 days?'],
      ['t_outside_30', 'Within the next 24 months, do you intend to work, travel, or reside outside of the U.S. for more than 30 days?'],
    ]),
    q('t_travel_details', 'Provide details of previous and future foreign travel/residence, including pleasure and short business trips within the last 2 years: dates, countries/regions, reason, frequency, and duration:', 'textarea'),
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
    q('f_salary', 'What is your annual salary?', 'number'),
    q('f_fulltime', 'Are you currently working full-time (minimum 30 hours a week), and have you done so for the past six months?'),
    q('f_weapon', 'Do you carry a weapon in your occupation?'),
    q('f_highrisk', 'Are you a member of any high-risk occupations (e.g., blasters and explosives handlers, structural/iron workers, underground miners, professional athletes, casino workers, firefighters)?'),
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
    q('ms_active', 'Are you a member of the United States Military on active duty?'),
    q('ms_active_deploy', 'Are you currently deployed or do you have orders to be deployed in Saudi Arabia, Iraq, Afghanistan, Syria, Somalia, Sudan, or Yemen?', 'yesno', { dependsOn: { id: 'ms_active', value: 'Yes' } }),
    q('ms_flight_schedule', 'Provide your complete schedule of flying time if you participate in military aviation:', 'textarea', { dependsOn: { id: 'ms_active', value: 'Yes' } }),
    q('ms_flight_type', 'Do you fly Combat Tactical/Recon, Combat Transport/Support/Supply, Non-Combat Recon, Non-Combat Transport, or for Proficiency only?', 'text', { dependsOn: { id: 'ms_active', value: 'Yes' } }),
    q('ms_title_rank', 'What is your job title and current rank?', 'text', { dependsOn: { id: 'ms_active', value: 'Yes' } }),
    q('ms_aircraft_duties', 'Are you assigned duties aboard the aircraft?', 'yesno', { dependsOn: { id: 'ms_active', value: 'Yes' } }),
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
