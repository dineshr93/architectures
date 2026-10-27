# Using the Black Duck Security Scan Action with Black Duck SCA • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/using-the-black-duck-security-scan-action-with-black-duck-sca.html

As a GitHub Actions with Black Duck® SCA customer, you can use Bridge CLI to automate SCA scanning in your CI pipeline.

You can use Bridge CLI with Black Duck® SCA in the following ways:

- Adding pull request comments to GitHub
- Exporting a SARIF file
- Uploading Black Duck® SCA issues to GitHub Advanced Security

The Black Duck Security Scan Action supports both self-hosted (e.g., on-prem) and Black Duck hosted Black Duck® SCA Hub instances.

In the default Black Duck® SCA Hub permission model, projects and project versions are created on the fly and as needed. Ensure that permissions needed to create projects and project versions are granted on Black Duck® SCA Hub.

For an overview about using PR Comments, please see the following documentation page: [Pull request (PR) comments](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Cd5lpl42tqjo6yiZrKiI8Q)

Black Duck Security Scan Action requires that you run full “intelligent” Black Duck® SCA scans for SCM push events and “rapid” ephemeral scans for SCM pull request events as shown in the example below.

Note: Detect specific options can be passed through Detect environment variables.

Below is an example of a `workflow.yml` file configured for Black Duck® SCA.

```yml
name: CI-BlackDuck-SCA-Basic
on:
  push:
    branches: [main, master, develop, stage, release]
  pull_request:
    branches: [main, master, develop, stage, release]
  workflow_dispatch:

jobs:
  build:
    runs-on: [ubuntu-latest]
    steps:
    - name: Checkout Source
      uses: actions/checkout@v5
    - name: Black Duck SCA Scan
      id: black-duck-sca-scan
      uses: blackduck-inc/black-duck-security-scan@v2

      ### Configure DETECT environment variables
      env:
        DETECT_PROJECT_NAME: ${{ github.event.repository.name }}

      with:
        ### SCANNING: Required fields
        blackducksca_url: ${{ vars.BLACKDUCK_URL }}
        blackducksca_token: ${{ secrets.BLACKDUCK_TOKEN }}

        ### SCANNING: Optional fields
        # blackducksca_scan_failure_severities: 'BLOCKER,CRITICAL'

        ### Github Issues
        # blackducksca_externalIssues_create: true
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Mandatory when blackducksca_externalIssues_create is set to 'true'

        ### FIX PULL REQUEST CREATION: Uncomment below to enable
        # blackducksca_fixpr_enabled: true
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Required when Fix PRs is enabled

        ### PULL REQUEST COMMENTS: Uncomment below to enable
        # blackducksca_prcomment_enabled: true
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Required when PR comments is enabled

        ### SARIF report generation and upload to GitHub Adavanced Security: Uncomment below to enable
        # blackducksca_reports_sarif_create: true # Create Black Duck SCA SARIF report and upload it as artifact
        # blackducksca_upload_sarif_report: true  # Upload Black Duck SCA SARIF report in GitHub Advanced Security tab
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Required when blackducksca_upload_sarif_report is set as true

        ### Mark build status if policy violating issues are found
        # mark_build_status: 'success'

        ### To enabable self-signed certificates.
        # network_ssl_trustAll: true
        # network_ssl_cert_file: '/Users/Config/cert.pem'

        ### Uncomment below configuration to add custom logic based on return status
        # - name: cmdLine
        #   id: cmdLine
        #   run: |
        #     EXIT_CODE=${{ steps.black-duck-security-scan.outputs.status }}
        #     echo "Black Duck Security Scan exit status - $EXIT_CODE"
```

**Creating Fix Pull requests**

