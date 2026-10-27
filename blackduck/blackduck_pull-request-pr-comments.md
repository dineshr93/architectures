# Pull request (PR) comments • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/pull-request-pr-comments.html

PR Comments help developers to identify and fix their own issues as they work, by adding a comment in a pull request (or merge request) for any new issue introduced through code changes in the PR.

## Why use PR comments?

This approach allows you to fix new issues *prior to completing a merge*, and before running a full scan.

## High-level workflow

1. If your project is new to Black Duck Software, run a baseline scan on your main branch before using PR Comments, so that the project has a history to compare your pull request against (PR comments are intended to tell you only the new issues—not all the issues).
2. PR comments require that you set additional environment variables, usually at least the project name and branch. NOTE: You may need to pass an SCM token with privileges as well. Check the documentation and verify that you have provided all the variables that are mandatory for PR Comments.
3. Create a pipeline job that runs the Black Duck Security Scan. NOTE: Quickstart documentation for each integration often shows how to set up PR comments in your pipeline workflow file. You can uncomment the appropriate lines to get started, or enable the feature in the pipeline configuration UI when available.
4. When PR Comments are enabled, a quick analysis is done that focuses exclusively on files modified in a pull request.
5. If an issue is found, a PR Comment is added to your SCM tool.

## When PR comments will appear

PR Comments will only be triggered when there are issues on the "feature branch" that do not exist on the main branch. For example, consider a case where you run a baseline scan on your main branch, and then you make a pull request to merge feature-branch-1 with your main branch. Your baseline scan determines the issues that exist on your main branch. PR Comments will only be triggered if feature-branch-1 contains issues that do not already exist on your main branch.

When your scan runs, PR Comments are not available, because the scan runs after pull requests have been approved and a merge has been completed.

## Availability of PR comments

PR Comments are available when creating or updating a pull request, if you are using Black Duck Security Scan with these products: Coverity, Black Duck SCA, and Polaris.

## Limitations

The PR comments feature is not available for SRM, although Black Duck Security Scan is otherwise available for SRM

Older, product-specific integrations and clients by Black Duck Software do not create PR Comments. This functionality is available only on Black Duck Security Scan plug-ins and the Bridge CLI client.
