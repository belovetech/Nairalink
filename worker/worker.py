from rq import Queue, Worker
from redis import Redis
import time
from job import count_words_at_url, say_hello

redis_conn = Redis()
queue = Queue(connection=redis_conn)


job = queue.enqueue(say_hello)
print(job.get_status())


while not job.is_finished:
    print('Job not finished yet, wait for 1s')
    time.sleep(1)

print(job.return_value())

