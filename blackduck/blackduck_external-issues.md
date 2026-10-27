# External issues • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/external-issues.html

Bridge enables automated creation of external issues from scan findings, streamlining vulnerability management for developers. GitHub repositories are currently supported.

Bridge CLI automatically opens and maintains external issues for security and compliance scan findings detected by:

- Polaris (SAST and SCA)

- Black Duck® SCA

## Why use external issues?

Key benefits for developers include:

- Immediate visibility of security issues in repositories.
- Customizable controls to match team risk tolerance and workflow preferences.
- Reduced context switching—developers can triage and resolve issues where they already work.

## External issues parameters

The following parameters can be configured to control when external issues are created:

| Parameters          | Description                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue creation      | Enable or disable the creation of external issues from scan findings.                                                                          |
| Severity levels     | Specify which findings generate issues by severity, selecting from `Critical`, `High`, `Medium`, or `Low`.                                     |
| Scan type filtering | For Polaris only, specify which scan types (SAST, SCA, or both) generate external issues.                                                      |
| SCA grouping        | For SCA findings, group related vulnerabilities affecting the same open source component and version into a single issue.                      |
| Issue limit         | Maximum limit for the total number of external issues that can exist at any given time in the repository for each assessment. Default is `10`. |

## How external issues works

When this feature is enabled, Bridge CLI:

- Runs configured scans.

- Creates issues in the external repository for findings that match configured criteria.

- Updates existing external issues when findings change.

- Closes issues when the underlying findings are no longer present in the latest scan.

Note: External issues are not created from Pull Request scan findings.

If issues are triaged in Polaris then the corresponding issues in the SCM repository (for example GitHub) are synchronised and closed.

## Information included in SAST issues

Each SAST issue created by Bridge provides detailed information to help developers understand and remediate code vulnerabilities in their application. SAST issues include:

- Severity level (Critical, High, Medium, or Low).

- Issue type (for example, SQL Injection, Cross-Site Scripting).

- File path and line number where the issue was detected.

- Number of occurrences of the issue in the codebase.

- Description of the vulnerability and why it matters.

- Local Effect section describing the potential impact of the vulnerability.

- Detailed remediation guidance with specific steps to fix the issue.

- References such as CWE identifiers with links to definitions, when available.

- Contributing code events showing the detailed data flow from source to sink, with file paths and line numbers for each event in the flow.

- Code snippets showing the vulnerable code segments.

- Polaris project/branch name.

- Link to view full details in Polaris.

SAST issues are clearly marked as being created by Black Duck tooling so that teams can easily distinguish them from manually created issues.

[![](https://docs.blackduck.com/api/khub/maps/ilBVZr_kR5v3KVjK1p~wbw/resources/dlxfphxxBxC312OhGrX8bg-ilBVZr_kR5v3KVjK1p~wbw/resized-content?v=6eb854e247551f1c&Ft-Calling-App=ft/turnkey-portal)](https://docs.blackduck.com/viewer/attachment/ilBVZr_kR5v3KVjK1p~wbw/dlxfphxxBxC312OhGrX8bg-ilBVZr_kR5v3KVjK1p~wbw)

## Information included in SCA issues

There are two modes for creating SCA issues: grouped (default) and ungrouped.

| Mode                  | Description                                                                                                                                                              | When to use                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Grouped (default)** | All vulnerabilities for a specific component-version pair are consolidated into a single issue. For example, a library with five CVEs creates one issue instead of five. | Use this mode to reduce clutter and help teams prioritize remediation at the component level.                      |
| **Ungrouped**         | Each vulnerability generates its own separate issue, providing granular tracking with distinct lifecycles per CVE.                                                       | Use this mode for detailed audit trails or compliance requirements that mandate individual vulnerability tracking. |

Each SCA issue created by Bridge provides comprehensive information about vulnerable dependencies and guidance for remediation. SCA issues include:

- Severity level (Critical, High, Medium, or Low).

- Component name, version, and origin (for example, Maven coordinates).

- Indication of whether the component is a direct dependency or a transitive dependency.

- File path and line number where the dependency is declared.

- Vulnerability summary table showing the count of vulnerabilities by severity level (Critical, High, Medium, Low).

- Detailed upgrade guidance table with short-term and long-term version recommendations.

- Comprehensive vulnerabilities table including:

  * Severity of each vulnerability.

  * Vulnerability identifiers (CVE and BDSA) with links to vulnerability databases.

  * CWE identifiers, when available.

  * Summary description of each vulnerability.

  * Indication of whether a solution or workaround is available.

- Link to view full details in Black Duck® SCA or Polaris.

- Component source repository links, when available.

SCA issues are clearly marked as being created by Black Duck tooling so that teams can easily distinguish them from manually created issues.

[![GitHub SCA issue screenshot](https://docs.blackduck.com/api/khub/maps/ilBVZr_kR5v3KVjK1p~wbw/resources/0CTIp29ov1oc8YMu3RXQfg-ilBVZr_kR5v3KVjK1p~wbw/resized-content?v=703fbd7340f6c4e0&Ft-Calling-App=ft/turnkey-portal)](https://docs.blackduck.com/viewer/attachment/ilBVZr_kR5v3KVjK1p~wbw/0CTIp29ov1oc8YMu3RXQfg-ilBVZr_kR5v3KVjK1p~wbw)

## Limitations

- Currently available for GitHub repositories.
- External issues can only be created from Polaris and Black Duck® SCA full scan results.
- Older, product-specific integrations and clients by Black Duck Software do not support this feature.
