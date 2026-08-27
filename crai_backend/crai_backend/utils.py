import os
from django.conf import settings


def force_https(url):
    if url and url.startswith("http://"):
        return "https://" + url[len("http://"):]
    return url


def absolute_url(request, path):
    url = request.build_absolute_uri(path) if request else path
    return force_https(url)
