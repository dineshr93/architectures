# Using Bridge CLI with Black Duck SCA • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/using-bridge-cli-with-black-duck-sca.html

As a Black Duck® SCA customer, you can use Bridge CLI to automate SCA scanning in your CI pipeline.

You can use Bridge CLI with Black Duck® SCA in the following ways:

- [Running Black Duck® SCA scans with a JSON file](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_wtd_kzv_qxb)
- [Running Black Duck® SCA scans on the command line](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_x5p_nbw_qxb)
- [Adding comments to pull requests](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_adding_comments)
- [Creating fix pull requests](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_creating_fixprs)
- [Exporting a SARIF file](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__export-sarif)

You can also do the following:

- Run Black Duck® SCA in [air gap mode](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_apy_fxr_kyb). In this mode, Bridge CLI doesn't download Detect from the public Internet.
- Configure Black Duck® SCA to [run with a proxy](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_bd-proxy).

## Running Black Duck® SCA scans with a JSON file

Pass sensitive information such as username and token using environmental variables, and run Bridge CLI and pass the JSON file using the `--input` command line option.

Here is a command line example for Black Duck® SCA:

```
export BRIDGE_BLACKDUCKSCA_TOKEN=<BLACKDUCKSCA_TOKEN>
bridge-cli --stage blackducksca --input input.json
```

The above example uses the following:

- `BRIDGE_BLACKDUCKSCA_TOKEN` environment variable to pass sensitive information such as password or access token to Bridge CLI (recommended for security purposes). Note that Bridge CLI automatically picks up values passed through these environment variables.
- `--stage` argument to specify the Black Duck security product you are integrating with.

Here is the `input.json` file:

```
{
    "data": {
        "blackducksca": {
            "url": "<BLACKDUCKSCA_URL>",
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

The above JSON file uses the following:

- `blackducksca.url` for Black Duck® SCA URL.
- `blackducksca.scan.full` should be set to `true` so that a full /intelligent scan is run by Bridge CLI. For pull request scans, this should be set to `false`.
- `blackducksca.scan.failure.severities` is a list of severities used by Bridge CLI to decide if the CI pipeline should be failed or not.

For a complete list of environment variables and command line arguments, see [Complete list of Bridge arguments](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ).

## Running Black Duck® SCA scans on the command line

Instead of using a JSON file, you can pass all arguments on the command line.

Here is a command line example for Black Duck® SCA:

```
export BRIDGE_BLACKDUCKSCA_TOKEN=<BLACKDUCKSCA_TOKEN>
bridge-cli --stage blackducksca \
blackducksca.url=<BLACKDUCKSCA_URL> \
blackducksca.scan.failure.severities=CRITICAL,HIGH \
blackducksca.scan.full=true
```

The above example uses the following:

- `BRIDGE_BLACKDUCKSCA_TOKEN` environment variable to pass sensitive information such as password or access token to Bridge CLI (recommended for security purposes). Note that Bridge CLI automatically picks up values passed through these environment variables.
- `--stage` argument to specify the Black Duck security product you are integrating with.
- `blackducksca.url` for Black Duck® SCA URL.
- `blackducksca.scan.full` should be set to `true` so that a full/intelligent scan is run by Bridge CLI. For pull request scans, this should be set to `false`.
- `blackducksca.scan.failure.severities` is a comma separated list of severities used by Bridge CLI to decide if the CI pipeline should be failed or not.

For a complete list of environment variables and command line arguments, see [Complete List of Bridge Arguments](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/Agsb8bLdFpKQqCgPS0ZLjQ).

## Adding comments to pull requests

Bridge CLI can add comments to pull requests when you perform a pull request scan. To add comments:

- Set blackducksca.automation.prcomment to true for pull request scans
- Pass SCM token as shown in the example below.
  * `github.user.token` for GitHub
  * `gitlab.user.token` for GitLab
  * `azure.user.token` for Azure DevOps
- Pass additional options as necessary

Below is an example of passing pull request comments using an input.json file. Pass access tokens using environmental variables:

```
export BRIDGE_BLACKDUCKSCA_TOKEN=<BLACKDUCKSCA_TOKEN>
export GITHUB_USER_TOKEN=<GITHUB_USER_TOKEN>
```

Create an input file as follows:

```
{
    "data": {
        "blackducksca": {
            "url": "<Black Duck URL>",
            "scan":{
                "full": true
            },
            "automation":{
                "prComment": true
            }
        },
        "github": {
            "repository": {
                "name": "<GitHub Repo Name>",
                "owner": {
                    "name": "<GitHub Owner Name>"
                },
                "branch": {
                    "name": "<Branch Name>"
                },
                "pull": {
                    "number": <Pull Request Number>
                }
            }
        }
     }
}  

