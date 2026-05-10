/**
 * Convert a team name to a URL-friendly slug.
 * "Real Madrid" → "real-madrid"
 * "FC Barcelona" → "fc-barcelona"
 */
export function teamNameToSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

/**
 * Convert a slug back to a display-friendly team name (title case).
 * "real-madrid" → "Real Madrid"
 * "fc-barcelona" → "FC Barcelona"
 *
 * Note: This is a best-effort conversion. The backend does case-insensitive
 * matching, so minor casing differences are acceptable.
 */
export function slugToTeamName(slug: string): string {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
