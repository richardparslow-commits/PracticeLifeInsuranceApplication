import { useEffect, useMemo, useState } from 'react'
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
  const selected = answers.h_conditions
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
          it is not an actual application for coverage, and nothing is submitted. Answers are saved
          only in your browser.
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
