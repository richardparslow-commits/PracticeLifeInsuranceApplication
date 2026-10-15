import { z } from 'zod'

const text = z.string().trim()

export const CONSENT_KEYS = ['consent_contact', 'consent_disclaimer'] as const
export type ConsentKey = (typeof CONSENT_KEYS)[number]

export interface ConditionModule {
  id: string
  triggers: string[]
  required: string[]
  detailPairs: [yesNoField: string, detailsField: string, whenValue?: string][]
}

export const conditionModules: ConditionModule[] = [
  {
    id: 'seizure',
    triggers: ['Seizure Disorder', 'Seizures'],
    required: ['sz_diagnosis', 'sz_dx_date', 'sz_last', 'sz_hosp', 'sz_pending', 'sz_injury'],
    detailPairs: [['sz_hosp', 'sz_hosp_details'], ['sz_pending', 'sz_pending_details'], ['sz_injury', 'sz_injury_details']],
  },
  {
    id: 'respiratory',
    triggers: [
      'Sleep Apnea', 'COPD', 'Emphysema', 'Chronic Bronchitis', 'Asbestosis', 'Cystic Fibrosis',
      'Tuberculosis', 'Lung Cancer (current or past diagnosed)', 'Sarcoidosis', 'Pulmonary Fibrosis',
    ],
    required: ['rs_diagnosis', 'rs_first_dx', 'rs_hosp', 'rs_pending'],
    detailPairs: [['rs_hosp', 'rs_hosp_details'], ['rs_pending', 'rs_pending_details']],
  },
  {
    id: 'hypertension',
    triggers: ['High Blood Pressure'],
    required: ['hb_dx', 'hb_med12', 'hb_change', 'hb_other', 'hb_hosp', 'hb_work'],
    detailPairs: [
      ['hb_change', 'hb_change_details'], ['hb_other', 'hb_other_details'],
      ['hb_hosp', 'hb_hosp_date'], ['hb_work', 'hb_work_details'],
    ],
  },
  {
    id: 'diabetes',
    triggers: ['Diabetes 1 or 2'],
    required: ['db_dx', 'db_control', 'db_change', 'db_compliant', 'db_hosp'],
    detailPairs: [
      ['db_control', 'db_insulin_date', 'Insulin'], ['db_change', 'db_change_details'],
      ['db_compliant', 'db_compliant_details', 'No'],
    ],
  },
  {
    id: 'cancer',
    triggers: ['Cancer', 'Lung Cancer (current or past diagnosed)'],
    required: ['cn_cancer', 'cn_dx', 'cn_location', 'cn_spread', 'cn_surgery', 'cn_chemo'],
    detailPairs: [
      ['cn_spread', 'cn_spread_details'], ['cn_surgery', 'cn_surgery_details'],
      ['cn_chemo', 'cn_chemo_date'], ['cn_other', 'cn_other_details'], ['cn_tamoxifen', 'cn_tamoxifen_date'],
    ],
  },
  {
    id: 'arthritis',
    triggers: ['Arthritis'],
    required: ['ar_type', 'ar_joints', 'ar_duration', 'ar_unable', 'ar_meds'],
    detailPairs: [['ar_type', 'ar_other', 'Other'], ['ar_unable', 'ar_unable_details'], ['ar_meds', 'ar_med_name']],
  },
  {
    id: 'asthma',
    triggers: ['Asthma'],
    required: ['as_dx', 'as_last', 'as_steroid', 'as_hosp', 'as_status'],
    detailPairs: [['as_steroid', 'as_steroid_details'], ['as_status', 'as_status_date']],
  },
]

export const mentalHealthTriggers = [
  'Situational anxiety', 'Adjustment disorder', 'Panic disorder', 'Depression', 'Major depression',
  'Schizophrenia', 'Bipolar I', 'Bipolar II', 'ADHD/ADD', 'Eating disorder',
  'Mental retardation / intellectual disability', 'PTSD', 'Tourette’s syndrome',
  'Suicide attempt/ideation', 'OCD', 'Autism',
]
export const suicideTrigger = 'Suicide attempt/ideation'

// Every field is optional text/array; required-ness is enforced by the submit schema.
const followUpShape = Object.fromEntries(
  [
    ...conditionModules.flatMap((m) => [...m.required, ...m.detailPairs.flatMap(([a, b]) => [a, b])]),
    'm_meds', 'm_dx_date', 'm_last_seen', 'm_attempt', 'm_attempt_details', 'm_suicide_details',
  ].map((k) => [k, text.optional()]),
)

export const practiceApplicationBaseSchema = z.object({
  ...followUpShape,
  first_name: text.optional(),
  last_name: text.optional(),
  date_of_birth: text.optional(),
  conditions_triggered: z.array(z.string()).optional(),
  mh_selected_conditions: z.array(z.string()).optional(),
  consent_contact: z.boolean().optional(),
  consent_disclaimer: z.boolean().optional(),
})

export type PracticeApplication = z.infer<typeof practiceApplicationBaseSchema>

export const practiceApplicationDraftSchema = practiceApplicationBaseSchema

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

export type ConsentInput = Partial<Record<ConsentKey, boolean | undefined>>

export const getMissingConsents = (data: ConsentInput): ConsentKey[] =>
  CONSENT_KEYS.filter((k) => data[k] !== true)

export const canTransmit = (data: ConsentInput): boolean => getMissingConsents(data).length === 0

export const practiceApplicationSubmitSchema = practiceApplicationBaseSchema.superRefine((data, ctx) => {
  const record = data as Record<string, unknown>
  const need = (path: string) => {
    if (isBlank(record[path])) ctx.addIssue({ code: 'custom', path: [path], message: 'Required' })
  }

  need('first_name')
  need('last_name')
  need('date_of_birth')

  for (const key of getMissingConsents(data)) {
    ctx.addIssue({ code: 'custom', path: [key], message: 'Consent is required to submit' })
  }

  const triggered = data.conditions_triggered ?? []
  for (const mod of conditionModules) {
    if (!mod.triggers.some((t) => triggered.includes(t))) continue
    mod.required.forEach(need)
    for (const [flag, details, whenValue = 'Yes'] of mod.detailPairs) {
      if (record[flag] === whenValue) need(details)
    }
  }

  const mh = (data.mh_selected_conditions ?? []).filter((c) => mentalHealthTriggers.includes(c))
  if (mh.length > 0) {
    ;['m_meds', 'm_dx_date', 'm_last_seen'].forEach(need)
    if (mh.includes(suicideTrigger)) need('m_suicide_details')
  }
  if (record.m_attempt === 'Yes') need('m_attempt_details')
})

