// This file acts as a barrel, exporting the active API implementation.
// You can switch between different implementations here for development, testing, and production.

// --- Implementations ---
// - api.mock.ts: In-memory data that resets on page refresh. Good for isolated component testing.
// - api.prod.ts: Uses browser localStorage for persistence. Good for single-user demos and offline capability.
// - api.backend.ts: A blueprint for connecting to a real, multi-user backend API. (Not active by default)

// To switch to the real backend implementation once it's built:
// 1. Comment out the current export.
// 2. Uncomment the line below.
// export * from './api.backend';

// By default, it points to the localStorage-based services for a working out-of-the-box demo.
export * from './api.prod';