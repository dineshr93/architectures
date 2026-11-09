# ARCHITECTURE — blackduck-c-cpp 3.1.2

Read this first. It is written for machines and for people who must edit this
codebase without breaking it. Every claim below is a `path:line` you can grep.
Human-facing usage/config docs live in `Blackduck-c-cpp-README.md` (note the
non-standard filename — there is no `README.md`, but `setup.py:9` opens one, so
`sdist` builds from a clean tree fail).

## 1. What it is

One process, one shot. It wraps a C/C++ build with a capture tool, learns which
files that build actually consumed, resolves those files to OS packages, and
pushes the result to Black Duck three ways (package BDIO2, BDBA binaries,
scan-cli signatures). C/C++ has no package manager of record, so the BOM is
built from *observed file paths*, not a lockfile.

- Package: `blackduck_c_cpp`, console script `blackduck-c-cpp` → `blackduck_c_cpp.run_build_capture:run` (`setup.py:43`).
- Python >= 3.10. No framework, no DI, no DB, no async web. `asyncio` is used
  in exactly one place (package-manager subprocess fan-out).
- 42 modules, ~8.2k LoC. ~72% of it is three files:
  `pkg_manager/pkg_manager_bom.py` (1443), `run_build_capture.py` (1163),
  `sig_scanner/run_sig_scanner.py` (995).

## 2. Lifecycle

`run()` (`run_build_capture.py:1136`) is the only entry point.

```
run()
 ├── C_Parser()                      # util/c_arg_parser.py:27 — configargparse, -c file == CLI flags
 ├── output_dir default: ~/.blackduck/blackduck-c-cpp/output/<project_name>
 ├── setup_logging()                 # :1100 — file+console handlers, redaction filter attached
 ├── validate_binary_checksum()      # util/validate_bin_checksum.py:112 — ONLY if "__compiled__" (Nuitka onefile)
 └── with RunBuildCapture(...) as RBC:      # util context manager
       ├── __enter__  :180  — create BD project/version (online), mkdir idir, dump offline_config.yaml
       └── RBC.run_build_capture()  :1012   — the pipeline below
```

`__exit__` (`:246`) only prints the exception. There is no cleanup, no rollback.
Errors are reported per-phase and the run continues; `final_status()` (`:980`)
prints a phase→status table at the end. Do not assume a failed phase aborts.

## 3. The pipeline

```
provision Coverity      util/cov_install.py:187          -> cov_home/bin/{cov-build,cov-cli,cov-manage-emit,cov-emit-link}
capture build           run_build_capture.py:681/667     -> <cov_dir>/idir/  + idir/build-log.txt
extract emitted files   sig_scanner/emit_wrapper.py:80   -> cov_emit_output_files/ + in-memory file sets
extract link units      coverity_json/cov_json_parse.py:159 -> header/linker/executable sets from cov_emit_links.json
OS pkg-manager BOM      pkg_manager/pkg_manager_bom.py:1241 -> raw_bdio.csv -> raw_bdio.json + bdba_ready.zip
BDBA upload             bdba/upload_bdba.py:76           -> POST /api/uploads (1 GB chunks)
signature scan          sig_scanner/run_sig_scanner.py:939 -> sig_scan/{sig_files|zip_file} -> dryrun json/bdio -> upload
BDIO2 upload            bdio/bdio2_python_transformer.py  -> c_cpp_bdio2.jsonld -> POST /api/scan/data/?mode=replace
```

Handoff between phases is **the filesystem**, never a shared object. Two
in-memory sets do cross the boundary (`emit_cov_header_files`, and the
cov-json triple) as constructor args to `PkgManagerBom`.

### Capture modes (`determine_cov_mode`, `:994`)

| Condition | Mode | Binary |
| --- | --- | --- |
| `use_bear: True` | `cov-emit-with-bear` | `bear intercept` → `cov-manage-emit replay-from-script` |
| `set_coverity_mode: cov-build` | `cov-build` | `cov-build` |
| Coverity >= 2023.9 | `cov-cli` | `coverity` / `coverity.exe` |
| Coverity < 2023.9 or version unparseable | `cov-build` | `cov-build` |

