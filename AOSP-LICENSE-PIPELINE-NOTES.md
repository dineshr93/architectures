# AOSP 16 — Third-Party License Pipeline: Agent Reference

> **Purpose:** verified ground truth for the "Settings → Legal → Third-party licenses" feature.
> Read this before investigating the topic. Every claim below was read from source in this checkout.
> **Do not re-derive these. Do not trust the "obvious" names — see [Anti-Rework Index](#1-anti-rework-index--names-that-do-not-exist).**

- **Checkout:** `/home/dinesh/aosp16` (AOSP `android-16.0.0_r4`, `repo` multi-repo, product `vsoc_x86_64_only`)
- **Verified:** 2026-10-21/22
- **Companion diagram:** `.archify/architecture-third-party-licenses-20261021/review-2/third-party-licenses.html`

---

## 0. TL;DR mental model

Licensing is a **build-time data-flow problem, not a runtime one**. Nothing is scraped at runtime.

```
declare  →  propagate  →  serialize  →  aggregate  →  install  →  render
(Android.bp)  (Soong)      (meta_lic)    (SQLite)     (.gz files)  (Settings+HTMLViewer)
```

Two facts that explain most of the design:

1. **Transitivity is free** because licenses are modeled as *Soong dependencies*, not metadata strings.
2. **Settings cannot render the page itself** because it runs as UID 1000 — rendering is delegated out-of-process.

---

## 1. ANTI-REWORK INDEX — names that DO NOT exist

Searches for these will return nothing. They are from legacy Android 4.x-era tooling or plausible-sounding guesses. **Verified absent from this tree.**

| ❌ Name you may expect | ✅ Reality in AOSP 16 |
|---|---|
| `OslParser`, `OslHandler`, `OslSourceCodeProvider` | Gone. Real class: `LicenseHtmlGeneratorFromXml` (SettingsLib) |
| `LicenseEntry` | Gone. Replaced by two `Map`s inside `LicenseHtmlGeneratorFromXml` |
| `OpenSourceLicensesSettings`, `LicensesDetailsProvider` | Never existed. Real: `SettingsLicenseActivity` |
| `packages/apps/Settings/src/com/android/settings/legal/` | **No such package.** Real: `.../settings/deviceinfo/legal/` |
| `development/` OSL tooling | Removed years ago |
| `android_license` module type | Does not exist. Real: `license` + `license_kind` |
| `notice` module type | Does not exist. Real: `gen_notice` + `notice_xml` |
| `notice_html`, `notice_html_assets` | Zero hits across `build/` |
| `$(OUT_DIR)/notices/` | Does not exist |
| `generate_lic`, `check_lic`, `license_artifact` | Removed |
| `build/make/tools/notice*` | Does not exist. Tools live in `build/make/tools/compliance/` and `build/make/tools/sbom/` |
| `R.string.open_source_licenses` (in Settings) | Does not exist in Settings. Real key: `settings_license_activity_title` = "Third-party licenses" |
| `android.intent.action.SHOW_LICENSES` | Does not exist. Real: `android.settings.LICENSE` |
| Go code in `build/soong/licenses/` | **None.** That dir is pure `.bp` declarations. Go lives in `build/soong/android/` + `build/soong/compliance/` |

### ⚠️ Orphaned file — do not edit

`build/make/tools/generate-notice-files.py` (273 lines) has **zero references** from any `.mk`/`.bp`/`.go`. Legacy from 2012. Its logic survives only as a **copy** inside `LicenseHtmlGeneratorFromXml.java`. Editing it changes nothing.

---

## 2. Stage-by-stage map with verified line numbers

### Stage 0 — License kind vocabulary

| What | Where |
|---|---|
| ~180 `license_kind { name: "SPDX-license-identifier-*" }` modules | `build/soong/licenses/Android.bp:48-1247` |
| Custom kinds (e.g. `BSD-Binary-Only`) | `build/soong/licenses/Android.bp:39-46` |
| `license { name: "Android-Apache-2.0" }` — default for AOSP | `build/soong/licenses/Android.bp:26-32` |
| `license { name: "opensourcerequest" }` — stub text | `build/soong/licenses/Android.bp:34-37` |
| Module type registration | `build/soong/android/license_kind.go:31` (`LicenseKindFactory`) |
| Kind properties (`Conditions`, `Url`, `Visibility`) | `build/soong/android/license_kind.go:34-41` |

**Condition vocabulary** (drives all policy):

| Condition | Meaning |
|---|---|
| `unencumbered` | public domain |
| `permissive` | no obligations |
| `notice` | must show attribution ← **most common** |
| `reciprocal` | must share changes |
| `restricted` / `restricted_if_statically_linked` | copyleft (GPL family) |
| `by_exception_only` | needs approval |
| `not_allowed` / `proprietary` | cannot ship |

### Stage 1 — Declaration

Canonical example — `external/zlib/Android.bp:1-15`:

```blueprint
package {
    default_applicable_licenses: ["external_zlib_license"],
}

license {
    name: "external_zlib_license",
    visibility: [":__subpackages__"],
    license_kinds: [
        "SPDX-license-identifier-BSD",
        "SPDX-license-identifier-Zlib",
    ],
    license_text: ["LICENSE"],
}
```

**Key insight:** `cc_library { name: "libz" }` (same file, L184) declares **no** `licenses:` — it inherits the package default. This is the common case, not the exception.

Precedence order for how a module gets licenses:
1. Its own `licenses: [...]` — `build/soong/android/module.go:340`
2. Its package's `default_applicable_licenses` — fallback at `licenses.go:256-266`
3. `legacy_by_exception_only` if nothing declared (Make side, `build/make/core/notice_files.mk:63`)

`license` module type: `build/soong/android/license.go:44`; properties at `:47-58`.

### Stage 2 — Propagation (the clever part)

**File: `build/soong/android/licenses.go`** — four bottom-up passes, documented verbatim at L29-34:

```
Stage 1 - bottom-up records package-level default_applicable_licenses property mapped by package name.
Stage 2 - bottom-up converts licenses property or package default_applicable_licenses to dependencies.
Stage 3 - bottom-up type-checks every added applicable license dependency and license_kind dependency.
Stage 4 - GenerateBuildActions calculates properties for the union of license kinds, conditions and texts.
```

| Function | Line |
|---|---|
| `RegisterLicensesPackageMapper` → `licensesPackageMapper` | 109 / 121 |
| `RegisterLicensesPropertyGatherer` → `licensesPropertyGatherer` | 116 / 143 |
| `licensesPropertyFlattener` | 176 |
| `getLicenses` (property-or-package-default resolution) | 231 |
| `exemptFromRequiredApplicableLicensesProperty` | 270 |

**Dedup happens at flatten time** — `licenses.go:205-207`:
```go
m.base().commonProperties.Effective_license_text        = SortedUniqueNamedPaths(texts)
m.base().commonProperties.Effective_license_kinds      = SortedUniqueStrings(kinds)
m.base().commonProperties.Effective_license_conditions = SortedUniqueStrings(conditions)
```

**Mutated properties on every module** — `build/soong/android/module.go`:
```
340  Licenses []string
343  Effective_package_name          *string  `blueprint:"mutated"`
345  Effective_license_text          NamedPaths `blueprint:"mutated"`
347  Effective_license_kinds         []string `blueprint:"mutated"`
349  Effective_license_conditions    []string `blueprint:"mutated"`
```

### Stage 3 — Serialization to `meta_lic`

| What | Where |
|---|---|
| Proto schema (`LicenseMetadata` message) | `build/soong/compliance/license_metadata_proto/license_metadata.proto` |
| Producer function | `build/soong/android/license_metadata.go:39` (`buildLicenseMetadata`) |
| CLI tool | `build/soong/compliance/build_license_metadata/build_license_metadata.go:43` (`main`) |
| Output path assignment | `build/soong/android/module.go:2133` → `PathForModuleOut(ctx, "meta_lic")` |
| Invocation site | `build/soong/android/module.go:2317` |
| Container detection | `license_metadata.go:191` (`isContainerFromFileExtensions`) |

Proto fields: `package_name`, `module_name`, `module_types`, `module_classes`, `projects`, `license_kinds`, `license_conditions`, `license_texts`, `is_container`, `built`, `installed`, `install_map`, `sources`, `deps`.

Container extensions: `.zip .tar .tgz .tar.gz .img .srcszip .apex .capex`

**Real sample** — `out/soong/.intermediates/packages/modules/Wifi/apex/com.android.wifi/android_common_com.android.wifi/meta_lic`:
```
package_name: "Android"
module_name: "com.android.wifi"
module_types: "apex"
projects: "packages/modules/Wifi"
license_kinds: "SPDX-license-identifier-Apache-2.0"
license_conditions: "notice"
license_texts: "build/soong/licenses/LICENSE:Android"
license_texts: "build/soong/licenses/opensourcerequest"
is_container: true
installed: "out/target/product/vsoc_x86_64_only/system/apex/com.android.wifi.capex"
```

### Stage 4a — SQLite aggregation hub (newest architecture, least known)

**File: `build/soong/android/compliance_metadata.go`**

| What | Line |
|---|---|
| Singleton `GenerateBuildActions` | **333** |
| `importCsv` rule (uses `sqlite3_noicu`) | **307-314** |
| `modules.csv` write | 381 |
| `make_metadata.csv` / `make_modules.csv` | 385 / 386 |
| `buildComplianceMetadataProvider` | 237 |

Paths:
- `out/soong/compliance-metadata/<product>/modules.csv` — **164 MB**
- `out/soong/compliance-metadata/<product>/compliance-metadata.db` — **188 MB**
- Tables: `modules`, `make_metadata`, `make_modules`

`modules.csv` header (full schema, useful for queries):
```
id,name,package,module_type,os,arch,variant,is_static_lib,is_primary_arch,installed_files,built_files,static_deps,static_dep_files,whole_static_deps,whole_static_dep_files,header_libs,licenses,pkg_default_applicable_licenses,lic_license_kinds,lic_license_text,lic_package_name,lk_conditions,lk_url
```

**Why a DB?** The same metadata feeds **both** `NOTICE.xml.gz` and the SPDX SBOM without re-walking 20k protos twice.

### Stage 4b — `notice_xml` → the file Settings reads

**File: `build/soong/compliance/notice.go`**

| What | Line |
|---|---|
| Module type registration (`notice_xml`) | 38 |
| `genNoticeXmlRule` | **47-51** |
| Bail-out on disabled flag | **79** |
| Output `NOTICE.xml.gz` | 87 |
| Input = the compliance DB | 88 |
| Install to `<partition>/etc/NOTICE.xml.gz` | **103-104** |

Per-partition modules declared in `build/soong/compliance/Android.bp:34-75`:
`notice_xml_system`, `notice_xml_system_ext`, `notice_xml_system_dlkm`, `notice_xml_product`, `notice_xml_odm`, `notice_xml_odm_dlkm`, `notice_xml_vendor`, `notice_xml_vendor_dlkm`.

**Actual generator is Python:** `build/make/tools/sbom/gen_notice_xml.py` (229 lines)

| Function | Line |
|---|---|
| `md5_file_content` | 91 |
| `get_transitive_static_dep_modules` (BFS over static/whole-static) | 97 |
| `main` | 131 |
| Dedup loop | **209-220** |
| `gzip(..., mtime=0)` for reproducible builds | **225** |

```python
if filepath not in all_license_files:
    all_license_files[filepath] = md5_file_content(filepath)
md5 = all_license_files[filepath]
notice_xml_file.write(new_file_name_tag(installed_file_metadata, package_name, md5))
...
for filepath, md5 in all_license_files.items():
    if md5 not in processed_md5:
        processed_md5.append(md5)
        notice_xml_file.write(new_file_content_tag(md5, f.read()))
```

### Stage 4c — The other path: `gen_notice` + `htmlnotice` (per-APEX)

| What | Where |
|---|---|
| `gen_notice` module type | `build/soong/android/gen_notice.go:33` |
| `genNoticeBuildRules` singleton `GenerateBuildActions` | **38** |
| `htmlNotice()` entry | `build/make/tools/compliance/cmd/htmlnotice/htmlnotice.go:199` |
| `ReadLicenseGraph` | `:206` |
| `ResolveNotices` | `:215` |
| `IndexLicenseTexts` | `:217` |
| **MD5 dedup core** | `build/make/tools/compliance/noticeindex.go:528` (`md5.Sum`) |
| SPDX SBOM singleton | `build/soong/android/sbom.go:41` (`sbom_singleton`) |

Other CLI tools in `build/make/tools/compliance/cmd/`: `checkmetadata`, `checkshare`, `dumpgraph`, `dumpresolutions`, `htmlnotice`, `listshare`, `rtrace`, `shippedlibs`, `textnotice`, `xmlnotice`.

Policy code (OSPO-gated) in `build/make/tools/compliance/policy_*.go`.

### Stage 5 — Device-side rendering

**Entry chain:**

```
Settings → About phone → Legal information
  → packages/apps/Settings/res/xml/about_legal.xml:34   key="license"
  → LicensePreferenceController.java:23                 Intent("android.settings.LICENSE")
  → AndroidManifest.xml:1920                            resolves to SettingsLicenseActivity
```

**`packages/apps/Settings/src/com/android/settings/SettingsLicenseActivity.java`** — two-tier source selection:

```java
private static final String LICENSE_PATH = "/system/etc/NOTICE.html.gz";   // L45

protected void onCreate(Bundle savedInstanceState) {                        // L50
    File file = new File(LICENSE_PATH);
    if (isFileValid(file)) {
        showHtmlFromUri(Uri.fromFile(file));        // L55 — fast path, ABSENT on AOSP 16
    } else {
        showHtmlFromDefaultXmlFiles();              // L57 — ← what actually runs
    }
}
```
- `showHtmlFromDefaultXmlFiles()` — L75
- `FileProvider.getUriForFile(...)` — L81 (authority `com.android.settings.files`)
- `showHtmlFromUri()` — L94; `intent.setComponent(componentName)` — L109 → `com.android.htmlviewer`

**`frameworks/base/packages/SettingsLib/.../license/LicenseHtmlLoaderCompat.java`**

```java
static final String[] DEFAULT_LICENSE_XML_PATHS = {   // L35-45 — nine partitions
    "/system/etc/NOTICE.xml.gz",      "/vendor/etc/NOTICE.xml.gz",
    "/odm/etc/NOTICE.xml.gz",        "/oem/etc/NOTICE.xml.gz",
    "/product/etc/NOTICE.xml.gz",    "/system_ext/etc/NOTICE.xml.gz",
    "/vendor_dlkm/etc/NOTICE.xml.gz","/odm_dlkm/etc/NOTICE.xml.gz",
    "/system_dlkm/etc/NOTICE.xml.gz",
};
static final String NOTICE_HTML_FILE_NAME = "NOTICE.html";   // L46
```
- `getVaildXmlFiles()` (sic typo) — L80-89
- `getCachedHtmlFile()` — L91-93 → `context.getCacheDir()/NOTICE.html`
- `isCachedHtmlFileOutdated()` — L95-107 (mtime comparison against every XML)

**`frameworks/base/packages/SettingsLib/.../license/LicenseHtmlGeneratorFromXml.java`** (445 lines) — the real "parser"

| What | Line |
|---|---|
| XML tag/attr constants (`licenses`, `file-name`, `file-content`, `contentId`, `lib`) | 54-58 |
| `mContentIdToFileContentMap` (MD5 → text) | **113** |
| `mFileNameToLibraryToContentIdMap` (file → lib → MD5) | ~104 |
| `generateHtml(List<File>, File, String)` static entry | 128 |
| `parse(File)` — transparently gunzips `.gz` | 163-189 |
| `parse(InputStreamReader, ...)` — `XmlPullParser` loop | **207-268** |
| `generateHtml(...)` — emits TOC + `<pre class="license-text">` | 294+ |

Header comment (L45-51) admits: *"All the HTML snippets and logic are copied from `build/make/tools/generate-notice-files.py`."*

**`packages/apps/HTMLViewer/src/com/android/htmlviewer/HTMLViewerActivity.java`** — the actual WebView

| What | Line |
|---|---|
| `setBlockNetworkLoads(true)` | **78** |
| `setJavaScriptEnabled(false)` | **83** |
| `loadUrl()` | 96-101 |
| On-the-fly gunzip in `shouldInterceptRequest()` | **183** |

**Per-APEX path (RecyclerView of module licenses):**

| What | Where |
|---|---|
| `ModuleLicensesPreferenceController.displayPreference` | `.../deviceinfo/legal/ModuleLicensesPreferenceController.java:43-56` |
| Filter: module assets must contain `NOTICE.html.gz` | same file, `Predicate.test()` L64-76 |
| `ModuleLicenseProvider` authority + filenames | `.../deviceinfo/legal/ModuleLicenseProvider.java:46-49` |
| `openFile()` — gunzips APEX asset into cache | **85-117** |
| `checkUri()` — strict validation | 154-176 |
| Click handler + UID-1000 comment | `ModuleLicensePreference.java:44-63` |

---

## 3. Measured facts from THIS build

Product `aosp_cf_x86_64_only_phone` / `vsoc_x86_64_only`, soong-only.

| Artifact | Value |
|---|---|
| `meta_lic` textprotos | **20,055** |
| `compliance-metadata.db` | **188 MB** |
| `modules.csv` | **164 MB** |
| `system/etc/NOTICE.xml.gz` | 348,883 B — **2,600** `<file-name>` / **329** `<file-content>` (≈7.9:1 dedup) |
| `product/etc/NOTICE.xml.gz` | 201,645 B |
| `vendor/etc/NOTICE.xml.gz` | 93,228 B |
| `system_ext/etc/NOTICE.xml.gz` | 71,738 B |
| + `odm`, `vendor_dlkm`, `system_dlkm`, `odm_dlkm` | 4–5 KB each |
| Host tools built | `build_license_metadata`, `gen_notice_xml`, `htmlnotice`, `textnotice` |

**`/system/etc/NOTICE.html.gz` does NOT exist** in this build. Confirmed by direct check. This is why the on-device XML→HTML generation path runs.

Sample XML structure:
```xml
<file-name contentId="b8b9862d565b7b0106106ac3ea42fab6" lib="Android">/system/apex/com.android.adbd.capex</file-name>
<file-content contentId="67459f64e6325b6ffaa3e53946688e6f"><![CDATA[To obtain the source code for third-party components...]]></file-content>
```

The `67459f64...` content ID is the `opensourcerequest` stub from `build/soong/licenses/opensourcerequest` — every AOSP build carries it.

---

## 4. Key design constraints (the "why")

1. **MD5 is the dedup key everywhere** — `noticeindex.go:528`, `gen_notice_xml.py:91`, and the `contentId` XML attribute. **For identity, not security.** Do not "fix" it by switching to SHA-256 for security reasons; it is not a security boundary.

2. **Settings runs as UID 1000 (`android.uid.system`).** Hosting a WebView there is a security risk, so rendering is delegated out-of-process to the unprivileged `com.android.htmlviewer` app. This is stated explicitly in source comments in both `SettingsLicenseActivity` and `ModuleLicensePreference`. **Any proposal to render licenses inside Settings is blocked by this.**

3. **Two parallel HTML generation paths exist and share NO code:**
   - Monolithic → `gen_notice_xml.py` (build) + `LicenseHtmlGeneratorFromXml.java` (device)
   - Per-APEX → `htmlnotice` Go tool (build), pre-rendered into APEX assets

4. **`DISABLE_NOTICE_XML_GENERATION`** — `build/soong/android/config.go:1801-1802`, checked at `build/soong/compliance/notice.go:79`. **If licenses suddenly vanish from a build, check this env var first.**

5. **AOSP 16 has a Kotlin "Catalyst" twin** of the legal screens, kept in sync with the Java via `// LINT.IfChange` / `// LINT.ThenChange` pairs:
   - `LegalSettingsScreen.kt:42` — `isFlagEnabled() = Flags.catalystLegalInformation()`
   - `LegalSettingsScreen.kt:49` — `+LegalPreference("license", R.string.license_title, "android.settings.LICENSE")`
   - **If you change the Java `LegalPreferenceController` you must change the Kotlin `LegalPreference` too, or lint fails.**
   - `ModuleLicensesScreen.kt` has `isFlagEnabled() = false` with comment *"Let system render the legacy UI"* — module licenses still uses the Java `ModuleLicensesDashboard`.

6. **Reproducible builds** — `gen_notice_xml.py:225` uses `gzip(..., mtime=0)`.

---

## 5. Make-side orchestration (for `Android.mk` / legacy work)

| What | Where |
|---|---|
| `.PHONY: notice_files` | `build/make/core/Makefile:1869` |
| `define text-notice-rule` | `build/make/core/Makefile:1878` |
| `define html-notice-rule` | `build/make/core/Makefile:1894` |
| `ifeq (,$(DISABLE_NOTICE_XML_GENERATION))` block | `build/make/core/Makefile:1941-1961` |
| Partition bucketing of license modules | `build/make/core/Makefile:1974-1996` |
| `corresponding-license-metadata` | `build/make/core/definitions.mk:561` |
| `declare-license-metadata` | `build/make/core/definitions.mk:588` |
| `declare-container-license-metadata` | `build/make/core/definitions.mk:809` |
| `declare-1p-target` (canonical "this is AOSP Apache-2.0") | `build/make/core/definitions.mk:836` |
| `report-missing-licenses-rule` | `build/make/core/definitions.mk:~903` |
| Per-partition phony targets (`systemlicense`, `vendorlicense`, …) | `build/make/core/os_licensing.mk` |
| `$(call build-license-metadata)` — must run **after** `fix-notice-deps` | `build/make/core/main.mk:1663-1666` |

androidmk conversion map (`build/soong/androidmk/androidmk/android.go`):
```
L62   "LOCAL_NOTICE_FILE"        → localizePathList("android_license_files")
L198  "LOCAL_LICENSE_KINDS"     → "android_license_kinds"
L201  "LOCAL_LICENSE_CONDITIONS"→ "android_license_conditions"
```
Note: `android_license_kinds` / `android_license_files` are **androidmk-converted property names only** — they are not Soong module types.

---

## 6. Strings reference

`packages/apps/Settings/res/values/strings.xml`:

| Line | Key | Value |
|---|---|---|
| 4320 | `legal_information` | Legal information |
| 4330 | `copyright_title` | Copyright |
| **4334** | **`license_title`** | **License** |
| 4338 | `module_license_title` | Google Play system update licenses |
| 4342 | `terms_title` | Terms and conditions |
| 4346 | `webview_license_title` | System WebView License |
| **4360** | **`settings_license_activity_title`** | **Third-party licenses** |
| 4362 | `settings_license_activity_unavailable` | There is a problem loading the licenses. |

SettingsLib: `frameworks/base/packages/SettingsLib/res/values/strings.xml:1483` — `notice_header` is **empty** (`translatable="false"`).

Intent actions that exist: `android.settings.LICENSE`, `android.settings.MODULE_LICENSES`, `android.settings.COPYRIGHT`, `android.settings.TERMS`, `android.settings.WEBVIEW_LICENSE`.

---

## 7. Full call chain (copy-paste reference)

```
Android.bp: package{default_applicable_licenses} + license{} + license_kind{}
    │
    │ Stage1 licensesPackageMapper        licenses.go:121
    │ Stage2 licensesPropertyGatherer     licenses.go:143
    │ Stage3/4 licensesPropertyFlattener licenses.go:176
    │            → Effective_license_{text,kinds,conditions}   module.go:343-349
    ▼
buildLicenseMetadata (license_metadata.go:39) → build_license_metadata CLI
    → out/soong/.intermediates/<mod>/<variant>/meta_lic        [20,055 textprotos]
    │
    ├──► complianceMetadataSingleton (compliance_metadata.go:333)
    │       modules.csv → importCsv/sqlite3 (:307) → compliance-metadata.db (188MB)
    │            ├──► notice_xml (compliance/notice.go:47) → gen_notice_xml.py
    │            │      → <partition>/etc/NOTICE.xml.gz   [2600 names / 329 contents]
    │            └──► sbom_singleton (sbom.go:41) → sbom.spdx.json
    │
    └──► genNoticeBuildRules (gen_notice.go:38) → htmlnotice
           ReadLicenseGraph(:206) → ResolveNotices(:215) → IndexLicenseTexts(:217)
           → per-APEX NOTICE.html.gz  (into APEX assets)

                    ═══════════ device boot ═══════════

Settings → About phone → Legal information → "License"
  └─ about_legal.xml:34 → LicensePreferenceController:23
       └─ Intent("android.settings.LICENSE") → Manifest:1920
            └─ SettingsLicenseActivity
                 ├─ /system/etc/NOTICE.html.gz?  → ABSENT on AOSP 16
                 └─ showHtmlFromDefaultXmlFiles()  (:75)
                      └─ LicenseHtmlLoaderCompat — scans 9× <partition>/etc/NOTICE.xml.gz
                           └─ LicenseHtmlGeneratorFromXml.parse()  (XmlPullParser + GZIPInputStream)
                                └─ writes getCacheDir()/NOTICE.html
                                     └─ FileProvider → content://com.android.settings.files/my_cache/NOTICE.html
                                          └─ ACTION_VIEW text/html
                                               └─ com.android.htmlviewer/.HTMLViewerActivity
                                                    └─ WebView (JS off, network blocked)
```

---

## 8. How to re-verify quickly

```bash
cd /home/dinesh/aosp16

# Count meta_lic protos
find out/soong/.intermediates -name meta_lic | wc -l

# Inspect the installed notice file
zcat out/target/product/vsoc_x86_64_only/system/etc/NOTICE.xml.gz | head -20
zcat out/target/product/vsoc_x86_64_only/system/etc/NOTICE.xml.gz | grep -c '<file-name'
zcat out/target/product/vsoc_x86_64_only/system/etc/NOTICE.xml.gz | grep -c '<file-content'

# Query the compliance DB
sqlite3 out/soong/compliance-metadata/aosp_cf_x86_64_only_phone/compliance-metadata.db \
  ".tables" ".schema modules"

# Confirm NOTICE.html.gz is absent (proves the XML path runs)
ls out/target/product/*/system/etc/NOTICE.html.gz   # → No such file

# Trace a single license from declaration to output
grep -rn 'default_applicable_licenses' external/zlib/Android.bp
```

---

## 9. Repo identity (for provenance)

AOSP `refs/tags/android-16.0.0_r4`. Root is **not** a git repo — it is a `repo` multi-repo checkout. All six relevant projects were **clean** (no local modifications) at time of verification.

| Project | HEAD |
|---|---|
| `build/soong` | `f389fa2a2a768a93bc99957e2288f3fbee032bff` |
| `build/make` | `b815dded1eafbf06191a6ae306956bb6ed6fb415` |
| `packages/apps/Settings` | `f6ec09afb00fb635e247687e032c39ed0c1ec21b` |
| `frameworks/base` | `45034f0663f960d9ee5fb0a101a4732b71f6e2f4` |
| `packages/apps/HTMLViewer` | `baa35c607e99e00199ade178da644f4e7ef5bc41` |
| `external/zlib` | `a6f47e8bd7c1ba412c4b5a3539aa77fe628d0172` |

Remote: `aosp` → `https://android.googlesource.com/` (fetch `..`)

**Note for tooling:** because there is no single git root, tools that verify source evidence against one pinned repo cannot validate cross-project citations here. Line numbers in this doc were verified by direct file reads, not git verification.

---

## 10. Diagram artifacts

| Path | Status |
|---|---|
| `.archify/architecture-third-party-licenses-20261021/review-2/third-party-licenses.html` | ✅ **Use this** — all gates passed |
| `.archify/architecture-third-party-licenses-20261021/candidate.json` | Diagram source (edit + re-finalize) |
| `.archify/architecture-third-party-licenses-20261021/candidate.pre-repair.json` | Pre-reflow backup |
| `.archify/architecture-third-party-licenses-20261021/third-party-licenses.html` | ⚠️ **STALE** — pre-reflow render, ignore |
| `.archify/architecture-third-party-licenses-20261021/visual-check/*.png` | Capture screenshots |

Re-render after editing the candidate:
```bash
cd /home/dinesh/aosp16
node ~/.agents/skills/archify/bin/archify.mjs finalize architecture \
  .archify/architecture-third-party-licenses-20261021/candidate.json \
  .archify/architecture-third-party-licenses-20261021/review-3/third-party-licenses.html \
  --quality showcase \
  --out-dir .archify/architecture-third-party-licenses-20261021/review-3 --json
```
Use a **fresh `--out-dir`** each run — the previous HTML owns its browser evidence.

---

## 11. Known open items / where work lands

| Task | Where to change it |
|---|---|
| Add a new license kind | `build/soong/licenses/Android.bp` (add `license_kind`) |
| Fix a wrong license on a module | That module's `Android.bp` `licenses:` or its `package{}` default |
| Change the rendered HTML layout | `LicenseHtmlGeneratorFromXml.java` (device) — **not** the orphaned `.py` |
| Change what gets deduped | `gen_notice_xml.py:209-220` (monolithic) or `noticeindex.go:528` (per-APEX) |
| Add a new legal preference row | `about_legal.xml` **AND** `LegalSettingsScreen.kt` (LINT-synced) |
| Change WebView hardening | `HTMLViewerActivity.java:78-83` |
| Licenses missing from device | Check `DISABLE_NOTICE_XML_GENERATION`, then `reportmissinglicenses` |

---

*Generated 2026-10-22. Every line number read directly from source in this checkout. If you find a drift, correct this file rather than leaving a comment elsewhere.*
