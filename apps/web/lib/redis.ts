import Redis from 'ioredis';

// Used for auth-context caching (see @campusos/shared/auth) and later
// for search/notification fan-out queues.
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
