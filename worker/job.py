import requests

def count_words_at_url(url):
    res = requests.get(url)
    return len(res.text.split())


def say_hello():
    return "Hello there!"
