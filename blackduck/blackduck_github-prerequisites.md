# GitHub prerequisites • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/github-prerequisites.html

Before configuring Black Duck Security Scan Action into your workflow, you must meet the following prerequisites:

## Basic requirements

Starting with Bridge version 3.5.1, the Black Duck Security Scan Action now includes support for Linux ARM architectures.

## GitHub runner setup

- Runners are the machines that execute jobs in a GitHub Actions workflow. To use GitHub runners in your project, GitHub Actions must be enabled for a repository/organization settings in order for required workflows to run (**Repository Settings** → **Select Actions** → **General** → **Actions permissions**).
- GitHub runner can be Self-hosted or GitHub-hosted. For installing Self-hosted runners, see [Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners). For installing GitHub-hosted runners, see [GitHub-hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners).

## Configure GitHub secrets

Sensitive data such as access tokens, user names, passwords and even URLs must be configured using GitHub secrets (**GitHub** → **Project** → **Settings** → **Secrets and Variables** → **Actions**).

## Configure GitHub token

`github_token` is required for Fix PR and PR Comments features. There are two different types of tokens that can be passed to `github_token`:

- If you have read-write permissions to the GitHub built-in Token, `secrets.GITHUB_TOKEN`, you can use that token and you don't need to create one. To configure permissions navigate to (**GitHub** → **Project** → **Settings** → **Actions** → **General** → **Workflow Permissions**). The token will be automatically created by GitHub at the start of each workflow run. **Inline token permissions**

  As an alternative to configuring default workflow permissions, the required permissions for `secrets.GITHUB_TOKEN` can be declared inline within the workflow YAML file using the `permissions` key:

  ```yaml
  # GitHub token permissions for post-scan actions. Required for built-in GITHUB_TOKEN
  # Not needed if using a PAT with equivalent scopes.
  permissions:
    contents: write               # Required for Fix PRs
    pull-requests: write          # Required for PR comments
    security-events: write        # Required for SARIF upload to GHAS (Black Duck® SCA and Polaris only)
  ```

For more information, see [Modifying the permissions for the GITHUB_TOKEN](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token#modifying-the-permissions-for-the-github_token).

- If you lack permissions to the GitHub built-in token, `secrets.GITHUB_TOKEN`, create a Personal Access Token (PAT) with required scopes. To do that, navigate to (**Select Profile Photo** → **Settings** → **Developer Settings** → **Personal access tokens**). PAT must have repo and API scope to use Fix PR or PR Comment features. For more information, see [Granting additional permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#granting-additional-permissions).

## Create workflow

Create a new workflow (**GitHub** → **Project** → **Actions** → **New Workflow** → **Setup a workflow yourself**) and configure the required fields. Push those changes and GitHub runner will initiate the workflow which can be seen on the **Actions** tab on main page of the repository.
