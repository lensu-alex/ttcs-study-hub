// Plain-language explanations shown next to each slide: lectures 4–6. Format: see notes-1.js.
window.TTCS_NOTES = Object.assign(window.TTCS_NOTES || {}, {

c4: {
  1: [
    "**Lecture 4 in one sentence:** the commands for finding things (`grep`, `find`), what a running program (a *process*) really is, and the ways processes talk to each other: pipes, FIFOs and signals."
  ],
  2: [
    "Four parts: the last file commands, then processes, then inter-process communication (IPC: how two running programs exchange data), then signals (how a process gets notified that something happened)."
  ],
  3: [
    "The everyday file commands in one place:",
    "- `mkdir` / `rmdir`: create / delete a directory (`rmdir` only if empty).",
    "- `touch f`: create an empty file if it does not exist yet.",
    "- `mv`: move or rename. Inside one disk nothing is copied, only the name changes place; data is copied only when moving to another disk.",
    "- `cp`: make a real second copy. `-r` (recursive) for a whole directory. With several files, the last argument is the destination directory.",
    "- `rm`: delete files; `rm -r` deletes a directory with everything in it.",
    "- `ln`: create a hard link, or a symbolic link with `-s`.",
    "- `mknod`: create a special file. In `mknod /dev/sda3 b 8 3`, `b` = block device, 8 and 3 = the major and minor numbers (which driver, which unit; lecture 9)."
  ],
  4: [
    "These symbols build **patterns**: descriptions of text to look for. They are the alphabet of *regular expressions*, used by `grep`, `sed` and `awk`.",
    "- `^` start of the line · `$` end of the line",
    "- an **atom** is one character, or a group in `[ ]` or `( )`",
    "- `*` the atom before it, 0 or more times · `+` 1 or more times · `?` 0 or 1 time",
    "Examples: `^d` = lines starting with d. `ab*c` matches ac, abc, abbc. `[0-9]+` = one or more digits.",
    "! Do not mix them up with the shell's own file-name wildcards, where `*` alone means “any text” and `?` means “any one character”: `ls *.c`. Same symbols, different rules. In a regular expression, “any text” is written `.*`."
  ],
  5: [
    "`grep pattern files` prints every **line** that matches the pattern. The name comes from “global regular expression print”.",
    "- `-r` search through a whole directory tree · `-i` ignore upper/lower case · `-n` show line numbers",
    "- `-w` match whole words only · `-v` in**v**ert: show the lines that do *not* match",
    "The examples:",
    "- `grep printf *.c`: the lines containing “printf” in all `.c` files. (Here `*.c` is expanded by the shell, before grep even starts.)",
    "- `grep -v -w printf *.[ch]`: the lines that do **not** contain the word printf, in `.c` and `.h` files.",
    "- `ls -l | grep ^d`: of the long listing, keep the lines that start with `d`, meaning only the directories."
  ],
  6: [
    "`grep` searches *inside* files; `find` searches **for** files, walking down a directory tree.",
    "    $ find <where> -name <pattern>",
    "- `-name` match the file name · `-iname` the same, ignoring case",
    "- `-type f` only files, `-type d` only directories · `-maxdepth 2` do not go deeper than 2 levels",
    "- `-exec cmd {} \\;` run a command on every file found. `{}` is replaced by the file's name and `\\;` marks the end of the command.",
    "The examples:",
    "- `find / -name hello`: look for something called “hello” on the whole system.",
    "- `find . -iname \\*.o -exec rm {} \\;`: delete every `.o` file under the current directory.",
    "The backslashes stop the shell from interpreting `*` and `;` itself, so they reach `find` untouched."
  ],
  7: [
    "A **program** is a file on disk. A **process** is that program *running*: its code loaded in memory, plus its current state (the values of its variables and of the CPU registers).",
    "- Each process has a number, the **PID** (process ID). `ps` lists them.",
    "- Start the same program twice and you get two separate processes with two PIDs.",
    "- Inside one process, instructions run one after another, never two at once.",
    "A process's memory has four areas:",
    "- **text**: the program's code;",
    "- **data**: global variables (initialized and uninitialized);",
    "- **stack**: temporary data of function calls: parameters, return addresses, local variables;",
    "- **heap**: memory the program asks for while running (`malloc` in C)."
  ],
  8: [
    "The same four areas, drawn as the process's memory from low addresses (bottom) to high (top), with a small C program showing what goes where:",
    "- **text** (bottom): the machine code of `main`.",
    "- **initialized data**: `int y = 15;`, a global that has a starting value.",
    "- **uninitialized data**: `int x;`, a global with no starting value.",
    "- **heap**: the block returned by `malloc`. It grows **upwards**; its current end is called the *program break*.",
    "- **stack**: the local variables `values` and `i`. It grows **downwards**; its current top is the *stack pointer*.",
    "- at the very top: the command-line arguments (`argc`, `argv`) and the environment variables.",
    "The empty space in the middle is what heap and stack grow into, from opposite sides."
  ],
  9: [
    "A process is either **independent** (it neither affects nor is affected by others) or **cooperating**.",
    "Why would processes cooperate?",
    "- **information sharing**: several need the same data;",
    "- **computation speedup**: split a job into parts that run at the same time;",
    "- **modularity**: build a system from small separate pieces;",
    "- **convenience**: you edit, compile and listen to music at once.",
    "Cooperating needs a way to exchange data: **IPC**, inter-process communication. There are two models: **shared memory** and **message passing**."
  ],
  10: [
    "The two models side by side:",
    "- **(a) Shared memory**: a piece of memory is visible to both process A and process B. One writes into it, the other reads. The kernel only sets it up; after that the processes talk directly. Fast, but they must take care not to trample each other's data.",
    "- **(b) Message passing**: A hands a message to the kernel, which puts it in a queue (m0, m1, …) and delivers it to B. Slower, since every message goes through the kernel, but simpler and safer. It also works between different machines.",
    "A Unix pipe is message passing; so is everything on a network."
  ],
  11: [
    "In message passing the processes share no variables. There are only two operations:",
    "- `send(message)`",
    "- `receive(message)`",
    "Messages can all have one fixed size (easy for the system, awkward for the programmer) or a variable size (the reverse)."
  ],
  12: [
    "How does a message know where to go?",
    "- **Direct**: you name the other process. `send(P, msg)` = send to process P; `receive(Q, msg)` = receive from process Q. Both sides must know each other.",
    "- **Indirect**: you name a **mailbox** (also called a *port*), a kind of shared letter box with its own ID. `send(A, msg)` drops a message into mailbox A; whoever does `receive(A, msg)` picks it up. The two processes do not need to know each other, only the mailbox.",
    "You will see this idea again: a named FIFO, and later a network port, are mailboxes."
  ],
  13: [
    "What happens while a message is on its way?",
    "- **Blocking** (synchronous): the caller **waits**. A blocking `send` waits until the message has been received; a blocking `receive` waits until a message arrives.",
    "- **Non-blocking** (asynchronous): the caller **does not wait**. `send` returns at once; `receive` returns either a message or “nothing yet” (null).",
    "If both sides block, sender and receiver meet at the exact moment of the hand-over. That is called a **rendez-vous**."
  ],
  14: [
    "Unix's message passing tools are pipes. FIFO = first in, first out: bytes come out in the order they went in.",
    "- **Anonymous pipe**, the `|` of the shell: `cat hello.c | grep printf`. It has no name, goes one way only, and connects processes that were started together.",
    "- **Named pipe (FIFO)**: a special *file* that works like a pipe. Because it has a name, two unrelated programs can use it; they only need to know the name (indirect communication, like a mailbox).",
    "The example:",
    "    $ mkfifo myfifo          # create it (same as: mknod myfifo p)",
    "    $ cat < myfifo &         # a reader waits in the background",
    "    $ echo \"hello\" > myfifo  # a writer sends; the reader prints it",
    "A FIFO needs both ends: a writer waits until some reader has opened it, which is why the reader is started first."
  ],
  15: [
    "A **signal** is a short notification delivered to a process: “this event just happened”. It is *asynchronous*: it can arrive at any moment, whatever the process is doing. Think of a tap on the shoulder.",
    "Who sends signals?",
    "- another process, with the system call `kill(pid, signal)` or the command `kill -TERM <pid>`;",
    "- you, from the keyboard: Ctrl-C, Ctrl-Z;",
    "- the kernel, when something happens:",
    "- **SIGCHLD**: a child process has ended (sent to its parent);",
    "- **SIGFPE**: arithmetic error, such as dividing by zero;",
    "- **SIGSEGV**: the program touched memory it does not own, the “Segmentation fault”.",
    "(HW/SW on the slide = hardware/software. Despite its name, `kill` sends *any* signal, not only deadly ones.)"
  ],
  16: [
    "When a signal arrives, one of three things happens, depending on the signal and on what the program has arranged:",
    "- **1. Ignored**: nothing happens. The default for harmless events.",
    "- **2. The process is terminated**: the default for most signals.",
    "- **3. Caught**: the program has registered a function, a **handler**, and that function runs.",
    "Two signals can be neither caught nor ignored: **SIGKILL** (always ends the process) and **SIGSTOP** (always pauses it). They are the system's guarantee that any process can be stopped.",
    "    $ kill -KILL <pid>     # the same as: kill -9 <pid>",
    "! Try plain `kill` first: it lets the program clean up. `kill -9` is the last resort."
  ],
  17: [
    "Using `kill`: first find the PID with `ps`, then:",
    "    $ kill -TERM 4899     # the same as: kill 4899, or kill -15 4899",
    "- A signal can be given by name with or without the “SIG” prefix (`SIGTERM`, `TERM`) or by its number (15).",
    "- SIGTERM is what `kill` sends when you name no signal: the polite “please exit”.",
    "- `kill -l` lists every signal; `kill -l 15` tells you the name of number 15."
  ],
  18: [
    "The two signals you send every day from the keyboard:",
    "- **Ctrl-C → SIGINT** (interrupt, number 2). Normally ends the program. A program may catch it and do something else instead, so Ctrl-C is not guaranteed to kill.",
    "- **Ctrl-Z → SIGTSTP** (terminal stop, number 20). Pauses the program. Continue it later with `fg` or `bg` (job control, lecture 3).",
    "The `kill` lines on the slide do the same thing from another terminal.",
    "! Numbers worth knowing: 2 = INT, 9 = KILL, 15 = TERM, 20 = TSTP."
  ]
},

c5: {
  1: [
    "**Lecture 5 in one sentence:** how to write programs in the shell's own language: variables, tests, `if`, loops and functions.",
    "This is the lecture the project depends on, since projects must be written only in bash or awk."
  ],
  2: [
    "The order: what a script is, variables, how to test a condition, `if` and `case`, the loops (`while`, `until`, `for`), and functions."
  ],
  3: [
    "Why write scripts at all?",
    "- To give **one name** to a sequence of commands you keep typing.",
    "- A script is mostly made of commands (copy this, start that), with a little logic around them.",
    "- Short programs are quick to write: no compiling.",
    "- The operating system itself uses scripts to start and stop its services (lecture 7).",
    "- **Portability**: the same script should run on other machines too, which is what makes it useful for administration."
  ],
  4: [
    "The main shells:",
    "- `sh`, the **Bourne shell**: the oldest, with few features, but present on every Unix at `/bin/sh`. Write for `sh` when the script must run anywhere.",
    "- `csh`, the **C shell**: its syntax imitates the C language.",
    "- `ksh`, the **Korn shell**: built on `sh`, with ideas borrowed from `csh`.",
    "- `bash`, the **Bourne Again shell**: the most common today. It has many extras, and a script that uses them will not run under plain `sh`: that is the “lack of portability”.",
    "! Notation used from here on: `sh(1)` means “the command sh, described in section 1 of the manual”. Read it with `man 1 sh`. Section 1 = commands, section 3 = C functions."
  ],
  5: [
    "A shell variable is created just by assigning to it:",
    "    $ x=1",
    "    $ echo $x",
    "    1",
    "- **No spaces** around `=`. `x = 1` is read as “run the command `x` with the arguments `=` and `1`”.",
    "- To use the value, put `$` in front of the name.",
    "- Such a variable is **local**: it exists only in this shell, not in the programs it starts. By convention local variables are written in lowercase."
  ],
  6: [
    "**Environment variables** are the ones handed down to every program the shell starts (its *child processes*). They carry system-wide settings:",
    "- `HOME` your home directory · `PATH` the directories searched for commands · `SHELL` your default shell",
    "- `EDITOR` your preferred text editor · `LANG` your language, e.g. `ro_RO.UTF-8` (Romanian as used in Romania, UTF-8 text encoding)",
    "Commands:",
    "- `env`: print all of them;",
    "- `export V=2`: create one (or turn an existing variable into one);",
    "- `printenv V`: print one."
  ],
  7: [
    "The difference, shown by starting a second shell inside the first (`bash` starts a child process):",
    "- **Local**: after `V=2`, the child shell prints an empty line for `echo $V`. The variable was not passed down.",
    "- **Environment**: after `export V`, the child shell prints `2`. It received a copy.",
    "! `export` = “also give this variable to the programs I start”. Without it, a variable stays private to the current shell."
  ],
  8: [
    "Two constructions that are replaced by a computed value:",
    "- `$(command)`: **command substitution**. The command runs, and its output is put in that place. `x=$(pwd)` stores the current directory in `x`.",
    "- `$((expression))`: **arithmetic**. `echo $((1+1))` prints 2. Inside, variable names work without `$`.",
    "The tricky lines at the end, starting from `x=1`:",
    "- `$((x<1))` → 0. A comparison gives 1 for true and 0 for false.",
    "- `$((x++))` → 1, and *then* x becomes 2 (use first, increase after).",
    "- `$((x++))` → 2, and then x becomes 3.",
    "- `$((++x))` → 4 (increase first, then use).",
    "That is the “side effects” remark: evaluating the expression also changes `x`."
  ],
  9: [
    "Quotes decide how much of a string the shell interprets:",
    "- **Single quotes** `'…'`: nothing is interpreted. `echo 'I have $x'` prints the characters `$x` as they are.",
    "- **Double quotes** `\"…\"`: variables and commands are still replaced, everything else is literal. `echo \"$USER has home in $HOME\"` prints `student has home in /home/student`.",
    "Inside double quotes only three characters stay special: `$`, the back quote, and the backslash `\\`.",
    "! Rule of thumb: use double quotes around variables (`\"$file\"`) so that names with spaces survive; use single quotes when you want the text exactly as typed."
  ],
  10: [
    "**Back quotes** are the old way of writing command substitution. These two lines do the same thing:",
    "    $ echo \"Today is `date`\"",
    "    $ echo \"Today is $(date)\"",
    "The command `date` runs and its output replaces it, giving `Today is Wed May 2 18:00:08 EEST 2018`.",
    "Prefer `$( )`: it is easier to read and can be nested. You still need to recognise back quotes, because old scripts and these slides use them."
  ],
  11: [
    "The same slide as in lecture 3, repeated because scripts are built from these:",
    "- `a | b`: pipeline, output of `a` into `b`; `|&` also sends the error messages.",
    "- `a ; b`: one after the other.",
    "- `a && b`: `b` only if `a` succeeded.",
    "- `a || b`: `b` only if `a` failed.",
    "- `$?`: the exit status of the last command, 0 = success.",
    "`&&` and `||` are the shortest way to write a condition: `mkdir d && cd d`."
  ],
  12: [
    "Reading the examples:",
    "- `ls -lR | tee files.lst | wc -l`: list everything recursively; `tee` saves a copy in `files.lst` *and* passes it on; `wc -l` counts the lines.",
    "- `ls -lR $(pwd) > files.lst; wc -l files.lst`: the same in two steps: write the list to a file, then count its lines.",
    "- `mkdir acte && mv *.docx acte/`: move the documents **only if** the directory could be created.",
    "- `chsh 2>/dev/null && grep $(whoami) /etc/passwd || echo \"chsh failed!\"`: try to change the login shell, throwing error messages away (`2>/dev/null`). If it worked, show my line of `/etc/passwd`; otherwise print a message.",
    "The pattern `A && B || C` works like “if A then B else C”. (The slide writes `$(pwd)` and `$(whoami)` with back quotes; it is the same thing.)"
  ],
  13: [
    "A **script** is a text file containing commands, exactly as you would type them.",
    "- It is not compiled. A program called an **interpreter** reads the file and executes it line by line.",
    "- A **compiler**, by contrast, first translates the whole source into machine code (lecture 10).",
    "The shells are interpreters, and so are perl, ruby, python, sed and awk."
  ],
  14: [
    "The first line of a script says which interpreter must run it. It starts with `#!` (called the *shebang*) followed by the interpreter's full path:",
    "    #!/bin/sh",
    "    #!/usr/bin/python",
    "The interpreter may be installed in different places on different systems. The portable form asks `env` to find it through `PATH`:",
    "    #!/usr/bin/env python",
    "Anywhere else in the script, `#` starts a comment: the rest of the line is ignored."
  ],
  15: [
    "The full recipe for a script:",
    "- **1. Write it** in a file, here `hello.sh`: the `#!/bin/sh` line, a comment, and `echo \"Hello, $USER!\"`.",
    "- **2. Make it executable**: `chmod +x hello.sh`.",
    "- **3. Run it**: `./hello.sh`. The `./` is needed because the current directory is not in `PATH`.",
    "The alternative `sh hello.sh` gives the file to the interpreter directly, so it needs no execute permission (and ignores the `#!` line)."
  ],
  16: [
    "Variables the shell fills in for every script:",
    "- `$1`, `$2`, …: the arguments, in order. From the tenth on, use braces: `${10}`.",
    "- `$0`: the name of the script itself.",
    "- `$#`: how many arguments were given.",
    "- `$*` and `$@`: all the arguments. The difference shows inside double quotes: `\"$*\"` is one single string, `\"$@\"` keeps each argument separate. Use `\"$@\"`.",
    "- `$?`: exit status of the last command.",
    "- `$$`: the process ID of the script itself.",
    "- `$!`: the process ID of the last command started in the background with `&`. (The slide's wording, “suspended”, is not exact.)",
    "- `shift` throws away `$1` and moves the rest down: `$2` becomes `$1`, and so on."
  ],
  17: [
    "Two versions of a script that adds two numbers:",
    "    #!/bin/sh",
    "    echo $(($1+$2))",
    "Called as `sh add.sh 1 2`, it prints `3`: `$1` is 1, `$2` is 2, and `$(( ))` does the sum.",
    "The variant `add2.sh` shows `shift`:",
    "    sum=$1",
    "    shift",
    "    echo $(($sum + $1))",
    "It saves the first argument, shifts, and now `$1` is what used to be the second argument. Same result."
  ],
  18: [
    "A script that copies a file while turning capitals into small letters:",
    "    #!/bin/sh",
    "    tr '[A-Z]' '[a-z]' < $1 > $2",
    "- `tr` (translate) replaces each character of the first set by the matching one of the second (lecture 6).",
    "- `< $1`: read from the file given as first argument; `> $2`: write to the file given as second argument.",
    "So `./tolower.sh screaming.txt decent.txt` turns “WHERE ARE YOU?” into “where are you?”.",
    "`tolower(3)` is the C function that does this for one character; the `(3)` is its manual section."
  ],
  19: [
    "A table of contents for the rest of the lecture. Scripts get the same building blocks as any language:",
    "- **conditions**: `if`, `test` (also written `[ ]`), `case`;",
    "- **loops**: `for`, `while`, `until`;",
    "- **comparisons**: `-ne` (not equal), `-lt` (less than), `-gt` (greater than);",
    "- **functions**;",
    "- **ways out**: `break` (leave a loop), `continue` (next round), `return` (leave a function), `exit` (end the script)."
  ],
  20: [
    "The shape of an `if`:",
    "    if test-command",
    "    then",
    "        commands",
    "    elif other-test",
    "    then",
    "        commands",
    "    else",
    "        commands",
    "    fi",
    "- The condition is **a command**. `if` runs it and looks at its exit status: 0 → true, take the `then` branch; anything else → false.",
    "- `elif` = else if. `fi` (“if” backwards) closes the block.",
    "! There is no true/false type in the shell. “True” simply means “the command succeeded”."
  ],
  21: [
    "A script called as `./text.sh WORD FILE`: is the word in the file? If not, add it.",
    "    if grep \"$1\" $2 > /dev/null",
    "    then echo \"$1 found in file $2\"",
    "    else echo \"$1 not found in file $2, appending\"",
    "         echo \"$1\" >> $2",
    "    fi",
    "- `grep` succeeds (exit status 0) when it finds the text, so it can be used directly as the condition.",
    "- `> /dev/null` throws grep's output away; we only want its yes/no answer.",
    "- `>> $2` appends the word to the end of the file.",
    "In the run on the slide, “who” was not in `decent.txt`, so it was appended."
  ],
  22: [
    "Often the condition is not “did this command work” but “is this number bigger” or “does this file exist”. The command `test` answers such questions through its exit status.",
    "- `test expr` and `[ expr ]` are the same thing. `[` is really a command name, which is why the **spaces** after `[` and before `]` are required.",
    "- Combine with `-a` (and), `-o` (or), `!` (not): `[ $x -gt 0 -a $x -lt 10 ]`.",
    "`type [` asks the shell what `[` is; the answer shows that it is built in."
  ],
  23: [
    "Comparing **numbers** uses letter codes, because `<` and `>` already mean redirection:",
    "- `-eq` equal · `-ne` not equal",
    "- `-gt` greater than · `-ge` greater or equal",
    "- `-lt` less than · `-le` less or equal",
    "Example: `if [ $# -lt 2 ]; then echo \"need two arguments\"; fi`"
  ],
  24: [
    "Comparing **strings**:",
    "- `[ -z \"$s\" ]`: true if the string is empty (**z**ero length);",
    "- `[ -n \"$s\" ]`: true if it is **n**ot empty; `[ \"$s\" ]` means the same;",
    "- `[ \"$a\" = \"$b\" ]`: the same text (`==` also works in bash);",
    "- `[ \"$a\" != \"$b\" ]`: different text.",
    "! `=` compares text, `-eq` compares numbers. `[ 07 = 7 ]` is false, `[ 07 -eq 7 ]` is true."
  ],
  25: [
    "Questions about **files**:",
    "- `-e path`: does it **e**xist?",
    "- `-f path`: is it a regular **f**ile? · `-d path`: is it a **d**irectory?",
    "- `-r`, `-w`, `-x`: am I allowed to **r**ead, **w**rite, e**x**ecute it?",
    "Example: `[ -d backup ] || mkdir backup` creates the directory only if it is missing."
  ],
  26: [
    "`while` repeats a block **as long as the command succeeds**:",
    "    while cmd",
    "    do",
    "        commands",
    "    done",
    "The command is usually a test: `while [ $i -le 10 ]`. To write it on one line, put `;` where the line breaks were."
  ],
  27: [
    "Counting from 1 to 10:",
    "    i=1",
    "    while [ $i -le 10 ]",
    "    do",
    "        echo \"$i\"",
    "        i=$(($i+1))",
    "    done",
    "Start at 1; while `i` is less than or equal to 10, print it and add 1. The line `i=$(($i+1))` is the shell's way of writing `i = i + 1`. Forget it and the loop never ends."
  ],
  28: [
    "`until` is `while` turned around: it repeats **as long as the command fails**, and stops when it succeeds.",
    "    until cmd",
    "    do",
    "        commands",
    "    done",
    "Example: `until ping -c 1 server; do sleep 5; done` keeps trying every 5 seconds until the server answers."
  ],
  29: [
    "`for` takes a **list of words** and runs the block once for each:",
    "    for var in a b c",
    "    do",
    "        echo $var",
    "    done",
    "`var` is first `a`, then `b`, then `c`. The list is usually produced by something: a file pattern (`*.txt`), the arguments (`\"$@\"`), or a command (`$(ls)`)."
  ],
  30: [
    "Compiling every C file in the current directory:",
    "    for f in *.c",
    "    do",
    "        echo \"$f\"",
    "        cc $f -o \"$f.out\"",
    "    done",
    "The shell replaces `*.c` by the list of matching files, and `f` takes each name in turn. `cc` is the C compiler; `-o` names the result, so `hello.c` is compiled into `hello.c.out`."
  ],
  31: [
    "bash also accepts the C-style loop with a counter:",
    "    for (( i=1; i<=10; i++ ))",
    "    do",
    "        echo $i",
    "    done",
    "Start value; condition; step. It prints 1 to 10.",
    "It is **not portable**: plain `sh` does not understand it. In a script that must run everywhere, use the `while` loop from slide 27."
  ],
  32: [
    "`case` compares one value against several patterns and runs the first branch that matches. It is the shell's `switch`.",
    "    case $var in",
    "        pattern1) commands ;;",
    "        pattern2) commands ;;",
    "        *)        default commands ;;",
    "    esac",
    "- Each branch ends with `;;`.",
    "- `*` matches anything, so it serves as the default branch.",
    "- `esac` (“case” backwards) closes the block.",
    "Patterns use the shell's file-name wildcards: `*.txt)`, `[yY]*)`, `a|b)`."
  ],
  33: [
    "The example reads a word from the keyboard and answers according to it:",
    "- `read input_string` waits for you to type a line and stores it in the variable.",
    "- `hi)` → an English answer; `salut)` → two `echo` lines (a branch may hold several commands); `moin)` → a German answer.",
    "- `*)` catches everything else: “Sorry, I don't understand!”."
  ],
  34: [
    "A shell function is a named group of commands. It cannot hand back a value the way a C function does. The ways to get a result out:",
    "- **change a global variable** inside the function;",
    "- **print the result** to stdout and let the caller capture it: `result=$(myfunc 5)`;",
    "- `return n`: ends the function with exit status `n`, a small number meant for success/failure and read with `$?`;",
    "- `exit` ends the **whole script**, not just the function.",
    "A function's arguments arrive as `$1`, `$2`, …, like a script's. It cannot change the caller's arguments, but it can change any other variable.",
    "(`var=$(expr …)` on the slide: `expr` is an old command that does arithmetic.)"
  ],
  35: [
    "A complete example. `add_host` appends one line (address, name, aliases) to a hosts file.",
    "- Inside the function, `$1` and `$2` are **the function's** arguments: the address and the host name.",
    "- `shift; shift` drops those two, so `$@` now holds whatever is left: the aliases.",
    "- The `echo … >> $hostfile` line appends to the file named by the global variable `hostfile`.",
    "- The script proper starts below the function: `hostfile=$1` is the **script's** first argument.",
    "As the note says: the function is only *defined* when the shell reads it; it runs when it is called, twice here."
  ],
  36: [
    "In the shell **all variables are global**, even those created inside a function. Only the positional parameters `$1`, `$2`, `$@` belong to each function call.",
    "Follow `./scope.sh 1 2 3`:",
    "- `script arguments are 1 2 3`: here `$@` is the script's arguments.",
    "- `a is 11`.",
    "- `somefn first string next` prints `Function call parameters are first string next`: inside the function, `$@` is the function's own arguments.",
    "- The function sets `a=10`, and afterwards the script prints `a is 10`: the function changed the script's variable.",
    "(bash has the keyword `local` to make a variable private to a function; plain `sh` does not.)"
  ],
  37: [
    "A function may call itself. Factorial: n! = n × (n−1)!, and 1! = 1.",
    "- If `$1` is greater than 1: compute `prev` = n − 1, call `factorial` on it and capture what it prints, multiply, and print the product.",
    "- Otherwise print 1.",
    "Details that confuse:",
    "- The back quotes around `factorial $prev` capture the function's printed output (same as `$( )`). That is how the “return value” travels.",
    "- `expr $1 \\* $rec`: the `*` is escaped, otherwise the shell would replace it with the list of files.",
    "- `echo -n` prints without a final newline, so you type the number on the same line."
  ],
  38: [
    "A **function library** is a file containing only function and variable definitions, meant to be loaded by other scripts.",
    "- It has **no** `#!` line, because it is never run on its own.",
    "- A script loads it with `source file` or the short form `. file`. That executes the file *inside the current shell*, so its functions and variables become available.",
    "In the example, `libcall.sh` loads `renamelib.sh` and can then use the variable `MSG` and the function `rename`.",
    "(If you ran the library as a normal command instead, it would execute in a separate process and its definitions would be lost when that process ended.)"
  ],
  39: [
    "A function reporting failure through its return code:",
    "- Inside `add_host`: `if [ \"$#\" -eq \"0\" ]; then return 1; fi`. If it was called with no arguments, stop and report 1.",
    "- The script calls `add_host` with no arguments, then saves the code: `RET_CODE=$?`.",
    "- It tests the code and prints an error message.",
    "! Save `$?` in a variable immediately. Every command overwrites it, even an `echo`."
  ],
  40: [
    "`read` takes one line from the keyboard (stdin) and stores it in variables:",
    "- `read x y`: the first word goes to `x`, the rest of the line to `y`. Typing `1 2` gives x=1, y=2.",
    "- `read` with no variable name stores the whole line in `$REPLY`.",
    "The standard way to process a file line by line:",
    "    cat foo.txt | while read LINE; do echo $LINE; done",
    "`read` succeeds as long as there is another line and fails at the end of the file, which ends the `while`."
  ],
  41: [
    "To see what a script really does, run it with `-x`:",
    "    $ sh -x tolower.sh screaming.txt decent.txt",
    "The shell prints each command just before executing it, prefixed with `+`, **after** variables have been replaced. You can see that `$1` became `screaming.txt`.",
    "When a script misbehaves, this is the first thing to try. Inside a script, `set -x` switches the same mode on from that line onward."
  ]
},

c6: {
  1: [
    "**Lecture 6 in one sentence:** the small tools that cut, glue and rewrite text (`cut`, `paste`, `split`, `join`, `tr`, `sed`, `awk`), plus the calculator `bc`.",
    "Each does one simple job. Their power comes from chaining them with pipes."
  ],
  2: [
    "A “filter” is a program that reads text, changes it, and prints the result. The lecture goes from the simplest filters to the two that are small programming languages: `sed` (automatic editing) and `awk` (automatic processing)."
  ],
  3: [
    "The words used in the whole lecture:",
    "- **Filter**: a program placed in the middle of a pipeline, `cmd1 | filter | cmd2`. It reads text, transforms it, passes it on.",
    "- **Line**: text up to a newline character (`\\n`).",
    "- **Field**: one piece of data inside a line, one “column”.",
    "- **Separator** (delimiter): the character between fields: a space, a tab, a `:`.",
    "Example: in the line `Popescu Ana 141 A` the separator is a space and there are four fields: surname, first name, group, series."
  ],
  4: [
    "`cut` keeps only **some columns** of every line. You say which with a list such as `1,3` or `2-5`:",
    "- `-f list`: **f**ields. With `-d` you give the delimiter; without it, the delimiter is a tab.",
    "- `-c list`: **c**haracter positions.",
    "- `-b list`: **b**yte positions.",
    "- `-s`: skip lines that do not contain the delimiter at all.",
    "The square brackets in the “invocation forms” mark optional parts; you do not type them.",
    "The `(1)` in `cut(1)` is the manual section: `man 1 cut`."
  ],
  5: [
    "    $ cut -d: -f 1,7 /etc/passwd",
    "Every line of `/etc/passwd` describes one user, in 7 fields separated by `:`. Field 1 is the user name and field 7 is the user's shell.",
    "So: “the delimiter is `:`, keep fields 1 and 7”. Result: `paul:/bin/ksh`.",
    "`/sbin/nologin` as a shell marks a service account that nobody can log in to."
  ],
  6: [
    "    $ who | cut -c1-8,18-30",
    "`who` lists the users logged in, in neat fixed-width columns: name, terminal, login time. Here there is no reliable separator, so the columns are picked by **character position**: characters 1–8 (the name) and 18–30 (the date).",
    "Use `-f` when a separator exists, `-c` when the columns are aligned by position."
  ],
  7: [
    "`paste` glues files **side by side**: line 1 of each file becomes one output line, then line 2 of each, and so on. The pieces are separated by a tab.",
    "- `-d list`: use other separator characters instead of the tab.",
    "- `-s` (serial): glue all the lines of **one file** into a single line, then do the same for the next file.",
    "- `-` in place of a file name means “read standard input”.",
    "`cut` takes columns apart; `paste` puts them together."
  ],
  8: [
    "Two files with three lines each: first names and last names.",
    "- `paste firstnames.txt lastnames.txt` puts them side by side:",
    "    Paul    Irofti",
    "    Alex    Alexandrescu",
    "    Ana     Popescu",
    "- `paste -s firstnames.txt lastnames.txt` turns each file into one line:",
    "    Paul    Alex    Ana",
    "    Irofti  Alexandrescu    Popescu",
    "(In the `echo` lines, `\\n` stands for a newline, which is how three lines are written with one command.)"
  ],
  9: [
    "Two tricks with `-`, which means “standard input”:",
    "- `ls | paste - - -`: three dashes = read stdin three times per output line. The first name goes in column 1, the next in column 2, the next in column 3, then a new line starts. Result: the list in three columns.",
    "- `find / -name bin -type d | paste -s -d : -`: find every directory called `bin`, then join all those lines into **one line** (`-s`) separated by `:` (`-d :`). The result looks just like a `PATH` value."
  ],
  10: [
    "`split` cuts one big file into several smaller ones.",
    "- Default: pieces of 1000 lines, named `xaa`, `xab`, `xac`, …",
    "- `-l n`: pieces of `n` lines · `-b n`: pieces of `n` bytes",
    "- `-a n`: how many letters the ending has (default 2: aa, ab, …)",
    "- a last argument replaces the `x` at the start of the names.",
    "To put the pieces back together: `cat xa* > whole`."
  ],
  11: [
    "A 362-line file (`wc -l` counts lines) split into pieces of 100 lines:",
    "    $ split -l 100 fisier.tex",
    "gives `xaa`, `xab`, `xac` with 100 lines each and `xad` with the remaining 62.",
    "    $ split -a 1 -l 100 fisier.tex fisier",
    "does the same, with the prefix `fisier` and a one-letter ending: `fisiera`, `fisierb`, …",
    "(“fisier” is Romanian for “file”. `.tex` is a LaTeX document.)"
  ],
  12: [
    "`join` merges two files **by a common key**, like matching rows of two tables. If both files have a line with the same first field, the output is one line: the key, then the rest of both lines.",
    "- `-1 n` / `-2 n`: which field is the key in file 1 / file 2 (default: the first).",
    "- `-a 1`: also print the lines of file 1 that found no partner.",
    "Both files must be **sorted** by the key, or lines will be missed."
  ],
  13: [
    "`age.txt` has Paul 33, Alex 40, Ann 25. `income.txt` has Paul 3000, Ann 4500.",
    "    $ join age.txt income.txt",
    "    Paul 33 3000",
    "    Ann 25 4500",
    "Alex is missing because he has no line in the second file.",
    "    $ join -a1 age.txt income.txt",
    "also prints the unpaired lines of file 1, so `Alex 40` appears, without an income."
  ],
  14: [
    "`bc` (basic calculator) is a calculator you can use in pipelines. The shell's `$(( ))` only knows whole numbers; for anything with decimals you call `bc`.",
    "- `-l`: load the math library and work with 20 decimals. Without it, `1/3` gives `0`.",
    "- `-e expr`: evaluate the expression given on the command line.",
    "- With no input, it starts its own prompt and waits for you to type expressions.",
    "It is a small language of its own, with variables and `while`.",
    "POSIX is the standard describing what every Unix must provide; “not specified by POSIX” means “may be missing on some systems”."
  ],
  15: [
    "The math functions available with `bc -l`. The names are single letters:",
    "- `s(x)` sine · `c(x)` cosine · `a(x)` arctangent",
    "- `e(x)` e to the power x · `l(x)` natural logarithm · `sqrt(x)` square root",
    "- `scale=n`: how many decimals to keep",
    "- `quit`: leave",
    "Angles are in radians. A classic: `4*a(1)` is π, because arctan(1) = π/4."
  ],
  16: [
    "- `echo \"1/3\" | bc` → `0`: integer division without `-l`.",
    "- `echo \"1/3\" | bc -l` → `.33333333333333333333`: 20 decimals with `-l`.",
    "- `echo \"1>3\" | bc -l` → `0` and `echo \"1<3\" | bc -l` → `1`: comparisons give 1 for true, 0 for false.",
    "- `bc -l -e \"sqrt(2)\" -e quit` → `1.41421356237309504880`: expressions passed as options.",
    "The usual pattern in a script: `result=$(echo \"scale=2; $a / $b\" | bc)`."
  ],
  17: [
    "An interactive session: you type a line, `bc` answers.",
    "- `scale=4`: keep 4 decimals from now on.",
    "- `sqrt(3)` → 1.7320",
    "- `4*a(1)` → 3.1412. This is π; the last digits are off because the intermediate result was cut to 4 decimals.",
    "- `c(4*a(1))` → −1.0000, the cosine of π.",
    "- `c(4*s(1))` → −.9750",
    "- `quit` ends the session."
  ],
  18: [
    "`tr` (translate) works on single **characters**: it replaces each character of the first set with the character in the same position of the second set.",
    "- `tr 'abc' 'xyz'`: a→x, b→y, c→z.",
    "- `-d`: **d**elete the characters of the set instead of replacing them.",
    "- `-s`: **s**queeze: a run of the same character becomes a single one.",
    "- `-c`: **c**omplement: apply the operation to every character *not* in the set.",
    "`tr` reads only standard input, never a file name: `tr a b < file`."
  ],
  19: [
    "- `tr -cs \"[A-Za-z]\" \"\\n\"`: every character that is **not** a letter (`-c`) becomes a newline, and repeated newlines are squeezed into one (`-s`). Result: one word per line.",
    "- `tr \"[a-z]\" \"[A-Z]\"`: small letters to capitals.",
    "- `cat test | tr -cd \"[:print:]\"`: delete (`-d`) everything that is not (`-c`) a printable character. Applied to a compiled program, it leaves only the readable bits. The `ELF` you see is the signature at the start of every Linux executable.",
    "(The line before it, `echo … | cc -xc -o test -`, compiles a one-line C program read from stdin into the file `test`.)"
  ],
  20: [
    "`sed` (stream editor) edits text **automatically**, with no window and no cursor: you describe the change, and it applies it to every line passing through.",
    "- It reads the input one line at a time.",
    "- For each line it checks a **pattern**, a regular expression. Where `tr` works on single characters, `sed` works on whole pieces of text.",
    "- If the line matches, it applies a command to it: most often **s**ubstitute or **d**elete.",
    "`sed` prints the result and leaves the original file untouched."
  ],
  21: [
    "The substitute command: `s,pattern,replacement,flags`. The character after `s` is the separator; these slides use a comma, most people write `s/old/new/`.",
    "- `s,Alex,Paul,`: replace the **first** Alex on each line.",
    "- `s,Alex,Paul,g`: **g**lobal, replace every Alex on the line.",
    "- `s,Alex,Paul,2`: replace only the **second** one.",
    "- `s,Alex,Paul,w file`: also **w**rite the changed lines to a file.",
    "! Without `g`, only the first match on each line is replaced. This is the classic sed surprise."
  ],
  22: [
    "- `sed /Paul/d`: **d**elete every line that contains “Paul”. The whole line goes.",
    "- `sed s/Paul//g`: replace “Paul” with nothing, which removes the word and keeps the rest of the line.",
    "- `sed 1,3s/Paul//g`: an **address** in front of the command limits it to certain lines, here 1 to 3. The Paul on line 5 survives.",
    "An address can be a line number, a range `1,3`, or a pattern `/Paul/`."
  ],
  23: [
    "Swapping first name and surname. The pattern, piece by piece:",
    "- `^`: start of the line;",
    "- `[A-Z]`: one capital letter;",
    "- `[A-Za-z]*`: followed by any number of letters. Together: one capitalised word;",
    "- `\\( … \\)`: brackets that **remember** what matched inside them. There are two such groups, one per word.",
    "In the replacement, `\\1` and `\\2` mean “what group 1 / group 2 matched”. Writing `\\2 \\1` prints them in reverse order: “Paul McCartney” becomes “McCartney Paul”.",
    "The single quotes around the whole command keep the shell from touching the backslashes and brackets."
  ],
  24: [
    "A curiosity: someone wrote an Arkanoid game entirely in `sed`. The point being made is that `sed` is a complete programming language, not just a find-and-replace tool. Nothing to learn here."
  ],
  25: [
    "`awk` is a small programming language for text arranged in columns. The name is the initials of its authors: Aho, Weinberger, Kernighan (it appeared in 1977; the slide says 1970).",
    "An awk program is a list of rules:",
    "    pattern { action }",
    "- awk reads the input line by line.",
    "- For each line it tries **every** rule: if the pattern matches, the action runs.",
    "- Then it moves on to the next line.",
    "A rule with no pattern applies to every line.",
    "“Turing complete” means it can compute anything a normal programming language can."
  ],
  26: [
    "- `awk '/Ringo/ {print}'`: for lines matching “Ringo”, print the line. This is what `grep Ringo` does.",
    "The second example counts lines. Its four rules:",
    "- `BEGIN { … }` runs **once, before** the first line: prints a title.",
    "- `/[Dd]an/ { dan++ }`: on every line containing Dan or dan, add 1 to the variable `dan`.",
    "- `/[Aa]nn/ { ann++ }`: the same for Ann.",
    "- `END { … }` runs **once, after** the last line: prints the totals.",
    "Variables need no declaration and start at 0. Note that it counts *lines* that match, not occurrences."
  ],
  27: [
    "awk splits every line into **fields** automatically:",
    "- `$1`, `$2`, …: the first field, the second, …; `$0` is the whole line.",
    "- `FS`, the field separator, says what separates fields. By default: spaces and tabs.",
    "The account example: each line of the file is an operation and a sum.",
    "- `BEGIN`: print a title, set `amount = 0`.",
    "- lines matching `/IN/`: add the second field: `amount += $2`.",
    "- lines matching `/OUT/`: subtract it.",
    "- `END`: print the total.",
    "10 − 5 + 20 + 3 − 25 = 3, so it prints `3 USD`. The header line “OP SUM” matches neither pattern and is skipped.",
    "! In awk, `$1` is a field of the current line. It has nothing to do with the shell's `$1`."
  ],
  28: [
    "Variables awk keeps up to date for you:",
    "- `NF`: **n**umber of **f**ields on the current line. `$NF` is therefore the last field.",
    "- `NR`: **n**umber of **r**ecords (lines) read so far, that is, the current line number.",
    "- `FILENAME`: the file being read.",
    "Built-in functions: `toupper()`, `tolower()`, `length()`, `int()` (drop the decimals), and maths: `exp()`, `log()`, `sin()`.",
    "Example: `awk 'END { print NR }' file` prints the number of lines, like `wc -l`."
  ],
  29: [
    "- `awk '{ for (i=1; i<=NF; i++) print $i }'`: for every line, loop over its fields and print each on its own line. `$i` means “field number i”. awk's `for` looks like C's.",
    "- The second program sets `FS = \":\"` in `BEGIN`, because `/etc/passwd` is separated by colons. Then, for every line, it prints a sentence built from field 1 (the user) and field 7 (the shell).",
    "In `print`, pieces written next to each other are simply glued together: `\"User \" $1 \" uses \" $7`."
  ],
  30: [
    "An awk program can run another command and read its answer.",
    "- For the line matching `/paul/`, it builds a command as a string: `cmd = \"basename \" $7`. For the shell `/bin/ksh` that is `basename /bin/ksh`. (`basename` strips the directory part of a path.)",
    "- `cmd | getline shell`: run the command and put its one line of output into the variable `shell`.",
    "- `close(cmd)`: finish with that command.",
    "Result: `User paul uses ksh shell.`"
  ]
}

});
