Fixing Master Boot Record on Windows 7
######################################
:date: 2011-10-15 17:14
:author: Thomas Van Doren
:category: tech
:tags: dual boot, tech, windows
:slug: fixing-master-boot-record-on-windows-7

I recently removed the linux partition from my desktop. I had a linux
partition, but it made sense to just use one windows partition and run
linux in a vm.

Removing the partition is not a big deal. I just used the Windows Disk
Management tool to remove the linux partition and expand the windows
partition accordingly. I tried to fix the master boot record before
rebooting, since GRUB was no longer required. Upon restart, however, I
was met with a vague partition error followed by the grub restore
prompt.

To remedy this problem so that windows would boot:

-  Boot from Windows 7 install disk.
-  Try Startup Repair (though it probably won't work) in 'Repair your
   computer' > 'System Recovery Options'.
-  Reboot - if it still doesn't work, return to 'System Recovery
   Options' menu.
-  Open command prompt.

.. code-block:: cmd

       bootrec.exe /fixmbr

-  Reboot - it should boot directly to Windows 7.

Sources
~~~~~~~

-  `Microsoft Support - How use the Bootrec.exe tool...`_

.. _Microsoft Support - How use the Bootrec.exe tool...: http://support.microsoft.com/kb/927392
