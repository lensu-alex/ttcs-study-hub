// Plain-language explanations shown next to each slide: course intro and lectures 1–3.
// One entry per slide number. Each entry is a list of strings:
//   "text"        a paragraph            "- text"   a bullet
//   "    text"    a line of code         "! text"   a "remember this" box
// Inside text, `backticks` mark code and **stars** mark bold.
window.TTCS_NOTES = Object.assign(window.TTCS_NOTES || {}, {

intro: {
  1: [
    "This course teaches the everyday toolbox of a computer scientist: working in a terminal, writing shell scripts, and understanding what the operating system does behind your back (starting up, running services, storing files, compiling programs, talking over the network).",
    "All the examples are on Linux. Vlad Olaru is the lecturer; the e-mail on the slide is how you reach him."
  ],
  2: [
    "How the 100 points are built:",
    "- **Laboratory, 30 points.** Weeks 1–7. Only labs 2–7 are graded. You must be present, and a missed lab cannot be made up later.",
    "- **Project, 35 points.** Weeks 8–14, in teams of 2–3, picked from the project list and worked on during lab hours. Everyone in the team gets the same points.",
    "- **Verification, 35 points.** The final test on the lecture material (Romanian “verificare”).",
    "! You pass with at least 50 points out of 100. Lab + project alone can give 65, so they matter more than the test."
  ],
  3: [
    "What you should be able to do at the end:",
    "- **Command line work**: be comfortable typing commands instead of clicking.",
    "- **Automatization**: make the computer repeat boring tasks for you with scripts.",
    "- **Operating systems diversity**: know that Linux, macOS and other Unix systems share the same ideas, with small differences.",
    "- **Basics of networking**: how two programs on different machines talk.",
    "- **System services**: the background programs that keep a system running."
  ],
  4: [
    "What you need to follow along:",
    "- **An operating system to practise on**: Linux, or any Unix-like system. macOS counts, so your Mac's Terminal works for most of the course.",
    "- **A virtual machine**, if you want a real Linux without installing it on your disk. VirtualBox, QEMU and KVM are three free programs that run a whole simulated computer in a window.",
    "- **The theory book**: Silberschatz, Galvin and Gagne, *Operating System Concepts*. Most diagrams in lectures 1, 4, 9 and 10 are taken from it."
  ],
  5: [
    "“Dinosaur book” is the nickname of the Silberschatz textbook from the previous slide: every edition has dinosaurs on its cover. If someone says “it's in the dinosaur book”, this is the book they mean."
  ]
},

c1: {
  1: [
    "**Lecture 1 in one sentence:** what a computer is made of, and what the operating system (OS) is and does for you.",
    "It is the most theoretical lecture. The ideas come back in every later one, so it is worth getting the vocabulary right: hardware, kernel, system program, service."
  ],
  2: [
    "The plan: first the parts of a computer, then what an operating system is, then the list of services it offers, and finally how a system starts (“boots”). The boot part is only opened here; lecture 2 does it properly."
  ],
  3: [
    "A computer system has four layers, from bottom to top:",
    "- **Hardware**: the physical parts. CPU (the processor), memory, and I/O devices (input/output: keyboard, disk, screen, network card).",
    "- **Operating system**: the referee. It decides which program gets the processor, the memory and the devices, and when.",
    "- **Application programs**: what you actually want to run (browser, compiler, game).",
    "- **Users**: not only people. Another program or another computer asking for something is also a “user”."
  ],
  4: [
    "The same four layers as a picture. Read the arrows: each layer only talks to its neighbours.",
    "You talk to applications. Applications ask the operating system. Only the operating system touches the hardware. A program never drives the disk directly; it asks the OS to do it."
  ],
  5: [
    "How the hardware is wired together:",
    "- Each device (disk, keyboard, network card) is driven by a small chip called a **device controller**.",
    "- The processors and all the controllers are connected by one shared set of wires, the **bus**, which also leads to memory.",
    "“Concurrent execution … competing for memory access cycles” means: the CPU and the devices all work at the same time, and they all want to use memory, but the bus lets only one of them use it at any instant. So they take turns, very fast."
  ],
  6: [
    "The picture has three boxes: CPU, memory, device.",
    "- **CPU ↔ memory**: the CPU keeps fetching the next instruction from memory and executing it (the *instruction execution cycle*) and moves data back and forth. The **cache** is a small, very fast memory inside the CPU that keeps recently used data close.",
    "- **CPU ↔ device**: the CPU sends an **I/O request** (“read this block”). When the device is done it raises an **interrupt**: a signal that makes the CPU stop what it is doing and handle the event.",
    "- **Device ↔ memory (DMA)**: with Direct Memory Access the device copies the data straight into memory, without passing every byte through the CPU.",
    "`(*N)` and `(*M)` just mean “there can be several CPUs and several devices”."
  ],
  7: [
    "Definition to remember: the OS is a program that sits **between the user and the hardware**.",
    "Its three goals:",
    "- run your programs;",
    "- make the computer **convenient**. It does this by inventing *abstractions*: simple ideas that hide ugly details. You think “file”, the disk only knows numbered blocks. You think “network connection”, the network card only sees bits.",
    "- use the hardware **efficiently**."
  ],
  8: [
    "What the OS is “for” depends on who you ask:",
    "- **A normal user** wants the machine to be easy and fast, and does not care how resources are shared.",
    "- **A big shared computer** (supercomputer, server) has many users at once, so there the OS is mainly a **resource allocator** (who gets what) and a **control program** (keeps programs from misbehaving).",
    "- **Phones and tablets** have little memory and a battery, so the OS is tuned for usability and battery life.",
    "- **Embedded systems** (the computer inside a car or a washing machine) may have no screen or keyboard at all; they just run."
  ],
  9: [
    "Nobody agrees on an exact definition, so the slide gives a practical one:",
    "- **Kernel**: the one program that runs all the time, from boot to shutdown. This is the heart of the OS.",
    "- **System programs**: come with the OS but are not part of the kernel (the shell, `ls`, the login program).",
    "- **Applications**: everything else.",
    "- **Middleware**: ready-made building blocks for programmers (databases, multimedia, graphics) that modern systems ship as well.",
    "GPOS = general-purpose operating system: one meant to run any kind of program, such as Linux or Windows."
  ],
  10: [
    "The OS offers services. This slide and the next list the ones that help the **user**:",
    "- **User interface (UI)**: a command line (CLI), windows (GUI), a touchscreen, or *batch*, where commands are put in a file and run with nobody watching.",
    "- **Program execution**: load a program into memory, run it, end it (normally or with an error).",
    "- **I/O operations**: programs cannot touch devices themselves, so the OS reads and writes for them.",
    "- **File manipulation**: create, delete, read, write, search files and directories, and control who may access them.",
    "(On the slide the word “Batch” ended up glued to “program execution”; it belongs to the list of interfaces.)"
  ],
  11: [
    "More services for the user:",
    "- **Communication**: two processes (running programs) exchange data, on the same machine or over a network. Two ways: *shared memory* (both see the same piece of memory) or *message passing* (one sends, the other receives). Lecture 4 explains both.",
    "- **Error detection**: things break, in the hardware (CPU, memory, a disk) or in a program (dividing by zero). The OS must notice and react so that the rest of the system stays correct. Debugging tools are part of this service."
  ],
  12: [
    "These services are not for one user; they keep the **whole system** working when many users and programs share it:",
    "- **Resource allocation**: hand out CPU time, memory, disk space and devices among everyone who wants them.",
    "- **Execution logging** (also called accounting): keep track of who used how much of what.",
    "- **Protection and security**. *Protection* = control inside the system: one process must not be able to damage another. *Security* = defence against outsiders: logging in with a password, blocking invalid access attempts."
  ],
  13: [
    "The summary picture of slides 10–12. Read it from top to bottom:",
    "- on top, the programs and the **user interfaces** (GUI, touch screen, command line);",
    "- in the middle, a thin line called **system calls**: the only door through which a program can ask the OS for a service;",
    "- below it, the boxes are exactly the services just listed (*accounting* = execution logging);",
    "- at the bottom, the hardware.",
    "! A system call is a function call into the kernel. `open`, `read`, `write`, `fork` and `kill` are system calls."
  ],
  14: [
    "An OS is written to run on a whole family of machines, not on one. Usually it comes pre-installed, but you can install another one, or even build one yourself from source code. The steps are always the same:",
    "- get (or write) the source code;",
    "- **configure** it: say which hardware and features this machine needs;",
    "- **compile** it: turn the source into a program the processor can run;",
    "- **install** it on the disk;",
    "- **boot**: restart the machine so that it starts with the new OS."
  ],
  15: [
    "The previous slide's steps, done for real with Linux. `make` is a tool that runs build recipes (lecture 10); the word after it selects the recipe.",
    "- `make menuconfig`: opens a text menu where you tick what the kernel should contain.",
    "- `make`: compiles the kernel. The result is `vmlinuz`, the compressed kernel file.",
    "- `make modules`: compiles the **modules**, optional kernel pieces (mostly device drivers) that are loaded only when needed.",
    "- `make modules_install`: copies the modules to their place on the system. (The slide prints `make modules` twice; the second one should be this.)",
    "- `make install`: installs the new kernel, so the boot loader can find it."
  ]
},

c2: {
  1: [
    "**Lecture 2 in one sentence:** what happens between pressing the power button and typing your first command, and how Unix organises users and files.",
    "It introduces many names you will meet again (`init`, `getty`, UID, mount, file descriptor), so use the list of acronyms under each explanation."
  ],
  2: [
    "Four parts: how the machine starts (boot), how you log in, how you talk to the system (the shell, or a graphical interface), and how files and directories work."
  ],
  3: [
    "The problem: when you press the power button, memory is empty, and the OS is a file on a disk. Something has to fetch it. That something is the **bootstrap loader**.",
    "- The processor always starts executing at one fixed address. A chip that keeps its contents without power (ROM or EEPROM) sits there, holding a small program: the **BIOS**, or on modern machines **UEFI**.",
    "- That program finds the **boot loader** on the disk and starts it. The usual Linux boot loader is **GRUB**: the menu where you choose which kernel or which OS to start.",
    "- The boot loader loads the **kernel** into memory and jumps to it. From then on the system is running.",
    "*Single user mode* is a rescue state: only root, no network, used for repairs.",
    "(“HW” on the slide = hardware.)"
  ],
  4: [
    "The BIOS reads the **first sector** of the boot disk. A sector is the smallest piece of a disk, traditionally 512 bytes. That first sector is the **MBR**, Master Boot Record, and it holds two things:",
    "- the **partition table**: how the disk is cut into partitions;",
    "- a tiny piece of **bootstrap code**: the first stage of the boot loader.",
    "**GPT** (GUID Partition Table) is the modern replacement, needed for disks larger than 2 TB."
  ],
  5: [
    "The loader must now find the kernel. The catch: “file” is an idea created by the OS, and the OS is not running yet. At this point there are only numbered disk sectors. Two ways out:",
    "- **1. A map of sectors.** The loader keeps a list of the exact sectors where the kernel lies. Simple, but the list must be rebuilt every time the kernel file moves or changes. This is how **LILO** worked.",
    "- **2. Mini file-system drivers.** The loader itself knows how to read the file system, so it can find the kernel by its path, like any file. This is how **GRUB** works."
  ],
  6: [
    "What the kernel does once loaded:",
    "- The kernel file is `/boot/vmlinuz`. It takes control of the hardware (HW) and initialises it.",
    "- It sets up its main parts: process control, memory management, files, clocks, protection.",
    "- Then it stays in memory and **waits**. A kernel does nothing by itself; it only reacts to events (interrupts). That is what “interrupt-driven program” means.",
    "- Last step: it starts the **first process**, `/sbin/init`, which gets process ID 1. Every other process descends from it.",
    "`init` then chooses the **runlevel**, a number from 0 to 6 saying what kind of system to bring up (next slide). Classic Unix reads the default from `/etc/inittab` and then runs the start-up scripts of that runlevel, found in `/etc/rc0.d` … `/etc/rc6.d`. “rc” = run commands.",
    "(“cf.” on the slide is Romanian shorthand for “according to”.)"
  ],
  7: [
    "A **runlevel** is a number that names a state of the whole machine:",
    "- **0** power off · **1** single user (repairs) · **2** multi-user, no network",
    "- **3** multi-user with network, text only · **4** unused · **5** like 3, plus the graphical interface · **6** reboot",
    "On modern Linux, `init` is a program called **systemd** and runlevels are called **targets**, handled with `systemctl` (lecture 7).",
    "    $ runlevel      # which runlevel am I in?",
    "    $ telinit 3     # switch to runlevel 3",
    "    $ telinit 6     # runlevel 6 = reboot",
    "! Worth memorising: 0 = off, 1 = single user, 3 = text, 5 = graphical, 6 = reboot."
  ],
  8: [
    "`init` also starts the programs that let you log in:",
    "- in **runlevel 3** (text): `getty` on a fixed number of terminals. `getty` is the program that prints “login:”.",
    "- in **runlevel 5** (graphical): `getty` plus a **display manager** (`xdm`, `gdm`), which is the graphical login screen.",
    "`telinit 3` therefore turns the graphical interface off, and `telinit 5` turns it back on.",
    "Ctrl-Alt-F1 … F6 only *switch your screen* to a text terminal; the graphical interface keeps running, usually on Ctrl-Alt-F7.",
    "(“porneste” on the slide is Romanian for “starts”; “w/ or w/o” = with or without. X Window is the classic graphics system of Unix.)"
  ],
  9: [
    "Logging in on a text terminal, step by step:",
    "- `getty` prints “login:” and reads your user name.",
    "- `getty` runs `/bin/login`, which asks for the password.",
    "- `login` looks your name up in `/etc/passwd` (one line per user) and checks the password against the encrypted one in `/etc/shadow`.",
    "- If it matches, `login` starts **your shell**, the one written on your line of `/etc/passwd`, and sets the variables `USER`, `SHELL` and `HOME` from the same line.",
    "- The shell prints a prompt (`$`) and waits for commands.",
    "- When you exit the shell, `init` notices and starts a fresh `getty` on that terminal, so the next person can log in."
  ],
  10: [
    "The **shell** is the program that reads the commands you type and runs them. The slide calls it a Command Line Interpreter (CLI).",
    "- It works **interactively** (you type, it answers) or in **batch** (it reads commands from a file, a *shell script*).",
    "- **Internal** (built-in) commands are done by the shell itself, like `cd`. **External** commands are separate programs on the disk, like `ls`.",
    "- It gives you a working environment (`env` shows it), and commands for files, for controlling programs, and for administration.",
    "- Administration is reserved for the user **root**, who has UID 0 and is the first line of `/etc/passwd`.",
    "There are several shells: `sh` (Bourne shell, the original), `bash` (Bourne Again shell, the Linux standard), `csh`, `ksh`. The file `/etc/shells` lists the ones installed."
  ],
  11: [
    "A screenshot of a real terminal session, so you can see what a command line looks like.",
    "Things to recognise: the **prompt** ends in `#`, which means the user is root (a normal user gets `$`). The commands typed are `uptime` (how long the machine has been on), `df -kh` (how full the disks are), a pipeline `ps aux | sort … | head -n 5` (the five busiest processes) and `ls -l` (details of a file).",
    "Nothing here needs memorising."
  ],
  12: [
    "The **GUI** (Graphical User Interface) is the other way to talk to the system: mouse, windows, icons. It was invented at Xerox PARC in the 1970s.",
    "Most systems offer both:",
    "- Windows: a GUI, plus a command line;",
    "- macOS: a GUI on top of a Unix kernel, with the normal Unix shells in Terminal;",
    "- Unix and Linux: the shell is the base, and the GUI (CDE, KDE, GNOME are three desktops) is optional."
  ],
  13: [
    "A screenshot of the macOS desktop, as an example of a GUI. Compare it with slide 11: same kind of system underneath, a completely different way of using it."
  ],
  14: [
    "Inside the system you are not a name, you are a number: the **UID** (user ID).",
    "- It is written on your line of `/etc/passwd`. Only root can edit that file, so you cannot change your own UID.",
    "- Every time one of your programs tries something (open a file, kill a process), the kernel checks the UID to decide if it is allowed.",
    "- **UID 0 is root**, the superuser. For root's processes the kernel skips most checks; some operations are allowed *only* for root.",
    "! Because root can do anything, a mistake made as root can destroy the system. That is why you should not run ordinary programs as root."
  ],
  15: [
    "Besides the UID you get a **GID** (group ID). Groups exist so that several users can share files: members of the same group can be given access that other users do not get.",
    "- Every file stores the pair (UID, GID) of its owner. `ls -l` shows it.",
    "- `/etc/group` gives names to the group numbers and lists the **supplementary groups**: a user can belong to several groups at once.",
    "    $ id         # my UID, GID and groups",
    "    $ id root    # the same for the user root"
  ],
  16: [
    "A **file** is the OS's abstraction for data that must survive a power-off. You see a name and a sequence of bytes (“Unix byte stream”: Unix does not care what the bytes mean). The OS hides where on the disk they really are.",
    "- A name may contain any character except `/`.",
    "- A file has **attributes**: type, size, owner, permissions, time of last change. `ls -l file` prints them.",
    "A **directory** (folder) is a collection of files and of other directories, which gives the familiar tree."
  ],
  17: [
    "All directories form **one tree**. Its top is the **root directory**, written `/`. (Do not confuse it with the user root.)",
    "- Every directory contains two automatic entries: `.` = this directory, `..` = the parent directory. For `/` both mean `/`.",
    "- A **path** says how to reach a file. An **absolute** path starts with `/` and starts from the root: `/home/ana/notes.txt`. A **relative** path starts from where you are now: `notes.txt`, `../bob/x`.",
    "- When you log in, you are placed in your **home directory**, taken from `/etc/passwd`.",
    "A command is also just a file with a path: `ls` is really `/bin/ls`."
  ],
  18: [
    "The **file system** is the part of the OS that manages files. The same word also means the *format* in which data is laid out on a disk: ext4 (Linux), NTFS (Windows), vfat (USB sticks).",
    "- Linux can combine disks with different formats into the single directory tree. The kernel layer that makes them all look alike is the **VFS**.",
    "- To use a disk you **mount** it: you attach it to an existing directory, called the **mountpoint**. After that, the disk's contents appear inside that directory.",
    "    $ mount -t ext4 /dev/sda1 /",
    "Read as: mount the disk partition `/dev/sda1`, whose format (`-t`, type) is ext4, on the directory `/`.",
    "- `/etc/fstab` is the table of what to mount where at boot. At start-up the system does the equivalent of `mount -a` (mount **a**ll of it)."
  ],
  19: [
    "The screenshot shows mounting in action. `df -h` lists every mounted file system (**d**isk **f**ree, `-h` = human-readable sizes); the last column is the mountpoint.",
    "- First `df -h`: the disk partition `/dev/sda6` is mounted on `/`. The `tmpfs` lines are small file systems kept in memory (lecture 9).",
    "- Then `mount -t ntfs /dev/sda2 /mnt` attaches a Windows partition to the directory `/mnt`.",
    "- Second `df -h`: a new line appears, `/dev/sda2` mounted on `/mnt`. Its files are now reachable under `/mnt`."
  ],
  20: [
    "When a program opens a file, the kernel gives it back a small number, the **file descriptor**. From then on the program says “read from 3” or “write to 4” instead of using the name.",
    "Every program starts with three descriptors already open:",
    "- **0 = stdin**, standard input: where it reads from (the keyboard);",
    "- **1 = stdout**, standard output: where normal results go (the screen);",
    "- **2 = stderr**, standard error: where error messages go (also the screen).",
    "All three are normally connected to your terminal. The command `tty` prints which terminal that is.",
    "! 0, 1, 2 = stdin, stdout, stderr. Redirection on the next slide is built on these numbers."
  ],
  21: [
    "**Redirection** = connecting one of those descriptors to a file instead of the terminal. The program does not notice.",
    "- `cmd < file`: read input from the file instead of the keyboard.",
    "- `cmd > file`: write output to the file. The file is **emptied first**.",
    "- `cmd >> file`: write output at the **end** of the file (append).",
    "- `cmd << MARKER`: “here document”. The input is the lines you type next, until a line containing only MARKER.",
    "The optional `n` in front is a descriptor number. Without it, `<` means 0 and `>` means 1. So `2> errors.txt` sends only the error messages to a file."
  ],
  22: [
    "The four redirections in action:",
    "- `echo \"…\" > out`: create (or overwrite) the file `out` with one line.",
    "- `echo \"…\" >> out`: add a second line at the end.",
    "- `cat < out`: `cat` reads from `out` instead of the keyboard, so it prints the file.",
    "- `cat << EOF >> out`: `cat` reads the lines you type until `EOF` and appends them to `out`.",
    "The `>` at the start of those typed lines is not a redirection: it is the shell's continuation prompt, telling you it is still waiting for the end marker."
  ]
},

c3: {
  1: [
    "**Lecture 3 in one sentence:** how to use bash well (environment, pipelines, background jobs, history), and how Unix decides who may do what with a file (types, permissions, links)."
  ],
  2: [
    "Two halves. First the command interpreter, meaning the shell, in more detail than last time. Then files and directories again, this time with types, permissions and links."
  ],
  3: [
    "A reminder that the shell works in two ways: **interactive** (you type a command, it answers) and **batch** (it runs a script).",
    "In interactive mode it shows a **prompt** when it is ready: `$` or `%` for a normal user, `#` for root.",
    "- The text of the prompt is stored in the variable `PS1` (Prompt String 1). `echo $PS1` shows it.",
    "- `PS2` is the *continuation* prompt, usually `>`. The shell prints it when your command is not finished yet, as in the here-document example on the slide."
  ],
  4: [
    "The **environment** is a list of `NAME=value` pairs that every program receives when it starts. It is how settings are passed around.",
    "- By convention the names are in capitals: `HOME`, `PATH`, `SHELL`.",
    "- You read a value by putting `$` in front: `echo $SHELL` prints `/bin/bash`.",
    "- They change how programs behave. `PATH` tells the shell in which directories to look for commands. `LD_LIBRARY_PATH` tells the loader (`ld`) where to look for libraries. `CPATH` and `LIBRARY_PATH` do the same for the compiler `gcc`.",
    "! Not every shell variable is an environment variable. A plain variable stays inside the shell; only *exported* ones are handed to the programs it starts."
  ],
  5: [
    "- `export NAME=value` turns a variable into an environment variable, so programs started from this shell will see it. The example changes the prompt.",
    "- `env` prints the whole environment.",
    "- A C program receives the environment as the third parameter of `main`: `argc` = number of arguments, `argv` = the arguments, `envp` = the environment strings."
  ],
  6: [
    "bash is the successor of the first shell, `sh`. It reads configuration files, which are just lists of commands run automatically:",
    "- **At login only**: `/etc/profile` (for everybody), then one of `~/.bash_profile`, `~/.bash_login`, `~/.profile` (yours). `~` means your home directory.",
    "- **Every time a terminal opens**: `~/.bashrc`. “rc” = run commands.",
    "- **At logout**: `~/.bash_logout`.",
    "After editing `.bashrc` you can apply it without reopening the terminal: `source .bashrc`, or the short form `. .bashrc`.",
    "Ctrl-D sends end-of-file (EOF). Typed at an empty prompt it tells the shell “no more input”, so the shell exits.",
    "The commands you typed are saved in `~/.bash_history`."
  ],
  7: [
    "Ways to combine commands on one line:",
    "- `a | b` **pipeline**: the output of `a` becomes the input of `b`. Both run at the same time, which is what “parallel execution” means here.",
    "- `a |& b`: the same, but the error messages of `a` go through the pipe too (short for `a 2>&1 | b`).",
    "- `a ; b`: run `a`, then `b`, no matter what.",
    "- `a && b`: run `b` **only if** `a` succeeded.",
    "- `a || b`: run `b` **only if** `a` failed.",
    "Every command ends with a number, its **exit status**: 0 = success, anything else = failure. The shell keeps the last one in `$?`.",
    "! In the shell, 0 means success. This is the opposite of C, where 0 is “false”."
  ],
  8: [
    "A command normally runs in the **foreground**: it owns the terminal and you wait for it. **Job control** lets you run several at once.",
    "- `cmd &` starts it in the **background**; you get the prompt back immediately.",
    "- **Ctrl-Z** pauses the foreground command. Technically it sends it the signal SIGTSTP (“terminal stop”).",
    "- `jobs` lists the shell's jobs, each with a number.",
    "- `fg %2` brings job 2 to the foreground; `bg %2` lets it continue in the background; `kill %2` ends it.",
    "(R/W on the slide = read/write.)"
  ],
  9: [
    "bash remembers what you typed (in `~/.bash_history`) and lets you reuse it:",
    "- `!42` runs command number 42 again; `!-2` the one two commands ago.",
    "- `!gcc` runs the most recent command that **starts with** “gcc”; `!?hello?` the most recent one that **contains** “hello”.",
    "- `^old^new` repeats the previous command with “old” replaced by “new”. Handy for fixing a typo.",
    "- **Ctrl-R**, then type a few letters: searches backwards through the history as you type.",
    "The command `history` prints the numbered list."
  ],
  10: [
    "**Internal** (built-in) commands are executed by bash itself; no new program is started.",
    "- `cd` must be built in: a separate program could only change *its own* directory, not the shell's.",
    "- `alias l='ls -l'` gives a short name to a long command.",
    "- `exit 3` ends the shell with exit status 3.",
    "- `exec cmd` **replaces** the shell with the program: when the program ends, there is no shell left to return to. After `exec firefox`, closing Firefox closes the terminal session."
  ],
  11: [
    "**External** commands are programs stored on disk; the shell finds them through `PATH` and starts them as new processes. (In bash, `pwd` and `echo` also exist as built-ins, but `/bin/pwd` and `/bin/echo` are real programs.)",
    "`echo` prints its arguments. With `-e` it understands **escape sequences**, codes that begin with a backslash:",
    "- `\\n` new line · `\\t` tab · `\\a` bell (beep)",
    "- `\\b` backspace · `\\r` carriage return (back to the start of the line) · `\\v` vertical tab"
  ],
  12: [
    "In Unix almost everything is presented as a file. The types:",
    "- **Regular file**: ordinary data, text or binary.",
    "- **Directory**: a list of file names. Programs can read it, but only the kernel writes to it (you change it indirectly, by creating or deleting files).",
    "- **Device file**: stands for a piece of hardware. *Character* devices give bytes one at a time (a terminal, `tty`). *Block* devices work in fixed-size blocks (disks). Reads and writes go to the device's driver, not through the file system (FS).",
    "- **FIFO** (named pipe): a channel for two programs to talk to each other. IPC = inter-process communication. The ordinary `|` is an *anonymous* pipe and only connects related processes; a FIFO has a name on disk, so any two programs can use it.",
    "(The slide calls FIFOs bidirectional: either side may open one for reading or writing. Data still flows from a writer to a reader.)"
  ],
  13: [
    "Two more file types:",
    "- **Socket**: a communication channel like a pipe, but it can also connect two different machines (TCP/IP socket). A *Unix socket* connects programs on the same machine. Lecture 11 is about them.",
    "- **Symbolic link**: a tiny file that contains the *name* of another file; a shortcut. `ln -s target shortcut` creates one.",
    "`ls -l` shows the type as the **first character** of each line:",
    "- `-` regular · `d` directory · `c` character device · `b` block device · `p` FIFO (pipe) · `s` socket · `l` symbolic link",
    "The command `file name` looks inside a file and tells you what it contains (text, image, executable)."
  ],
  14: [
    "A process carries two identities:",
    "- the **real** UID/GID: who actually started it;",
    "- the **effective** UID/GID: the identity the kernel uses for permission checks.",
    "Normally they are the same. A **set-UID** program is the exception: its file has a special flag saying “while this runs, the effective UID becomes the UID of the file's **owner**, not of whoever started it”.",
    "The classic example is `passwd`. To change your password it must write to `/etc/shadow`, which only root may touch. `/usr/bin/passwd` is owned by root and has the set-UID flag, so while it runs it acts as root, for that one job.",
    "set-GID is the same idea for the group. The *saved* set-UID is a copy that lets a program switch back and forth."
  ],
  15: [
    "Each file has three sets of permissions: for the **u**ser who owns it, for its **g**roup, and for **o**thers. Each set has three bits: **r**ead, **w**rite, e**x**ecute. `ls -l` shows them as `rwxr-xr--`.",
    "`chmod` changes them, in two notations:",
    "- letters: `chmod u+rw f` (give the owner read and write), `chmod g-x f` (take execute from the group), `chmod o-rwx f` (take everything from others);",
    "- octal: r = 4, w = 2, x = 1, added up per set. `755` = `rwxr-xr-x`, `644` = `rw-r--r--`.",
    "The names like `S_IRUSR` are the same bits in C: **R**ead for **USR**, and so on for `W`, `X`, `GRP`, `OTH`.",
    "Three special bits: set-uid and set-gid (previous slide) and the **sticky bit**: on a shared directory such as `/tmp`, only a file's owner may delete it.",
    "The kernel compares the process's *effective* UID and GID with these bits to allow or refuse access."
  ],
  16: [
    "`umask` decides the permissions a **new** file starts with. It is a mask of bits to **remove**.",
    "New files start from 666 (`rw-rw-rw-`) and new directories from 777. Then the umask bits are switched off:",
    "- `umask 022` removes write (2) for group and others → files get 644, directories 755.",
    "- `umask 077` removes everything for group and others → files 600: private.",
    "It is normally set once, in a start-up file such as `/etc/profile`."
  ],
  17: [
    "Inside the kernel a file is an **i-node** (index node): a record with the owner, the permissions, and where the data is. A *name* in a directory is only a pointer to an i-node, called a **hard link**.",
    "- One file can have several names: `ln old new` adds a second one. Both are equal; neither is “the original”.",
    "- `rm` removes **one name**. The data disappears only when the last name is gone.",
    "To delete a file you need permissions on the **directory**, not on the file: write (you are changing the directory's list) and execute (called *search* on a directory: the right to go into it)."
  ],
  18: [
    "Hard links have two limits: both names must be on the same file system (same formatted disk), and you cannot hard-link directories.",
    "A **symbolic link** avoids both. It is a small separate file containing the *path* of another file, like a shortcut. `ln -s /etc/profile ~/.system-wide-profile` creates one.",
    "Most commands **follow** the link (they “dereference” it) and work on the target:",
    "- `cat link` prints the target's contents.",
    "A few work on the link itself:",
    "- `rm link` deletes only the shortcut; `ls -l link` shows the shortcut and where it points.",
    "If the target is deleted, the symbolic link stays but points to nothing: a *broken link*."
  ],
  19: [
    "Directory commands:",
    "- `mkdir d` creates a directory. `mkdir -p a/b/c` also creates the missing parents on the way.",
    "- `rmdir d` deletes a directory, but **only if it is empty**. (For a full one: `rm -r d`.)",
    "- `cd d` goes into it. `cd` alone goes to your home directory. `cd -` goes back to where you were before.",
    "- `pwd` prints where you are: **p**rint **w**orking **d**irectory."
  ]
}

});
