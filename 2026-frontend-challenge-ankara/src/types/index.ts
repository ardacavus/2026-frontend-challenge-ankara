export interface JotformAnswer {
  name: string
  order: string
  text: string
  type: string
  answer?: string | string[] | Record<string, string>
  prettyFormat?: string
}

export interface JotformSubmission {
  id: string
  form_id: string
  ip: string
  created_at: string
  status: string
  new: string
  flag: string
  notes: string
  updated_at: string | null
  answers: Record<string, JotformAnswer>
}

export interface JotformResponse {
  responseCode: number
  message: string
  content: JotformSubmission[]
  resultSet: {
    offset: number
    limit: number
    count: number
  }
  duration: string
}

export interface InvestigationData {
  checkins: JotformSubmission[]
  messages: JotformSubmission[]
  sightings: JotformSubmission[]
  notes: JotformSubmission[]
  tips: JotformSubmission[]
}
