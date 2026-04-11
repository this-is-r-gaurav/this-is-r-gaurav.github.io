export function urlFixer(url: string | undefined) {
    if (!url) return "";
    return `https://${url.replace(/^https?:\/\//, "")}`;
}