```

If the file were called input.json you would use it by executing the following in a terminal:

```
bridge-cli --stage blackducksca --input input.json
```

See the previous section on this page about [running Black Duck® SCA with a JSON file](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_wtd_kzv_qxb).

## Creating fix pull requests

Bridge CLI can create fix PRs when you perform a full scan of your main branch. For each vulnerable direct dependency found by Black Duck® SCA, Bridge can open a pull request in your SCM with a change that updates the component version.

To create fix pull requests:

- Set `blackducksca.fixpr.enabled` to true in your input file
- Pass SCM token as shown in the example below
  * Github.user.token for GitHub
  * Gitlab.user.token for GitLab
  * azure.user.token for Azure DevOps
- · Pass additional options as necessary

Below is an example for creating pull request comments using an input.json file. Pass access tokens using environmental variables:

```
export BRIDGE_BLACKDUCKSCA_TOKEN=<BLACKDUCKSCA_TOKEN>
export GITHUB_USER_TOKEN=<GITHUB_USER_TOKEN>
```

Create an input file as follows:

```
{
    "data": {
        "blackducksca": {
            "url": "<URL>",
            "scan": {
               "full": "true"
            },
            "fixpr": {
                "enabled": true,
                "maxcount": 25,
                "severities":["HIGH", "CRITICAL"]
            }
        },
        "github": {
            "repository" : {
                "name": "<GitHub_Repository",
                "branch": {
                   "name": "main"
                },
                "owner": {
                    "name" :"<REPO-OWNER>"
                }
            }
        },
        "environment":{
            "scan": {
                "pull": false
            }
        }
    }
}  

```

If the file were called input.json you would use it by executing the following in a terminal:

```
bridge-cli --stage blackducksca --input input.json
```

See the previous section on this page about [running Black Duck® SCA with a JSON file](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/N9F8RW_Bek9YQUiRqF4hoA?section=topic_tsw_g1v_qxb__section_wtd_kzv_qxb).

## Exporting a SARIF file

Bridge CLI allows you to export findings in a SARIF file.

```
{
   "data":{
      "blackducksca": {
         "url": "<BLACKDUCKSCA_URL>",
         "token": "<MY_TOKEN>",
      "reports":
      {
         "sarif":{
            "create":true,
            "file":{
               "path":"<PATH_TO_SARIF_FILE>"
            }
            "severities":[CRITICAL", "HIGH"],
            "groupSCAissues":true
         }
      }
   }  
}  
```

Note: SARIF report creation is only supported for non MR/PR scans. Set "reports.sarif.create" to "true," and a SARIF file will be created.

## Running Black Duck® SCA in air gap mode

To run Bridge CLI in air gap mode (no connectivity to the Internet, except for Black Duck Hub):

1. Download an appropriate version of Detect, either air-gap.zip or air-gap-no-docker.zip. Install it at one of the following locations:

   - `<home>/.bridge/tools/blackducksca` (default location), *or*
   - A location configured using `<detect.install.directory>` to override the default.

2. Set air gap to true, by either:

   - Passing on the command line (`network.airgap=true`):

     ```
     bridge-cli --stage blackducksca \
     blackducksca.url=<BLACKDUCK_URL> \
     blackducksca.scan.failure.severities=CRITICAL,HIGH \
     blackducksca.scan.full=true \
     network.airgap=true
     ```

*or*

   - Passing it as an argument in your JSON input file:

     ```
     {
         "data": {
             "blackducksca": {
                 …
             },
             "network": {
                 "airgap": true
             }
         }
     }
     ```

3. If using the PR Comment or Create Fix Pull request features, set the appropriate API URL.

   - `github.api.url` for GitHub
   - `gitlab.api.url` for GitLab
   - `azure.api.url` for Azure DevOps

If not set, Bridge returns an error.

## Configuring proxy for Black Duck® SCA Detect

If proxy is configured using environment variables as described in [Configuring proxy for Bridge](https://docs.blackduck.com/r/ilBVZr_kR5v3KVjK1p~wbw/0l1TqIT7~dOBGnq1kT7GBw), Bridge will automatically set the following Detect environment variables if they are not already set:

- BLACKDUCK_PROXY_HOST
- BLACKDUCK_PROXY_PORT
- BLACKDUCK_PROXY_IGNORED_HOSTS

If the proxy requires authentication information, you must set the following Detect environment variables :

- BLACKDUCK_PROXY_USERNAME
- BLACKDUCK_PROXY_PASSWORD
