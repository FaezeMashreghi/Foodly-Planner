export function validateConfirmationCode(value: string): string | undefined {
  const code = value.replace(/\s/g, '')
  if (code === '') return 'Enter the confirmation code'
  if (!/^\d{6}$/.test(code)) return 'Enter the 6-digit code from the email'
  return undefined
}
