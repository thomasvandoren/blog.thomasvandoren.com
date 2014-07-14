WikiGraph - Visualize Wikipedia Connections
###########################################
:date: 2011-03-11 03:17
:author: Thomas Van Doren
:category: tech
:tags: flash, mysql, php, projects, wikigraph, wikipedia
:slug: wikigraph-visualize-wikipedia-connections

`WikiGraph`_ helps users visualize connections among Wikipedia articles.
It uses links within articles to decide how articles relate to each
other. It is a Flash application with a PHP data services api, and a
MySQL database. The database contains about **8.3 million articles**
with **800 million links**. Seven UW CSE students (including me)
worked on WikiGraph as part of the Winter 2011 `Software Engineering`_
class.

http://wikigraph.cs.washington.edu/

Some of the Challenges
----------------------

The 24 most significant relationships for an article are shown in a
graph. The strength of a relationship is determined by link
relationships and the length of the article (longer articles are more
likely to be real articles as opposed to long pages of links). Mutual
relationships are considered the strongest (article a links to article b
and vice-a-versa) followed by outbound relations and then inbound
relations.

It can take a long time to determine the 24 most significant
relationships for some articles. For example, the number `0`_
article has hundreds of thousands of inbound links (articles that link
to the number 0 article). It takes over 30 seconds to pull all those
connections from the database and then sort them in order of
significance.

This seemed like too much time to have users wait, so we implemented a
caching system. If a graph is not already in the cache, the api quickly
returns 24 connections that are not necessarily the strongest, but are a
mix of inbound and outbound links. A background job is then initiated to
cache the graph for subsequent requests.

It would be possible to cache all of the links at once, but due to
limitations with our MySQL server we were not able to do this. Hence, it
is done lazily. Some graphs, with too many links cause the database
queries to timeout (there are too many results). If we had more time to
work on the project, we would consider ways to cache all of the graphs
initially so that every request would return the most significant
connections quickly.

We used Google Code to develop the source code, track issues, and
create  documentation in the wiki.

http://code.google.com/p/wiki-map-uw-cse/

The Flash Client
----------------

To develop the Flash application we used Flex 4 with ActionScript 3.
None of our team members had ever developed a Flash application prior to
January and we did not have access to Flash Builder. Flex was incredibly
easy to learn for our team and it is open source! Everyone had
significant Java and Object Oriented experience, and we found lots of
documentation and tutorials which made it easy to get started.

We were also able to use FlexUnit 4 to run automated unit tests on our
Flex/ActionScript source code. This proved to be easy to do in a Windows
environment, but far more difficult on our Hudson build server which
used Fedora 13. I will write a separate blog about getting FlexUnit,
Hudson, and Fedora to work together harmoniously.

The PHP Data Services API
-------------------------

We implemented a ReSTful architecture to access the pertinent WikiGraph
data. This allows for future clients (maybe a JavaScript/HTML5 client)
to use our api. It is a read only api. The users do not have any
modification rights. Although, a user action can initiate a cache
operation, which updates the cache table.

There is a pretty simple set of functional PHP scripts that implement
all of the user actions. An OO  paradigm is used to access the database.

We used PHPUnit to run automated unit tests. It was super easy  and
provided options for jUnit-like output which Hudson could easily chart.

The MySQL Database
------------------

Our database consumes quite a bit of space, so we opted to use an Amazon
Web Service Relational Database Service. Our class was able to provide
grants to use the AWS services. We were very pleased with the AWS
experience. It allowed us to moderate how much space and memory we used
for the database. That was useful when we wanted to perform
administrative actions on the db. We could upgrade to a high memory,
fast CPU instance while the admin operations took place, and then
downgrade to a cheaper low memory, standard CPU for normal use.

I doubt that AWS needs any further commendations, but I highly recommend
it.

.. _WikiGraph: http://wikigraph.cs.washington.edu/
.. _Software Engineering: http://www.cs.washington.edu/education/courses/cse403/11wi/
.. _0: http://wikigraph.cs.washington.edu/graph/#1878498
