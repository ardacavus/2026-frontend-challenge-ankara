export const JOTFORM_API_KEY = import.meta.env.VITE_JOTFORM_API_KEY as string
export const JOTFORM_BASE_URL = 'https://api.jotform.com'

export const FORM_IDS = {
  checkins: import.meta.env.VITE_FORM_CHECKINS as string,
  messages: import.meta.env.VITE_FORM_MESSAGES as string,
  sightings: import.meta.env.VITE_FORM_SIGHTINGS as string,
  notes: import.meta.env.VITE_FORM_NOTES as string,
  tips: import.meta.env.VITE_FORM_TIPS as string,
} as const
