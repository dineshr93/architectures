# Additional GitHub configuration • Bridge CLI Guide

Source: https://docs.blackduck.com/r/bridge/latest/bridge-cli-guide/additional-github-configuration.html

Here are some optional configurations that can be used with Black Duck Security Scan Action for GitHub:

- **Black Duck Scan versioning:**

  In our workflow, we employ the `blackduck-inc/black-duck-security-scan` GitHub Action to perform security scans. Users can specify the action version using two primary methods:

  * **@v2 (recommended)**: Locks the action to the latest v2.x release, ensuring updates and patches within the stable major version 2. For precise version control, you can pin to a specific patch version (e.g., `@v2.1.1`).
  * **@latest**: Directs to the most recent release commit.

- **Install directory:**
  `bridgecli_install_directory`: Use this to specify the path to Bridge CLI.
  Note: If this is not explicitly specified, then the integration defaults to `$HOME/bridge-cli`. If the installed version of Bridge CLI is not the latest, then the latest version of Bridge CLI is downloaded unless you specify the version to use explicitly (as documented below).

- **Download URL:**
  `bridgecli_download_url`: Use this to specify the URL to the Bridge CLI zip file to be automatically downloaded and used. Examples: `bridgecli_download_url: <https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/bridge/binaries/bridge-cli-bundle/latest/bridge-cli-bundle-win64.zip>` or `bridgecli_download_url: <https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/bridge/binaries/bridge-cli-bundle/3.11.0/bridge-cli-bundle-3.11.0-win64.zip>`
  Note: If `bridgecli_download_url` is not provided, Black Duck Security Scan Action downloads the latest version of Bridge CLI from [repo.blackduck.com](https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/bridge/binaries/bridge-cli-bundle/latest/).

- **Download version:**
  `bridgecli_download_version`: Use this to specify the Bridge CLI version to use. If provided, the specified version of Bridge CLI will be automatically downloaded from [repo.blackduck.com](https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/bridge/binaries/bridge-cli-bundle/) and used. If not, the latest version is downloaded and used. Example: `bridgecli_download_version: "1.0.0"`
  Note: If both `bridgecli_download_version` and `bridgecli_download_url` are provided, `bridgecli_download_url` takes precedence.
  Note: If `network_airgap` is enabled, `bridgecli_download_version` and `bridgecli_download_url` are ignored.

- **Network Airgap:**
  `network_airgap`: If `network_airgap` is set to `true`, GitHub Action will not download Bridge CLI. Download and set up Bridge CLI. The default Bridge installation directory is `$HOME/bridge-cli`. To install Bridge CLI in a custom location, set `bridgecli_install_directory` in your GitHub workflow to point to your custom Bridge installation directory.
  Note: Black Duck® SCA users must download and set up an airgapped version of Detect under `$HOME/.bridge/blackduck`. To use a custom location, set `detect_install_directory` to point to the Detect installation directory.

- **Using a proxy through GitHub Action's environment:**
  Black Duck Security Action supports the following environment variables:
  *Table 1. Proxy parameters*

    | **Variable**                  | Description                                                                                                                                                                             | **Example**                                                                          |
    | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
    | `HTTPS_PROXY` / `https_proxy` | Proxy URL for HTTPS traffic. You can include basic authentication if required. Use this when target URL is HTTPS.                                                                       | `https://proxy.com` `https://192.168.1.1:8080` `https://username:password@proxy.com` |
    | `HTTP_PROXY` / `http_proxy`   | Proxy URL for HTTP traffic. You can include basic authentication if required. Use this when target URL is HTTP.                                                                         | `http://proxy.com` `http://192.168.1.1:8080` `http://username:password@proxy.com`    |
    | `NO_PROXY` / `no_proxy`       | A comma-separated list of hosts or IP addresses that should bypass the proxy. Some clients only honor IP addresses when connections are made directly to the IP rather than a hostname. | `example.com` `example.com,myserver.local:443,example.org`                           |
  Note: Currently Coverity Local Scan is not supported with Proxy configuration.
  You may use the proxy parameters with secrets as shown here:

  ```yml
  env:
      HTTPS_PROXY: ${{ secrets.HTTPS_PROXY }} # Proxy URL for HTTPS traffic
      HTTP_PROXY: ${{ secrets.HTTP_PROXY }} # Proxy URL for HTTP traffic
      NO_PROXY: ${{ secrets.NO_PROXY_LIST }} # Comma-separated list of hosts or IP addresses that should bypass the proxy

  ```

  Note: Proxy variables in a GitHub pipeline can either be defined globally (available to all steps) or scoped to a single step (available only within that step).
  If you are using a proxy with authentication, follow these guidelines:

  * Proxy with auth: Users need to pass a username and password for authentication. Example: **http://user:password@proxyIP:proxyPort/**

  * Proxy with no auth: Users do not need to pass credentials for authentication. Example: **http://proxyIP:proxyPort/**

  * For further information: <https://docs.github.com/en/actions/how-tos/manage-runners/use-proxy-servers>

- **Include diagnostics:**   `include_diagnostics`: When set to `true`, Bridge CLI diagnostic files are created and posted to GitHub. Additionally, `diagnostics_retention_days` can be used to specify the number of days the diagnostics files are retained for. Default value is 90. Accepted range of values is from 1 to 90.

- **Mark build status:**
  `mark_build_status`: Defines the build status when policy-violating issues are detected. Supported values: `failure`, and `success`. The default value is `failure`.
  Note: `mark_build_status` is applicable only for return status 8. For any other return value, mark build status is ignored.
