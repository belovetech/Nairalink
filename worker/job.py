from redis import Redis
import redis
from rq import Queue, Worker, Connection

# listen = ['high', 'default', 'low']

# redis_conn = Redis()
# conn = redis.from_url('redis://localhost:6379')


# if __name__ == '__main__':
#     with Connection(conn):
#         worker = Worker(map(Queue, listen))
#         worker.work()




# job = queue.enqueue(count_words_at_url, 'http://nvie.com')
# print(job.result)
# time.sleep(2)
# print(job.result)
# Schedule job to be run in 10 seconds
# job = queue.enqueue_in(timedelta(seconds=10), say_hello)
