# Complete list of Bridge arguments • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/complete-list-of-bridge-arguments.html

This page lists all the arguments and parameters that Bridge CLI supports. Parameters for a Bridge CLI workflow can be passed through [environment variables](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/vkep1bLmCP_~x7m0N9RQFg "Command-line arguments can also be specified using environment variables"), [command line](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/rxrMel96xbDVP~WCgbSpug) or a [JSON file](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/4gYXlStrdNeNAbWjB0uNYg).

Note: We recommend that you pass sensitive information such as access tokens using environment variables.

For a list of arguments that are common to all Black Duck security products, refer to [Universal Bridge CLI arguments](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_wlb_lc5_5xb) below.

For product specific parameters, refer to the product specific sections below:

- [Polaris](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_er2_qgx_yxb)
- [Black Duck SCA](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_qhs_hmy_yxb)
- [Coverity Connect](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_mbx_5wy_yxb)
- [Software Risk Manager (SRM)](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_lmk_rhp_jyb)

For integrating Bridge with different SCM platforms, refer to the SCM specific sections below:

- [Azure](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_scm_azure)
- [Bitbucket](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_scm_bitbucket)
- [GitHub](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_scm_github)
- [GitLab](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_scm_gitlab)

## Universal Bridge CLI arguments

These arguments can be passed on the command line, but not as part of a JSON file.

| Argument          | Description                                                                                                                                                                                              | Required                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `bridge-cli`      | Command to invoke Bridge CLI.                                                                                                                                                                            | Yes                                  |
| `--stage`         | The `--stage` command specifies the Black Duck security product you are integrating with (such as `--stage polaris`).                                                                                    | Yes                                  |
| `--input`         | The `--input` command loads a JSON file containing common arguments to run scans                                                                                                                         | Required for inputting a JSON files. |
| `--help`          | Shows the help file for Bridge CLI.                                                                                                                                                                      | No                                   |
| `--json-log`      | Outputs JSON format logs. See [Logging and Diagnostics](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/K76X8t6M0hXZUKtts3x7cQ).                                                                     | No                                   |
| `--json-log-file` | Outputs JSON format logs in the `bridge.log` file in the Bridge CLI home directory. See [Logging and Diagnostics](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/K76X8t6M0hXZUKtts3x7cQ).           | No                                   |
| `--home`          | Sets the directory where Bridge CLI writes logs and adapter output (default is .bridge).                                                                                                                 | No                                   |
| `--version`       | Returns the version of Bridge CLI executable.                                                                                                                                                            | No                                   |
| `--schema`        | Specifies a schema to load                                                                                                                                                                               | No                                   |
| `--verbose`       | Turns on verbose logging.                                                                                                                                                                                | No                                   |
| `--diagnostics`   | Enables debug logs under the Bridge CLI home directory. Creates a `diagnostics.json` file containing the final state data inside the Bridge CLI home directory, but masking sensitive information like tokens and passwords. See [Logging and Diagnostics](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/K76X8t6M0hXZUKtts3x7cQ). | No                                   |
| `--out <outFile>` | Creates an output file with the file name and location provided by the user. This file will contain the final state data with masked sensitive information. To include sensitive information in the file, use `--include-sensitive-information` with `--out`. | No                                   |
| `--list <name>`   | Show a list of tools and workflows.                                                                                                                                                                      | No                                   |

## Networking

| Parameter               | Description                  | Required | Notes                                                                                                                                                                                                    |
| ----------------------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `network.airgap`        | Air Gap mode                 | No       | Default: `false` This option is not applicable to Coverity, or Polaris users. For Black Duck® SCA users, Bridge CLI downloads Detect from Black Duck artifactory on the Internet by default. If `network.airgap` is set to `true`, Bridge CLI does not download tools from the public Black Duck artifactory. You must make sure an airgap version of Detect exists locally. Note: Air gap only curtails access to the public Internet. Bridge CLI still needs access to your Black Duck® SCA Hub server even when this option is set to `true`. Note: SCM API URL is required if you are using the PR comment or Create Fix Pull request features. If not set, Bridge returns an error. `github.host.url` for GitHub `gitlab.api.url` for GitLab `azure.api.url` for Azure DevOps. |
| `network.ssl.cert.file` | Self-Signed Certificate File | No       | Accepts a string: you may pass the Certificate file path. Available for Coverity Connect only. If this option is used, then Bridge will trust the self-signed certificate file passed.                   |
| `network.ssl.trustAll`  | Trust All Certificates       | No       | Default: `false` Available for Coverity Connect and Black Duck SCA only. When this option is set to `true`, Bridge will trust all certificates.                                                          |

## Client scan tool parameters

The table below describes the parameters for configuring Bridge to integrate with client scanning tools that are run locally during builds.

