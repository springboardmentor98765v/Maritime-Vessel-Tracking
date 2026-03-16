/**
 * Map of country name → emoji flag
 * Covers the most common maritime registry flags.
 */
const FLAG_MAP = {
  // Top maritime registry nations
  'Panama': '🇵🇦',
  'Liberia': '🇱🇷',
  'Marshall Islands': '🇲🇭',
  'Bahamas': '🇧🇸',
  'Malta': '🇲🇹',
  'Singapore': '🇸🇬',
  'Cayman Islands': '🇰🇾',
  'Bermuda': '🇧🇲',
  'Cyprus': '🇨🇾',
  'Isle of Man': '🇮🇲',
  'Hong Kong': '🇭🇰',
  'Madeira': '🇵🇹',
  'Gibraltar': '🇬🇮',
  'Cook Islands': '🇨🇰',
  'Vanuatu': '🇻🇺',
  'Saint Kitts and Nevis': '🇰🇳',
  'Belize': '🇧🇿',
  'Tuvalu': '🇹🇻',
  'Palau': '🇵🇼',
  'Mongolia': '🇲🇳',
  'Cambodia': '🇰🇭',
  'Tonga': '🇹🇴',
  'Comoros': '🇰🇲',
  'Kiribati': '🇰🇮',
  'Saint Vincent and the Grenadines': '🇻🇨',
  'Antigua and Barbuda': '🇦🇬',
  // Major shipping nations
  'China': '🇨🇳',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Korea': '🇰🇷',
  'Greece': '🇬🇷',
  'Norway': '🇳🇴',
  'UK': '🇬🇧',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'Denmark': '🇩🇰',
  'Netherlands': '🇳🇱',
  'USA': '🇺🇸',
  'United States': '🇺🇸',
  'Italy': '🇮🇹',
  'Russia': '🇷🇺',
  'India': '🇮🇳',
  'Turkey': '🇹🇷',
  'Brazil': '🇧🇷',
  'France': '🇫🇷',
  'Spain': '🇪🇸',
  'Portugal': '🇵🇹',
  'Australia': '🇦🇺',
  'Canada': '🇨🇦',
  'Taiwan': '🇹🇼',
  'Indonesia': '🇮🇩',
  'Malaysia': '🇲🇾',
  'Philippines': '🇵🇭',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'UAE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Kuwait': '🇰🇼',
  'Qatar': '🇶🇦',
  'Oman': '🇴🇲',
  'Iran': '🇮🇷',
  'Iraq': '🇮🇶',
  'Egypt': '🇪🇬',
  'South Africa': '🇿🇦',
  'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪',
  'Tanzania': '🇹🇿',
  'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳',
  'Algeria': '🇩🇿',
  'Mexico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Colombia': '🇨🇴',
  'Venezuela': '🇻🇪',
  'Peru': '🇵🇪',
  'Ecuador': '🇪🇨',
  'Cuba': '🇨🇺',
  'Honduras': '🇭🇳',
  'Antarctica': '🇦🇶',
}

/**
 * Get the flag emoji for a given country name.
 * Falls back to a globe emoji if unknown.
 * @param {string} countryName
 * @returns {string} emoji flag
 */
export function getFlag(countryName) {
  if (!countryName) return '🌍'
  // Try exact match first
  const exact = FLAG_MAP[countryName]
  if (exact) return exact
  // Try case-insensitive match
  const lower = countryName.toLowerCase()
  const entry = Object.entries(FLAG_MAP).find(([k]) => k.toLowerCase() === lower)
  return entry ? entry[1] : '🌍'
}

/**
 * Format a country with its flag emoji.
 * @param {string} countryName
 * @returns {string} e.g. "🇵🇦 Panama"
 */
export function formatFlagCountry(countryName) {
  if (!countryName) return '—'
  const flag = getFlag(countryName)
  return `${flag} ${countryName}`
}
