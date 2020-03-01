Five python tips
################
:date: 2011-09-22 20:49
:author: tvd
:category: tech
:tags: python, tech
:slug: five-python-libraries-i-wish-i-would-have-known-about-sooner

I have been using `python`_ at work for the last year, and had fooled
around with it for five years prior to that. I am by no means an
encyclopedia of python knowledge, but here are a few pointers that were
not obvious to me when I was getting started.

1. Use `contextlib.closing`_ to avoid leaking file pointers.

2. Use `OptionParser`_ (< 2.7) or `ArgumentParser`_ (>= 2.7) for easy
access to command line options and arguments.

3. Use `pickle`_ to write/read data structures to/from file for easy
persistent storage.

4. Use `subprocess`_ to make shell calls. This is especially useful when
writing utility scripts that need to make bash calls (for example)!

5. Simplify unittesting with `mock objects`_. Be careful about using the
built in methods on Mock objects, though. A spelling error will get
invoked as a 'mock' call to the object instead of throwing an
AttributeError.

There are tons of other useful modules and third party libraries out
there. Feel free to suggest them in the comments!

.. _python: http://python.org/
.. _contextlib.closing: http://docs.python.org/library/contextlib.html#contextlib.closing
.. _OptionParser: http://docs.python.org/library/optparse.html
.. _ArgumentParser: http://docs.python.org/library/argparse.html
.. _pickle: http://docs.python.org/library/pickle.html
.. _subprocess: http://docs.python.org/library/subprocess.html
.. _mock objects: http://www.voidspace.org.uk/python/mock/
