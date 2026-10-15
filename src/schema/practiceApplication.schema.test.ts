import { describe, expect, it } from 'vitest'
import {
  canTransmit,
  getMissingConsents,
  practiceApplicationDraftSchema,
  practiceApplicationSubmitSchema,
} from './practiceApplication.schema'

const consents = { consent_contact: true, consent_disclaimer: true }
const base = { first_name: 'Ann', last_name: 'Lee', date_of_birth: '1980-01-01', ...consents }

const failedPaths = (data: unknown) => {
  const r = practiceApplicationSubmitSchema.safeParse(data)
  return r.success ? [] : r.error.issues.map((i) => i.path.join('.'))
}

describe('draft schema', () => {
  it('accepts partial data', () => {
    expect(practiceApplicationDraftSchema.safeParse({ first_name: 'Ann' }).success).toBe(true)
    expect(practiceApplicationDraftSchema.safeParse({}).success).toBe(true)
  })

  it('does not require follow-ups even when triggered', () => {
    expect(practiceApplicationDraftSchema.safeParse({ conditions_triggered: ['Cancer'] }).success).toBe(true)
  })
})

describe('consent gating helpers', () => {
  it('returns both keys when nothing is checked', () => {
    expect(getMissingConsents({})).toEqual(['consent_contact', 'consent_disclaimer'])
    expect(getMissingConsents({ consent_contact: false, consent_disclaimer: false })).toEqual([
      'consent_contact',
      'consent_disclaimer',
    ])
  })

  it('returns only the unchecked key', () => {
    expect(getMissingConsents({ consent_contact: true, consent_disclaimer: false })).toEqual(['consent_disclaimer'])
    expect(getMissingConsents({ consent_contact: false, consent_disclaimer: true })).toEqual(['consent_contact'])
  })

  it('canTransmit only when both are checked', () => {
    expect(canTransmit(consents)).toBe(true)
    expect(canTransmit({ consent_contact: true })).toBe(false)
    expect(canTransmit({ consent_disclaimer: true, consent_contact: false })).toBe(false)
    expect(canTransmit({})).toBe(false)
  })
})

describe('submit schema', () => {
  it('passes a minimal submission with no triggering conditions', () => {
    expect(practiceApplicationSubmitSchema.safeParse(base).success).toBe(true)
  })

  it('ignores hidden follow-up fields when nothing is triggered', () => {
    expect(practiceApplicationSubmitSchema.safeParse({ ...base, conditions_triggered: ['None'] }).success).toBe(true)
  })

  it('blocks missing consents with paths pointing at the consent fields', () => {
    expect(failedPaths({ ...base, consent_contact: false })).toEqual(['consent_contact'])
    expect(failedPaths({ ...base, consent_disclaimer: undefined })).toEqual(['consent_disclaimer'])
    expect(failedPaths({ first_name: 'A', last_name: 'B', date_of_birth: 'x' })).toEqual([
      'consent_contact',
      'consent_disclaimer',
    ])
  })
})

describe('conditional health modules', () => {
  const cases: [string, string[], string][] = [
    ['Seizure Disorder', ['Seizure Disorder'], 'sz_diagnosis'],
    ['Seizures', ['Seizures'], 'sz_diagnosis'],
    ['Sleep Apnea', ['Sleep Apnea'], 'rs_diagnosis'],
    ['COPD', ['COPD'], 'rs_diagnosis'],
    ['High Blood Pressure', ['High Blood Pressure'], 'hb_dx'],
    ['Diabetes 1 or 2', ['Diabetes 1 or 2'], 'db_dx'],
    ['Cancer', ['Cancer'], 'cn_cancer'],
    ['Arthritis', ['Arthritis'], 'ar_type'],
    ['Asthma', ['Asthma'], 'as_dx'],
  ]

  it.each(cases)('%s requires its follow-up fields', (_name, triggered, field) => {
    expect(failedPaths({ ...base, conditions_triggered: triggered })).toContain(field)
  })

  it('passes once the follow-ups are answered', () => {
    const data = {
      ...base,
      conditions_triggered: ['Asthma'],
      as_dx: '2010-01', as_last: '2024-01', as_steroid: 'No', as_hosp: 'No', as_status: 'No',
    }
    expect(practiceApplicationSubmitSchema.safeParse(data).success).toBe(true)
  })
})

describe('conditional mental health rules', () => {
  it('requires mental health follow-ups when a trigger is selected', () => {
    const paths = failedPaths({ ...base, mh_selected_conditions: ['Depression'] })
    expect(paths).toEqual(expect.arrayContaining(['m_meds', 'm_dx_date', 'm_last_seen']))
  })

  it('does not validate mental health follow-ups for "None"', () => {
    expect(practiceApplicationSubmitSchema.safeParse({ ...base, mh_selected_conditions: ['None'] }).success).toBe(true)
  })

  it('requires detail text for suicide-related answers', () => {
    const mh = { m_meds: 'x', m_dx_date: '2020-01-01', m_last_seen: '2024-01-01' }
    expect(failedPaths({ ...base, ...mh, mh_selected_conditions: ['Suicide attempt/ideation'] })).toEqual(['m_suicide_details'])
    expect(failedPaths({ ...base, m_attempt: 'Yes' })).toEqual(['m_attempt_details'])
    expect(
      practiceApplicationSubmitSchema.safeParse({
        ...base, ...mh, mh_selected_conditions: ['Suicide attempt/ideation'], m_suicide_details: 'details',
      }).success,
    ).toBe(true)
  })
})

describe('cross-field details', () => {
  const hb = { hb_dx: '2015-01', hb_med12: 'Yes', hb_change: 'No', hb_other: 'No', hb_hosp: 'No', hb_work: 'No' }
  const hyper = { ...base, conditions_triggered: ['High Blood Pressure'], ...hb }

  it('passes when all answers are No', () => {
    expect(practiceApplicationSubmitSchema.safeParse(hyper).success).toBe(true)
  })

  it.each([
    ['hb_change', 'hb_change_details'],
    ['hb_hosp', 'hb_hosp_date'],
  ])('%s = Yes requires %s', (flag, details) => {
    expect(failedPaths({ ...hyper, [flag]: 'Yes' })).toEqual([details])
    expect(practiceApplicationSubmitSchema.safeParse({ ...hyper, [flag]: 'Yes', [details]: 'x' }).success).toBe(true)
  })

  it('diabetes medication change requires details', () => {
    const db = { ...base, conditions_triggered: ['Diabetes 1 or 2'], db_dx: '2010-01', db_control: 'Diet Only', db_change: 'Yes', db_compliant: 'Yes', db_hosp: 'No' }
    expect(failedPaths(db)).toEqual(['db_change_details'])
  })
})
