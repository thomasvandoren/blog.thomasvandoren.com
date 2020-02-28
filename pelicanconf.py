#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

import os.path

AUTHOR = 'Thomas Van Doren'
SITENAME = 'thomasvandoren.com'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'US/Pacific'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

SOCIAL = (
    ('GitHub', 'https://github.com/thomasvandoren'),
    ('LinkedIn', 'https://www.linkedin.com/in/thomasvandoren'),
    ('Twitter', 'https://twitter.com/thomasvandoren'),
)

STATIC_PATHS = [
    'images',
    'presentations',
]

DEFAULT_PAGINATION = 10

THEME = "pelican-themes/tuxlite_tbs"
