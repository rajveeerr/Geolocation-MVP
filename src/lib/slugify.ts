/**
 * Converts a string into a URL-friendly slug.
 * - Converts to lowercase
 * - Removes non-alphanumeric characters (except hyphens and spaces)
 * - Replaces spaces and multiple hyphens with a single hyphen
 * - Trims leading/trailing hyphens
 * @param text The string to slugify.
 * @returns A URL-friendly slug.
 */
export function slugify(text: string): string {
    if (!text) return '';
    
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}