export function extractApiError(result, fallback) {
    if (typeof result === "string") return result || fallback;
    if (!result || typeof result !== "object") return fallback;
    if (typeof result.detail === "string") return result.detail;
    for (const value of Object.values(result)) {
        if (value === result) continue;
        const nested = extractApiError(value, null);
        if (nested) return nested;
    }
    return fallback;
}
