"""Render every PDF page to PNG + thumbnail and write data/slides.js (titles + searchable text)."""
import sys, os, re, json, fitz

site = sys.argv[1]
DOCS = [
    dict(id="intro", pdf="intro.pdf", kind="info", title="Course introduction",
         blurb="Organization, grading, objectives and references.", topics=["grading", "objectives", "references"]),
    dict(id="c1", pdf="course1.pdf", kind="lecture", n=1, title="Computer systems and the operating system",
         blurb="What a computer system is made of, what an OS is and does, and how one is built and installed.",
         topics=["system structure", "what is an OS", "kernel", "OS services", "building Linux"]),
    dict(id="c2", pdf="course2.pdf", kind="lecture", n=2, title="Boot, login, the shell and files",
         blurb="From power-on to a prompt: boot loaders, init and runlevels, login, UID/GID, files, mounts, descriptors and redirection.",
         topics=["boot process", "runlevels", "login", "UID / GID", "file system", "file descriptors", "redirection"]),
    dict(id="c3", pdf="course3.pdf", kind="lecture", n=3, title="The command interpreter, files and permissions",
         blurb="The bash environment, pipelines, job control, history, file types, set-UID, permissions, umask and links.",
         topics=["environment", "bash config files", "pipelines & lists", "job control", "history", "file types", "permissions", "links"]),
    dict(id="c4", pdf="course4.pdf", kind="lecture", n=4, title="File tools, processes, IPC and signals",
         blurb="grep and find, what a process is, shared memory vs message passing, pipes and FIFOs, signals.",
         topics=["file commands", "wildcards", "grep", "find", "processes", "IPC", "FIFOs", "signals"]),
    dict(id="c5", pdf="course5.pdf", kind="lecture", n=5, title="Shell programming",
         blurb="Scripts from the ground up: variables, expansion, quoting, tests, conditionals, loops, functions, read and debugging.",
         topics=["variables", "expansion", "quoting", "scripts & #!", "special variables", "test / [ ]", "if / case", "loops", "functions"]),
    dict(id="c6", pdf="course6.pdf", kind="lecture", n=6, title="Filters and text processing",
         blurb="The classic text toolbox: cut, paste, split, join, bc, tr, sed and awk.",
         topics=["cut", "paste", "split", "join", "bc", "tr", "sed", "awk"]),
    dict(id="c7", pdf="course7.pdf", kind="lecture", n=7, title="System services",
         blurb="How services are started and managed: System V init scripts, Upstart jobs and systemd units.",
         topics=["daemons", "System V", "rc directories", "init.d scripts", "Upstart", "systemd", "targets", "unit files"]),
    dict(id="c8", pdf="course8.pdf", kind="lecture", n=8, title="Daemons and time management",
         blurb="Daemonizing a program, syslog, scheduling with cron, anacron and at, and the hardware vs system clock.",
         topics=["daemons", "syslogd", "cron", "crontab format", "anacron", "at", "hwclock", "date", "time"]),
    dict(id="c9", pdf="course9.pdf", kind="lecture", n=9, title="Data storage: block devices and file systems",
         blurb="Disks and the memory hierarchy, block and loop devices, swap, fstab, journaling, tmpfs, NFS, procfs and sysfs.",
         topics=["storage hierarchy", "block devices", "loop devices", "swap", "inodes", "fstab", "journaling", "tmpfs", "NFS", "procfs / sysfs"]),
    dict(id="c10", pdf="course10.pdf", kind="lecture", n=10, title="Compiling, linking, debugging and make",
         blurb="From source to executable, static and dynamic libraries, compiler options, gdb and Makefiles.",
         topics=["compiler & linker", "static vs dynamic", "libraries", "cc options", "gdb", "Makefile"]),
    dict(id="c11", pdf="course11.pdf", kind="lecture", n=11, title="Networking",
         blurb="Networks and protocols, OSI vs internet model, IP, TCP, UDP, DNS, sockets, HTTP and email.",
         topics=["protocols", "OSI model", "IP", "TCP / UDP", "DNS", "sockets", "HTTP", "email"]),
    dict(id="projects", pdf="project-list.pdf", kind="info", title="Project list",
         blurb="Project rules and the 14 project topics (bash / awk only).", topics=["rules", "14 topics"]),
]

def norm(s):
    return re.sub(r"\s+", " ", s.replace(" ", " ")).strip()

def compact(s):
    """Join runs of letter-spaced characters ('f i n d' -> 'find') so code on slides is searchable."""
    out, run = [], []
    for tok in s.split(" "):
        if len(tok) == 1:
            run.append(tok)
        else:
            if run:
                out.append("".join(run) if len(run) >= 3 else " ".join(run)); run = []
            out.append(tok)
    if run:
        out.append("".join(run) if len(run) >= 3 else " ".join(run))
    return " ".join(out)

def page_title(page, fallback):
    d = page.get_text("dict")
    spans = []
    for b in d.get("blocks", []):
        for l in b.get("lines", []):
            for s in l.get("spans", []):
                t = s["text"].strip()
                if t and not re.fullmatch(r"\d{1,3}", t):
                    spans.append((s["size"], s["bbox"][1], s["bbox"][0], s["text"]))
    if not spans:
        return fallback
    mx = max(s[0] for s in spans)
    big = [s for s in spans if s[0] >= mx * 0.93]
    big.sort(key=lambda s: (round(s[1] / 4), s[2]))
    t = norm(" ".join(s[3] for s in big))
    return t[:90] if 2 <= len(t) else fallback

total = 0
for doc in DOCS:
    d = fitz.open(os.path.join(site, "pdfs", doc["pdf"]))
    sd = os.path.join(site, "slides", doc["id"]); td = os.path.join(site, "thumbs", doc["id"])
    os.makedirs(sd, exist_ok=True); os.makedirs(td, exist_ok=True)
    pages = []
    for i, p in enumerate(d, 1):
        w = 1600 if p.rect.width >= p.rect.height else 1400
        z = w / p.rect.width
        p.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False).save(os.path.join(sd, f"{i:03d}.png"))
        zt = 360 / p.rect.width
        p.get_pixmap(matrix=fitz.Matrix(zt, zt), alpha=False).save(os.path.join(td, f"{i:03d}.jpg"), jpg_quality=72)
        raw = norm(p.get_text())
        raw = re.sub(r"\s\d{1,3}$", "", raw)  # trailing slide number
        c = compact(raw)
        text = raw if c == raw else raw + " ‖ " + c
        pages.append(dict(t=page_title(p, f"Page {i}"), x=text))
        total += 1
    doc["ar"] = round(d[0].rect.width / d[0].rect.height, 4)
    doc["pages"] = pages
    print(doc["id"], len(pages), "|", " / ".join(pg["t"] for pg in pages[:6]))
os.makedirs(os.path.join(site, "data"), exist_ok=True)
with open(os.path.join(site, "data", "slides.js"), "w") as f:
    f.write("// Generated from the course PDFs: slide titles and searchable text.\nwindow.TTCS_DOCS = ")
    json.dump(DOCS, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";\n")
print("pages:", total)
