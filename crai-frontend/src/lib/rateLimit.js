const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 10;

const store = new Map();

function getClientIp(request) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window in-memory rate limiter.
 * Returns null when allowed, or a NextResponse JSON 429 when the limit is exceeded.
 */
export function rateLimit(request, route = "default", limit = LIMIT, windowMs = WINDOW_MS) {
    const now = Date.now();
    const key = `${route}:${getClientIp(request)}`;

    const record = store.get(key);
    if (!record || now >= record.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return null;
    }

    record.count += 1;
    if (record.count > limit) {
        return Response.json(
            { detail: "Too many requests. Please try again later." },
            { status: 429, headers: { "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)) } }
        );
    }

    return null;
}

let cleanupTimer;
export function startRateLimitCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of store) {
            if (now >= record.resetAt) store.delete(key);
        }
    }, WINDOW_MS);
    cleanupTimer.unref?.();
}

startRateLimitCleanup();