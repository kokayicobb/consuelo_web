import Redis from 'ioredis';

let redis: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
      });

      redis.on('error', (error) => {
        console.warn('Redis connection error:', error.message);
      });

      redis.on('connect', () => {
        console.log('Connected to Redis');
      });
    } catch (error) {
      console.warn('Failed to initialize Redis client:', error);
      return null;
    }
  }

  return redis;
};

export const cacheGet = async (key: string): Promise<string | null> => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    return await client.get(key);
  } catch (error) {
    console.warn('Redis GET error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string, 
  value: string, 
  expireInSeconds: number = 3600
): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(key, expireInSeconds, value);
    return true;
  } catch (error) {
    console.warn('Redis SET error:', error);
    return false;
  }
};

export const cacheDelete = async (key: string): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.warn('Redis DELETE error:', error);
    return false;
  }
};

export default getRedisClient;