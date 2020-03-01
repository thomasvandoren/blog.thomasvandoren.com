Jenkins Windows Slave with Git
##############################
:date: 2011-09-27 23:07
:author: tvd
:category: tech
:tags: cygwin, git, jenkins, msysgit, ssh, tech, windows
:slug: jenkins-windows-slave-with-git

There are some articles out there about setting up Jenkins slaves on
Windows. This is one more, with a bunch of information about configuring
Git. The documentation for setting up Git to work well with Jenkins is
surprisingly sparse and the process is extremely frustrating (in my
experience). Hopefully this will help!

\* This assumes some master Jenkins service is setup with the `Git
plugin`_ and has network access to the Windows box that is becoming a
slave.

Setup Jenkins Slave
-------------------

-  Goto Jenkins master.
-  Select 'Manage Jenkins' > 'Manage Nodes'.
-  Select 'New Node'.
-  Give it a name that identifies the computer, select 'Dumb Slave', and
   'Ok'. Some example settings:

   -  Name: win7-thomas
   -  # of executors: 4 (one executor per cpu is not a bad ratio)
   -  Remote FS Root: c:\\Jenkins\\Slaves
   -  Labels: windows blackberry (this box is good for building the
      blackberry projects and is a windows box)
   -  Usage: Utilize this slave as much as possible
   -  Launch method: Launch slave agents via Java Web Start
   -  Availability: Keep this slave on-line as much as possible

-  After saving the new node, open it from the 'nodes' screen, and
   select 'Launch'.
-  Save the slave-agent.jnlp in a decent folder (like c:\\Jenkins).
-  Open the slave-agent.jnlp. Double clicking worked for me, but you
   might need to use something like:

   -  ``javaws
      http://jenkins-hostname/computer/win7-thomas/slave-agent.jnlp``
   -  Or, one of the other suggestions Jenkins shows.

-  This should popup a window that says 'Connected'. Goto 'File' >
   'Install as Windows Service'.
-  Once you have completed this install, you should see 'Jenkins Slave'
   among the running services.
-  It might make sense to change the user that runs the service to
   something other than the SYSTEM user. Once changed, you will need to
   Stop and Restart the service.
-  Reboot. Make sure that 'Jenkins Slave' is started automatically at
   startup.
-  When you create a new project, make sure that its labels indicate
   this slave's name or labels.

Setup Git
---------

It is advisable to run the Jenkins Slave service as a pre-defined user,
as opposed to the SYSTEM user. However, if the Jenkins Slave service is
running as the SYSTEM user, the following will help emulate the
environment that Jenkins will use when building.

-  To run commands as the SYSTEM user, you can use ``psexec.exe`` from
   `SysInternals`_.

   -  From an Administrator cmd.exe prompt, ``psexec -i -s cmd.exe`` will
      open a new shell as the SYSTEM user.

General Advice when Setting Up Git
----------------------------------

-  Define a ``HOME`` env var equal to ``%USERPROFILE%``.
-  Create *passphrase-less* rsa keys and put them in ``%HOME%/.ssh``. These
   keys should be setup on whatever server hosts the Git repos. In
   GitHub, for example, you would need to add the keys to your account.
-  Do an initial ``ssh git@github.com`` to add GitHub to the known\_hosts.
-  Get rid of any ``GIT_SSH`` env vars if using the default ssh client for
   auth (as opposed to plink.exe, etc). ``GIT_SSH=c:\...\plink.exe`` may
   exist if you have previously used putty/pageant/TortoiseGit/etc to
   access Git repos.
-  ``ssh git@github.com`` (or wherever your repo is) is very useful for
   debugging. One to three -v flags (i.e. ``ssh -vv git@github.com``) may be
   added to help debug the connection process.
-  Set the ``%HOME%/.ssh/config`` to specify which authentication to use:

.. code-block:: conf
    :anchorlinenos:
    :linenos: table
    :lineanchors: code-ssh-config

    Host github.com
        User git
        Hostname github.com
        PreferredAuthentications publickey

-  If you see the following error message and your files do have the
   correct perms (0600), then you are suffering from a `bug in the
   msysgit ssh`_ executable. Unix permissions (0644) don't map to NTFS
   ACLs. Msys just fakes the behavior of chmod, but it can't fake a
   chmod to a restrictive enough permissions set. Steps to fix are
   below.

::

    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Permissions 0644 for '/path/to/key' are too open.
    It is recommended that your private key files are NOT accessible by others.
    This private key will be ignored.
    bad permissions: ignore key: /path/to/key

-  Assuming cygwin is installed at ``c:\cygwin`` and msysgit is installed
   at ``c:\progra~1\Git``, this will replace the ssh executable in msysgit
   with the one from cygwin, which recognizes file perms:

.. code-block:: cmd
    :anchorlinenos:
    :linenos: table
    :lineanchors: code-fixgit

    @rem From an Administrator cmd.exe
    @rem This works for 32bit Windows. Adjust accordingly for 64bit.
    c:
    ren "C:\Program Files\Git\bin\ssh.exe" "C:\Program Files\Git\bin\ssh.bak.exe"
    copy "C:\cygwin\bin\ssh.exe" "C:\Program Files\Git\bin\ssh.exe"
    copy "C:\cygwin\bin\cyg*.dll" "C:\Program Files\Git\bin\"

Some Sources
------------

-  `yakiloo.com - Setup - Jenkins and Windows`_
-  `Jenkins, GIT Plugin and Windows`_
-  `GitHub's Windows Git Setup`_
-  `University of Cambridge - ssh authorized\_keys HOWTO`_

*Appreciated feedback from* `George Reilly`_.

**Update:** Git section posted on `Cozi Tech`_ blog!

.. _Git plugin: https://wiki.jenkins-ci.org/display/JENKINS/Git+Plugin
.. _SysInternals: http://technet.microsoft.com/en-us/sysinternals/bb545027
.. _bug in the msysgit ssh: http://code.google.com/p/msysgit/issues/detail?id=261#c46
.. _yakiloo.com - Setup - Jenkins and Windows: http://yakiloo.com/setup-jenkins-and-windows/
.. _Jenkins, GIT Plugin and Windows: https://wiki.jenkins-ci.org/display/JENKINS/Git+Plugin#GitPlugin-
.. _GitHub's Windows Git Setup: http://help.github.com/win-set-up-git/
.. _University of Cambridge - ssh authorized\_keys HOWTO: http://www.eng.cam.ac.uk/help/jpmg/ssh/authorized_keys_howto.html
.. _George Reilly: http://weblogs.asp.net/george_v_reilly/
.. _Cozi Tech: http://blogs.cozi.com/tech/2011/09/setting-up-git-in-a-headless-windows-environment.html
