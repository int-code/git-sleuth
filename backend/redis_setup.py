from redis.asyncio import Redis
import os
def get_redis():
    return Redis(host=os.getenv("REDIS_HOST"), port=os.getenv("REDIS_PORT"), decode_responses=True)