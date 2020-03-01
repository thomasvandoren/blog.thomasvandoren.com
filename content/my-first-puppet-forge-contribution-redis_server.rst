My first puppet forge contribution: redis
#########################################
:date: 2012-05-15 01:58
:author: tvd
:category: tech
:tags: github, puppet, redis, tech, travis-ci
:slug: my-first-puppet-forge-contribution-redis_server

Today I contributed my very first puppet module back to the
community! `thomasvandoren/redis`_ is a puppet module to install,
configure, and manage redis. It is by no means finished, but it is
working. I didn't see any other redis modules in puppet forge, so I
thought I would share this one.

I also, for the first time, configured the `repo`_ to build in
`travis`_, which is an awesome free CI system for open source repos on
github. I have about half of the test script running in travis right
now. I'll have to reflect on travis in another post; suffice it to say
it is an awesome service!

**Update 2012-05-18:** the module has been renamed to the much more
simple: redis.

.. _thomasvandoren/redis: https://forge.puppetlabs.com/thomasvandoren/redis
.. _repo: https://github.com/thomasvandoren/puppet-redis
.. _travis: http://travis-ci.org/#!/thomasvandoren/puppet-redis
