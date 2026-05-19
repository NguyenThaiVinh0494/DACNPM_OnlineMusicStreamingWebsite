export function getOnboardingCompletedKey(userId) {
  return `onboardingCompleted:${userId || 'guest'}`;
}

export function getOnboardingPreferencesKey(userId) {
  return `forYouPreferences:${userId || 'guest'}`;
}

export function loadOnboardingPreferences(userId) {
  try {
    const raw = localStorage.getItem(getOnboardingPreferencesKey(userId));
    if (!raw) {
      return { selectedTopics: [], selectedArtists: [] };
    }

    const parsed = JSON.parse(raw);
    return {
      selectedTopics: Array.isArray(parsed?.selectedTopics) ? parsed.selectedTopics : [],
      selectedArtists: Array.isArray(parsed?.selectedArtists) ? parsed.selectedArtists : [],
    };
  } catch {
    return { selectedTopics: [], selectedArtists: [] };
  }
}

export function saveOnboardingPreferences(userId, preferences) {
  localStorage.setItem(
    getOnboardingPreferencesKey(userId),
    JSON.stringify({
      selectedTopics: preferences?.selectedTopics || [],
      selectedArtists: preferences?.selectedArtists || [],
    }),
  );
}

export function markOnboardingCompleted(userId) {
  localStorage.setItem(getOnboardingCompletedKey(userId), 'true');
}

export function hasCompletedOnboarding(userId) {
  return localStorage.getItem(getOnboardingCompletedKey(userId)) === 'true';
}
