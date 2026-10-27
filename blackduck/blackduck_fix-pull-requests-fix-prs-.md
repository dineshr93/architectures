# Fix pull requests (Fix PRs) • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/fix-pull-requests-fix-prs-.html

Fix PRs are a Black Duck SCA and Polaris feature that automatically remediates vulnerabilities by creating Pull Requests (or Merge Requests) that upgrade dependencies to versions with reduced or no risk. Fix PRs are triggered during baseline scans and require an SCM token to allow Bridge CLI or Black Duck Security Scan plug-ins to create the Pull Request.

Note: Polaris also supports Fix PRs for SAST scans. When enabled alongside a Polaris SAST scan, Bridge CLI can automatically create one Pull Request per eligible issue, containing an AI-generated code fix for security vulnerabilities identified by Coverity analysis. See [Using SAST Fix PRs with Bridge](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/6A~E9yHyq5AAnT63eJxoTw "Bridge can create SAST Fix Pull Requests (Fix PRs) from Polaris SAST scan results in CI workflows. Each Fix PR contains an AI-generated code fix for one static analysis vulnerability detected by a full baseline SAST scan on a monitored branch, such as main, develop, staging, or release.") for details.

Bridge prevents duplicate Fix PRs for the same upgrades on a branch:

- When creating a Fix PR for a single component version, Bridge checks for an existing open Fix Pull Request that already upgrades that component version. If one exists, Bridge does not create another Fix Pull Request for the same component version.
- When creating a Fix Fix Pull Request that includes multiple component versions, Bridge excludes any component versions that already appear in an existing Fix Pull Request on the branch. The new Fix Pull Request is created only for component versions that are not already covered.

## Why use Fix PRs?

When enabled, Fix PRs will be raised to provide automated upgrades for vulnerable dependencies. They should be run with protected branches where baseline scans run (main, develop or release), avoiding ephemeral feature branches.

## Configurable options for Fix PRs

Fix Pull Requests (Fix PRs) can be configured to manage how and when Fix PRs are generated:

- Fix Pull Requests can be enabled or disabled. Default is disabled
- Configure the preferred upgrade guidance priority, e.g., short-term only, long-term only, or a defined order of preference, e.g., long-term then short-term. Defaults to short-term, long-term.
- Configure which severities Fix Pull Requests should be raised for, e.g. CRITICAL, MEDIUM, LOW. Defaults to CRITICAL, HIGH.
- Enforce a maximum limit for the number of Fix Pull Requests created. Defaults to 5.

## High-level workflow

1. Create an SCM token with privileges to create Pull Requests.
2. Fix PRs require additional environment variables, usually at least the project name and version. Check the documentation and verify that mandatory variables are provided for Fix PRs.
3. Create a pipeline job that runs the Black Duck Security Scan. NOTE: Black Duck SCA Quickstart documentation for each integration shows how to set up Fix PRs in a pipeline workflow file. Uncomment the appropriate lines to get started, or enable the feature in the pipeline configuration UI when available.
4. Run a baseline scan on a protected branch (main, develop or release). When Fix PRs are enabled Black Duck SCA will scan for vulnerable dependencies.
5. Fix PRs are automatically created that include dependency upgrades to fix vulnerabilities.

## When Fix PRs will appear

Fix PRs are only triggered during baseline scans on protected branches when vulnerable dependencies have available fixes.

## Availability of Fix PRs

Fix PRs are available for Black Duck SCA and Polaris baseline scans on all major SCM platforms: GitHub, GitLab, Bitbucket and Azure DevOps.

## Limitations

Fix PRs are only available for Bridge Black Duck SCA and Polaris.

Older, product-specific integrations and clients by Black Duck Software do not raise Fix PRs. This functionality is available only on Black Duck Security Scan plug-ins and the Bridge CLI client.

Fix PRs require component location information to identify where vulnerable dependencies are declared in source files. Bridge uses Black Duck® Detect component location analysis to generate this information. Supported package managers are NPM, Maven, Gradle and NuGet.