### Scan modes

`--modes` is a comma list, lowercased and quote-stripped at `:142`. Valid
tokens: `all`, `bdba`, `sig`, `pkg_mgr`. `pkg_mgr` gates the BOM + BDIO;
`bdba` gates the zip; `sig` gates scan-cli. Note the package-manager phase
**always** runs its parse/resolve work; the mode only gates querying
(`pkg_manager_bom.py:1246` `run_mode_res`).

## 4. Module map

| Path | Owns | Key symbols |
| --- | --- | --- |
| `run_build_capture.py` | Orchestrator, Coverity install/provisioning, libc+arch detection, bazel workspace patching, logging | `RunBuildCapture:43`, `set_coverity_root:419`, `coverity_download:435`, `run_build:681`, `run_build_with_bear:667`, `run_cov_emit:779`, `run_cov_emit_link:806`, `run_get_package_manager_bom:829`, `run_bdba:874`, `run_sig_scan:899`, `run_bdio_from_package_manager:937` |
| `util/c_arg_parser.py` | Every CLI/YAML option. One flat `argparse` namespace is the whole config surface. | `C_Parser:13`, `str2bool:20` |
| `util/util.py` | Subprocess + zip + upload primitives | `run_argv:53` (shell=False), `run_argv_streaming:111`, `run_cmd:162` (shell=True, legacy), `run_cmd_emit:195` (shell=True, needs pipes), `zip_files:266`, `upload_scan:287`, `error_and_exit:303` |
| `util/global_settings.py` | Compiled regexes for file-classification. No state, no config. | `src_emit_pttrn`, `so/a/o/obj/dll/lib_pattern`, `h/hpp/hxx_pattern` |
| `util/cov_install.py` | Coverity mini-package download from GCP via BD tool-token | `CoverityInstall:20`, `hub_api_tool_token:45`, `unzip_with_symlinks:117` |
| `util/hub_api.py` | Black Duck REST via `blackduck` SDK client | `HubAPI:13`, `create_or_verify_project_version_exists:28`, `get_hub_version:147`, `get_latest_scan_cli_version:158` |
| `util/build_log_parser.py` | `build-log.txt` → linker inputs, `-L` paths, executables | `LogParser:45`, `parse_build_log:322`, `parse_cov_translate_blocks:224`, `get_exectuable:349` |
| `util/bear_parser.py` | `bear` events → Coverity translate blocks (the `use_bear` path) | `BearParser:103`, `run_bear_and_parse:109`, `merge_ordered:293` |
| `util/log_redaction.py` | logging.Filter that scrubs secret-shaped text | `_TokenRedactionFilter:31`, `register_known_secret:61` |
| `util/validate_bin_checksum.py` | Self-sha256 of the Nuitka binary vs `repo.blackduck.com` | `validate_binary_checksum:112` |
| `util/zip_file.py` | `MyZipFile` — symlink-safe extraction | `MyZipFile:11` |
| `pkg_manager/pkg_manager_detector.py` | distro + pkg-manager detection | `PkgDetector.get_platform:43` |
| `pkg_manager/pkg_manager_bom.py` | **The BOM.** Path resolution, async pkg queries, ldd + `LD_DEBUG` transitives, CSV→JSON | `PkgManagerBom:38`, `run:1241`, `resolve_file_paths:224`, `check_pkg_mgr:313`, `run_pkg_query:342`, `check_ldd:681`, `check_ldd_deb:867`, `check_components:887`, `parse_components_info:998`, `csv_to_json:1106`, `zip_files:1139`, `set_matchtype_per_hub_version:1229` |
| `pkg_manager/ld_debug_parse.py` | `LD_DEBUG=files` output → dep graph | `LdDebugParser:8` |
| `coverity_json/cov_json_parse.py` | `cov-emit-link` JSON → header/linker/executable sets | `CovJsonParser:15`, `run:159` |
| `sig_scanner/emit_wrapper.py` | `cov-manage-emit` invocation + emitted-file classification | `EmitWrapper:18`, `run_cov_emit:80`, `run_cov_emit_on_bear_output:68`, `archive_idir:58` |
| `sig_scanner/run_sig_scanner.py` | scan-cli download, file staging, split-upload | `SigScanner:25`, `run:939`, `json_splitter:341`, `bdio_splitter:410`, `build_sig_scanner_command:561`, `run_sig_scanner:703` |
| `bdba/upload_bdba.py` | Chunked multipart binary upload | `BDBAApi:24`, `upload_binary:76` |
| `bdio/bdio2_python_transformer.py` | `raw_bdio.json` extended-objects → BDIO2 graph | `BDIO2Transformer:26`, `generate_bdio2:50` |
| `katiska/` | Vendored BDIO2 emitter (ported from Synopsys `katiska`). Treat as third-party. | `BDIOEntries:119`, `BDIOBuilder:389`, `bdio_paths.py`, `version_king.py` |

