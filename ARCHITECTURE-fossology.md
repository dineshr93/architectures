<!-- SPDX-FileCopyrightText: © Fossology contributors

     SPDX-License-Identifier: GPL-2.0-only
-->

# FOSSology architecture, with a dependency and coupling audit

Everything below is read off the tree at master (538c77569). No build was run; every number
and claim is backed by a file path, a line, or a command in the Evidence appendix.

## 1. What it is

License and copyright compliance system plus a toolkit. Three moving parts:

- a PostgreSQL database that holds all state,
- a PHP web UI and REST API behind Apache,
- a C scheduler daemon that forks scanner "agents" (C, C++ and PHP).

Scanned file content lives in a content-addressed filesystem repository, not in the database.

## 2. Runtime topology

docker-compose.yml defines three services (docker-compose.yml:11-85):

    db        postgres:16, schema owned by FOSSology
    scheduler runs fo_scheduler, which forks the agents
    web       Apache + PHP, published on 8081:80

The repository volume is shared by scheduler and web (docker-compose.yml:31,60), so both see
the same blobs. The web container locates the scheduler via FOSSOLOGY_SCHEDULER_HOST and the
database via FOSSOLOGY_DB_* (docker-compose.yml:47-52). Health check is
`/repo/api/v1/health` (docker-compose.yml:62).

A single-container mode also exists (Dockerfile), recommended only with an external database
(README.md:40-45).

## 3. Build and packaging

CMake, agent-per-subdirectory.

- Top level adds src and install (CMakeLists.txt:34-35); packaging configs come from
  cmake/FoPackaging.cmake (CMakeLists.txt:42).
- src/CMakeLists.txt:17-50 enumerates the modules with add_subdirectory(). The list is
  subsettable with -DAGENTS="a;b" (src/CMakeLists.txt:10-14).
- Four modules are excluded from the build by being commented out: demomod,
  example_wc_agent, ninka, regexscan (src/CMakeLists.txt:56-60).

Every module has the same shape (src/nomos/CMakeLists.txt:11-32):

    agent/       compiled scanner binary (C, C++ or PHP) -> FO_MODDIR/<agent>/agent/
    ui/          PHP web UI plugins -> FO_MODDIR/<agent>/ui/
    *.conf       agent config -> FO_MODDIR/<agent>/
    agent_tests/ ui_tests/   built only when TESTING

32 directories contain an agent/ binary; 28 of them are actually built.

Dockerfile is two-stage. The builder installs build deps with utils/fo-installdeps --buildtime
plus install/fo-install-pythondeps, builds, and installs; the runtime slim stage installs
--runtime deps and runs install/fo-postinstall --agent --common --scheduler-only --web-only
--no-running-database (Dockerfile:114-116) plus install/scripts/php-conf-fix.sh. Debian
packaging lives in pbconf/ and debian/.

## 4. Scheduler

`fo_scheduler` (src/scheduler/agent) is the orchestrator: C11 plus a glib event loop, driven by
signals. SIGCHLD reaps agents, SIGALRM drives the periodic agent/database update, SIGTERM and
SIGQUIT shut down, SIGHUP reloads config (scheduler.c:70-90).

Files split by concern:

    scheduler.c    main loop, signal and event glue      1364 lines
    database.c     all scheduler SQL plus email notify    1296 lines
    job.c          job_t lifecycle, status, log files      789 lines
    agent.c        agent_t spawn/track/kill               1755 lines
    host.c         host_t {name,address,agent_dir,max}     178 lines
    event.c        event_t queue
    interface.c    TCP socket interface for CLI clients    643 lines
    fo_cli         thin client binary that talks to the running scheduler

Jobs are pulled from the database, not pushed from the UI. sqlstatements.h:119-197 selects from
jobqueue joined against jobdepends and dispatches only entries whose dependencies are satisfied,
then UPDATE jobqueue for state transitions. Scheduler config also comes from the database
(sysconfig table, sqlstatements.h:32). Agent stdout is the protocol channel (LOG_* and EMAIL_*
macros, libfossscheduler.h:74-192). Job logs are written through the repository under the "logs"
type (job.c:713).

