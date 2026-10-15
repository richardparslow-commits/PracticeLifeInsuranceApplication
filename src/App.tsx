import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { sections } from './data/sections'
import type { Answers, Question, Section } from './data/types'
import { QuestionField, isVisible } from './components/QuestionField'
import './App.css'

const STORAGE_KEY = 'practice-life-application-v1'

function loadAnswers(): Answers {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Answers
  } catch {
    return {}
  }
}

function activeFollowUps(section: Section, answers: Answers) {
  const selected = answers[section.followUpQuestionId ?? 'h_conditions']
  const list = Array.isArray(selected) ? selected : []
  return (section.followUps ?? []).filter((g) => g.triggers.some((t) => list.includes(t)))
}

function visibleQuestions(section: Section, answers: Answers): Question[] {
  const all = [...section.questions, ...activeFollowUps(section, answers).flatMap((g) => g.questions)]
  return all.filter((qn) => isVisible(qn, answers))
}

function isAnswered(v: string | string[] | undefined) {
  return Array.isArray(v) ? v.length > 0 : !!v
}

export default function App() {
  const [answers, setAnswers] = useState<Answers>(loadAnswers)
  const [contact, setContact] = useState({ name: '', email: '', phone: '', preferredTime: '' })
  const [consents, setConsents] = useState({ contact: false, authorization: false })
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [step, setStep] = useState(0)
  const reviewStep = sections.length
  const onReview = step === reviewStep

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const setAnswer = (id: string, value: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [id]: value }))

  const progress = useMemo(
    () =>
      sections.map((s) => {
        const qs = visibleQuestions(s, answers)
        return { total: qs.length, done: qs.filter((x) => isAnswered(answers[x.id])).length }
      }),
    [answers],
  )

  const go = (n: number) => {
    setStep(n)
    window.scrollTo({ top: 0 })
  }

  const section = sections[step]
  const submitContactRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitAttempted(true)
    if (!consents.contact || !consents.authorization) return
    if (!event.currentTarget.reportValidity()) return

    const application = sections.flatMap((s) =>
      visibleQuestions(s, answers)
        .filter((question) => isAnswered(answers[question.id]))
        .map((question) => {
          const answer = answers[question.id]
          return `${question.text}\n${Array.isArray(answer) ? answer.join(', ') : answer}`
        }),
    ).join('\n\n')
    const body = [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Cell phone: ${contact.phone}`,
      `Preferred time to reach me: ${contact.preferredTime}`,
      '',
      'Practice application responses:',
      application || '(No questions answered)',
    ].join('\n')
    window.location.href = `mailto:richardparslow@lifepolicypilot.blog?subject=${encodeURIComponent('Practice Life Insurance Application')}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="app">
      <header className="site-header">
        <h1>Practice Life Insurance Application</h1>
        <p>
          A practice tool from{' '}
          <a href="https://lifeinsurancebrokeradvocate.com/" target="_blank" rel="noreferrer">
            Life Insurance Broker Advocate
          </a>
          . Use it to see the kinds of questions an underwriter asks. This is for education only —
          it is not an actual application for coverage. Answers are saved only in your browser.
          The optional contact form opens your email app only after both consent boxes are checked;
          it does not send anything automatically.
        </p>
      </header>

      <nav className="steps" aria-label="Sections">
        {sections.map((s, i) => (
          <button key={s.id} className={i === step ? 'active' : ''} onClick={() => go(i)}>
            {i + 1}. {s.title.replace(' Questions', '')}
            <small>{progress[i].done}/{progress[i].total}</small>
          </button>
        ))}
        <button className={onReview ? 'active' : ''} onClick={() => go(reviewStep)}>Review</button>
      </nav>

      <main>
        {!onReview && section && (
          <section>
            <h2>{section.title}</h2>
            {section.description && <p className="muted">{section.description}</p>}
            {section.questions.map((qn) => (
              <QuestionField key={qn.id} question={qn} answers={answers} onChange={setAnswer} />
            ))}
            {activeFollowUps(section, answers).map((g) => (
              <fieldset key={g.id} className="followup">
                <legend>{g.title}</legend>
                {g.questions.map((qn) => (
                  <div key={qn.id}>
                    {g.subheadings?.[qn.id] && <h4>{g.subheadings[qn.id]}</h4>}
                    <QuestionField question={qn} answers={answers} onChange={setAnswer} />
                  </div>
                ))}
              </fieldset>
            ))}
          </section>
        )}

        {onReview && (
          <section>
            <h2>Review Your Practice Application</h2>
            {sections.map((s) => (
              <div key={s.id} className="review-section">
                <h3>{s.title}</h3>
                {visibleQuestions(s, answers).filter((x) => isAnswered(answers[x.id])).map((x) => (
                  <p key={x.id}>
                    <strong>{x.text}</strong>
                    <br />
                    {Array.isArray(answers[x.id]) ? (answers[x.id] as string[]).join(', ') : answers[x.id]}
                  </p>
                ))}
              </div>
            ))}
            <div className="actions">
              <button onClick={() => window.print()}>Print / Save as PDF</button>
              <a
                className="button"
                href="mailto:richardparslow@lifepolicypilot.blog?subject=Practice%20Life%20Insurance%20Application%20Feedback"
              >
                Email feedback
              </a>
              <button
                className="danger"
                onClick={() => {
                  if (window.confirm('Clear all answers?')) {
                    setAnswers({})
                    go(0)
                  }
                }}
              >
                Start over
              </button>
            </div>

            <section className="contact-section" aria-labelledby="contact-heading">
              <h2 id="contact-heading">Optional: Send a Copy and Request Contact</h2>
              <p>
                You may provide your contact details and request a follow-up. This section is optional.
                Submitting opens your email application with your practice answers; review the message
                there before sending. Standard email may not be secure.
              </p>
              <form noValidate onSubmit={submitContactRequest}>
                <div className="contact-fields">
                  <label>Name
                    <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                  </label>
                  <label>Email address
                    <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  </label>
                  <label>Cell phone number
                    <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                  </label>
                  <label>Preferred time for me to reach out
                    <input value={contact.preferredTime} onChange={(e) => setContact({ ...contact, preferredTime: e.target.value })} />
                  </label>
                </div>

                <label className={`consent-card${submitAttempted && !consents.contact ? ' missing' : ''}`}>
                  <input
                    type="checkbox"
                    checked={consents.contact}
                    aria-invalid={submitAttempted && !consents.contact}
                    onChange={(e) => setConsents({ ...consents, contact: e.target.checked })}
                  />
                  <span>
                    <strong>Consent to Contact:</strong> By checking this box and clicking “Submit / Contact Me,” I provide my express written consent to receive marketing and informational calls, text messages (SMS/MMS), and emails from Richard Francis Parslow (Life Insurance Broker Advocate / Life Policy Pilot) regarding life insurance products and services at the phone number and email address I provided above, including through the use of an automated telephone dialing system, artificial or AI-generated voice, or prerecorded message, even if my number is currently listed on any federal, state, or corporate Do-Not-Call list. I understand that my consent is not a condition of purchasing any insurance policy, goods, or services, and that I may still request a quote by emailing Richard at <a href="mailto:richardparslow@lifepolicypilot.blog">richardparslow@lifepolicypilot.blog</a> to set up a Zoom appointment to complete all necessary paperwork to apply for life insurance. Message and data rates may apply. Message frequency varies. I can revoke my consent at any time by replying STOP to any text message, clicking unsubscribe in emails, or contacting <a href="mailto:richardparslow@lifepolicypilot.blog">richardparslow@lifepolicypilot.blog</a>. I also acknowledge that I have read and agree to the Privacy Policy and Terms of Use.
                  </span>
                </label>

                <div className="authorization">
                  <h3>PRE-UNDERWRITING PRACTICE APPLICATION DISCLAIMER &amp; LIMITED USE AUTHORIZATION</h3>
                  <h4>1. Purpose &amp; Limited Use Guarantee</h4>
                  <p>If you choose to email, upload, or otherwise transmit this completed Practice Application to Richard Francis Parslow (Texas Life Agent License #3076729, General Lines License #3090432, National Producer Number #20873424, operating Life Policy Pilot and Life Insurance Broker Advocate), the information you provide will be used exclusively to evaluate your preliminary insurability, communicate with life insurance carrier underwriters and authorized brokerage general agencies on your behalf, and obtain the most accurate preliminary life insurance quotes and rate-class estimates available for your profile. Your information will never be sold, rented, or shared with third-party lead generators or unaffiliated marketers.</p>
                  <h4>2. Scope of Information Covered</h4>
                  <p>By submitting or sending this Practice Application to Richard Francis Parslow, you voluntarily authorize the review and disclosure (on a de-identified or minimally identified basis whenever possible during informal trial inquiries) of the personal, health, lifestyle, and financial responses you provide across all twelve (12) sections of this worksheet, specifically:</p>
                  <ul>
                    <li><strong>Health, Medical &amp; Family History:</strong> Date and state of birth, age, sex/gender, physical diagnoses, surgeries, hospitalizations, diagnostic tests, chronic or acute conditions (including cardiac, respiratory, neurological, metabolic, renal, oncology, sleep apnea, mobility/ADL assistance, organ transplant, and HIV/AIDS diagnosis or treatment history), current prescription medications and supplements, and family medical history.</li>
                    <li><strong>Mental Health History:</strong> Psychological, mood, anxiety, depressive, psychiatric, or neurodevelopmental conditions, counseling, outpatient/inpatient psychiatric care, related work disability, suicidal ideation or attempts, and psychiatric medications.</li>
                    <li><strong>Substance &amp; Lifestyle Disclosures:</strong> Nicotine, tobacco, vaping, and oral nicotine use; alcohol consumption, treatment, counseling, or medical advice to discontinue; and past or present use or treatment regarding illegal drugs, marijuana/cannabis, or unprescribed controlled substances.</li>
                    <li><strong>Avocations, Aviation &amp; Military Service:</strong> Private, commercial, student, or military aviation hours and incidents; hazardous sports or avocations (including climbing, diving, skydiving, hang gliding, rodeo, and motorized racing); and active-duty U.S. Military status, rank, aviation duties, and current or ordered foreign deployments.</li>
                    <li><strong>Driving, Criminal, Financial &amp; Residency Records:</strong> Driver’s license status, suspensions, moving violations, accidents, and DUI/DWI history; misdemeanor or felony arrests, pleas, convictions, pending charges, probation, or parole; personal or business bankruptcy filings and discharge status; occupation, hazardous job duties, and annual income; and U.S. citizenship, permanent residency/visa classification, and past or planned foreign travel or residence.</li>
                  </ul>
                  <h4>3. Practice Worksheet Only — Not a Formal Application or Binder of Coverage</h4>
                  <p>This Practice Application is a preliminary pre-underwriting triage worksheet only. Completing or sending this worksheet to Richard Francis Parslow:</p>
                  <ul>
                    <li>Does NOT constitute a formal application for life insurance with any insurance company;</li>
                    <li>Does NOT bind, create, or guarantee any temporary or permanent life insurance coverage or lock in any premium rate; and</li>
                    <li>Does NOT authorize a hard credit inquiry or a formal third-party consumer report pull (such as MIB, Inc., formal Motor Vehicle Reports [MVR], criminal background checks, or prescription database checks under the Fair Credit Reporting Act, 15 U.S.C. § 1681 et seq.), which only occur if and when you sign a formal carrier application.</li>
                    <li>If you later submit a formal application to an insurance carrier, you must still answer all questions on that carrier’s official application completely and truthfully. Final rates and eligibility remain strictly subject to formal carrier underwriting, policy issuance, and statutory contestability provisions (Tex. Ins. Code § 705.051 and § 1101.006).</li>
                  </ul>
                  <h4>4. Email Transmission Security Notice</h4>
                  <p>Standard, unencrypted email is not a fully secure medium for transmitting sensitive medical or personal data. If you choose to email this worksheet to <a href="mailto:richardparslow@lifepolicypilot.blog">richardparslow@lifepolicypilot.blog</a>, you acknowledge and accept the inherent risks of standard email transmission. For maximum privacy during pre-underwriting, do not include your Social Security Number, Driver’s License Number, or actual Green Card/Visa ID Number on this practice worksheet, and feel free to use only your initials or first name when emailing the document.</p>
                  <h4>5. Expiration &amp; Right to Revoke (28 TAC § 22.55 Disclosure)</h4>
                  <p>In compliance with Texas Department of Insurance privacy regulations (28 TAC § 22.55), this authorization to use your information for preliminary underwriting inquiries remains valid for twelve (12) months from the date of submission (and in no event longer than the Texas statutory maximum of 24 months), unless revoked earlier. You have the right to revoke this authorization and request the permanent deletion of your Practice Application at any time by emailing <a href="mailto:richardparslow@lifepolicypilot.blog">richardparslow@lifepolicypilot.blog</a>. Revocation will not affect any preliminary underwriter inquiries already conducted prior to receipt of your revocation notice.</p>
                </div>

                <label className={`consent-card${submitAttempted && !consents.authorization ? ' missing' : ''}`}>
                  <input
                    type="checkbox"
                    checked={consents.authorization}
                    aria-invalid={submitAttempted && !consents.authorization}
                    onChange={(e) => setConsents({ ...consents, authorization: e.target.checked })}
                  />
                  <span><strong>Acknowledgment &amp; Consent:</strong> By checking this box (or by voluntarily emailing/sending this completed Practice Application to Richard Francis Parslow), I confirm that I have read, understand, and agree to the terms of this Disclaimer and Limited Use Authorization.</span>
                </label>
                {submitAttempted && (!consents.contact || !consents.authorization) && (
                  <p className="consent-error" role="alert">Check both consent boxes to continue. No email will be prepared until both are checked.</p>
                )}
                <div className="actions">
                  <button className="primary" type="submit">Submit / Contact Me</button>
                </div>
              </form>
            </section>
          </section>
        )}

        <div className="actions">
          <button disabled={step === 0} onClick={() => go(step - 1)}>Back</button>
          {!onReview && <button className="primary" onClick={() => go(step + 1)}>{step === sections.length - 1 ? 'Review' : 'Next'}</button>}
        </div>
      </main>

      <footer>
        <p>
          Questions? <a href="mailto:richardparslow@lifepolicypilot.blog">richardparslow@lifepolicypilot.blog</a> ·{' '}
          <a href="https://lifeinsurancebrokeradvocate.com/" target="_blank" rel="noreferrer">lifeinsurancebrokeradvocate.com</a>
        </p>
      </footer>
    </div>
  )
}
