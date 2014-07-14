Quickly validate puppet manifests in a git repo.
################################################
:date: 2012-09-17 22:34
:author: Thomas Van Doren
:category: tech
:tags: git, puppet, ruby, tech
:slug: quickly-validate-puppet-manifests-in-a-git-repo

I have been bitten on more than one occasion with a forgotten curly
brace or missing comma in a puppet manifest. So, I wrote a little git
post-commit script that will validate all manifests in a repo. I have
tested it on a repo with ~60 modules and ~400 manifests, and it only
adds a little bit of latency to committing (less than 1s on my system
with the email disabled).

I still like to use continuous integration via `Travis`_ or `Jenkins`_
to run smoke tests, spec tests, and lint. This post-commit commit script
just provides some quick feedback for syntax errors.

.. raw:: html

   <script src="https://gist.github.com/3736299.js?file=post-commit.rb"></script>

https://gist.github.com/3736299#file_post_commit.rb

.. _Travis: http://travis-ci.org/
.. _Jenkins: http://jenkins-ci.org/