## 5. Data contracts

These files are the interfaces. Changing a shape here breaks a consumer in
another package with no type checker in between.

| Artifact | Producer | Consumer | Shape |
| --- | --- | --- | --- |
| `<cov_dir>/idir/build-log.txt` | cov-build / cov-cli / `replay-from-script` | `build_log_parser`, `pkg_manager_bom.run_log_parser` | Coverity text log, `EXECUTING:` lines |
| `<cov_dir>/emit/<ts>/` | Coverity | `EmitWrapper.get_latest_emit_dir:41` | latest-mtime dir wins |
| `cov_emit_output_files/` | `emit_wrapper.run_cov_emit` | staging for sig scan | copies of emitted source+headers |
| `cov_emit_links.json` | `cov-emit-link` (`run_cov_emit_link:806`) | `CovJsonParser` | keys `files`, `translation-units`, `link-units`; ids `primary-file-id`, `input-files[].file-id`, `kind` |
| `resolved_file_paths.txt`, `unresolved_file_paths.txt`, `all_binary_paths.txt`, `json_grep_files_diff.txt`, `resolved_cov_file_paths.txt`, `unresolved_cov_file_paths.txt` | `PkgManagerBom.write_to_txt:247` | humans / debugging only | `<type>: <path>` lines |
| `raw_bdio.csv` | `create_csv:936` | `csv_to_json:1106` | columns differ per pkg manager (rpm has `epoch`,`release`; brew has no `package-architecture`) |
| `raw_bdio.json` | `csv_to_json` | `BDIO2Transformer.generate_bdio2`, `run_bdio_from_package_manager:937` | `{"extended-objects": [ExtendedObject]}` — see `katiska/custom_types.py:47` for the canonical record |
| `bdba_ready.zip` | `PkgManagerBom.zip_files:1139` (excludes `header` bucket) | `BDBAApi.upload_binary` | zip of absolute realpaths |
| `sig_scan/sig_files/` or `sig_scan/zip_file/sig_scan.zip` | `SigScanner.copy_files_to_dir:115` / `zip_files:159` | scan-cli | chosen by `expand_sig_files` |
| `sig_scan/data/**` dryrun `.json`/`.bdio` | scan-cli `--dryRunWriteDir` | `json_splitter`/`bdio_splitter` → `upload_sig_json_results:768`/`upload_sig_bdio_results:799` | scan-cli native |
| `c_cpp_bdio2.jsonld` | `BDIO2Transformer.write_bdio2_document:40` | `util.upload_scan` | BDIO2 graph |
| `offline_config.yaml` | `__enter__:195` | humans; `use_offline_files` warns to keep `skip_*` identical | args dict, `api_token` popped, mode 0600 |
| `blackduck_c_cpp.log` | `setup_logging` | humans | redacted |

