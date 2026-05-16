
/**
 * Safely extracts a media URL from various media objects or arrays.
 * Handles undefined/null values and provides a fallback.
 * 
 * @param media - A single media object, an array of media objects, or undefined
 * @param fallback - The fallback URL if no valid media is found
 * @returns The secure URL of the media or the fallback
 */
export function getMediaUrl(
    media: any | any[] | undefined | null,
    fallback: string = "/jersey_cravings.png"
): string {
    if (!media) return fallback;

    // If it's an array, take the first item
    if (Array.isArray(media)) {
        if (media.length === 0) return fallback;
        const firstItem = media[0];
        if (!firstItem) return fallback;
        
        // Handle case where array item is a string (some review types use string[])
        if (typeof firstItem === "string") return firstItem;
        
        return firstItem.secureUrl || firstItem.url || fallback;
    }

    // If it's a single object
    if (typeof media === "object") {
        return media.secureUrl || media.url || fallback;
    }

    // If it's a string
    if (typeof media === "string") {
        return media;
    }

    return fallback;
}
