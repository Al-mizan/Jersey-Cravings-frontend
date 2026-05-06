export const toQueryKeyString = (params?: Record<string, unknown>): string => {
    if (!params) {
        return "";
    }

    const entries = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([a], [b]) => a.localeCompare(b));

    return JSON.stringify(entries);
};
