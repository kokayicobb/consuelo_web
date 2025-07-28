export function debugAuth() {
  console.log("🔍 Environment Variables Debug:")
  console.log("INTERNAL_API_KEY exists:", !!process.env.INTERNAL_API_KEY)
  console.log("INTERNAL_API_KEY length:", process.env.INTERNAL_API_KEY?.length)
  console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)
  console.log("NODE_ENV:", process.env.NODE_ENV)
}

export function validateInternalApiKey(providedKey: string | undefined): boolean {
  const expectedKey = process.env.INTERNAL_API_KEY

  console.log("🔑 API Key Validation:")
  console.log("Expected key exists:", !!expectedKey)
  console.log("Provided key exists:", !!providedKey)
  console.log("Keys match:", expectedKey === providedKey)

  return expectedKey === providedKey
}