Code-location names are derived, not configured: base
`<project>/<version>` (`:83`), then BDIO2 appends `-BDIO2`
(`bdio2_python_transformer.py:30`), sig appends `-SIG`
(`run_sig_scanner.py:39`), BDBA appends `-<chunk>-BDBA` (`upload_bdba.py:86`).

## 6. Invariants and landmines

1. **`shlex.quote` on non-shell values.** `project_version`, `bd_url`,
   `codelocation_name` are quoted at `:60-83` and then used as plain Python
   strings in REST calls and argv lists. Quoting therefore injects literal
   quotes into Black Duck names when they contain shell metacharacters. This
   is a known wart; do not "fix" it by re-quoting elsewhere.
2. **Two `zip_files`.** `util/util.py:266` (writes absolute arcnames) and
   `PkgManagerBom.zip_files:1139` / `SigScanner.zip_files:159` (callers).
   Grep before editing.
3. **Semantics of the pkg-manager string blob.** `join_components:263` packs
   `sha1 confidence matchType` into one space-delimited string, and
   `parse_logic:1015` unpacks it with the lookbehind regexes in
   `parse_logic_patterns:109`. Any value containing a space corrupts a row.
4. **Concurrency is memory-derived.** `calculate_max_concurrency:124` sizes the
   semaphore from `psutil` free RAM at 100 MB/child ×8 CPU multiplier. The
   semaphore MUST be created inside the loop (`:1243`) — constructing
   `asyncio.Semaphore` in `__init__` breaks under `asyncio.run`.
5. **`confidence` is always emitted as `confidence:100`** by pkg queries
   (e.g. `:481`, `:546`, `:672`). Do not treat it as a real signal.
6. **matchType is version-gated.** `set_matchtype_per_hub_version:1229` → BD
   >= 2021.6 uses `DIRECT_DEPENDENCY_BINARY`/`TRANSITIVE_DEPENDENCY_BINARY`,
   older uses `Binary`. Offline forces `unknown`, and `set_csv_matchtpye:1210`
   rewrites `unknown` on the `use_offline_files` replay path.
7. **Windows produces no BDIO** (no pkg manager) and the pkg/BOM phases
   degrade to no-ops. `pkg_manager_detector` returns `not_found`.
8. **Bash-on-Windows path assumptions.** `EmitWrapper.run_cov_emit:89` swaps
   `grep -v` for `findstr /v` — any new shell pipe there needs both branches.
9. **`archive_idir:58` moves the idir away**, timestamp-renamed next to the
   new one. Disk usage grows per run; nothing prunes it.
10. **`use_offline_files` + `offline` + `skip_build` are mutually constrained**
    (`__enter__:238`): `use_offline_files` requires `offline=False` and
    `skip_build=True`. `--scan_cli_dir` is required for offline dryrun output.
11. **Splitter requires a prior offline run.** `json_splitter`/`bdio_splitter`
    only have input if a dryrun exists, hence the offline-then-online dance.
12. **Vendored `katiska/` is a port, not a dependency.** Do not refactor it to
    match local style; upstream drift makes diffs unreadable.

## 7. Security model

Comments in-tree cite `SECURITY_PLAN.md` defects D1–D5. **That file is not in
this distribution** — the identifiers `D1`…`D5` in comments are the only
remaining documentation. Keep them when editing.

