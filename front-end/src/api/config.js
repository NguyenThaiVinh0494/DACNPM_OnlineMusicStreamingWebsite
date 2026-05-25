export function normalizeApiBaseUrl(configuredBaseUrl) {
  const baseUrl = (configuredBaseUrl || '/api/').trim();
  return `${baseUrl.replace(/\/+$/, '')}/`;
}
