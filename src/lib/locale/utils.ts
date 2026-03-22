type Locale = 'hu' | 'en'
type LocalizedOption = {
  value: string
  label: Record<Locale, string>
}
export function getLocalizedLabel(
  value: string,
  locale: string,
  options: LocalizedOption[],
): string {
  const option = options.find((opt) => opt.value === value)
  return option?.label[locale as 'hu' | 'en'] ?? value
}
