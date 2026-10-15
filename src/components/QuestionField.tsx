import type { Answers, Question } from '../data/types'

interface Props {
  question: Question
  answers: Answers
  onChange: (id: string, value: string | string[]) => void
}

export function isVisible(question: Question, answers: Answers): boolean {
  if (!question.dependsOn) return true
  const a = answers[question.dependsOn.id]
  return Array.isArray(a) ? a.includes(question.dependsOn.value) : a === question.dependsOn.value
}

export function QuestionField({ question, answers, onChange }: Props) {
  if (!isVisible(question, answers)) return null
  const { id, text, type, options = [] } = question
  const value = answers[id]
  const str = typeof value === 'string' ? value : ''
  const arr = Array.isArray(value) ? value : []
  const nested = !!question.dependsOn

  return (
    <div className={`field${nested ? ' nested' : ''}`}>
      <label className="q-text" htmlFor={id}>{text}</label>
      {type === 'yesno' && (
        <div className="choices" role="radiogroup" aria-label={text}>
          {['Yes', 'No'].map((o) => (
            <label key={o} className="choice">
              <input type="radio" name={id} checked={str === o} onChange={() => onChange(id, o)} /> {o}
            </label>
          ))}
        </div>
      )}
      {(type === 'text' || type === 'number' || type === 'date') && (
        <input id={id} type={type} value={str} onChange={(e) => onChange(id, e.target.value)} />
      )}
      {type === 'monthyear' && (
        <input id={id} type="month" value={str} onChange={(e) => onChange(id, e.target.value)} />
      )}
      {type === 'textarea' && (
        <textarea id={id} rows={3} value={str} onChange={(e) => onChange(id, e.target.value)} />
      )}
      {type === 'select' && (
        <select id={id} value={str} onChange={(e) => onChange(id, e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      )}
      {type === 'multiselect' && (
        <div className="choices grid">
          {options.map((o) => (
            <label key={o} className="choice">
              <input
                type="checkbox"
                checked={arr.includes(o)}
                onChange={(e) => onChange(id, e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))}
              />{' '}{o}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
