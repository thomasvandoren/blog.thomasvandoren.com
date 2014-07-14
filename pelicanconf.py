#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

import os.path


AUTHOR = u'Thomas Van Doren'
SITENAME = u"Thomas Van Doren's Blog"
# SITEURL = 'http://thomasvandoren.com/blog'

TIMEZONE = 'US/Pacific'

DEFAULT_LANG = u'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None

# Blogroll
LINKS =  (
    ('Chapel', 'http://chapel.cray.com/'),
    ('Cray Blog', 'http://blog.cray.com/'),
    ('Pelican', 'http://getpelican.com/'),
    ('Python.org', 'http://python.org/'),
    ('Jinja2', 'http://jinja.pocoo.org/'),
)

# Social widget
SOCIAL = (
    ('GitHub', 'https://github.com/thomasvandoren'),
    ('LinkedIn', 'https://www.linkedin.com/in/thomasvandoren'),
    ('Facebook', 'https://facebook.com/thomasvandoren'),
)

DEFAULT_PAGINATION = False

STATIC_PATHS = [
    'images',
    'presentations',
]

THEME = os.path.expanduser("~/src/pelican-themes/tuxlite_tbs")

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