- `blackduck_fixpr_enabled`: By default, fix pull request creation is disabled (Black Duck Security Scan Action will not create fix pull requests for vulnerable direct dependencies.). To enable this feature, set `blackduck_fixpr_enabled` as `true`.
- `github_token`: You must pass `github_token` parameter with required permissions. The token can be GitHub `secrets.GITHUB_TOKEN` with required permissions. For more information on GitHub tokens see the [GitHub documentation](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- Due to rate limit restriction of GitHub rest API calls, note that GitHub might limit the number of pull requests that are created by Black Duck Security Scan Action.

What follows is a more detailed example of a `workflow.yml` file configured for Black Duck SCA for more advanced users.

```yml
name: CI-BlackDuck-SCA
  on:
    push:
      branches: [main, master, develop, stage, release]
    pull_request:
      branches: [main, master, develop, stage, release]
  jobs:
    build:
      runs-on: [ubuntu-latest]
    steps:
    - name: Checkout Source
      uses: actions/checkout@v5
    - name: Black Duck SCA Full Scan
      id: black-duck-full-scan
      if: ${{ github.event_name != 'pull_request' }}
      uses: blackduck-inc/black-duck-security-scan@v2

      ### Use below configuration to set specific detect environment variables
      env:
        DETECT_PROJECT_NAME: ${{ github.event.repository.name }}
      with:
        blackducksca_url: ${{ vars.BLACKDUCK_URL }}
        blackducksca_token: ${{ secrets.BLACKDUCK_TOKEN }}
        blackducksca_scan_full: true
        # blackducksca_waitForScan: false   # Used to support the async mode

        ### Accepts Multiple Values
        blackducksca_scan_failure_severities: 'BLOCKER,CRITICAL'

        ### Arbitrary product-related CL arguments
        # detect_search_depth: 2
        # detect_args: '--detect.diagnostic=true'
        # detect_config_path: '/Users/Config/application.properties'

        ### Uncomment below configuration to enable automatic fix pull request creation if vulnerabilities are reported
        # blackducksca_fixpr_enabled: true
        # blackducksca_fixpr_maxCount: 10
        # blackducksca_fixpr_filter_severities: 'CRITICAL,HIGH'
        # blackducksca_fixpr_useUpgradeGuidance: 'SHORT_TERM,LONG_TERM'
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Mandatory when blackducksca_fixpr_enabled is set to 'true'

        ### SARIF report generation and upload to GitHub Adavanced Security: Uncomment below to enable
        # blackducksca_reports_sarif_create: true # Create Black Duck SCA SARIF report and upload it as artifact
        # blackducksca_reports_sarif_file_path: '/Users/tmp/report.sarif.json' # File path including file name where SARIF report should be created(need to include file name as well)
        # blackducksca_reports_sarif_severities: 'CRITICAL,HIGH'
        # blackducksca_reports_sarif_groupSCAIssues: true # By default true
        # blackducksca_upload_sarif_report: true  # Upload Black Duck SCA SARIF report in GitHub Advanced Security tab
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Required when blackducksca_upload_sarif_report is set as true

        ### Github Issues
        # blackducksca_externalIssues_create: true
        # blackducksca_externalIssues_severities: "critical,high,medium"
        # blackducksca_externalIssues_groupSCAIssues: true
        # blackducksca_externalIssues_maxCount: 5
        # github_token: ${{ secrets.GITHUB_TOKEN }} # Mandatory when blackducksca_externalIssues_create is set to 'true'

        ### Mark build status if policy violating issues are found
        # mark_build_status: 'success'

        ### To enable Black Duck SCA policy badges
        # blackducksca_policy_badges_create: true
        # blackducksca_policy_badges_maxCount: 5

        # project_directory: ${{ vars.PROJECT_DIRECTORY }}

        ### Uncomment below configuration if Bridge diagnostic files needs to be uploaded
        # include_diagnostics: true

        ### To enabable self-signed certificates
        #network_ssl_trustAll: true
        #network_ssl_cert_file: '/Users/Config/cert.pem'

    - name: Black Duck SCA PR Scan
      id: black-duck-pr-scan
      if: ${{ github.event_name == 'pull_request' }}
      uses: blackduck-inc/black-duck-security-scan@v2

      ### Use below configuration to set specific detect environment variables
      env:
        DETECT_PROJECT_NAME: ${{ github.event.repository.name }}
      with:
        blackducksca_url: ${{ vars.BLACKDUCK_URL }}
        blackducksca_token: ${{ secrets.BLACKDUCK_TOKEN }}
        blackducksca_scan_full: false

        ### Below configuration is used to enable automatic pull request comment based on Black Duck SCA scan result
        blackducksca_prComment_enabled: true
        github_token: ${{ secrets.GITHUB_TOKEN }}
        # Mandatory when blackducksca_automation_prcomment is set to 'true'

        ### To enable Black Duck SCA policy badges
        # blackducksca_policy_badges_create: true
        # blackducksca_policy_badges_maxCount: 5

        # project_directory: ${{ vars.PROJECT_DIRECTORY }}

        ### Uncomment below configuration if Bridge diagnostic files needs to be uploaded
        # include_diagnostics: true

        ### Mark build status if policy violating issues are found
        # mark_build_status: 'success'

        ### To enabable self-signed certificates
        # network_ssl_trustAll: true
        # network_ssl_cert_file: '/Users/Config/cert.pem'

        ### Uncomment below configuration to add custom logic based on return status
        # - name: cmdLine
        #   id: cmdLine
        #   run: |
        #     EXIT_CODE=${{ steps.black-duck-full-scan.outputs.status }}
        #     echo "Black Duck Full Scan exit status - $EXIT_CODE"  

```

Note: SARIF report creation is only supported for non MR/PR scans.

*Table 1. **List of mandatory and optional parameters for Black Duck® SCA***

| **Input Parameter**                          | Description                                                                                                                                                                                              | Mandatory / Optional                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `blackducksca_token`                         | Black Duck® SCA API token                                                                                                                                                                                | Mandatory                                                                                                                      |
| `blackducksca_externalIssues_create`         | Enable creation of Blackduck SCA GitHub Issues. Flag to enable/disable GitHub issues creation from scan findings. When `false`, no external issues are created. **Default:**`false`                      | Optional                                                                                                                       |
| `blackducksca_externalIssues_severities`     | List of Blackduck SCA severities for which GitHub issues should be created. List of severities `["Critical", "High", "Medium", "Low"]`. **Default:**`["Critical", "High"]`                               | Optional                                                                                                                       |
| `blackducksca_externalIssues_groupSCAIssues` | Flag to denote whether to group SCA issues by vulnerabilities of a component‑version pair while creating external issues. **Default:**`true`                                                             | Optional                                                                                                                       |
| `blackducksca_externalIssues_maxCount`       | Maximum number of GitHub issues to create at any given time per assessment/workflow. For Black Duck SCA workflows, default limits SCA issues to 10 when not specified. **Default:**`10`                  | Optional                                                                                                                       |
| `blackducksca_prComment_enabled`             | Option to enable pull request comments for new issues found in the pull request. Baseline full scan results must exist on the server for this feature to work. Note: The merge request from the feature branch to the main branch must exist for this feature to work. **Default**: `false` | Optional                                                                                                                       |
| `blackducksca_fixpr_enabled`                 | Enables or disables Fix PRs creation for Black Duck® SCA. When set to true, a fix PR is created for each vulnerable direct dependency. **Accepted values**: true, false **Default**: false.              | Optional                                                                                                                       |
| `blackducksca_fixpr_maxCount`                | Sets the maximum number of fix pull requests that can be created on a branch. Accepts integer values.                                                                                                    | Optional                                                                                                                       |
| `blackducksca_fixpr_filter_severities`       | Creates Fix PRs only for issues with the severity level specified. The value is a comma-separated list. Supported severities: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`                                        | Optional                                                                                                                       |
| `blackducksca_fixpr_useUpgradeGuidance`      | Allows the user to specify short-term or long-term upgrade guidance, or both. If both values are provided, the first takes priority, and the second value is used only if the first returns no results. If upgrade guidance is not available, the fix PR is not created. **Accepted values:** `SHORT_TERM` `LONG_TERM` `SHORT_TERM, LONG_TERM` `LONG_TERM, SHORT_TERM` **Default:**`"SHORT_TERM, LONG_TERM"` | Optional                                                                                                                       |
| `detect_install_directory`                   | Installation directory for Black Duck® SCA.                                                                                                                                                              | Optional                                                                                                                       |
| `blackducksca_scan_failure_severities`       | Black Duck® SCA scan failure severities. Accepted severities: `ALL`, `NONE`, `BLOCKER`, `CRITICAL`, `MAJOR`, `MINOR`, `OK`, `TRIVIAL`, `UNSPECIFIED` **Default**: `"CRITICAL, HIGH"`                     | Optional                                                                                                                       |
| `blackducksca_scan_full`                     | Specifies whether full scan is required or not. Must be set to `true` for push events and `false` for pull request events. **Default**: `false`                                                          | Optional                                                                                                                       |
| `blackducksca_url`                           | Black Duck® SCA URL                                                                                                                                                                                      | Mandatory                                                                                                                      |
| `github_token`                               | GitHub Access Token Example: `github_token: ${{ secrets.GITHUB_TOKEN }}`                                                                                                                                 | Mandatory if `blackduck_automation_fixpr` or `blackduck_prComment_enabled` or `blackduck_upload_sarif_report` is set as `true` |
| `blackducksca_reports_sarif_create`          | Set this to `true` to generate SARIF report. **Default**: `false` Note: SARIF reports can be generated for any configured branch; however, report generation is not supported in a PR/MR context.        | Optional                                                                                                                       |
| `blackducksca_reports_sarif_file_path`       | File path (including file name) where SARIF report is created. When the Bridge version is lower than 3.5.0, the default SARIF file path will be: **Default**: `.bridge/Blackduck SCA SARIF Generator/report.sarif.json` If the Bridge version is greater than 3.5.0, the default SARIF file path will be: **Default**: `.blackduck/integrations/blackducksca/sarif/report.sarif.json` | Optional                                                                                                                       |
| `blackducksca_reports_sarif_severities`      | Comma-separated list of SAST/SCA issue severities to include in SARIF file report. Valid severities are `Critical`, `High`, `Medium`, `Low`, and `Informational`. **Default**: All severities are included. | Optional                                                                                                                       |
| `blackducksca_reports_sarif_groupSCAIssues`  | When set to true, SCA issues are grouped by component. Set this to false to list SCA issues by vulnerability. **Default**: `true`                                                                        | Optional                                                                                                                       |
| `blackducksca_upload_sarif_report`           | Set this to `true` to upload Black Duck SCA SARIF issues to GitHub Advanced Security.                                                                                                                    | Optional                                                                                                                       |
| `detect_search_depth`                        | Number indicating the search depth in the source directory.                                                                                                                                              | Optional                                                                                                                       |
| `detect_config_path`                         | Black Duck® SCA config file path location.                                                                                                                                                               | Optional                                                                                                                       |
| `detect_args`                                | Additional arguments for Black Duck® SCA.                                                                                                                                                                | Optional                                                                                                                       |
| `project_directory`                          | The project source directory. Defaults to the repository root directory. Set this to specify a custom folder that is other than repository root.                                                         | Optional                                                                                                                       |
| `blackducksca_waitForScan`                   | Specifies whether the workflow should wait for the analysis to complete or not. Supported values: `true` or `false` **Default**: `true` If set to false, post scan workflows like PR comment, Fix PR, SARIF etc. will not be applicable. | Optional                                                                                                                       |
| `blackducksca_policy_badges_create`          | `blackduck_policy_badges_create`:To enable creation of badges on the GitHub repository. Github token is mandatory when `blackduck_policy_badges_create` is set to true. Note: Rapid scan results are not posted to Black Duck® SCA portal. For pull request scans, badges displayed represent only the new violations found on pull request. | Optional                                                                                                                       |
| `blackducksca_policy_badges_max_count`       | To limit number of badges to be displayed on the GitHub repository                                                                                                                                       | Optional                                                                                                                       |

*Table 2. **Network parameters***

| **Input Parameter**    | Description                                                                  | Mandatory / Optional |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| `network_ssl_trustAll` | Disables SSL certificate verification. Use with caution. **Deafult:**`false` | Optional             |

## Uploading Black Duck Security Scan Action issues to GitHub Advanced Security

To upload Black Duck Security Scan Action results in GitHub Advanced Security tab, you need to have the following options enabled as shown in the examples above:

1. Create SARIF file (Option: `blackducksca_reports_sarif_create`)
2. Upload SARIF file (Option: `blackducksca_upload_sarif_report`)

GitHub Enterprise (GHE) server users can upload SARIF reports as well. This feature has been verified on Enterprise Server version 3.15. Prior to uploading SARIFs to the GitHub Advanced Security dashboard on your GHE server, ensure that these prerequisites are met:

- **GitHub Advanced Security** must be enabled for the repository.
- **Code scanning** should be activated.
- The **GitHub Actions workflow** must have `security-events: write` permission.

Important: People with admin permissions to a repository, or the security manager role for the repository, can configure code scanning for that repository. People with write permissions to a repository can also configure code scanning, but only by creating a workflow file or manually uploading a SARIF file.

Code scanning is available for all public repositories on [GitHub](http://github.com/). Code scanning is also available for private repositories owned by organizations that use GitHub Enterprise Cloud or GitHub Enterprise Server. This feature requires a license for GitHub Advanced Security. For more information, see "[About GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)."
