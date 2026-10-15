import type { Question, QuestionType } from './types'

export const q = (
  id: string,
  text: string,
  type: QuestionType = 'yesno',
  extra: Partial<Question> = {},
): Question => ({ id, text, type, ...extra })

export const details = (parent: string, text = 'If Yes, please provide details (dates, names, treatment, outcome):'): Question =>
  q(`${parent}_details`, text, 'textarea', { dependsOn: { id: parent, value: 'Yes' } })

// Build a list of questions where every Yes/No question is followed by a details box
export const withDetails = (items: [string, string][]): Question[] =>
  items.flatMap(([id, text]) => [q(id, text), details(id)])

export const YES = 'Yes'
