/**
 * The calendar date of an instant in Bangkok, wherever the code runs.
 *
 * getDate() and friends use the machine's time zone. The server runs in UTC,
 * so anything saved between midnight and 7am Bangkok time printed as the day
 * before, and a client component printed a different day from the server
 * render of the same page. Bangkok has no daylight saving, so a fixed +7 hours
 * read back in UTC gives the right date everywhere.
 */
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000

export function bangkokDate(iso: string): { day: number; month: number; year: number } | null {
  const t = new Date(iso).getTime()
  if (isNaN(t)) return null
  const d = new Date(t + BANGKOK_OFFSET_MS)
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() }
}
