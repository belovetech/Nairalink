# import requests

# def count_words_at_url(url):
#     res = requests.get(url)
#     return len(res.text.split())
# from redis import Redis
# import time
# from rq.decorators import job


# my_redis_conn = Redis()

# @job('low', connection=my_redis_conn, timeout=5)
# def add(x, y):
#     return x + y

# job = add.delay(3, 4)
# time.sleep(1)
# print(job.return_value())