- **D1 — env scrub.** `BLACKDUCK_API_TOKEN`/`BD_HUB_TOKEN` are read then
  `del`'d from `os.environ` at `:116-120`, and
  `BLACKDUCK_REPO_USER`/`BLACKDUCK_REPO_PASSWORD` at
  `validate_bin_checksum.py:130`, because every subprocess (`cov-build`, the
  user's `build_cmd`, dpkg/rpm/ldd, scan-cli) inherits the parent env.
  The scan-cli child gets a *whitelist* env, not `os.environ`
  (`run_sig_scanner.py:737-760`). Anything added to the env must be added to
  that tuple deliberately.
- **D2/D4 — shell-free subprocess.** New code uses `util.run_argv` /
  `run_argv_streaming` (argv list, `shell=False`, `TypeError` on string).
  `util.run_cmd` and `run_cmd_emit` remain `shell=True`; they survive only
  where a pipe is genuinely needed (grep/findstr) or for fixed local probes
  (`pkg_manager_detector`). Never interpolate a path, a log line, or a
  user-supplied `additional_sig_scan_args` into a `shell=True` string.
  `additional_sig_scan_args` is parsed to `List[str]` by
  `parse_additional_args:657` and treats backticks, `$( )`, and `|` as
  literals — covered by `tests/security/test_additional_sig_scan_args.py`.
- **D3 — offline config on disk.** `api_token` is popped before
  `json.dump`, plus `chmod 0600` (`__enter__:217-232`).
- **D5 — log redaction.** `_TokenRedactionFilter` is attached to both handlers
  (`setup_logging:1126,1132`) and the literal token is registered at `:130`.
  Any *new* handler or `print()` of a request bypasses it.

## 8. External systems

| System | Coupling | Where |
| --- | --- | --- |
| Coverity | subprocess black-box, filesystem handoff only. Tool owns download+version choice. | `cov_install.py`, `emit_wrapper.py` |
| Black Duck | `blackduck` SDK `Client` (`hub_api.py:21`) + raw `session.post` for scan upload | `hub_api.py`, `util.upload_scan:287`, `upload_bdba.py` |
| GCP storage | Coverity zip, via tool-token as service-account JSON | `cov_install.gcp_download:69` |
| scan-cli (JVM) | `java -jar scan.cli.impl-standalone.jar`, argv list, whitelist env | `run_sig_scanner.py:561,703` |
| `bear` | optional capture (`apk add bear`, >= 3.1.3) | `bear_parser.py` |

This tool is a **sibling of Synopsys Detect, not a Detect agent**. It never
invokes Detect. It mirrors a couple of Detect property names
(`project_group_name`, `project_description`) and reuses the same scan-cli +
BDIO upload path. Do not add Detect coupling.

## 9. Working here

- Install: `pip install -e .` (needs `README.md` present, see §1).
- Tests: `pytest tests/security`. 8 files, all security regressions
  (env scrubbing, log redaction, shell injection, arg parsing, offline yaml,
  sig-scanner env whitelist). They import only narrow modules by design —
  keep new tests at that level; importing `run_build_capture` drags in the BD
  SDK and Coverity paths. No CI config, no linter config, no coverage config in
  this tree. No git repo either (extracted sdist).
- Local run: `blackduck-c-cpp -bc make -d <build_dir> -proj P -vers V -bd https://bd -a <token>`.
  `--skip_build` reuses a prior capture; `--offline` stops all uploads.
- Debug mode (`-dg True`) sends *all* matched files to BDBA and signature
  matching instead of only the pkg-manager-unmatched ones — that gate is
  `self.debug` inside `PkgManagerBom`.

### Edit playbook

| Task | Touch |
| --- | --- |
| New CLI/YAML option | `util/c_arg_parser.py` + read it in `RunBuildCapture.__init__` (`:50-178`); pass explicitly — there is no config propagation, every consumer takes positional args |
| Support a new OS/pkg manager | `pkg_manager_detector.get_platform` + a `run_<mgr>_command_batch`/`_run_<mgr>_query` pair in `pkg_manager_bom.py` + column list in `create_csv:936` |
| New file kind classified from Coverity output | `util/global_settings.py` patterns + `cov_json_parse.add_file_to_set:62` |
| New build-capture tool | `determine_cov_mode:994` + a `run_build_with_*` in `run_build_capture.py` + a parser branch in `build_log_parser.parse_build_log:322` |
| Change BOM→BDIO mapping | `bdio/bdio2_python_transformer.py:39` only; keep `katiska/` untouched |
| New scan-cli arg | `build_sig_scanner_command:561` — append to the argv **list**, never to a string |
