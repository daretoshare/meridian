'use server'

export async function checkCulturalPassword(password: string): Promise<boolean> {
  const expected = process.env.CULTURAL_PASSWORD
  if (!expected) return true // no password configured → open access
  return password === expected
}

export async function isCulturalPasswordRequired(): Promise<boolean> {
  return !!process.env.CULTURAL_PASSWORD
}
