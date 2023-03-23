from rq import Queue, Worker
from redis import Redis
from utils import count_words_at_url
import time


redis = Redis()
queue = Queue(connection=redis)


job = queue.enqueue(count_words_at_url, 'http://heroku.com')
print(job.return_value())

time.sleep(2)
print(job.return_value())
