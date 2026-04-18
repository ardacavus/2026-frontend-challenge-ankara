import { JOTFORM_API_KEY, JOTFORM_BASE_URL, FORM_IDS } from '../constants'
import type { JotformResponse, JotformSubmission, InvestigationRecord } from '../types'
import {
  transformCheckin,
  transformMessage,
  transformSighting,
  transformNote,
  transformTip,
} from '../utils/transformers'

async function fetchFormSubmissions(formId: string): Promise<JotformSubmission[]> {
  const url = `${JOTFORM_BASE_URL}/form/${formId}/submissions?apiKey=${JOTFORM_API_KEY}&limit=1000&orderby=created_at`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Jotform API error: ${res.status} for form ${formId}`)
  const data: JotformResponse = await res.json()
  if (data.responseCode !== 200) throw new Error(data.message)
  return data.content
}

export async function fetchCheckins(): Promise<JotformSubmission[]> {
  return fetchFormSubmissions(FORM_IDS.checkins)
}

export async function fetchMessages(): Promise<JotformSubmission[]> {
  return fetchFormSubmissions(FORM_IDS.messages)
}

export async function fetchSightings(): Promise<JotformSubmission[]> {
  return fetchFormSubmissions(FORM_IDS.sightings)
}

export async function fetchNotes(): Promise<JotformSubmission[]> {
  return fetchFormSubmissions(FORM_IDS.notes)
}

export async function fetchTips(): Promise<JotformSubmission[]> {
  return fetchFormSubmissions(FORM_IDS.tips)
}

export async function fetchAllInvestigationData(): Promise<InvestigationRecord[]> {
  const [checkins, messages, sightings, notes, tips] = await Promise.all([
    fetchCheckins(),
    fetchMessages(),
    fetchSightings(),
    fetchNotes(),
    fetchTips(),
  ])

  return [
    ...checkins.map(transformCheckin),
    ...messages.map(transformMessage),
    ...sightings.map(transformSighting),
    ...notes.map(transformNote),
    ...tips.map(transformTip),
  ].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}
