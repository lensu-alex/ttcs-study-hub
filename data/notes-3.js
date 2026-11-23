// Plain-language explanations shown next to each slide: lectures 7–9. Format: see notes-1.js.
window.TTCS_NOTES = Object.assign(window.TTCS_NOTES || {}, {

c7: {
  1: [
    "**Lecture 7 in one sentence:** which background programs a Linux system starts at boot, and the three generations of tools for managing them: **System V init**, **Upstart** and **systemd**.",
    "All three answer the same questions: what gets started, in what order, and how do I start or stop one by hand. Today you will mostly use systemd; the older two still show up in documentation and on exams."
  ],
  2: [
    "First a recap of how the system looks to a user, then how it looks from the inside, then **services**: the programs that run in the background from boot to shutdown."
  ],
  3: [
    "The story so far, as one chain:",
    "- `init` starts `getty` on each terminal;",
    "- `getty` gives you a terminal; `login` checks your password and starts your shell on it;",
    "- the shell runs your commands. Each command is a program on disk; while it runs, it is a **process**, a *child* of the shell;",
    "- to get anything done (files, processes, administration), the command asks the operating system for its services.",
    "The next slide looks at that last step from the system's side."
  ],
  4: [
    "A program can get an OS service in two ways:",
    "- **directly from the kernel**, through a *system call* (a function call into the kernel, like `open` or `read`);",
    "- **from another program** that provides the service: a **server**. Unix calls these servers **daemons**. They run in *user space*, which means as normal programs outside the kernel, and in the end they use system calls too.",
    "A command reaches a daemon through some form of IPC (inter-process communication): shared memory or message passing, as in lecture 4.",
    "Examples of things done by daemons: networking services, the firewall, printing, timekeeping."
  ],
  5: [
    "A **service** is a system program started automatically at boot. Technically it is a process started by `init`. Some are daemons you talk to (a web server, `sshd`); others just prepare the environment (mount disks, set up the network).",
    "- They normally run for as long as the system is up, and are restarted if they crash.",
    "- Which ones run depends on the **runlevel**.",
    "- Each one supports the same four operations: **start**, **stop**, **reload** its configuration, show its **status**.",
    "There are three systems for managing them, in historical order: **System V** (classic Unix; V is the Roman numeral five), **Upstart** (Ubuntu, around 2006–2014) and **systemd** (today's Linux)."
  ],
  6: [
    "The System V way is built from plain files and naming rules:",
    "- `/etc/inittab` tells `init` the default runlevel (the line containing `initdefault`).",
    "- `/etc/init.d/` holds one **script per service**. Each script knows how to start and stop its service.",
    "- For each runlevel there is a directory: `/etc/rc0.d` … `/etc/rc6.d`, plus `rcS.d` for the very first stage of boot. “rc” = run commands.",
    "- Those directories contain only **symbolic links** to the scripts in `init.d`. The *name of the link* is the configuration:",
    "- `S05name` = **S**tart this service when entering the runlevel;",
    "- `K01name` = **K**ill (stop) it;",
    "- the two digits set the order, because the links are processed in alphabetical order: S01 before S02.",
    "So enabling or disabling a service in a runlevel just means renaming or creating a link."
  ],
  7: [
    "A real `/etc/rc3.d`, the directory for runlevel 3.",
    "- `runlevel` answers `N 3`: the previous runlevel was **N**one (the system has just booted) and the current one is 3.",
    "- In the `ls -l` output every line starts with `l`: they are all symbolic links, and the arrow shows the script in `../init.d/` each one points to.",
    "- `K01ssh` and `K01xinetd`: these services are **stopped** in runlevel 3.",
    "- `S01rsyslog`, `S02cron`, `S03bluetooth`, … `S05rc.local`: these are **started**, in that order. Logging (rsyslog) comes first, so later services can write log messages."
  ],
  8: [
    "On Linux each `init.d` script begins with a block of special comments that describes the service to the system:",
    "    ### BEGIN INIT INFO",
    "    # Default-Start:  2 3 4 5",
    "    # Default-Stop:   0 1 6",
    "    ### END INIT INFO",
    "To the shell these are ordinary comments, but the tools that create the S and K links read them. The example says: start this service in runlevels 2, 3, 4 and 5; stop it in 0 (power off), 1 (single user) and 6 (reboot).",
    "The format comes from the LSB, Linux Standard Base, a standard meant to make Linux distributions behave alike."
  ],
  9: [
    "Nobody creates the S/K links by hand; there are commands for that, different on each system: `chkconfig` (Red Hat), `update-rc.d` (Debian, Ubuntu), `bum` (a graphical tool).",
    "    $ update-rc.d -n ssh enable 2 3 4 5",
    "enables ssh in runlevels 2–5. The `-n` makes it a **dry run**: it only shows what it would do.",
    "To act on a service **right now**, use `service`:",
    "    $ service ssh start      # same as: /etc/init.d/ssh start",
    "    $ service ssh stop",
    "    $ service ssh reload     # re-read the configuration, keep running",
    "    $ service ssh restart    # stop, then start",
    "`service --status-all` lists every service and whether it is running."
  ],
  10: [
    "**Upstart** replaced the fixed “run the scripts in order” model with **events**.",
    "- An **event** is a message such as “the system reached runlevel 2” or “this service has started”.",
    "- A **job** is a service plus the rules saying which events start and stop it. Jobs are described in files in `/etc/init/`.",
    "- If a service exists both there and in `/etc/init.d`, the Upstart version wins.",
    "- Upstart notices edits to those files by itself, using `inotify` (a kernel feature that reports file changes).",
    "Reading the example `tty1.conf`:",
    "- `start on runlevel [2345]`: start when entering runlevel 2, 3, 4 or 5;",
    "- `stop on runlevel [!2345]`: stop in any other runlevel (`!` = not);",
    "- `respawn`: if it dies, start it again;",
    "- `exec /sbin/getty -8 38400 tty1`: the command to run, here the login prompt on the first terminal."
  ],
  11: [
    "How Upstart brings the system up:",
    "- When `init` starts, it emits the event **startup**.",
    "- Jobs waiting for that event start. As each job changes state, `init` emits more events: **starting**, **started**, **stopping**, **stopped**.",
    "- Those events start other jobs, and so on, like a chain reaction, until everything needed is running.",
    "Something System V could not do: Upstart can also run **per user**, managing the programs of your own login session. Such an instance is an ordinary process (its PID is greater than 1; only the system's `init` has PID 1) and reads its job files from your own directories, such as `$HOME/.init/`.",
    "XDG_CONFIG_HOME is the standard variable for “where this user's configuration files live”, normally `~/.config`."
  ],
  12: [
    "`initctl` (init control) is the command for talking to Upstart:",
    "    $ initctl list                # all jobs and their state",
    "    $ initctl status networking   # one job",
    "    $ initctl start networking",
    "    $ initctl stop networking",
    "    $ initctl emit some_event     # send an event by hand",
    "A job's state is shown as a pair **goal/state**, for example `start/running`: the goal is what it should be doing, the state is what it is actually doing right now."
  ],
  13: [
    "**systemd** is the `init` of current Linux systems. Two new words:",
    "- A **unit** is anything systemd manages, each described in its own configuration file. There are 12 kinds. The ones to know:",
    "- **service** unit: a daemon to start and supervise;",
    "- **target** unit: a named group of units, used as a milestone during boot;",
    "- **mount** unit: a file system to mount;",
    "- **device** unit: a piece of hardware;",
    "- **timer** unit: starts another unit at given times (a replacement for cron).",
    "- A **target** takes the place of a runlevel. Instead of “runlevel 5” you say `graphical.target`.",
    "Units declare which other units they **depend on**, and systemd works out the order from that."
  ],
  14: [
    "What changes compared with System V:",
    "- **No fixed order.** Each unit says what it needs, and systemd starts things as soon as their dependencies are ready, many of them at the same time. This is why modern systems boot fast.",
    "- It can also run per user (`systemd --user`), like Upstart.",
    "- It still understands the old `init.d` scripts and the old commands, so old software keeps working.",
    "How it boots:",
    "- load the unit files from `/etc/systemd/system` (your settings) and `/lib/systemd/system` or `/usr/lib/systemd/system` (installed by packages). The slide's `/etc/system/system` is a typo;",
    "- find the boot target, normally `default.target`;",
    "- work out everything that target depends on, and start it."
  ],
  15: [
    "The targets that correspond to the old runlevels:",
    "- `poweroff.target` = runlevel 0",
    "- `rescue.target` = runlevel 1, single user",
    "- `multi-user.target` = runlevel 3, network, text only",
    "- `graphical.target` = runlevel 5, network + graphical interface",
    "- `reboot.target` = runlevel 6",
    "`default.target` is not a real target. It is a symbolic link to one of the above, and it decides what the machine boots into.",
    "Booting a target starts everything it depends on, for example `networking.service` and `crond.service`."
  ],
  16: [
    "A **unit file** is a small text file made of sections in square brackets, each containing `Key=value` lines. (The format is borrowed from the `.desktop` files that describe application icons; XDG is the group that defined those.)",
    "- `[Unit]`: a description, plus ordering: what must be started before or after this unit.",
    "- `[Service]`: only in service units. The actual commands for starting, stopping and reloading.",
    "- `[Install]`: what happens when you *enable* the unit, meaning which target should pull it in at boot.",
    "The next slide is a full example."
  ],
  17: [
    "The unit file of the SSH server, line by line.",
    "**[Unit]**",
    "- `After=network.target auditd.service`: start only after the network is up.",
    "- `ConditionPathExists=!/etc/ssh/sshd_not_to_be_run`: start only if that file does **not** exist (`!` = not).",
    "**[Service]**",
    "- `EnvironmentFile=-/etc/default/ssh`: read variables from this file; the leading `-` means “no error if it is missing”.",
    "- `ExecStartPre=/usr/sbin/sshd -t`: before starting, check that the configuration is valid.",
    "- `ExecStart=/usr/sbin/sshd -D $SSHD_OPTS`: the command that **is** the service.",
    "- `ExecReload=…`: how to reload: test the configuration, then send the signal HUP to the main process (`$MAINPID`).",
    "- `Restart=on-failure`: restart it if it crashes.",
    "- `Type=notify`: the daemon itself tells systemd when it is ready.",
    "**[Install]**",
    "- `WantedBy=multi-user.target`: when enabled, it starts as part of the multi-user target.",
    "- `Alias=sshd.service`: a second name for the same unit."
  ],
  18: [
    "`systemctl` (system control) is the one command for systemd:",
    "    $ systemctl list-units",
    "    $ systemctl start ssh.service",
    "    $ systemctl stop ssh.service",
    "    $ systemctl restart ssh.service",
    "    $ systemctl enable ssh.service",
    "    $ systemctl disable ssh.service",
    "! `start`/`stop` act **now** and are forgotten at the next reboot. `enable`/`disable` decide what happens **at boot** and do not touch the running service. To have both, run both.",
    "Also useful: `systemctl status ssh.service` shows whether it is running, plus its last log lines."
  ]
},

c8: {
  1: [
    "**Lecture 8 in one sentence:** how a background service (a daemon) is built and where its messages go, and how to make the system run commands at chosen times.",
    "The practical part is `cron`. Its five-field time format is a favourite test question."
  ],
  2: [
    "Two topics. **Daemons**: what makes a program a daemon, and how it logs messages. **Time**: three schedulers, `cron` (repeat regularly), `anacron` (repeat regularly on a machine that is not always on) and `at` (run once, later), and then the clocks themselves."
  ],
  3: [
    "A **daemon** is a process that runs in the background and has no terminal attached to it: nobody types into it and it prints on no screen. It waits for work. Most are started at the end of boot.",
    "Why cut the link to the terminal? If a server started from a shell stayed attached, then:",
    "- the shell's job control (Ctrl-C, Ctrl-Z) could stop it by accident;",
    "- closing the terminal would kill it;",
    "- its messages would land in the middle of whatever you are typing.",
    "Examples: the system services in `/etc/rc.d` (web server, mail server `sendmail`/`postfix`, `syslogd`, `inetd`), the jobs run by `cron` and `at`, and any server you start yourself.",
    "Names ending in **d** are daemons: `syslogd`, `crond`, `sshd`."
  ],
  4: [
    "The five things a program does to become a daemon, and why:",
    "- **1. Detach from the terminal**, so that keyboard signals and the closing of the terminal no longer reach it.",
    "- **2. Change the working directory** to `/`. A running process keeps its current directory “busy”, and a file system in use cannot be unmounted. `/` is never unmounted, so it is the safe choice. (A *core file* is the memory dump the kernel writes when a program crashes; it lands in the working directory.)",
    "- **3. Close all open file descriptors** inherited from the shell that started it.",
    "- **4. Reconnect stdin, stdout and stderr** to `/dev/null`: reading gives “end of file”, writing is thrown away. Descriptors 0, 1 and 2 stay valid, so library code that prints something does not crash.",
    "- **5. Use the logging daemon** `syslogd` for messages, since there is no longer a screen to print on."
  ],
  5: [
    "With no terminal, where does a daemon write its errors? It sends them to one central logging daemon: `syslogd` (on Linux, `rsyslogd`).",
    "- Programs call the function `syslog()`; from the shell you use the command `logger`.",
    "- The file `syslog.conf` tells `syslogd` what to do with each kind of message: append it to a file, show it on the console, or forward it to the `syslogd` of another machine.",
    "- It can receive messages over the network on UDP port 514. `/etc/services` is the file listing which service uses which port.",
    "- After editing the configuration you make the daemon re-read it by sending it the signal SIGHUP: `kill -HUP <pid>`. This is a convention followed by most daemons. Modern systems wrap it as `service … reload` or `systemctl reload …`."
  ],
  6: [
    "Every log message carries two labels, written together as `facility.level`. The pair is called the **priority**.",
    "The **level** says how serious it is, from 0 (worst) to 7:",
    "- 0 emerg · 1 alert · 2 crit · 3 err · 4 warning · 5 notice · 6 info · 7 debug",
    "The default is **5, notice**: normal, but worth noting. (`LOG_NOTICE` is the name used in C code.)",
    "Thanks to the level, the configuration can say things like “everything at level err or worse goes to this file”.",
    "The logs themselves are text files in `/var/log`."
  ],
  7: [
    "The **facility** says what kind of program sent the message:",
    "- `kern` the kernel · `auth` logins and passwords · `cron` the schedulers · `mail` · `lpr` printing",
    "- `user` ordinary programs (the default) · `local0` … `local7` free for your own use",
    "A line in `syslog.conf` is: *which messages* → *where to put them*.",
    "    kern.*          /dev/console",
    "    local7.debug    /var/log/cisco.log",
    "- first line: kernel messages of any level (`*`) go to the console;",
    "- second line: messages from facility `local7` at level debug or more serious (so all of them) go to that file."
  ],
  8: [
    "Working with logs:",
    "- `tail -f /var/log/syslog`: show the end of the log and keep **f**ollowing it, so new messages appear as they are written. Stop with Ctrl-C.",
    "- `head` shows the beginning of a file and `tail` the end; `-n 5` means 5 lines.",
    "- `logger -p user.info Some message`: write your own message to the log, with facility `user` and level `info`. Useful in scripts.",
    "A good exercise: run `tail -f` in one terminal and `logger hello` in another."
  ],
  9: [
    "`crond` is the daemon that runs commands **on a schedule**: every night, every Monday, every 10 minutes. (From Greek *chronos*, time.)",
    "- It is started at boot as a normal service. `cron -f` runs it in the foreground instead, without turning it into a daemon, for testing.",
    "- The schedules are tables called **crontabs** (cron tables). Each user has one, stored under `/var/spool/cron/crontabs/`. You do not edit those files yourself; you use the `crontab` command.",
    "- The system has its own: `/etc/crontab`, plus the directories `/etc/cron.hourly`, `/etc/cron.daily`, `/etc/cron.weekly`, `/etc/cron.monthly`. Any script placed in one of them is run that often. (The slide's `crond.daily` is a typo.)"
  ],
  10: [
    "What `crond` does, forever:",
    "- **Once a minute** it wakes up and looks through all the crontabs for commands scheduled for this minute, and runs them. This is why one minute is the finest schedule cron can do.",
    "- Whatever a command prints is **e-mailed** to the owner of the crontab, or to the address in the variable `MAILTO`. A background job has no screen, so mail is its way of reporting.",
    "- Each minute it also checks whether any crontab was changed, and reloads if so. You never need to restart cron after editing a schedule."
  ],
  11: [
    "`crontab` is the command for managing your own schedule table.",
    "    $ crontab myfile",
    "installs the contents of `myfile` as your crontab, replacing the old one.",
    "The administrator can control who may use cron with two files, each a list of user names, one per line:",
    "- `/etc/cron.allow`: if it exists, **only** these users may use cron;",
    "- `/etc/cron.deny`: otherwise, these users may **not**.",
    "`allow` is checked first. If neither file exists, it depends on the system: either only root, or everybody."
  ],
  12: [
    "The three options you will use:",
    "- `crontab -e`: **e**dit your crontab. It opens in the editor named by `$VISUAL` or `$EDITOR` and is installed when you save and quit.",
    "- `crontab -l`: **l**ist it.",
    "- `crontab -r`: **r**emove it, entirely and without asking.",
    "! `-r` and `-e` are next to each other on the keyboard. Many people have deleted their crontab this way; keep a copy with `crontab -l > backup`."
  ],
  13: [
    "A crontab contains three kinds of lines:",
    "- **comments**, starting with `#`;",
    "- **variable settings**: `NAME=value`;",
    "- **scheduled commands** (next slide).",
    "The variables cron understands:",
    "- `SHELL`: which shell runs the commands (default `/bin/sh`);",
    "- `PATH`: where commands are looked for (default only `/usr/bin:/bin`);",
    "- `MAILTO`: who receives the output;",
    "- `HOME` and `LOGNAME` come from `/etc/passwd`.",
    "! In these settings `$` is **not** expanded. `PATH=$HOME/bin:$PATH` does not work; write the full text out. And since cron's PATH is so short, use full paths for your scripts. This is the usual reason for “it works in my terminal but not in cron”."
  ],
  14: [
    "A schedule line is **five time fields and then the command**:",
    "    minute  hour  day-of-month  month  day-of-week  command",
    "    0-59    0-23  1-31          1-12   0-7",
    "For the day of the week, 0 and 7 both mean Sunday, and names (`mon`, `sun`) are allowed.",
    "In each field you can write:",
    "- a value: `5`",
    "- `*`: every possible value",
    "- a range: `8-11` = 8, 9, 10, 11",
    "- a list: `1,2,5,9`",
    "- a step: `0-23/2` = every 2 hours; `*/10` = every 10",
    "The command runs when all the fields match the current time. One special case: if you restrict **both** day fields, it is enough for either of them to match.",
    "In the command, a `%` is turned into a newline and everything after the first `%` is fed to the command as its input. To get a real percent sign, write `\\%`.",
    "! The order: minute, hour, day of month, month, day of week. From the smallest unit to the largest, with the weekday added at the end."
  ],
  15: [
    "Reading each schedule (the spaces between fields were lost on the slide):",
    "- `5 0 * * *`: minute 5, hour 0, every day → 00:05 each night. `>> … 2>&1` appends both output and errors to a file.",
    "- `15 14 1 * *`: 14:15 on day 1 of every month.",
    "- `0 22 * * 1-5`: 22:00, Monday to Friday. In the `mail` command each `%` is a newline, so the text after the first one becomes the body of the e-mail.",
    "- `23 0-23/2 * * *`: minute 23 of every second hour: 00:23, 02:23, 04:23, …",
    "- `5 4 * * sun`: 04:05 every Sunday.",
    "- `0 4 8-14 * *` plus a test: “second Saturday of the month” cannot be written with the five fields alone (fill in both day fields and cron runs when *either* matches). So it runs at 04:00 on days 8–14 (the second week) and the command itself checks that today is Saturday: `date +%u` prints the weekday number, 6 = Saturday. The `%` is written `\\%` so cron leaves it alone.",
    "The first two lines set the shell to bash and send the mail to root."
  ],
  16: [
    "cron assumes the machine is always on. If your laptop is off at 03:00, the 03:00 job is simply skipped.",
    "**anacron** fixes that for jobs counted in **days**. It does not ask “is it time now?” but “has this job run in the last N days?”. If not, it runs it.",
    "A line of `/etc/anacrontab` has four fields:",
    "    period-in-days   delay-in-minutes   job-id   command",
    "    7                10                 weekly   /usr/local/bin/backup.sh",
    "meaning: run the backup if it has not run in the last 7 days, but wait 10 minutes after anacron starts.",
    "After each run anacron stores the date (no time of day) in a file under `/var/spool/anacron`, named after the job id. That is its memory.",
    "As with cron, the output is mailed to root or to `MAILTO`."
  ],
  17: [
    "`at` runs a command **once**, at a time you choose. The daemon doing the work is `atd`.",
    "- `at TIME`: schedule. You then type the commands and finish with Ctrl-D.",
    "- `atq`: list your waiting jobs (**at q**ueue).",
    "- `atrm N`: cancel job number N (**at r**e**m**ove).",
    "It understands many ways of writing a time: `16:30`, `4pm + 5 days`, `11am Jun 23`, `3pm tomorrow`, `now + 1 minute`.",
    "Jobs wait in queues named by letters; `a` is the default, and you can ignore the others."
  ],
  18: [
    "A full session:",
    "- `at now + 1 minute`: schedule something for one minute from now. `at` warns that the commands will be run by `/bin/sh`.",
    "- At the `at>` prompt you type the command, `ps auxw` (a full list of processes), then press Ctrl-D. `at` shows this as `<EOT>`, end of transmission, and confirms: job 4, with its time.",
    "- `atq` lists it: job number, time, queue `a`, user `guest`.",
    "- `atrm 4` cancels it; the second `atq` prints nothing.",
    "Like cron, `at` mails you the output of the job."
  ],
  19: [
    "A computer has **two clocks**:",
    "- the **hardware clock**: a chip with a battery that keeps time while the machine is off. Also called RTC (real-time clock) or the CMOS clock;",
    "- the **system clock**: kept by the kernel while the machine runs.",
    "`hwclock` is the command for the hardware clock:",
    "- `hwclock --hctosys`: copy **h**ardware **c**lock **to sys**tem clock;",
    "- `hwclock --systohc`: the other way round;",
    "- `hwclock --set --date …`: set it to a given time;",
    "- `hwclock --adjust`: correct its **drift**. Every cheap clock runs a little fast or slow; the measured error is kept in `/etc/adjtime`;",
    "- `hwclock -c`: compare the two clocks every 10 seconds;",
    "- `hwclock --predict`: say what the hardware clock will show at a future time, given its drift."
  ],
  20: [
    "The **system clock** is the one programs actually use.",
    "- The kernel keeps it going with a *timer interrupt*: a hardware timer pokes the kernel many times a second, and the kernel counts.",
    "- It exists only while the machine is on. At boot it is set from the hardware clock.",
    "- Internally it is one number: the **seconds elapsed since 1 January 1970, 00:00:00**. That moment is called the Unix epoch.",
    "`date` prints the clock (or sets it, as root). A `+` followed by codes chooses the format:",
    "- `%d` day · `%m` month · `%y` two-digit year · `%H` hour · `%M` minute",
    "- `date +%d.%m.%y` → `23.11.26`",
    "! Capital `%M` is minutes, small `%m` is the month."
  ],
  21: [
    "`time cmd` runs the command and then tells you how long it took. It prints three numbers:",
    "- **real**: time on the wall clock, from start to finish;",
    "- **user**: CPU time spent in the program's own code;",
    "- **sys**: CPU time the kernel spent working for the program (reading files, etc.).",
    "`time sleep 5` shows real ≈ 5 s but user and sys ≈ 0: the program was waiting, not computing.",
    "bash has `time` built in. There is also a separate program, `/usr/bin/time`, which can report more (memory used, for instance)."
  ]
},

c9: {
  1: [
    "**Lecture 9 in one sentence:** where data lives: disks seen as *block devices*, and the *file systems* that organise them, including a few that are not on a disk at all.",
    "Many commands appear. The ideas to hold on to: device → format → mount, and what journaling is for."
  ],
  2: [
    "Two layers. Below, **block devices**: disks as the kernel sees them. Above, **file systems**: the structure placed on a disk so that you can have files and directories."
  ],
  3: [
    "Two kinds of memory:",
    "- **Main memory** (RAM): the only large memory the processor can use directly. Fast, *random access* (any byte can be reached straight away), but **volatile**: its contents are lost when the power goes off. DRAM is the usual type of RAM chip.",
    "- **Secondary storage**: larger, slower and **non-volatile**: it keeps data without power. Hard disks, SSDs, USB flash drives, CDs and DVDs.",
    "Programs run in main memory; files live on secondary storage."
  ],
  4: [
    "Inside a hard disk (HDD):",
    "- several rigid discs, the **platters**, coated with magnetic material, all spinning on one axis, the *spindle*;",
    "- each surface is divided into concentric circles, the **tracks**;",
    "- each track is divided into **sectors**, the smallest unit that can be read or written;",
    "- the same track on all the platters, taken together, is a **cylinder**.",
    "The **disk controller** is the electronics that links the disk to the computer.",
    "**NVM** (non-volatile memory) devices such as SSDs have no moving parts, which is why they are much faster."
  ],
  5: [
    "No memory is fast, large and cheap all at once, so a computer uses several kinds, arranged from fast and small to slow and big.",
    "- **Caching**: keep a copy of the data you use often in a faster memory. Main memory acts as a cache for the disk: recently read files stay in RAM.",
    "- **Device driver**: the piece of the kernel that knows how to operate one kind of device controller. It gives the rest of the kernel the same simple interface (“read block n”) for every device, whoever made it."
  ],
  6: [
    "The hierarchy as a pyramid. Going **up**: faster and smaller. Going **down**: slower and larger.",
    "- **registers** and **cache**: inside the processor;",
    "- **main memory**: RAM. Everything down to here is *volatile* and counts as *primary storage*;",
    "- below the dashed line the storage is *non-volatile*: **nonvolatile memory** (SSD) and **hard-disk drives** are *secondary storage*;",
    "- **optical disks** and **magnetic tapes** are *tertiary storage*: slow and cheap, used for archives.",
    "Each level serves as a cache for the level below it."
  ],
  7: [
    "A **block device** is one that transfers data in whole blocks: disks, mainly.",
    "- **DMA** (direct memory access): a dedicated chip moves the blocks between the disk and RAM, and the CPU is only told when the transfer is finished. The older method, *programmed I/O*, had the CPU copy every byte itself.",
    "- In Unix a device appears as a special file in `/dev`: `/dev/sda1`, `/dev/cdrom`.",
    "- The kernel identifies a device by two numbers: the **major** number says which driver handles it, the **minor** number says which unit of that kind it is.",
    "- `mknod` creates such a file by hand: in `mknod /dev/sdc1 b …`, `b` means block device and the numbers after it are the major and the minor.",
    "(HW = hardware.)"
  ],
  8: [
    "A **loop device** makes an ordinary **file** look like a disk.",
    "Why would you want that? A file can contain a whole file system: the `.iso` image of a CD, for example. With a loop device you can mount it and browse its contents without burning a disc.",
    "- The loop devices are `/dev/loop0`, `/dev/loop1`, …",
    "- `losetup` (loop setup) connects one to a file:",
    "    $ losetup -f file.img     # attach to the first free loop device",
    "    $ losetup -j file.img     # show which loop device uses this file"
  ],
  9: [
    "A disk (or partition) is used in one of two ways:",
    "- **For files.** First you *format* it: write an empty file system structure onto it.",
    "    $ mkfs -t ext4 /dev/sda1     # same as: mkfs.ext4 /dev/sda1",
    "`mkfs` = make file system. Formatting erases what was there.",
    "- **As swap space.** No file system. The kernel uses it as overflow for RAM: when memory is full, it moves data that has not been used recently to the swap area and brings it back when needed. This is what lets programs use more memory than the machine physically has (*virtual memory*).",
    "    $ mkswap /dev/sda2 ; swapon /dev/sda2",
    "`mkswap` prepares the area, `swapon` starts using it, `swapoff` stops."
  ],
  10: [
    "Commands for looking at disks:",
    "- `parted -l`, `fdisk -l`: show the **partition table**, i.e. how a disk is divided.",
    "- `lsblk`: list block devices as a tree (disks and their partitions). `lsblk -f` adds the file system type.",
    "- `blkid`: print each device's UUID, label and type.",
    "- `df -h`: **d**isk **f**ree. How full each mounted file system is.",
    "- `du -sh *`: **d**isk **u**sage. How much space each item in the current directory takes (`-s` = one total per item).",
    "- `free -h`: free and used RAM and swap.",
    "`-h` everywhere means *human-readable*: 1.5G instead of 1572864."
  ],
  11: [
    "A **file**, from the OS's side, is a container for data that must survive power-off.",
    "- You refer to it by **name**. The file system translates the name into an **inode**, the kernel's internal record for that file.",
    "- You use it in three steps: **open**, **read/write**, **close**.",
    "The inode holds the file's **metadata**, data about the data:",
    "- the attributes: owner, permissions, size, times of last access and last change;",
    "- the list of disk blocks where the contents are stored.",
    "The name is *not* in the inode. It is in the directory, which is why one file can have several names (hard links, lecture 3)."
  ],
  12: [
    "The same slide as in lecture 2, with one addition.",
    "- The file system is the OS component that organises a disk into files and directories.",
    "- The **VFS** layer lets Linux combine different formats (ext3, ext4, ntfs, vfat) in one directory tree.",
    "- `mount` attaches a formatted device to a directory, the **mountpoint**.",
    "New here is the reverse operation, spelled without an “n”:",
    "    $ umount /dev/sda1     # by device",
    "    $ umount /             # or by mountpoint",
    "You cannot unmount a file system that is in use, for example while a terminal has its current directory there."
  ],
  13: [
    "`/etc/fstab` (file systems table) is the list of what to mount where **at boot**. During start-up the system runs the equivalent of `mount -a`, “mount everything in fstab”.",
    "To see what is mounted **now**:",
    "- `mount` with no arguments;",
    "- or the files `/etc/mtab` and `/proc/mounts`.",
    "Each line of fstab describes one mount with **6 fields**, explained on the next two slides. A typical line:",
    "    /dev/sda1   /home   ext4   defaults   0   2"
  ],
  14: [
    "The first four fields of an fstab line:",
    "- **1. What to mount** (`fs_spec`): a device (`/dev/sda7`), a remote directory (`fmi.unibuc.ro:/home`), or better a `UUID=…` or `LABEL=…`. Device names like sda/sdb can change when you plug in another disk; a UUID is stored inside the file system and never changes. `blkid` shows them.",
    "- **2. Where** (`fs_file`): the mountpoint. `none` for swap.",
    "- **3. Type** (`fs_vfstype`): ext4, xfs, vfat, ntfs, nfs, proc, swap.",
    "- **4. Options** (`fs_mntops`). `defaults` stands for: `rw` (read and write), `suid` (set-UID programs work), `dev` (device files work), `exec` (programs can be run), `auto` (mounted by `mount -a`), `nouser` (only root may mount it), `async` (writes are buffered).",
    "Two other useful options: `user` lets an ordinary user mount it, and `noauto` means “not at boot, only on request”."
  ],
  15: [
    "The last two fields are numbers:",
    "- **5. Dump** (the real name is `fs_freq`; the slide has `fs_req`): used by the old backup program `dump`. Practically always 0.",
    "- **6. Pass** (`fs_passno`): the order in which `fsck` checks file systems at boot. **1** for the root `/`, **2** for the others, **0** = never check (normal for network file systems).",
    "`fsck` = file system check. It looks for damage in a file system's internal structure and repairs what it can:",
    "    $ fsck /dev/sda1",
    "    $ fsck -t ext4 /dev/sdb2",
    "Run it only on a file system that is **not mounted**."
  ],
  16: [
    "The plan for the rest of the lecture. “File system” covers more than disks:",
    "- **for permanent data**, on disk, with or without a *journal* (slides 17–19);",
    "- **temporary**, kept in RAM (slide 20);",
    "- **inside a file**, through a loop device (slides 21–22);",
    "- **distributed**: the files are on another machine (slide 23);",
    "- **pseudo** file systems: no stored files at all, just a window into the kernel (slides 24–26)."
  ],
  17: [
    "The problem: one change to a file (creating it, say) needs **several separate writes** to the disk: the directory, the inode, the list of free blocks. If the power fails between two of them, the structures on disk no longer agree with each other. The file system (FS) is *inconsistent*.",
    "The old cure is to run `fsck` over the entire disk before using it again. On a big disk that can take hours, and the machine is unusable meanwhile.",
    "The modern cure is **journaling**: before touching the real structures, write down what you are about to do in a special area, the **journal** (or log). After a crash the system only has to read the journal and redo the unfinished operations. That takes seconds.",
    "(R/W = read/write.)"
  ],
  18: [
    "A concrete case of inconsistency:",
    "- A program opens a file and keeps it open for a long time.",
    "- Meanwhile you delete the file with `rm`. Its name disappears from the directory at once.",
    "- But the kernel keeps the data and the inode as long as the program has the file open. The real deletion is postponed until the program closes it.",
    "- **The power goes off** right then.",
    "What is now on the disk: no directory entry points to the file, yet its inode and data are still marked as used. An orphan.",
    "At the next boot `fsck` finds the orphan. Since it cannot know the file's name, it puts it in the special directory `lost+found` and repairs the bookkeeping."
  ],
  19: [
    "How a journal works:",
    "- Every change to the metadata is grouped as a **transaction**: a set of writes that must happen all together or not at all.",
    "- The transaction is first written to the **journal**. Once it is there, it counts as done (**committed**), even though the real structures have not been touched yet.",
    "- Later, in the background, the changes are applied to the real structures, and the transaction is removed from the journal.",
    "- After a crash: replay whatever is still in the journal.",
    "Result: recovery is fast, and the metadata cannot end up half-changed.",
    "ext4, xfs and reiserfs are journaling file systems."
  ],
  20: [
    "**tmpfs** is a file system that lives in **RAM**. It is very fast, and everything in it disappears at unmount, reboot or power-off.",
    "- It behaves like any file system, with files and directories. (A *RAM disk* is something else: a fake disk in memory that you would still have to format.)",
    "- If RAM gets tight, its contents can spill into swap space, so it does not simply fail when memory is full.",
    "    $ mount -t tmpfs ramfs /mnt -o size=1g",
    "Normally `mount` wants a device. tmpfs has none, so any word goes in that place (here `ramfs`); `-o size=1g` limits it to 1 GB.",
    "Used for temporary files: `/run`, `/dev/shm` and often `/tmp` are tmpfs. You saw them in the `df -h` output in lecture 2."
  ],
  21: [
    "Loop devices in practice. `mount -o loop` attaches the loop device for you:",
    "    $ mount -o loop -t iso9660 cdrom.iso /cdrom",
    "mounts a CD image. iso9660 is the file system format used on CDs.",
    "The second example makes swap space out of a file:",
    "- `dd if=/dev/zero of=~/myswapfile bs=1K count=1M`: `dd` copies raw data from an **i**nput **f**ile to an **o**utput **f**ile. Here: 1M blocks of 1K each, taken from `/dev/zero` (an endless supply of zero bytes). The result is an empty 1 GB file.",
    "- `losetup --show -f ~/myswapfile`: attach it to the first free loop device and print which one.",
    "- `mkswap /dev/loop0`, then `swapon /dev/loop0`: prepare it as swap and switch it on.",
    "- `swapon` alone lists the active swap areas."
  ],
  22: [
    "The same idea, with a complete file system inside a file:",
    "- `dd …`: create an empty 1 GB file, `ext4.img`.",
    "- `losetup --show -f ~/ext4.img`: make it look like the disk `/dev/loop0`.",
    "- `mkfs.ext4 /dev/loop0`: format that “disk” as ext4.",
    "- `file ~/ext4.img`: the `file` command now recognises it as containing an ext4 file system.",
    "- `mount /dev/loop0 /mnt`: use it. Whatever you copy into `/mnt` ends up inside the file.",
    "- `umount /dev/loop0`, then `losetup -d /dev/loop0`: unmount and **d**etach.",
    "This is a safe way to practise formatting, mounting and `fsck` without risking a real disk."
  ],
  23: [
    "A **distributed file system** lets you work with files stored on another machine as if they were local.",
    "- The **server** *exports* one of its directories.",
    "- The **client** mounts it into its own tree: `mount -t nfs fmi.unibuc.ro:/home /home`. NFS = Network File System.",
    "How does a `read` reach the other machine? Through **RPC**, remote procedure call: calling a function that actually runs elsewhere.",
    "- On the client, a small stand-in function, the **stub**, packs the arguments into a message and sends it.",
    "- On the server, a matching stub unpacks the message, calls the real function, and sends the result back.",
    "- Packing and unpacking are called **marshalling** and **unmarshalling**. The data travels in a neutral format (XDR, ASN.1), so that machines of different kinds understand each other."
  ],
  24: [
    "A **pseudo file system** stores nothing on any disk. Its “files” are produced by the kernel at the moment you read them. It is a way of asking the kernel questions with ordinary tools such as `cat` and `ls`.",
    "`/proc` (type `procfs`) contains one directory per running process, named after its PID: `/proc/1234/`. Inside you find, among others:",
    "- `cmdline`: the command that started it;",
    "- `cwd`: its current working directory; `exe`: the program file; `environ`: its environment;",
    "- `fd/`: its open file descriptors (0, 1, 2, …);",
    "- `status`, `stat`: its state and memory use. This is where `ps` gets its information.",
    "Try `cat /proc/$$/status`: `$$` is the PID of your shell.",
    "(SP and PC on the slide = stack pointer and program counter, two CPU registers.)"
  ],
  25: [
    "Besides the per-process directories, `/proc` has files about the whole system. The useful ones:",
    "- `/proc/cpuinfo`: the processors · `/proc/meminfo`: memory (what `free` reads)",
    "- `/proc/loadavg`: how busy the system is (what `uptime` shows)",
    "- `/proc/mounts`: mounted file systems · `/proc/partitions`: disk partitions · `/proc/swaps`: swap in use",
    "- `/proc/filesystems`: file system types this kernel supports · `/proc/modules`: loaded kernel modules",
    "- `/proc/cmdline`: the options the kernel was started with",
    "- `/proc/sys/`: kernel settings; some can be changed by writing into them",
    "They are all text: `cat /proc/cpuinfo`.",
    "(PCI is the bus graphics and network cards plug into; `lspci` lists them.)"
  ],
  26: [
    "`/sys` (type `sysfs`) is the second pseudo file system. Where `/proc` is about processes, `/sys` is the kernel's tidy catalogue of **devices and drivers**.",
    "- `/sys/devices`: the full tree of devices as the kernel sees them;",
    "- `/sys/block`: one entry per disk, as links into `/sys/devices`;",
    "- `/sys/module`: the loaded kernel modules;",
    "- `/sys/fs`: special file systems such as cgroups (control groups: limits on how much CPU or memory a group of processes may use);",
    "- `/sys/kernel`: the state of the kernel itself. `mm` = memory management.",
    "Example: `cat /sys/block/sda/size` prints the size of the first disk, counted in 512-byte sectors."
  ]
}

});