| Tool                  | Parameter                | Description                   | Required | Notes                                                                                                                                                                                                    |
| --------------------- | ------------------------ | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverity              | `coverity.build.command` | Build Command                 | No       | Build command for the project to be passed to Coverity.                                                                                                                                                  |
|                       | `coverity.clean.command` | Clean Command                 | No       | Clean command for the project to be passed to Coverity.                                                                                                                                                  |
|                       | `coverity.config.path`   | Coverity Config File Location | No       | Path to the coverity.yml file to be passed to Coverity. Note: Bridge CLI 4.4.0 and later supports centralised configuration for SAST scans using a Coverity configuration file managed in the Polaris Web UI. Administrators upload the configuration file to Polaris. During a scan, Bridge CLI retrieves it and passes it to Coverity for analysis.  A locally specified configuration, using `coverity.config.path`, `--config`, or `-c` in `coverity.args`, takes precedence over the centrally managed configuration.  If no configuration is available in Polaris or locally, Coverity uses the default CLI and analyser behaviour. See [default analysis documentation](https://docs.blackduck.com/access?ft:originId=f720d35c853c162f322ebf99909fe7c9/48a0a223f2d3132fc578c1a4f7c67eac.topic). |
|                       | `coverity.args`          | Generic Arguments             | No       | Pass generic arguments to the Coverity CLI.  If you are a Coverity user, you can see the list of arguments you can use. Reference: [Black Duck Documentation Portal](https://docs.blackduck.com/access?ft:originId=f720d35c853c162f322ebf99909fe7c9/151db51503bc085eddc10ebd06a858bb.topic). Note:  Check options compatibility with your platform before using them. |
| Black Duck® SCADetect | `detect.search.depth`    | Detect Search Depth           | No       | Search depth to be passed to Black Duck-Detect.                                                                                                                                                          |
|                       | `detect.config.path`     | Detect Config File Location   | No       | Path to the configuration file to be passed to Detect.                                                                                                                                                   |
|                       | `detect.args`            | Generic Arguments             | No       | Pass any argument to Detect.  If you are a Black Duck® SCA Detect user, you can see the list of arguments you can use. Reference: [Black Duck Documentation Portal](https://docs.blackduck.com/access?ft:originId=9c0814dc6c47bd8e1b015657cf47a869/a70278796354c7ed0ab8107252357c78.topic&Version=latest). Note:  Check options compatibility with your platform before using them. |

## Polaris

**Parameters to pass**

Note: If the application doesn't already exist in Polaris, Bridge will try and create it before triggering a CI scan. If you have concurrent subscription / team member enabled, the application creation will be successful. If you have parallel subscription, application creation will fail.

| Parameter                              | Description                                                                                                                                                                                              | Required                                                                            | Notes                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `polaris.accesstoken`                  | Access token                                                                                                                                                                                             | Yes                                                                                 | For security reasons, it is recommended that you pass this as an environment variable.                                                                                                                   |
| `polaris.serverurl`                    | Server URL                                                                                                                                                                                               | Yes                                                                                 | Polaris server URL                                                                                                                                                                                       |
| `polaris.application.name`             | Application Name                                                                                                                                                                                         | Yes                                                                                 | Application must exist on Polaris, and have right entitlements. If the application doesn't already exist in Polaris, Bridge will try to create it before triggering a CI scan. If you have concurrent subscription / team member enabled, the application creation will be successful. If you have parallel subscription, application creation will fail. |
| `polaris.project.name`                 | Project Name                                                                                                                                                                                             | Yes.                                                                                | The specified project is created on Polaris if it doesn’t exist. If you don’t want the project to be created, set `polaris.onboarding` to `false`.                                                       |
| `polaris.assessment.types`             | Assessment Type                                                                                                                                                                                          | Yes                                                                                 | Comma separated values. Accepted values: `SAST` `SCA` `DAST` `SAST, SCA` Further configuration requirements for SAST, SCA, and DAST scans are found here: [Using Bridge CLI with Polaris](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/XSvpEQVO8881OO3IeOrl0g). |
| `tool.install.directory`               | Tool Install Directory                                                                                                                                                                                   | No                                                                                  | Directory to which Bridge downloads the underlying scan tools. Defaults to `<User>/.blackduck/bridge/tools`.                                                                                             |
| `polaris.onboarding`                   | Auto Create Projects                                                                                                                                                                                     | No                                                                                  | If set to `true`, Bridge will attempt to create the project on Polaris if it does not exist. Default is `true`.                                                                                          |
| `polaris.branch.name`                  | Polaris Project branch name                                                                                                                                                                              | Yes                                                                                 | Branch name in the Polaris server. If the branch does not exit, it creates the branch if `polaris.onboarding` is set to `true`. If `polaris.onboarding` is not enabled, the call will error out. If a branch name is not provided, Bridge will error out and no tests will be created. |
| `polaris.prcomment.enabled`            | Enable PR Comments                                                                                                                                                                                       | No                                                                                  | Boolean. Enables and disables the PR Comment feature. Defaults is `false`.                                                                                                                               |
| `polaris.fixPR.enabled`                | Enable Fix PRs                                                                                                                                                                                           | No                                                                                  | Enables or disables the Polaris Fix PR workflow. **Default**: `false`                                                                                                                                    |
| `polaris.fixPR.useUpgradeGuidance`     | Use upgraded guidance for Fix PRs                                                                                                                                                                        | No                                                                                  | Specifies whether to use only short term guidance, only long term guidance, or an ordered preference that allows both for SCA Fix PRs. Bridge tries the guidance values in the order provided. **Values**: `SHORT_TERM` `LONG_TERM` `SHORT_TERM,LONG_TERM` `LONG_TERM,SHORT_TERM` **Default**:`SHORT_TERM,LONG_TERM` |
| `polaris.fixPR.filter.severities`      | Configure when Fix PRs are raised                                                                                                                                                                        | No                                                                                  | Bridge creates Fix PRs only for issues with a severity matching a filter. This applies to **both** SAST and SCA if both assessment types are enabled. **Values**: One or more of the following, separated by commas: `CRITICAL` `HIGH` `MEDIUM` `LOW` **Default**: CRITICAL,HIGH |
| `polaris.fixPR.maxCount`               | Configure max number of fix PRs that are created on a branch                                                                                                                                             | No                                                                                  | Max number of fix PRs created on a branch across both SAST and SCA scans, with SAST evaluated first. Dismissed issues are excluded, then the `polaris.fixPR.filter.severities` allow list is applied. Issues are sorted by severity (descending) and first-detected date (ascending, with undated issues last), and only the first `maxCount` results are selected. **Default**: 5 |
| `polaris.branch.parent.name`           | Polaris parent branch name                                                                                                                                                                               | No                                                                                  | Parent Branch name in the Polaris server. Applicable only if PR Comments is enabled. For GitHub users only, Bridge reads parent branch name from` github.branch.parent.name`. All other users must specify parent branch name using this option. |
| `polaris.prcomment.severities`         | Severities for which the PR Comments should be created.                                                                                                                                                  | No                                                                                  | Defaults to `["high", "critical"]`.                                                                                                                                                                      |
| `polaris.reports.sarif.create`         | Enable/disable SARIF report generation                                                                                                                                                                   | No                                                                                  | Set to "true" to generate a SARIF report. **Default:** false                                                                                                                                             |
| `polaris.reports.sarif.file.path`      | File path where the SARIF file will be created.                                                                                                                                                          | No                                                                                  | Defines where the SARIF file will be created. (A file name must be included.) **Default:** <BRIDGE\_HOME>/Polaris SARIF Generator/report.sarif.json                                                      |
| `polaris.reports.sarif.severities`     | List of severities to match. for SARIF file report                                                                                                                                                       | No                                                                                  | Only issues that match one of the indicated severities will be included in the SARIF file report. (Severities are case-insensitive.) For example, `["high", "critical"]` No validations shall be done. If this is not configured, by default all severities are considered. |
| `polaris.reports.sarif.issue.types`    | Indicate which assessment issues type to include in SARIF file report                                                                                                                                    | No                                                                                  | Value of "assessment.types" resource                                                                                                                                                                     |
| `polaris.reports.sarif.groupSCAIssues` | Flag to enable/disable Component-Version grouping for SCA Issues in SARIF report rules section.                                                                                                          | No                                                                                  | Set to "true" to enable grouping of SCA issues by component. **Default:** true                                                                                                                           |
| `polaris.assessment.mode`              | The test mode type for this scan.                                                                                                                                                                        | No                                                                                  | **Default**: CI, to scan source code at the CI platform. **Note**: `polaris.assessment.mode=SOURCE_UPLOAD` is scheduled for [deprecation](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/3sbQ3zPR_DSrSIKpFbNB5A?section=t_deprecated_cli_resources__section_august). Please use `polaris.test.sast.location` and/or `polaris.sca.test.location` instead. A deprecation warning message is logged if `polaris.assessment.mode=SOURCE_UPLOAD` is used. |
| `polaris.test.sca.location`            | Configure location for where source code should be scanned for an SCA assessment type.                                                                                                                   | No. Required for Source Code Upload for SCA assessment type.                        | Valid values are `hybrid` or `remote`. **Default**: `hybrid`, is the default mode. In this mode, Bridge would download the tools to run capture locally and upload the captured artifacts (bdio) to run analysis on the cloud. Setting this property to a value of `remote` would result in Bridge uploading the source code to the Polaris platform for SCA scanning and analysis, instead of downloading tools and scanning the source code locally or on the CI platform. |
| `polaris.test.sast.location`           | Configure location for where source code should be captured and built for a SAST assessment type.                                                                                                        | No. Required for Source Code Upload for SAST assessment type.                       | Valid values are `hybrid`, `local` or `remote`. **Default**: `hybrid`, is the default mode. In this mode, Bridge would download the tools to run capture locally and upload the captured artifacts (idir) to run analysis on the cloud. Setting this property to a value of `remote` would result in Bridge uploading the source code to the Polaris platform for scanning and analysis, instead of downloading tools and scanning the source code locally or on the CI platform Setting this property to a value of `local` would result in Bridge downloading the tools to run capture and analysis locally and upload the results to the cloud. Note: When SAST Fix PRs are enabled, valid values are `hybrid` or `remote`. If `local` is specified, SAST Fix PRs will be skipped and a warning will be logged. |
| `project.directory`                    | The project source directory.                                                                                                                                                                            | No                                                                                  | String that specifies the project directory to upload. The project.directory should be a valid file path for the file system you are in. If it is empty, Bridge will use the current working directory (pwd). Note: Works for both `CI` and `SOURCE_UPLOAD` |
| `project.source.archive`               | The zipped source file path.                                                                                                                                                                             | No                                                                                  | The file must be a zip format file. If it is not empty, Bridge will not create a zip archive from project directory If user sets the `project.source.archive` Bridge will upload it to Polaris and run the scan. If user does not set `project.source.archive` ,Bridge will archive the project directory and upload it to Polaris. |
| `project.source.excludes`              | Comma-separated list of git ignore pattern strings used to exclude files and directories from the source archive created by Bridge for Polaris source upload scans when `polaris.test.sast.location=remote`. | No                                                                                  | **Example:** "generated/\*\*,node\_modules/\*\*" **Default:** "" Logs an info message if Bridge is using the default. The .bridge and .git directories are automatically excluded from the generated source archive, even when `project.source.excludes` is configured. The value specified for resource `project.source.excludes` should be a gitignore pattern, not file paths. See gitignore documentation: <https://git-scm.com/docs/gitignore> |
| `project.source.preserveSymlinks`      | Project Symlinks                                                                                                                                                                                         | No                                                                                  | **Default:**false. Bridge will save the copy of the target file to the zip archive. If the symlink is a directory, Bridge will copy the files in the target directory recursively to the zip archive. When `project.source.preserveSymlinks`is set as true, Bridge will preserve the links to the zip file. Note: If `project.source.preserveSymlinks`is set as true and there are symlinks to locations outside of the project (or absolute path links) this will cause issues when uploading to Polaris since the analysis environment won’t have those files or directories needed to satisfy the symlink. |
| `polaris.test.sca.type`                | SCA Test Type                                                                                                                                                                                            | No                                                                                  | Allows you to run a Package Manager scan, a Signature scan, an SCA binary scan or an SCA container scan. Only Package Manager and Signature scans can run together in the same pipeline; in that case, Bridge creates two tests in Polaris.  When `polaris.test.sca.type` is set to `SCA_BINARY`, configure the binary artifact path using `polaris.artifactToUpload`. When polaris.test.sca.type is set to `SCA_CONTAINER`, configure the container image .tar artifact using `polaris.artifactToUpload`. For more detailed information about SCA functionality, see [Documentation for Black Duck SCA Detectors](https://docs.blackduck.com/access?ft:originId=9c0814dc6c47bd8e1b015657cf47a869/a16d3a857a61dddb1b8441d2c754d3bf.topic). **Default**: `SCA-PACKAGE` **Accepted values**: `SCA-PACKAGE` `SCA-SIGNATURE` `SCA-PACKAGE,SCA-SIGNATURE` `SCA_BINARY` `SCA_CONTAINER` Note: Pull Request Comment workflow is ignored when triggered with a Signature scan. GitHub Issues, SARIF report and GitLab report generation are not supported for SCA Container scans. |
| `polaris.test.sast.type`               | SAST Test Type                                                                                                                                                                                           | No                                                                                  | This parameter allows you to run a full SAST scan, or a rapid SAST scan. If this parameter is not set, the default value will be used. Default value: `SAST-FULL` Acceptable values: `SAST-FULL` `SAST-RAPID` **Important:** A full SAST scan of the project must be completed before using `SAST-RAPID`. If you attempt to run a rapid scan on a project before you run a full scan, Bridge starts a full SAST scan automatically. |
| `polaris.artifactToUpload`             | SCA artifact path for binary or container scans                                                                                                                                                          | No. Required when `polaris.test.sca.type` is set to `SCA_BINARY` or `SCA_CONTAINER` | Path to the file to upload for SCA scanning. Required when `polaris.test.sca.type` is `SCA_BINARY` (binary or archive file) or `SCA_CONTAINER` (container image .tar, .tgz, .gz or .zip archive). Supports absolute and relative paths; relative paths are resolved against the current working directory. Directory paths are not supported. |
| `polaris.container.name`               | SCA container resource name                                                                                                                                                                              | No. Required when `polaris.test.sca.type` is set to `SCA_CONTAINER`                 | Name of the container resource to associate with the scan target. The container name will be listed in the containers section of the project in Polaris web UI and can also be used as a filter. Note: `polaris.branch.name` is not validated for SCA Container scans. |
| `polaris.waitforscan`                  | Enable/disable waitforscan                                                                                                                                                                               | No                                                                                  | Indicates if the workflow should wait for the analysis to complete or not. **Default:**`true` Note: When run with `waitforscan` set to `false` - Bridge would show an INFO message, will exit after queuing the tests on cloud, and not do any post analysis operations (i.e. break build, pr comments / sarif) |

**JSON Input**

Here is a sample `input.json` file that can be used with Polaris.

```
{
    "data": {
        "polaris": {
            "application": {
                "name": "<Application Name>"
            },
            "project": {
                "name": "<Project Name>"
            },  
            "branch": {
                "name": "<Branch Name>"
            },
            "assessment": {
                "types":  ["SCA", "SAST"]

            },
            "serverurl": "<Polaris URL>"
        }
    }
}
```

Here are the commands to run.

```
export BRIDGE_POLARIS_ACCESSTOKEN=<POLARIS_ACCESSTOKEN>
bridge-cli --stage Polaris --input input.json

```

**Parameters to pass for generating GitLab Reports with Polaris**

| Parameter                               | Description                                            | Required | Notes                                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `polaris.reports.gitlab.create`         | Enable/disable GitLab report generation                | No       | Set this to `true` to generate Polaris SCA/SAST report. Note: GitLab reports can be generated for any configured branch; however, report generation is not supported in a merge request context. **Default**: `false` |
| `polaris.reports.gitlab.dir.path`       | Directory path where the GitLab report will be created | No       | Directory path (excluding file name) where GitLab report is created. Note: GitLab is only able to package artifacts found in the `$CI_PROJECT_DIR` directory. If `BRIDGE_POLARIS_REPORTS_GITLAB_DIR_PATH` is set outside `$CI_PROJECT_DIR`, Gitlab report will not be uploaded. **Default**: `$CI_PROJECT_DIR/.blackduck/integrations/polaris/gitlab_report/sca.json` `$CI_PROJECT_DIR/.blackduck/integrations/polaris/gitlab_report/sast.json` |
| `polaris.reports.gitlab.issue.types`    | List assessment issues to create in GitLab reports     | No       | Lists which assessment issue types to create in GitLab file reports. **Example**: `'SCA,SAST'`                                                                                                           |
| `polaris.reports.gitlab.severities`     | List severities to include in GitLab report            | No       | Comma-separated list of SAST/SCA issue severities to include in GitLab file report. Valid severities are `Critical`, `High`, `Medium`, `Low`, and `Informational`. **Default**: `All severities are included.` |
| `polaris.reports.gitlab.groupscaissues` | Enable/disable grouping SCA issues by component        | No       | When set to true, SCA issues are grouped by component. Set this to false to list SCA issues by vulnerability. **Default**: `true`                                                                        |

**Parameters to pass for selecting Coverity version**

| Argument           | Description             | Required | Notes                                                                                                                                                                                                    |
| ------------------ | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coverity.version` | Select Coverity version | No       | Use with SAST local and SAST hybrid scans (full and rapid) Important: SAST remote scans use default version from Polaris Web UI **Default**: Bridge uses the version configured on Polaris Web UI for the application, project or branch being scanned. **Acceptable Values**: Versions of Coverity that are supported on Polaris (including deprecated versions). **Example**: ` 2025.6.2` For further details please refer to [Polaris multi version SAST tool support with Bridge](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/MxY6Vlky_vcIEgG2wLi1vQ "Polaris enables organizations to select from multiple supported versions of client scan tools, providing control over upgrades, minimizing workflow disruptions and supporting organizational policies. This feature ensures consistent and stable analysis results during tool upgrades.") |

**Parameters to pass for generating GitHub Issues with Polaris**

| Parameter                               | Description                                    | Required | Notes                                                                                                                                         |
| --------------------------------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `polaris.externalIssues.create`         | Enable/disable creation of GitHub issues       | Yes      | Set to `true` to enable creation of GitHub issues from scan findings. **Default:** `false`. When `false`, no external issues are created.     |
| `polaris.externalIssues.severities`     | Severities for which GitHub issues are created | No       | List of severities for which GitHub Issues issues should be created. **Default**: `["Critical", "High"]`.                                     |
| `polaris.externalIssues.types`          | `polaris.externalIssues.types`                 | No       | List of Polaris issue types for which GitHub issues should be created. Accepted values: `SAST`, `SCA` (case‑insensitive).                     |
| `polaris.externalIssues.groupSCAIssues` | Group SCA issues by component-version pair     | No       | Set to `true` to group SCA issues by vulnerabilities of a component-version pair when creating external issues. **Default:** `true`.          |
| `polaris.externalIssues.maxCount`       | Maximum number of GitHub issues to create      | No       | Maximum number of GitHub issues to create at any given time per assessment/workflow. **Default:** `10` for SAST/SCA issues if not configured. |

## Polaris Secure Tunnel

*Polaris Secure Tunnel* lets you securely connect to internal web applications and APIs for the purpose of running dynamic tests (DAST) using [Polaris fAST Dynamic](https://docs.blackduck.com/access?ft:originId=4411d74355056751ace3917564d29bc0/72b5b3601c618e30303c8fa224dca111.topic). Run Polaris Secure Tunnel to establish a secure TLS connection between Polaris and an internal target in a private network. Run Polaris Secure Tunnel locally, on a virtual machine, or other runner, and leave it running until your DAST testing is complete.

Important: The location from where Polaris Secure Tunnel runs must be able to communicate with both your internal DAST target and Polaris (via port 443).

| Parameter                  | Required                                                                | Notes                                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `polaris.serverUrl`        | Yes                                                                     | The Polaris server URL, either `https://polaris.blackduck.com`, `https://poc.polaris.blackduck.com`, `https://ksa.polaris.blackduck.com` or `https://eu.polaris.blackduck.com`.                          |
| `polaris.application.name` | Yes, if not using `polaris.tunnel.name`                                 | The name of the application that contains a DAST project to scan. The application must already exist inPolaris and have the right entitlements.                                                          |
| `polaris.project.name`     | Yes, if not using `polaris.tunnel.name`                                 | The name of the DAST project you wish to scan. The project must already exist in Polaris, and the Entry Point URL is in a private network option must be enabled (in the project's settings).            |
| `polaris.tunnel.name`      | Yes, if not using `polaris.application.name` and `polaris.project.name` | Name of the tunnel to fetch as defined in Polaris in Organizations > (and then) Secure Tunnel. When provided, Bridge CLI fetches the tunnel configuration using the tunnel name instead of deriving it from the application/project. Can be used independently without `polaris.application.name` and `polaris.project.name` for the `polaris-secure-tunnel `workflow. Note: In the DAST project settings, if the Entry Point URL is in a private network option is enabled the name of the secure tunnel should be assigned. |

Here is an example command using `polaris.application.name` and `polaris.project.name`:

```
bridge-cli --stage polaris-secure-tunnel polaris.application.name="My Application" polaris.project.name="Internal DAST target" polaris.serverUrl="https://polaris.blackduck.com"
```

Here is an example command that uses `polaris.tunnel.name`:

```
bridge-cli --stage polaris-secure-tunnel polaris.tunnel.name ="My-Secure-Tunnel" polaris.serverUrl="https://polaris.blackduck.com"
```

Note: See [Connect to an internal DAST target from Bridge CLI](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/4yvTWsHIVgYXwk7hXidC8w) for more information.

## Black Duck® SCA

The base command to run the scan.

```
bridge-cli --stage blackducksca
```

For more detailed information about SCA functionality, see [Documentation for Black Duck SCA Detectors](https://docs.blackduck.com/access?ft:originId=9c0814dc6c47bd8e1b015657cf47a869/a16d3a857a61dddb1b8441d2c754d3bf.topic).

**Parameters to pass**

| Parameter                                   | Description                                             | Required | Notes                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blackducksca.url`                          | URL                                                     | Yes      | Black Duck® SCA URL                                                                                                                                                                                      |
| `blackducksca.token`                        | Token                                                   | Yes      | Black Duck® SCA access token                                                                                                                                                                             |
| `blackducksca.scan.full`                    | Full scan                                               | No       | Performs a full/intelligent scan when set to `true`. Required and used for scanning based on SCM push events. Performs a rapid scan when set to `false` . Required for SCM pull request events. `true `or `false`. (Default: `false`). |
| `detect.install.directory`                  | Install Directory                                       | No       | Path to directory where `detect.jar` resides. Default: `<$HOME>/.bridge/tools/detect`                                                                                                                    |
| `blackducksca.scan.failure.severities`      | Failure severities                                      | No       | Used by Bridge to determine whether to break the build or not. If provided, Bridge will break the build and returns exit code.                                                                           |
| `blackducksca.automation.prcomment`         | Add comments to pull requests                           | No       | If set to `true` , Bridge adds comments to pull requests for new issues introduced in the pull request.  Note: Requires Rapid Scan to be run on pull require events. This argument is ignored if full scan is run. Note: Requires SCM information including token as documented in section SCM Information needed for "Adding Comments to Pull Requests" feature below. |
| `detect.download.url`                       | Detect Download URL                                     | No       | Use this to download Detect from the specified URL. If not specified Detect is downloaded from [repo.blackduck.com](https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/detect/). |
| `blackducksca.fixpr.enabled`                | Black Duck® SCA Fix PR capability                       | No       | Set this to true to enable creation of fix pull requests. **Default**: false                                                                                                                             |
| `blackducksca.fixpr.maxcount`               | Maximum number of fix PRs that can be created           | No       | Set this to a positive integer value to limit the number outstanding fix pull requests created. **Default**: unlimited                                                                                   |
| `blackducksca.fixpr.severities`             | Severities used to decide whether the fix PR is created | No       | Set this to a list of severities for which fix pull requests should be created for. **Default**: CRITICAL,HIGH                                                                                           |
| `blackducksca.fixpr.useupgradeguidance`     | Upgrade guidance                                        | No       | Set this to one of the following values to let Bridge know which type of upgrade guidance to be used. If multiple values are specified, the first available guidance is used. If no upgrade guidance is available, fix pull request is not created. **Accepted values**: SHORT\_TERM LONG\_TERM SHORT\_TERM, LONG\_TERM LONG\_TERM, SHORT\_TERM **Default**: SHORT\_TERM, LONG\_TERM |
| `blackducksca.reports.sarif.create`         | Enable/disable SARIF report generation                  | No       | Set to "true" to generate a SARIF report. **Default:** false                                                                                                                                             |
| `blackducksca.reports.sarif.file.path`      | File path where the SARIF file will be created.         | No       | Defines where the SARIF file will be created. (A file name must be included.) **Default:** <BRIDGE\_HOME>/<SARIF\_GENERATOR\_ADAPTER\_NAME>/report.sarif.json                                            |
| `blackducksca.reports.sarif.severities`     | List of severities to match.                            | No       | Only issues that match one of the indicated severities will be included in the SARIF file report. (Severities are case-insensitive.) For example, `["high", "critical"]` **Default:**`[]`                |
| `blackducksca.reports.sarif.groupSCAIssues` | Enable/disable grouping of SCA issues by component.     | No       | Set to "true" to enable grouping of SCA issues by component. **Default:** true                                                                                                                           |
| `blackducksca.waitforscan`                  | Enable/disable waitforscan                              | No       | Indicates if the workflow should wait for the analysis to complete or not. **Default:** true Note: For Black Duck Rapid Scan - this setting will be ignored. Note: When run with `waitforscan` set to `false` - Bridge would show an INFO message, will exit after queuing the tests on cloud, and not do any post analysis operations (i.e. break build, fix pr / pr comments / sarif) |

**JSON input**

Here is a sample `input.json `file that can be used with Black Duck® SCA.

```
{
    "data": {
        "blackducksca": {
            "url": <BlackDuckSCA url>,
            "scan": {
                "full": true,
                "failure": {
                    "severities": ["CRITICAL"]
                }
            }
        }
    }
}
```

Here are the commands to run.

```
export BRIDGE_BLACKDUCKSCA_TOKEN=<BLACKDUCKSCA_TOKEN>
bridge-cli --stage blackducksca --input input.json
```

**Parameters to pass for generating GitHub Issues with Black Duck® SCA**

| Parameter                                    | Description                                    | Required | Notes                                                                                                                                                  |
| -------------------------------------------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `blackducksca.externalIssues.create`         | Enable/disable creation of GitHub issues       | Yes      | Set to `true` to enable creation of GitHub issues from Black Duck SCA scan findings. **Default:** `false`. When `false`, no GitHub issues are created. |
| `blackducksca.externalIssues.severities`     | Severities for which GitHub issues are created | No       | List of severities for which GitHub issues should be created from Black Duck SCA findings. **Default:** `["Critical", "High"]`.                        |
| `blackducksca.externalIssues.groupSCAIssues` | Group SCA issues by component-version pair     | No       | Set to `true` to group SCA issues by vulnerabilities of a component-version pair when creating GitHub issues. **Default:** `true`.                     |
| `blackducksca.externalIssues.maxCount`       | Maximum number of GitHub issues to create      | No       | Maximum number of GitHub issues to create at any given time per assessment/workflow. **Default:** `10` if not configured.                              |

**Parameters to pass for generating GitLab Reports with Black Duck SCA**

| Parameter                                    | Description                                                | Required | Notes                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blackducksca.reports.gitlab.create`         | Enable/disable GitLab report generation                    | No       | Set this to `true` to generate Black Duck SCA report. Note: Gitlab reports can be generated for any configured branch; however, report generation is not supported in a merge request context. **Default**: `false` |
| `blackducksca.reports.gitlab.dir.path`       | Directory path where the GitLab report will be created     | No       | Directory path (excluding file name) where Gitlab report is created. Note: GitLab is only able to package artifacts found in the `$CI_PROJECT_DIR` directory. If `BRIDGE_BLACKDUCKSCA_REPORTS_GITLAB_DIR_PATH` is set outside `$CI_PROJECT_DIR`, Gitlab report will not be uploaded. **Default**: `$CI_PROJECT_DIR/.blackduck/integrations/blackducksca/gitlab_report/sca.json` |
| `blackducksca.reports.gitlab.severities`     | List severities to include in GitLab report                | No       | Comma-separated list of SCA issue severities to include in Gitlab file report. Valid severities are `Critical`, `High`, `Medium`, `Low`, and `Informational`. **Default**: `All severities are included.` |
| `blackducksca.reports.gitlab.groupscaissues` | Enable/disable grouping SCA issues by component (missing?) | No       | When set to `true`, SCA issues are grouped by component. Set this to `false` to list SCA issues by vulnerability. **Default:**`true`                                                                     |

## Coverity Connect

| Parameter                        | Description                                      | Required | Notes                                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coverity.connect.url`           | Coverity URL                                     | Yes      | Coverity Connect URL                                                                                                                                                                                     |
| `coverity.connect.user.name`     | User Name                                        | Yes      | For security reasons it is recommended to pass this as an environmental variable.                                                                                                                        |
| `coverity.connect.user.password` | Password                                         | Yes      | For security reasons it is recommended to pass this as an environmental variable.                                                                                                                        |
| `coverity.connect.project.name`  | Project Name                                     | Yes      | Project will be created if it doesn't exit.                                                                                                                                                              |
| `coverity.connect.stream.name`   | Stream Name                                      | Yes      | Stream will be created if it doesn't exit.                                                                                                                                                               |
| `coverity.connect.policy.view`   | View                                             | No       | Coverity platform's view name/ID. Bridge will break the build if issues are found in the view provided by user and returns [exit code](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Vz5qxyBIkktUrE8nN6kOFg). |
| `coverity.automation.prcomment`  | Enable pull request comments (deprecated)        | No       | **Note**: Scheduled for [deprecation](https://docs.blackduck.com/viewer/attachment/ilBVZr_kR5v3KVjK1p~wbw/jgDUD1_O9wsywQjaABCZ7A-ilBVZr_kR5v3KVjK1p~wbw). Please use `coverity.prComment.enable` instead. |
| `coverity.prcomment.enabled`     | Enable pull request comments                     | No       | If set to `true`, Bridge adds comments to pull requests for new issues introduced in the Pull Request filtered by `coverity.prComment.impacts`. Detected issues are uploaded to Coverity and will break the build. Requires Rapid Scan to be run on pull request events. This argument is ignored if full scan is run. Note: Requires SCM information including token as documented in section SCM Information needed for “Adding Comments to Pull Requests” feature. |
| `coverity.prcomment.impacts`     | Impact levels that trigger pull request comments | No       | List of impacts that will cause pull request scans to fail. Issues matching any listed impact level will be uploaded to Coverity, added as pull request comments and trigger build failure. **Default**: [High]. **Valid values**: [`High`, `Medium`, `Low`, `Audit`] |
| `coverity.install.directory`     | Install directory                                | No       | Path to directory where `coverity ` resides. Defaults: `<$HOME>/.bridge/tools/cov-analysis` for on-prem Coverity Connect users. `<$HOME>/.bridge/tools/cov-thin-client` for Coverity cloud users.        |
| `coverity.version`               | Version                                          | No       | For Coverity Cloud Deployment 2023.6 and newer: If you do not pass `version`, Bridge uses the default `version` on the Coverity cloud server. If you pass `version`, Bridge uses the provided version. Bridge errors out if the version is unsupported. `version` is ignored for older Coverity Cloud Deployment versions. |
| `coverity.local`                 | local analysis                                   | No       | To use Bridge CLI with on-prem Coverity Connect, set this to `true`. When set to true, Bridge will download full analysis kit and will perform capture and analysis locally.  With Coverity cloud deployments, Black Duck uses Thin Client and this option should be set to `false`. Default: `false`. |
| `coverity.waitforscan`           | Enable/disable waitforscan                       | No       | Indicates if the workflow should wait for the analysis to complete or not. **Default:** true Note: This will be applicable only to tests running on clouds. Note: For local analysis (Coverity local) - this setting will be ignored. Note: When run with `waitforscan` set to `false` - Bridge would show an INFO message, will exit after queuing the tests on cloud, and not do any post analysis operations (i.e. break build, pr comments) |

Here is a sample `input.json` file that can be used with Coverity Cloud.

```json
{
    "data": {
        "coverity": {
            "connect": {
                "url": "<Connect URL>",
                "project": {
                    "name": "<PROJECT_NAME>"
                },
                "stream": {
                    "name": "<STREAM_NAME>"
                },
                "policy": {
                    "view": "<View Name / Id>"
                }
            },
            "prcomment": {
                "enabled": false
            }
        }
    }
}
```

Note: To use Bridge CLI with on-prem Coverity Connect, you must set the `coverity.local` to `true` as described above.

Here is a sample `input.json `file that can be used with on-prem Coverity Connect:

```json
{
    "data": {
        "coverity": {
            "connect": {
                "url": "<Connect URL>",
                "project": {
                    "name": "<PROJECT_NAME>"
                },
                "stream": {
                    "name": "<STREAM_NAME>"
                },
                "policy": {
                    "view": "<View Name / Id>"
                }
            },
            "prcomment": {
                "enabled": false
            },
            "local": true
        }
    }
}
```

Here are the commands to run:

```
export BRIDGE_COVERITY_CONNECT_USER_NAME=<COV_USER>
export BRIDGE_COVERITY_CONNECT_USER_PASSWORD=<COVERITY_PASSPHRASE>
bridge-cli --stage connect --input input.json
```

**Coverity Cloud Deployment 2023.6 and newer - Multi Version Support**

Coverity Cloud Deployment 2023.6 and newer supports multiple versions of Coverity Thin Client. Pass a non-default version of Thin Client to use as input to Bridge via `coverity.version`.

- If you don't pass `version`, Bridge uses the default version set up on the platform.
- If you pass a supported `version`, Bridge uses that version.
- If you pass an unsupported `version`, Bridge errors out with a message.

## Software Risk Manager (SRM)

| Parameter                    | Description                | Required | Notes                                                                                                                                                                                                    |
| ---------------------------- | -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `srm.url`                    | URL                        | Yes      | SRM Server URL                                                                                                                                                                                           |
| `srm.apikey`                 | API key                    | Yes      | API Key. **Note:**Personal Access Tokens (PATs) are not supported when using Bridge.                                                                                                                     |
| `srm.project.name`           | Project Name               | Yes      | SRM project name. Bridge creates the project if it does not exist. If the project already exists, user may pass project ID.                                                                              |
| `srm.project.id`             | Project ID                 | No       | SRM project ID. You can use `srm.project.name `instead.                                                                                                                                                  |
| `srm.branch.name`            | Branch Name                | No       | SRM branch name. If Bridge creates the project, user may pass a branch name. In that case, Bridge will create the user provided branch as the default branch. However, if a default branch already exists, Bridge will only create the user provided branch if the parent branch is specified using `srm.branch.parent`. |
| `srm.branch.parent`          | Parent Branch Name         | No       | Used to create a new branch if it does not exist already.                                                                                                                                                |
| `srm.assessment.types`       | Assessment Types           | Yes      | Comma separated values. Accepted values: `SAST` or `SCA` or `SAST, SCA`.                                                                                                                                 |
| `coverity.execution.path`    | Path to Coverity           | No       | Path to Coverity CLI. Note: If the version is not supported, Bridge errors out.                                                                                                                          |
| `detect.execution.path`      | Detect Execution Path      | No       | Path to the Detect Detect jar file to use.                                                                                                                                                               |
| `srm.analysis.source.upload` | Source Upload Flag         | No       | Option to set for source code archive to be created and uploaded. Default is true.                                                                                                                       |
| `srm.waitforscan`            | Enable/disable waitforscan | No       | Indicates if the workflow should wait for the analysis to complete or not. **Default:** true Note: This will be applicable only to tests running on clouds. Note: When run with `waitforscan` set to `false` - Bridge would show an INFO message, will exit after queuing the tests on cloud, and not do any post analysis operations. |

Here's an example of an SRM `input.json` file:

```
{
    "data": {
      "srm": {
        "url": "<SRM URL>",
        "project": {
          "name": "SRM_PROJECT"
        },
        "assessment": {
          "types": [
             "sast",
             "sca"
          ]
        }

      },
      "coverity": {
        "execution": {
          "path": "/Users/johndoe/bridge-install-dir/srm-coverity/cov-thin-client-macosx-2023.6.1/bin/coverity"
        }
      }
    }
  }
```

## Azure

The following table shows the Bridge CLI arguments available for Azure DevOps integration.

| Parameter                      | Description          |
| ------------------------------ | -------------------- |
| `azure.api.url`                | Azure DevOps API URL |
| `azure.user.token`             | User Token           |
| `azure.organization.name`      | Organization Name    |
| `azure.project.name`           | Project Name         |
| `azure.repository.name`        | Repository Name      |
| `azure.repository.branch.name` | Branch Name          |
| `azure.repository.pull.number` | Pull Request Number  |

Important: The `azure.repository.pull.number` parameter is not required for Black Duck SCA Fix Pull Requests as this feature should only be run from protected branches (e.g. main, develop).

## Bitbucket

The table below shows the Bridge CLI arguments available for Bitbucket integration.

| Parameter                                  | Description           |
| ------------------------------------------ | --------------------- |
| `bitbucket.api.url`                        | Bitbucket API URL     |
| `bitbucket.user.token`                     | User Token            |
| `bitbucket.project.repository.name`        | Repository Name       |
| `bitbucket.project.repository.branch.name` | Branch Name           |
| `bitbucket.user.name`                      | Bitbucket User Name   |
| `bitbucket.project.key`                    | Bitbucket Project Key |
| `bitbucket.project.repository.pull.number` | Pull Request Number   |

Important: The `bitbucket.project.repository.pull.number` parameter is not required for Black Duck SCA Fix Pull Requests as this feature should only be run from protected branches (e.g. main, develop).

## GitHub

The table below shows the Bridge CLI arguments available for GitHub integration.

| Parameter                       | Description                                                   |
| ------------------------------- | ------------------------------------------------------------- |
| `github.host.url`               | GitHub Enterprise host URL (Do not use with standard GitHub.) |
| `github.user.token`             | User Token                                                    |
| `github.repository.name`        | Repository Name                                               |
| `github.repository.branch.name` | Branch Name                                                   |
| `github.repository.owner.name`  | Repository Owner                                              |
| `github.repository.pull.number` | Pull Request Number                                           |

Important: The `github.repository.pull.number` parameter is not required for Black Duck SCA Fix Pull Requests as this feature should only be run from protected branches (e.g. main, develop).

## GitLab

The table below shows the Bridge CLI parameters available for GitLab integration.

For GitLab reports Bridge CLI parameters:

- [Polaris GitLab reports](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_er2_qgx_yxb)
- [SCA GitLab reports](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ?section=topic_w4s_lvr_5xb__section_qhs_hmy_yxb)

| Parameter                       | Description          |
| ------------------------------- | -------------------- |
| `gitlab.api.url`                | GitLab API URL       |
| `gitlab.user.token`             | User Token           |
| `gitlab.repository.name`        | Repository Name      |
| `gitlab.repository.branch.name` | Branch Name          |
| `gitlab.repository.pull.number` | Merge Request Number |

Important: The `gitlab.repository.pull.number` parameter is not required for Black Duck SCA Fix Pull Requests as this feature should only be run from protected branches (e.g. main, develop).
