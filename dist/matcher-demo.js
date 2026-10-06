// Extracted from krievinsss/songs, commit 1a58fcfc351a71499db247aa1d38c10eb9933d55.
// Original lines 2–76; only TypeScript type annotations removed.

/**
 * Normalizes text by removing Latvian diacritics, punctuation, extra spaces, and making lowercase.
 */
export function normalizeLatvianText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[āáàâä]/g, 'a')
    .replace(/[čç]/g, 'c')
    .replace(/[ēéèêë]/g, 'e')
    .replace(/[ģğ]/g, 'g')
    .replace(/[īíìîï]/g, 'i')
    .replace(/[ķ]/g, 'k')
    .replace(/[ļ]/g, 'l')
    .replace(/[ņ]/g, 'n')
    .replace(/[šś]/g, 's')
    .replace(/[ūúùûü]/g, 'u')
    .replace(/[žźż]/g, 'z')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance for fuzzy tolerance
 */
export function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Checks if a guess matches target title or artist.
 */
export function checkMatch(guess, target, normalizedTargetExtra) {
  const normGuess = normalizeLatvianText(guess);
  const normTarget = normalizeLatvianText(target);
  const normExtra = normalizedTargetExtra ? normalizeLatvianText(normalizedTargetExtra) : '';

  if (!normGuess || !normTarget) return false;

  // Exact or word inclusion
  if (normGuess === normTarget) return true;
  if (normExtra && normExtra.includes(normGuess)) return true;

  // If guess contains target or target contains guess (length >= 4)
  if (normGuess.length >= 4 && normTarget.includes(normGuess)) return true;
  if (normTarget.length >= 4 && normGuess.includes(normTarget)) return true;

  // Levenshtein fuzzy distance for typos
  const distance = levenshteinDistance(normGuess, normTarget);
  const maxAllowedDistance = Math.min(3, Math.floor(normTarget.length / 3));

  return distance <= maxAllowedDistance;
}
