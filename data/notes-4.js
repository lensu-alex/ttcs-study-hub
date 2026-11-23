// Plain-language explanations shown next to each slide: lectures 10–11 and the project list. Format: see notes-1.js.
window.TTCS_NOTES = Object.assign(window.TTCS_NOTES || {}, {

c10: {
  1: [
    "**Lecture 10 in one sentence:** how C source code becomes a program you can run (compiling and linking), how to find bugs in it with `gdb`, and how `make` automates the building.",
    "Two distinctions carry the lecture: *compiling* vs *linking*, and *static* vs *dynamic* libraries."
  ],
  2: [
    "Three tools, three parts: the compiler and linker (`cc`), the debugger (`gdb`), and the build manager (`make`)."
  ],
  3: [
    "The vocabulary, in the order things happen:",
    "- **Source**: the text you write (`hello.c`).",
    "- **Compiler**: translates one source file into machine code.",
    "- **Object** file (`hello.o`): the result. It is machine code, but not yet runnable: the calls to functions defined elsewhere (like `printf`) are still blanks.",
    "- **Library**: a collection of already compiled functions that others can reuse.",
    "- **Linker**: fills in the blanks. It joins your objects with the libraries and produces the **executable**.",
    "Two kinds of executable:",
    "- **static**: the library code is *copied into* it. A bigger file, but it needs nothing else to run.",
    "- **dynamic**: it contains only your code plus small placeholders (*stubs*) for the library functions. The libraries remain separate files and are attached when the program runs. Smaller, and one copy of a library serves every program."
  ],
  4: [
    "A dynamic executable needs its libraries found at some point. **Option 1: at load time**, all at once, before the program starts:",
    "- the OS loads the executable into memory;",
    "- it looks up **every** library the program uses and loads them all;",
    "- if even one is missing, the program does not start at all.",
    "This is the familiar “error while loading shared libraries: libsomething.so: cannot open shared object file”."
  ],
  5: [
    "**Option 2: at run time**, on demand (“lazy” loading):",
    "- the program starts with only the libraries it strictly needs to begin;",
    "- the first time it calls a function from a library that is not loaded yet, it pauses, the library is found and loaded, and the program continues from where it stopped.",
    "Advantage: faster start, and libraries that are never used are never loaded.",
    "Disadvantage: a missing library is discovered late, possibly in the middle of the work, and the program is aborted at that point."
  ],
  6: [
    "The whole journey in one picture, top to bottom, with the three moments marked on the right:",
    "- **compile time**: *source program* → compiler → *object module*;",
    "- **load time**: the *linkage editor* (the linker) joins your object module with other object modules into a *load module*, which is the executable file. The *loader* then puts it in memory together with the system libraries;",
    "- **execution time (run time)**: the program is a *binary image in memory*; libraries loaded on demand are attached now (*dynamic linking*).",
    "The circles are files or data, the boxes are the tools that process them."
  ],
  7: [
    "The two compilers found on Unix systems:",
    "- **gcc**: the GNU Compiler Collection, the standard on Linux;",
    "- **clang**: the C/C++ compiler of the LLVM project, the standard on macOS.",
    "Whichever is installed, the command `cc` (“C compiler”) always exists and runs it, and `c++` does the same for C++. Scripts and Makefiles use `cc` so that they work everywhere."
  ],
  8: [
    "The shortest possible compilation:",
    "    $ cc hello.c",
    "    $ ./a.out",
    "    Hello, World!",
    "- With no other instructions, the executable is called `a.out` (“assembler output”, a name kept from the first Unix).",
    "- You run it as `./a.out`. The `./` means “the file right here”: the shell only searches the directories in `PATH`, and the current directory is not one of them.",
    "- `-o` chooses the name: `cc -o hello hello.c` produces `hello`."
  ],
  9: [
    "`-c` means “compile only, do not link”:",
    "    $ cc -c hello.c",
    "produces `hello.o`, an **object file**, and stops.",
    "Why stop halfway? In a real project each source file is compiled to its own `.o`, and one linking step at the end joins them. When you change one file, only that file needs recompiling. This is what `make` exploits later in the lecture."
  ],
  10: [
    "To use a library, add `-l` and its short name **at the end** of the command:",
    "    $ cc hello.c -lm",
    "- `-lm` means “link with the library called m”, the math library (`sin`, `sqrt`).",
    "- The file's real name is the short name with `lib` in front and `.a` or `.so` behind: `-lm` → `libm.a` or `libm.so`; `-lhello` → `libhello.so`.",
    "- `.a` (archive) is a **static** library, `.so` (shared object) a **dynamic** one.",
    "Where does the compiler look? In the standard directories (a list maintained by the command `ldconfig`), plus any directories you put in the variable `LD_LIBRARY_PATH`."
  ],
  11: [
    "Making your own **static** library:",
    "- `ar -r libhello.a hello.o`: `ar` (archiver) packs object files into one `.a` file. A static library is simply a bundle of `.o` files.",
    "- Optional checks: `ar -t libhello.a` lists what is inside; `nm libhello.a` lists the function names it provides; `objdump -p` prints technical details.",
    "- `gcc -o main main.c -L. -lhello`: compile `main.c` and link it with the library. `-L.` means “also look for libraries in the current directory” (`.`); `-lhello` picks `libhello.a`.",
    "- `./main`: run it. The library's code is now inside `main`; the `.a` file is no longer needed.",
    "! Capital `-L` = *where* to look. Small `-l` = *which* library."
  ],
  12: [
    "Making your own **dynamic** library:",
    "- `gcc -c hello.c -fpic`: compile as **p**osition-**i**ndependent **c**ode. A shared library can be loaded at a different memory address in each program, so its code must work wherever it lands.",
    "- `gcc -shared -o libhello.so hello.o`: turn the object into a shared library (`.so` = shared object).",
    "- Optionally copy it into a system directory (`/usr/lib`, `/usr/local/lib`) and run `ldconfig`, so the system knows about it.",
    "- `gcc -o main main.c -L. -lhello`: link, exactly as in the static case.",
    "- `ldd main`: list the dynamic libraries `main` needs and where each was found. If you see “not found”, the program will not start."
  ],
  13: [
    "A dynamically linked program needs its libraries again **every time it starts**.",
    "- If the library is in a standard place (you ran `ldconfig`, and `ldd` finds it), just run `./main`.",
    "- If not, say where it is with `LD_LIBRARY_PATH`:",
    "    $ LD_LIBRARY_PATH=. ./main",
    "sets the variable for this one command only. Or, for the rest of the session:",
    "    $ export LD_LIBRARY_PATH=.",
    "    $ ./main",
    "(*rpath* on the slide: the list of directories searched for libraries when a program starts.)",
    "! `-L` helps the **linker**, at build time. `LD_LIBRARY_PATH` helps the **loader**, at run time. You often need both."
  ],
  14: [
    "The four options you will actually use:",
    "- `-o name`: the name of the output file.",
    "- `-Wall`: **W**arnings, **all**. The compiler points out suspicious code. Always use it.",
    "- `-g`: include debug information (line numbers, variable names) so that `gdb` can show your source.",
    "- `-O` + a number: how hard to optimize. `-O0` = not at all; `-O2` = the usual level for finished programs.",
    "For debugging, combine `-g -O0`: optimization rearranges the code, and the debugger then seems to jump around.",
    "    $ cc -g -O0 hello.c -o hello",
    "(The slide calls `-O2` the default. With gcc, giving no `-O` option at all actually means `-O0`.)"
  ],
  15: [
    "A debugger lets you stop a running program and look inside it. Three words to know:",
    "- **Breakpoint**: a place where execution must stop: a function, a line, even a single machine instruction. Once stopped, you can inspect the variables.",
    "- **Backtrace** (stack trace): the chain of function calls that led to the current point: `main()` called `decompress()`, which called `zip_decompress()`. It answers “how did I get here?”.",
    "- **Watchpoint**: stop when a **value changes**, wherever that happens in the code. It answers “who is modifying this variable?”.",
    "The standard debugger is `gdb`, the GNU Debugger."
  ],
  16: [
    "The basic gdb commands, in the order you normally use them:",
    "- `break main` or `break hello.c:10`: put a breakpoint at a function, or at a line of a file;",
    "- `run`: start the program. It runs until it reaches a breakpoint;",
    "- `next`: execute one line, then stop again;",
    "- `print x`: show the value of the variable `x`;",
    "- `continue`: run on, until the next breakpoint or the end;",
    "- `quit`: leave gdb.",
    "Also worth knowing: `backtrace` (or `bt`) shows the call chain, and `step` is like `next` but goes *into* function calls."
  ],
  17: [
    "A complete session (the slide's text is scrambled; this is the order):",
    "    $ cc -g -O0 hello.c -o hello",
    "    $ gdb hello",
    "    (gdb) break main",
    "    Breakpoint 1 at 0x546: file hello.c, line 5.",
    "    (gdb) run",
    "    Breakpoint 1, main () at hello.c:5",
    "    5    printf(\"Hello, World!\");",
    "    (gdb) next",
    "    Hello, World!",
    "    6    return 0;",
    "    (gdb) continue",
    "    Program exited normally.",
    "    (gdb) quit",
    "Compile with `-g`, set a breakpoint at `main`, run: gdb stops at line 5 **before** executing it. `next` executes it, so the text is printed. `continue` runs to the end."
  ],
  18: [
    "A real program consists of many source files, modules and libraries that depend on each other, so they must be built in the right order. Typing every compile command by hand does not scale.",
    "- The dependencies and the commands are written down once, in a file named **Makefile**.",
    "- The command `make` reads it and runs whatever is needed.",
    "- `make -f OtherName` uses a file with a different name.",
    "(A *compilation unit* is one source file, compiled separately.)"
  ],
  19: [
    "A Makefile is a list of **rules**. Each rule has three parts:",
    "    target: dependency1 dependency2",
    "    <TAB>commands",
    "- **target**: the file you want to produce;",
    "- **dependencies**: the files it is made from;",
    "- **commands**: how to make it.",
    "`make` compares modification times: if the target is missing, or **older than one of its dependencies**, it runs the commands. Otherwise it does nothing. That is the whole trick, and the reason only changed files are recompiled.",
    "Plain `make` builds the first target in the file, which by convention is called `all`.",
    "! The command line must begin with a real TAB character, not spaces. The error “missing separator” means exactly this."
  ],
  20: [
    "Three rules:",
    "    all: hello",
    "    hello: hello.c",
    "    <TAB>cc -o hello hello.c",
    "    clean:",
    "    <TAB>rm hello",
    "- `all` needs `hello` and has no commands of its own: it is just a name for “build everything”.",
    "- `hello` is made from `hello.c` by running `cc`.",
    "- `clean` depends on nothing; it deletes the result.",
    "So: `make` (same as `make all`) compiles; `make clean` deletes; `make hello` builds that one target.",
    "Run `make` twice in a row and the second time it says that `hello` is up to date, because `hello.c` has not changed."
  ],
  21: [
    "Shortcuts for use inside a rule's commands, so you do not repeat file names:",
    "- `$@`: the **target** (think “at”: where we are going);",
    "- `$^`: **all** the dependencies;",
    "- `$<`: the **first** dependency.",
    "Two more constructions:",
    "- `.c.o:` is a generic rule: “how to make any `.o` file from the `.c` file with the same name”. One rule covers every source file.",
    "- `$(VAR:old=new)`: the value of `VAR`, with the ending `old` replaced by `new`. `$(SRCS:.c=.o)` turns `a.c b.c` into `a.o b.o`."
  ],
  22: [
    "Everything together. The top defines variables; the rules below never mention a file name directly.",
    "- `PROG=hello`, `SRCS=hello.c`: the program and its sources.",
    "- `OBJS=$(SRCS:.c=.o)`: the object files, derived from the sources → `hello.o`.",
    "- `CC=cc`, `CFLAGS=-g -O0`: the compiler and its options.",
    "The rules:",
    "- `all: $(PROG)`: the default target is the program.",
    "- `$(PROG): $(OBJS)` with `$(CC) -o $@ $^ $(CFLAGS)`: **link**. `$@` is `hello`, `$^` is all the objects.",
    "- `.c.o:` with `$(CC) -c -o $@ $< $(CFLAGS)`: **compile** each `.c` into its `.o`.",
    "- `install`: copy the program into `~/bin`.",
    "- `clean`: delete the program and the objects. The `-` in front of `rm` tells make to carry on even if `rm` fails.",
    "To add a source file to the project you change one line: `SRCS`."
  ]
},

c11: {
  1: [
    "**Lecture 11 in one sentence:** how programs on different machines talk to each other: addresses, protocols, sockets, and the everyday protocols built on top of them (web and e-mail).",
    "This is the lecture with the most acronyms. Each is spelled out under the explanation, and they are all in the Glossary."
  ],
  2: [
    "First the concepts: what a network is, what a protocol is, what a socket is. Then concrete protocols: IP, TCP, UDP, DNS, HTTP and the e-mail ones."
  ],
  3: [
    "Networking is presented as one more kind of IPC, inter-process communication (lecture 4).",
    "- A **pipe** (`ls -l | more`) connects two processes **on the same machine**. The channel lives inside the kernel, which takes care of everything: order, waiting, delivery.",
    "- A **TCP/IP socket** connects two processes **on different machines**. Now the data crosses cables and intermediate machines; it can be delayed, lost or reordered. Both sides therefore need agreed rules for coping with that. Those rules are **protocols**.",
    "Either way it is message passing, not shared memory: two machines have no memory in common."
  ],
  4: [
    "A **network** is a set of computers, called **hosts** or nodes, that are linked together.",
    "- **Physical links**: the cables and radio channels.",
    "- **Logical link**: the *path* a message takes from source to destination, usually through several physical links and several machines in between.",
    "- Networks connect to other networks. The **Internet** is the worldwide network of public networks; an *intranet* is a private one.",
    "The “problems” bullet lists the algorithm questions that networks raise (finding the shortest path, for instance). It is there for context only."
  ],
  5: [
    "A **protocol** is an agreed set of rules for a conversation: who speaks first, what a message looks like, what to answer. If both sides follow the same protocol, they understand each other, whoever wrote their software.",
    "- Internet protocols are published as numbered documents called **RFC** (Request for Comments). “RFC 791” is the document that defines IP.",
    "- They are written by the **IETF** (Internet Engineering Task Force), an open community of engineers, under the umbrella of **ISOC** (the Internet Society).",
    "! A protocol is a **specification**, a description on paper. The programs that follow it are *implementations*, and there can be many."
  ],
  6: [
    "Networking is too complicated for one protocol, so it is split into **layers**, each solving one problem and relying on the layer below.",
    "The **OSI** model (Open Systems Interconnection) has 7 layers, from bottom to top:",
    "- 1 physical · 2 data link · 3 network · 4 transport · 5 session · 6 presentation · 7 application",
    "The model the Internet really uses (the “DoD” model, after the US Department of Defense that funded it) has 4, obtained by merging:",
    "- **link** = OSI 1 + 2 · **network** (IP) · **transport** (TCP, UDP) · **application** = OSI 5 + 6 + 7",
    "This is a **protocol stack**: when sending, each layer hands its data to the layer below, down to the wire; when receiving, the data climbs back up.",
    "A **socket** is the programmer's handle on all this: your program reads and writes a socket, and the transport layer and everything under it do the rest.",
    "! Mnemonic for the 7 layers, bottom to top: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way."
  ],
  7: [
    "Real protocols, placed on their layers. You do not need the details, just where each belongs:",
    "- **Data link** (inside a local network, LAN): Ethernet (the cable), Wireless (Wi-Fi), and the older Token Ring and ATM. CSMA/CD is Ethernet's rule for sharing one cable.",
    "- **Network**: IP. It gets a packet from one machine to another.",
    "- **Transport**: TCP, UDP, SCTP. They get data from one *program* to another.",
    "- **Session**: RPC (remote procedure call).",
    "- **Presentation**: XDR and ASN.1 (common data formats), encryption, compression.",
    "- **Application**: DNS (names), SMTP (sending mail), HTTP (web), FTP (file transfer), SSH (remote login)."
  ],
  8: [
    "**IP**, the Internet Protocol, gives every host an **address** and delivers packets from one address to another.",
    "- An **IPv4** address is 32 bits, written as 4 numbers from 0 to 255 separated by dots: `192.168.1.1`. Each number is one byte.",
    "- 32 bits give about 4 billion addresses, which is not enough. **IPv6** uses 128 bits. IPv4 is still the most common.",
    "- Some ranges are **private**: `10.x.x.x`, `172.16–31.x.x`, `192.168.x.x`. They work only inside a local network (your home router hands them out) and cannot be reached from the Internet: they are *non-routable*.",
    "- The rest are **public**, reachable from anywhere.",
    "Of the slide's examples, `192.168.1.1` and `10.0.0.1` are private; `8.8.8.8` is Google's public DNS server."
  ],
  9: [
    "**TCP** is the layer that makes the network look reliable. Its real name is *Transmission* Control Protocol (the slide title says Transport). The slide lists what the pair TCP/IP does, marking who does what:",
    "- **(TCP)** cuts a long message into **packets** and puts them back together on arrival;",
    "- **(TCP)** delivers them **in order**, even if they arrived mixed up;",
    "- **(IP)** **routes** each packet, going around machines that are down;",
    "- **(TCP)** **resends** packets that were lost or damaged;",
    "- **(TCP)** slows down when the network is **congested**.",
    "In short: IP gets packets to the right machine, with no promises. TCP adds the promises."
  ],
  10: [
    "People remember names, machines use numbers. **DNS**, the Domain Name System, translates one into the other: `fmi.unibuc.ro` → `193.226.51.6`.",
    "- If a server's IP address changes, its name stays the same and nobody notices.",
    "- In the beginning every machine kept its own list in the file `/etc/hosts`. (The file still exists and is consulted first.)",
    "- Today the list is shared: special hosts called **name servers** answer the question “what is the address of this name?”. At the top are the **root name servers**, from which the others get their information.",
    "Commands: `nslookup name` and `dig name` ask DNS for an address; `whois domain` shows who registered a domain."
  ],
  11: [
    "The picture shows the **client–server** model, the basis of almost every network service:",
    "- the **server** is a program that waits for requests and answers them;",
    "- a **client** is a program that sends a **request** and gets a **response**;",
    "- one server serves many clients at the same time.",
    "Your browser is a client, and the web site runs a server. The client always speaks first."
  ],
  12: [
    "An IP address finds the **machine**. But a machine runs many programs: which one is the message for? That is the job of the **port**, a number from 0 to 65535, like the flat number in a block of flats.",
    "- **address + port = endpoint**, written `193.226.51.6:80`.",
    "- Servers listen on **well-known ports**, so that clients know where to knock: 80 = web, 22 = SSH, 25 = mail. The file `/etc/services` has the full list.",
    "- The client's port is just a free number chosen by the OS.",
    "- A **socket** is the object a program uses for one endpoint. A **connection** is a pair of sockets plus the protocol:",
    "    <TCP, 192.168.1.6:4444, 193.226.51.6:80>",
    "= by TCP, from port 4444 on my machine, to port 80 (the web server) on 193.226.51.6."
  ],
  13: [
    "A **TCP socket** is like a phone call:",
    "- first a **connection** is set up between the two endpoints;",
    "- everything sent arrives, **complete and in order**; what gets lost is resent automatically.",
    "It behaves like a pipe: a continuous **stream of bytes** with no message boundaries. If one side sends “hello” and then “world”, the other may read “helloworld” in one go, or “hel” and then “loworld”.",
    "! With TCP, the program itself must decide where one message ends and the next begins, for example by ending each with a newline."
  ],
  14: [
    "A **UDP socket** is like dropping postcards in a letter box:",
    "- no connection; each message, called a **datagram**, travels on its own;",
    "- **no guarantees**: a datagram can be lost, duplicated, or arrive after one that was sent later, and nobody tells you;",
    "- but message boundaries are kept: one send = one receive, whole.",
    "Why use it? It is simple and fast, with no setup and no waiting for retransmissions. Good for DNS queries, video calls and games, where a late packet is useless anyway.",
    "! TCP = reliable, ordered, byte stream. UDP = unreliable, unordered, whole messages."
  ],
  15: [
    "Three tiny teaching services exist on many systems: **daytime** (sends the date as text), **echo** (sends back what you type) and **time**.",
    "- You can play the client by hand with `telnet host port`, which opens a plain TCP connection where what you type is sent and what arrives is shown.",
    "- On the server side, such small services are not separate daemons. One daemon, the **super-server** `inetd` (or the newer `xinetd`), listens on all their ports and starts the right little program when someone connects. That is what “multiplexes several services” means. Their settings are in `/etc/xinetd.d/`.",
    "- Servers are complicated and have configuration files; clients are simple and just take command-line arguments.",
    "- Services are started and stopped with `service` or `systemctl` (lecture 7)."
  ],
  16: [
    "The **World Wide Web** was created at CERN, the physics lab in Geneva, and made public in 1991.",
    "- Every resource has an address, the **URL** (Uniform Resource Locator): `protocol://host:port/path`.",
    "- Pages are **hypertext**: text containing links to other pages.",
    "- The protocol is **HTTP** (HyperText Transfer Protocol), on port **80**. Its encrypted version, **HTTPS**, uses port **443**.",
    "- If the port is left out, the default for the protocol is used, so `http://fmi.unibuc.ro` and `http://fmi.unibuc.ro:80` are the same address.",
    "From the terminal: `lynx` and `w3m` are text-mode browsers; `curl` and `wget` download a URL."
  ],
  17: [
    "HTTP is a text protocol, so you can speak it by hand:",
    "    $ telnet fmi.unibuc.ro 80",
    "    GET / HTTP/1.1",
    "    Host: fmi.unibuc.ro",
    "    (empty line)",
    "- `telnet … 80` opens a TCP connection to the web server's port.",
    "- `GET / HTTP/1.1` is the **request**: “give me the page `/`, I speak HTTP version 1.1”.",
    "- `Host:` says which web site you want, since one server may host several.",
    "- `<cr/lf>` on the slide means “press Enter”: carriage return + line feed, the two characters that end a line. The **empty line** tells the server that the request is complete.",
    "The server replies with a status line (`HTTP/1.1 200 OK`), some headers, and then the HTML of the page. A browser does exactly this."
  ],
  18: [
    "Two protocols for **reading** your mail from a mail server:",
    "- **POP** (Post Office Protocol): download the messages to your computer and delete them from the server. The mail then exists only on that device.",
    "- **IMAP** (Internet Message Access Protocol): the messages **stay on the server** and you work on them there. Every device sees the same mailbox. This is what everyone uses today.",
    "Ports: POP 110, IMAP 143. The encrypted versions (the final S = secure): POP3S 995, IMAPS 993.",
    "On disk, a mailbox is stored in one of two formats:",
    "- **mbox**: all the messages in one big file;",
    "- **maildir**: one file per message."
  ],
  19: [
    "**SMTP** is the protocol for **sending** mail, from your program to your server and from server to server. Its real name is Simple *Mail* Transfer Protocol; port 25.",
    "It dates from 1982, when everyone on the network trusted everyone else. It does not check who the sender is, and originally asked for no password. Hence:",
    "- **spam**: unwanted mass mail;",
    "- **spoofing**: mail that claims to come from somebody else.",
    "The fixes added since:",
    "- **reverse DNS**: look up the name of the sending IP address and see whether it fits;",
    "- **authentication** with user name and password, and encryption (SMTPS);",
    "- **SPF**: the domain publishes which servers are allowed to send its mail;",
    "- **DKIM**: the sending server signs every message;",
    "- **DMARC**: the domain says what to do with mail that fails those two checks;",
    "- blacklists of IP addresses known to send spam."
  ]
},

projects: {
  1: [
    "**The rules:** the project is worth up to 35 points and must be finished by the end of the semester. Everyone in the team gets the same score, but each member has to present their own part. Only **bash** and **awk** are allowed.",
    "Several topics ask for a “graphical interface”. That means text-mode menus in the terminal, made with `dialog` or `whiptail` (commands that draw boxes and menus) or the `ncurses` library.",
    "**1. LazyWGET** (2 students). `wget -r` downloads a web page and everything it links to, in one go. You rebuild that one level at a time: each run of `lwget` downloads only the *next* level of links. “Lazy” and “promises” mean: note what must be downloaded, and do it only when asked.",
    "**2. FIFO-Manpage-Server** starts here and continues on the next page."
  ],
  2: [
    "**2. FIFO-Manpage-Server** (2–3 students). A server script waits on a named pipe (FIFO, lecture 4). A client writes a request, “my PID is X, I want the manual page of command Y”. The server runs `man Y` and writes the answer into a second FIFO named after the client's PID (`/tmp/server-reply-1234`), so each client gets its own reply channel. The client shows the page with a menu for jumping between sections.",
    "**3. FIFO-RSHD** (2–3 students). The same plumbing, but the client sends any command to be executed (RSHD = remote shell daemon). A *master* server hands the requests to N *slave* servers in turn (**round-robin**: 1, 2, …, N, 1, 2, …), and the slave that ran the command sends the output back through the client's FIFO.",
    "**4. Watchdog** starts here: a script that keeps an eye on a list of processes."
  ],
  3: [
    "**4. Watchdog** (2 students), continued. It reads `top` in batch mode (one snapshot as text instead of the live screen), checks each watched process against limits (say 5% CPU, 1 GB of memory), kills or pauses the ones that exceed them, and restarts those that died. Signals from lecture 4 do the pausing and killing.",
    "**5. MySort** (2 students). Implement two sorting algorithms, Shell sort and Bitonic sort, as shell scripts for numbers, and compare their speed with the real `sort -n`.",
    "**6. SLCheck** (2 students). Walk through a directory tree and report **broken symbolic links**, those pointing to files that no longer exist (lecture 3). You must write the recursion yourself; `find` is not allowed.",
    "**7. PackageMonitor** starts here: tracking which software packages were installed and removed."
  ],
  4: [
    "**7. PackageMonitor** (2–3 students), continued. Ubuntu records every package installation and removal in `/var/log/dpkg.log`. A *monitor* script, started regularly by `cron` (lecture 8), reads that log and files the information in a directory per package. A *front-end* script answers questions: what is installed, what was removed, the history of one package. LRU (least recently used) is the rule for the “undo cache”: when it is full, the oldest entry is dropped.",
    "**8. PackageMonitorInotify** (2–3 students). The same, but instead of running periodically it reacts the moment the log file changes, using `inotify` through its commands (such as `inotifywait`).",
    "**9. AutomounterShell** (2 students). Write a small shell, `amsh`, whose `cd` mounts a file system automatically when you step into a directory listed in a config file similar to `/etc/fstab` (lectures 2 and 9)."
  ],
  5: [
    "**9. AutomounterShell**, continued: an automatically mounted file system is unmounted again after a set time (say 5 minutes) if no process is using it.",
    "**10. File&DiskUsageMonitor** (2 students). The `script` command records a terminal session into a file called `typescript`. Compare the `ls -l` and `df` outputs saved in such recordings at different times, and report which files appeared or disappeared and how disk usage changed.",
    "**11. File&DiskUsageMonitorInotify** (2 students). The same report, but watching the changes live with `inotify` instead of comparing recordings.",
    "**12. ProxyWebServer** starts here. A *proxy* is a go-between: the browser asks it for a page; it fetches the page with `wget`, keeps a copy (the *cache*) and serves that copy next time. A *cache miss* is a request for a page not yet in the cache."
  ],
  6: [
    "**12. ProxyWebServer** (2–3 students), continued. The cache is kept on a `tmpfs`, a file system in RAM (lecture 9), so it is fast and starts empty (“cold”) after every unmount. When it is full, the least recently used page is thrown out (LRU). *Prefetching* means also downloading the pages that a page links to, before anyone asks.",
    "**13. Pdsh/pdcp** (3 students). `pdsh` runs one command on many machines at once and `pdcp` copies a file to all of them. Write simplified versions on top of `ssh`, understanding node lists such as `foo[1-5]`. To test, create one virtual machine and clone it several times with a script.",
    "**14. NestedVMs** (3 students, the hardest) starts here: virtual machines that run inside other virtual machines.",
    "A *type-1 hypervisor* (xen, kvm) is virtualization software that works directly with the hardware, which makes it faster."
  ],
  7: [
    "**14. NestedVMs**, continued. You build a tree: the real machine hosts VM1 and VM2, and each of those hosts two more VMs inside it. Then:",
    "- **networking**: any VM must be able to `ping` any other, at whatever depth;",
    "- **firewall**: incoming traffic is limited to ICMP (what `ping` uses), port 22 (ssh) and port 80 (web);",
    "- **web servers** on every machine;",
    "- `scatter file dir`: copy a file from the current machine to every VM below it in the tree;",
    "- `gather file dir`: the reverse, collect every VM's copy of a file onto the current machine;",
    "- finally the web servers are chained, so that pages on the deepest VMs can be reached through the servers above them. The host machine becomes the single entrance, the *gateway*."
  ],
  8: [
    "A final tip for project 14. Nested virtual machines are slow unless the processor helps:",
    "- use a type-1 hypervisor (xen or kvm);",
    "- the CPU must support hardware virtualization and **SLAT** (Second Level Address Translation), a feature that makes memory access inside a VM fast.",
    "The command `kvm-ok` tells you whether your computer can do it. Check this **before** choosing the project."
  ]
}

});