Agents can be farmed to other machines: host_t carries an ssh address and an agent_dir plus a max
concurrency (host.c:48-59).

The web UI controls the scheduler over a TCP socket, default 127.0.0.1:5555
(src/lib/php/common-scheduler.php:31-51). Everything else it needs it reads from the database.

## 5. Agent API

Shared C library in src/lib/c. libfossology.h:23-29 aggregates it:

    libfossscheduler.h    fo_scheduler_connect() parses the scheduler-supplied args and connects
                          the DB; fo_scheduler_next() pulls the next work item;
                          fo_scheduler_heart() heartbeat; fo_scheduler_disconnect(retcode);
                          fo_scheduler_userID/groupID/jobId
    libfossagent.h        fo_GetAgentKey (agent row), fo_WriteARS (Agent Running Status row),
                          uploadtree/pfile queries, upload permissions
    libfossrepo.h         repository access
    libfossdb.h / libfossdbmanager.h   PGconn wrappers
    fossconfig.h          .conf parsing

A C++ layer exists too (src/lib/cpp, 17 files) and is used by compatibility, copyright, ojo and
scancode (their agent/CMakeLists.txt reference it).

PHP agents inherit the same contract from Fossology\Lib\Agent\Agent
(src/lib/php/Agent/Agent.php:40-80): same scheduler handshake, same ARS table, same
job/user/group ids.

## 6. Repository

Content-addressed on disk (libfossrepo.h:9-25):

    host/type/00/00/sha1.md5.len      directories are lowercase octets, files are octets+digits

Config files are RepPath.conf, Depth.conf (fan-out depth) and Hosts.conf; default root is
/srv/fossology/repository (libfossrepo.h:48-50). Types include gold, file, license and logs.

This plus the pfile table is where the documented "only changed files get rescanned" behaviour
comes from: identical content is one pfile row and one repo blob, referenced by many uploadtree
rows.

## 7. Database

The schema is not SQL files. It is a PHP array in src/www/ui/core-schema.dat, 2987 lines, shaped
like:

    $Schema["TABLE"]["agent"]["agent_pk"]["ADD"] = "ALTER TABLE \"agent\" ADD COLUMN ..."

