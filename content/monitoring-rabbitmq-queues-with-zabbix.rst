Monitoring RabbitMQ Queues with Zabbix
######################################
:date: 2011-10-09 12:01
:author: Thomas Van Doren
:category: tech
:tags: amqp, monitoring, rabbitmq, tech, zabbix
:slug: monitoring-rabbitmq-queues-with-zabbix

Recently I setup some monitoring on a `RabbitMQ`_ server
using `Zabbix`_. This process is by no means difficult, but I thought
it was worth sharing.

I was looking for a solution that did not require additional plugins or
packages, but would perform well. Some useful tools for monitoring
include: the `Management Plugin`_ for RabbitMQ - works well, but
provides more info than I needed; `SNMP Statistics Plugin`_ which looks
promising; and the method below.

This assumes a zabbix server and agent(s) are setup, and a basic
knowledge of zabbix.

Zabbix User Parameters
----------------------

These user parameters pull all of the queue and exchange information out
of rabbitmqctl for a particular queue and exchange.

I created a new file,
/etc/zabbix/zabbix.conf.d/rabbitmq-server-stats.conf, which looked like
the one below. It assumes rabbitmqctl is at /usr/sbin/rabbitmqctl.

.. raw:: html

   <script src="https://gist.github.com/1273539.js?file=gistfile1.sh"></script>

After making the changes, bounce (restart) the zabbix-agent service on
the rabbitmq server box.

Sudo Permissions
----------------

The parameters won't work until the zabbix group is granted non-password
sudo access. I chose to add a new file at
/etc/sudoers.d/rabbitmqserverstats.

I added the following line to the end of /etc/sudoers:

.. raw:: html

   <script src="https://gist.github.com/1273547.js?file=gistfile1.sh"></script>

/etc/sudoers.d/rabbitmqserverstats contains:

.. raw:: html

   <script src="https://gist.github.com/1273541.js?file=gistfile1.sh"></script>

And with that, Zabbix should be able to monitor the some-queue and
some-exchange statistics.

**Update:** Posted to `RabbitMQ Server Stats template`_ on
`ZabbixTemplates.com`_.

Related Sources
~~~~~~~~~~~~~~~

-  `RabbitMQ Management and Monitoring Links`_
-  `Just Do I.T.: Monitoring RabbitMQ with Zabbix`_

.. _RabbitMQ: http://www.rabbitmq.com/
.. _Zabbix: http://www.zabbix.com/
.. _Management Plugin: http://www.rabbitmq.com/management.html
.. _SNMP Statistics Plugin: https://github.com/epicadvertising/rabbitmq_snmp_plugin
.. _RabbitMQ Server Stats template: http://zabbixtemplates.com/node/18
.. _ZabbixTemplates.com: http://zabbixtemplates.com/
.. _RabbitMQ Management and Monitoring Links: http://www.rabbitmq.com/how.html#management
.. _`Just Do I.T.: Monitoring RabbitMQ with Zabbix`: http://blog.dossot.net/2010/01/monitoring-rabbitmq-with-zabbix.html
