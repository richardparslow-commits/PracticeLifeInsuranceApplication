export type QuestionType =
  | 'yesno'
  | 'text'
  | 'textarea'
  | 'date'
  | 'monthyear'
  | 'number'
  | 'select'
  | 'multiselect'

export interface Question {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  // Show only when another question's answer equals "Yes" (or includes the given option)
  dependsOn?: { id: string; value: string }
}

export interface FollowUpGroup {
  id: string
  title: string
  // Shown when any of these options is selected in the section's condition checklist
  triggers: string[]
  questions: Question[]
  subheadings?: Record<string, string>
}

export interface Section {
  id: string
  title: string
  description?: string
  questions: Question[]
  followUps?: FollowUpGroup[]
}

export type Answers = Record<string, string | string[]>