install/fossinit.php applies it ("applies core-schema.dat to the database and updates
license_ref", install/fossinit.php:35-38). ~90 tables. The core ones:

    agent, ars_master + per-agent ARS tables    scanner registration and run status
    job, jobqueue, jobdepends                   work queue and dependency DAG
    upload, uploadtree, pfile                   uploads, tree, content-addressed files
    license_ref, license_map, license_file,
    license_candidate, obligation_*             license knowledge base
    clearing_decision, clearing_event and
    the *_event / *_decision tables
      (copyright, ecc, ipra, keyword)           decisions plus audit trail
    bucket_*, highlight_*, tag_*, report_cache,
    sysconfig, users/groups/perm_upload         UI-side state and config

Config is a database table (sysconfig), so it is editable from the UI and read by the scheduler.
Incremental changes are install/db/dbmigrate_*.php scripts. Tests build their own database from
core-schema.dat (src/testing/db/create_test_database.php, src/lib/php/Test/TestPgDb.php).

## 8. PHP library

src/lib/php, 267 PHP files. It is the layer between database and UI:

    Db/               DbManager plus Driver/Postgres
    Dao/              36 DAOs, one per aggregate (UploadDao, ClearingDao, LicenseDao, AgentDao,
                      JobDao, FolderDao, ...) - all SQL lives here
    BusinessRules/    13 domain services: ClearingEventProcessor, AgentLicenseEventProcessor,
                      LicenseMap, ObligationMap, ReuseReportProcessor, DetectLicensesFolder.
                      These own the decision and event semantics
    Application/      22 use cases: LicenseCsvExport/Import, CustomTextExport/Import,
                      RepositoryApi, CurlRequestService
    UI/, View/, Html/ presentation helpers and Twig rendering
    Proxy/            14 lazy proxies for expensive objects
    Agent/, Auth/, Util/, Report/, Text/, Exceptions/, Plugin/

bootstrap.php.in resolves SYSCONFDIR, parses fossology.conf (DIRECTORIES group), requires
common.php and Plugin/FO_Plugin.php, and sets the legacy globals
(src/lib/php/bootstrap.php.in:45,61,89-90). DI exists alongside it: Symfony ContainerBuilder
with services.xml.in (src/lib/php/CMakeLists.txt:11-25).

## 9. Web UI and REST API

src/www/ui, 393 files, Apache plus PHP plugin system.

- Plugins are PHP files ending .php. Prefixes are naming-only: core-, ui-, user-, agent-, jobs-,
  admin- (src/www/ui/README.txt:26-33).
- Lifecycle: Initialize() with no cross-plugin dependencies, then dependency sort, then
  PostInitialize(); cycles always fail (src/www/ui/README.txt:38-50). Base class is
  src/lib/php/Plugin/FO_Plugin.php.
- page/ holds page controllers, template/ holds Twig templates, async/ holds background AJAX
  handlers, scripts/, css/, images/ hold assets. Install layout: src/www/CMakeLists.txt:25-63.
- 54 top-level plugins; the fattest are MultiComparePlugin.php (968 lines) and ui-export-list.php
  (837).
- REST API v1 lives in src/www/ui/api: index.php (543) plus 24 Controllers, 41 Models, 13 Helper,
  2 Middlewares. The same surface the UI uses.
- Agent-specific screens ship inside each module's own ui/ dir (for example src/nomos/ui/),
  installed to FO_MODDIR/nomos/ui. 30 modules have a ui/ dir.

## 10. CLI toolkit

src/cli: fo_wrapper.php plus one PHP script per tool - cp2foss (upload), fo_folder, fo_tagfoss,
fo_import_licenses, fo_chmod, fo_antelink, schema-export.php - plus fossjobs and the fo_scheduler
client. Same bootstrap, so CLI and web share the whole lib/php stack.

## 11. Testing

src/testing is infrastructure only (src/testing/README:6-8); module tests live in each
{module}/agent_tests and ui_tests. C tests are CUnit-style test_*.c against lib/c. PHP tests are
PHPUnit with TestPgDb (real schema in a throwaway database) or TestLiteDb (no database, pure
logic), both under src/lib/php/Test/.

## 12. One scan, end to end

    upload (UI or cp2foss)
        -> upload + uploadtree rows; content hashed into pfile + repository blob
    ununpack agent extracts archives into the tree (adj2nest fixes tree indices)
    the UI enqueues work via JobDao: job + jobqueue (+ jobdepends) rows
    the scheduler picks dependency-ready jobqueue entries, assigns a host, forks the agent binary
    each agent fo_scheduler_connects, loops fo_scheduler_next() over files, writes results
        (nomos -> license_file and agent ARS; copyright -> copyright table) and emits
        clearing_event rows
    decider/deciderjob apply policy on top; reuser short-circuits files already cleared
    the UI reads through DAOs; exporters (spdx, cyclonedx, clixml, unifiedreport, readmeoss)
        generate reports

## 13. Where to start reading

scheduler.c and database.c for the control plane, libfossagent.h and
src/lib/php/Agent/Agent.php for the agent contract, core-schema.dat for the data model,
src/lib/php/Dao plus BusinessRules for domain logic, src/www/ui/api for the API surface.

---

# Dependency and coupling audit

Categorised the way the audit skill asks: quick wins, medium, architectural. Each finding names
the ceiling and the upgrade path. Nothing here is speculative - if a fix is not worth the churn
right now, it says so instead of proposing a refactor.

## Quick wins

### Q1. PHP version support is stated four different ways

    README.md:27           "The PHP versions 7.3 and later are supported"
    debian/control:9       php7.2-cli|7.3|7.4|8.1|8.3|8.4   (no 8.2)
    Dockerfile:25          php8.2-cli
    utils/fo-installdeps   php7.4 / php8.2 / php8.4  (utils/fo-installdeps:101-105)

The Docker path builds and runs on 8.2, but the Debian dependency line does not accept
php8.2-cli, so the container path and the distro path disagree about what is supported. The
README claim also drops 7.2, which packaging does accept.

Fix: make debian/control the canonical list, add php8.2 there, and align README and
fo-installdeps to it.

### Q2. The obsolete-file removal list in the www build is a no-op

src/www/CMakeLists.txt:13-21 lists 15 PHP files and 3 template paths as FO_WWW_OBSOLETE, and
:76 runs file(REMOVE_RECURSE) over them. None of those PHP files exist in src/www/ui any more
(checked one by one), and template/components and template/include do not exist either. The
list and its foreach block (:66-78) delete nothing.

Fix: delete the list and the block.

### Q3. Dead modules are still shipped

src/demomod (13 files), src/example_wc_agent (5), src/ninka (20), src/regexscan (7) exist but are
excluded from the build (src/CMakeLists.txt:56-60). 45 files of dead weight that every grep,
audit and licence scan still walks.

Fix: delete the directories, or move them to a legacy branch.

### Q4. Dead macro in job.c

src/scheduler/agent/job.c:34:

    #define MAX_SQL 512;JOB_STATUS_TYPES

This defines MAX_SQL as the token sequence `512;JOB_STATUS_TYPES`, and MAX_SQL is referenced
nowhere else in the tree. It is a leftover from an X-macro refactor.

Fix: delete the line.

### Q5. www/ui README describes directories that no longer exist

src/www/ui/README.txt:7-24 lists legacy paths (ui/common, ui/plugins, ui/template) and current
subdirectories. template/components and template/include are gone. The file already hedges
("Other subdirectories may exist and evolve"), so this is minor.

Fix: drop the two dead entries next time the file is touched.

## Medium

### M1. Monolithic files, and one file carrying two responsibilities

Measured line counts:

    src/www/ui/core-schema.dat                    2987
    src/scheduler/agent/agent.c                   1755
    src/scheduler/agent/scheduler.c               1364
    src/scheduler/agent/database.c                1296
    src/lib/php/libschema.php                     1179
    src/lib/c/libfossrepo.c                       1046
    src/lib/php/common-sysconfig.php               978
    src/lib/c/libfossdbmanager.c                   876
    src/scheduler/agent/job.c                      789
    src/www/ui/api/Controllers/UploadController.php 1352
    src/www/ui/api/Controllers/CopyrightController.php 1094
    src/www/ui/api/Controllers/LicenseController.php 1021

database.c is the worst offender: it holds every scheduler SQL statement plus email notification,
and the file's own comment flags the problem ("There is no good location to put the code that
performs the email notification", database.c:26-35). The API controllers are fat because
validation, business rules and DAO calls sit in one class (18 of 24 controllers reference
Fossology\Lib\Dao directly, 22 use Models).

Fix: split the email-notification block out of database.c - it is already delimited by that
comment. Leave the controllers; splitting them is churn with no behaviour change.

### M2. The UI reaches past the domain layer into DAOs

Files under src/www/ui referencing each lib/php layer:

    Lib\Dao             75
    Lib\BusinessRules   15
    Lib\Application     16
    Lib\Proxy           12
    Lib\UI              11

Most UI reads and writes go UI -> DAO -> SQL, skipping the BusinessRules services that own
decision and event semantics. That is why clearing semantics exist in two places: in the
processors and again inline in plugins.

Fix: no lazy fix exists. Route new UI code through BusinessRules, leave existing plugins alone.
Worth doing only if you are already changing clearing logic.

### M3. Two PHP styles coexist: namespaced classes and global procedural includes

src/lib/php holds 267 PHP files; 225 declare a namespace, 30 are legacy top-level files with
global functions (26 of them named common-*.php). bootstrap.php.in loads common.php and
FO_Plugin.php and sets $GLOBALS['SYSCONFDIR'] and every DIRECTORIES variable
(src/lib/php/bootstrap.php.in:45,61,89-90), while Symfony DI (ContainerBuilder plus
services.xml.in) is the modern path (src/lib/php/CMakeLists.txt:11-25).

Two mechanisms for the same job. Fix: keep both, put new code in namespaced classes and DI. Do
not refactor the legacy globals; 225 files already depend on them.

### M4. The agent protocol is implemented twice

C side: libfossscheduler.c (563) and libfossagent.c (489) implementing the contract in
libfossscheduler.h:194-211. PHP side: src/lib/php/Agent/Agent.php (343) re-implements the same
handshake, ARS write and job/user/group plumbing.

Every protocol change has to land in both implementations plus the scheduler that speaks it.

Fix: the duplication is justified - different languages, no shared ABI, and a PHP agent cannot
link libfossology. Mitigate with one integration test per side rather than a shared spec file
nobody reads.

### M5. Two hand-maintained OpenAPI specs, both served

src/www/ui/api/documentation/openapi.yaml is 7651 lines and openapiv2.yaml is 8076 lines. Both
declare `openapi: 3.1.0` and are 425 lines apart. InfoController.php:44-47 serves both, and
index.php:400 exposes the /openapi group.

Two specs for one API surface is a drift generator: whichever one a client reads, the other can
be wrong.

Fix: pick the canonical spec, generate the other from it or drop it.

### M6. Generated files are written into the source tree

src/lib/php/CMakeLists.txt:21 symlinks the generated bootstrap.php and services.xml from the
build directory back into ${CMAKE_CURRENT_SOURCE_DIR}, and .gitignore:93-94 hides them. Nine
generated VERSION files are ignored the same way (.gitignore:19,161-162,175-178,199).

Consequences: read-only or container-mounted source trees cannot build; parallel and out-of-tree
builds pollute the tree; stale symlinks survive branch switches and confuse readers.

Fix: drop the ln -sf and rely on the existing install(DIRECTORY .../gen/) rule
(src/lib/php/CMakeLists.txt:39-43). Small, contained, removes a real failure mode.

### M7. Schema bootstrap cost in tests

57 PHP test files use TestPgDb (full schema in a throwaway database); only 6 use TestLiteDb.
194 PHP test files exist. Test coverage is uneven across module types: 19 modules have
agent_tests, only 3 have ui_tests (nomos, scheduler, www).

Fix: pure-logic tests should use TestLiteDb. Nothing to do about the ui_tests gap lazily - it
needs new tests, not a refactor.

### M8. Hardcoded agent dependency list in the Dockerfile

Dockerfile:31-46 COPYs mod_deps for exactly 13 agents, as a cache-priming step before
fo-installdeps --buildtime. That set currently matches the 13 directories that have a mod_deps
file (verified), so it is in sync today. But src/CMakeLists.txt:17-50 is the source of truth: a
14th agent with mod_deps added there silently gets no build dependencies, and the failure shows
up later as a compile error.

Fix: prime the layer from the full src tree (`COPY ./src ./src`) before running fo-installdeps,
or generate the mod_deps list in a build step. COPY cannot glob, so the list must be generated
rather than written by hand.

## Architectural

### A1. The database schema is owned by a UI module

src/www/ui/core-schema.dat is the single definition of the database, 2987 lines, and the
database is shared infrastructure: the scheduler reads sysconfig and jobqueue from it, agents
write ARS and result tables, the CLI (src/cli/schema-export.php) and the tests
(src/lib/php/libschema.php, 1179 lines; src/lib/php/Test/TestPgDb.php) consume it.

The layering is inverted: everything depends on the schema, and the schema lives inside one
module's UI directory. Anyone touching the database has to reach into src/www/ui.

Fix: a real move, not a lazy one - 12 files reference the path (install/fossinit.php,
install/db/dbmigrate_*.php, src/cli/schema-export.php, src/testing/db/create_test_database.php,
src/lib/php/Test/*Db.php and others). If you do it, move to src/lib/php/schema/ and update those
callers in one commit. Not worth it standalone.

### A2. Scheduler-to-database coupling is concentrated but deep

All scheduler SQL lives in database.c plus sqlstatements.h: scheduler.c and agent.c contain zero
direct PQexec/PQprepare calls (measured). That is a clean boundary for the scheduler.

The coupling is to the schema instead: the statements hardcode jobqueue, jobdepends, job,
sysconfig, upload and uploadtree column names, so any schema change in core-schema.dat has to be
mirrored in sqlstatements.h by hand. There is no shared schema artifact between C and PHP.

Fix: accept it. The lazy mitigation is to keep schema-changing commits touching both files, not
to generate C headers from core-schema.dat.

### A3. UI to scheduler control path is a private socket protocol

The UI drives job control over TCP 127.0.0.1:5555 (src/lib/php/common-scheduler.php:31-51), and
the scheduler's socket interface is 643 lines of C (interface.c). Two implementations of one
wire protocol, with no versioning in the socket layer, and the default port is hardcoded in PHP.

Fix: leave it. If it ever needs to scale, the versioned REST API is the natural replacement
surface for job control, but that is a project, not a patch.

## What I did not touch

- No code was changed. This document is the only artifact.
- The audit deliberately proposes deletion over refactor everywhere a refactor would be churn
  (dead modules, dead macro, stale lists) and refuses to propose restructuring where the coupling
  is load-bearing (A2, M4, A3).
- Duplicated 4-line SPDX headers across 87 of 101 CMakeLists.txt files are noted and left alone:
  normalising them is a 87-file diff with zero functional value.

---

# Evidence appendix

Commands used to measure the numbers in this document.

    wc -l src/scheduler/agent/*.c src/www/ui/core-schema.dat src/lib/php/*.php src/lib/c/*.c
    git ls-files src | grep -c CMakeLists.txt                      # 101
    grep -rl 'Avinal Kumar' --include=CMakeLists.txt . | wc -l     # 87
    grep -n 'PHP versions' README.md                               # 7.3+
    grep -n php debian/control                                     # 7.2|7.3|7.4|8.1|8.3|8.4
    grep -n php8 Dockerfile                                        # php8.2-cli
    grep -n php utils/fo-installdeps                               # 7.4 / 8.2 / 8.4
    test -e src/www/ui/<each FO_WWW_OBSOLETE entry>                # none present
    git ls-files src/demomod src/example_wc_agent src/ninka src/regexscan
    grep -rn 'MAX_SQL' src/scheduler/agent                         # definition only
    grep -rlF 'Lib\Dao' src/www/ui | wc -l                         # 75
    grep -rlF 'Lib\BusinessRules' src/www/ui | wc -l               # 15
    grep -rl '^namespace ' src/lib/php --include=*.php | wc -l     # 225 of 267
    ls src/lib/php/common-*.php | wc -l                            # 26
    grep -rl TestPgDb src --include=*.php | wc -l                  # 57
    grep -rl TestLiteDb src --include=*.php | wc -l                # 6
    git ls-files src | grep -E 'Test\.php$' | wc -l                # 194
    git ls-files src | grep '/mod_deps' | cut -d/ -f2 | sort -u    # 13, matches Dockerfile
    grep -rc 'PQexec\|PQprepare\|fo_dbManager' src/scheduler/agent/*.c   # only database.c
    wc -l src/www/ui/api/documentation/openapi*.yaml               # 7651 / 8076
    grep -n 'openapi:' src/www/ui/api/documentation/*.yaml         # both 3.1.0
    grep -rn openapiv2 src/www/ui/api/Controllers/InfoController.php
