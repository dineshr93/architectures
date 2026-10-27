# Migrating to new Black Duck integrations (CI/CD, CLI): Black Duck

Source: https://community.blackduck.com/s/article/integrations-black-duck-migration-instructions-bd

## [Back to Main Migration Instructions](https://community.blackduck.com/s/article/integrations-black-duck-migration-instructions)

## Black Duck SCA

- [Bridge CLI](#BDbridgecli)

- [GitHub](#BDGitHub)

- [GitLab](#BDGitlab)

- [Azure DevOps](#BDAzure) 

- [Jenkins](#BDJenkins)  

### **Migrating to new Bridge CLI**

- The existing synopsys-bridge.zip was renamed to bridge-cli-bundle.zip. Download the new Bridge Bundle [here](https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/bridge/binaries/bridge-cli-bundle/latest/). Additionally, Bridge Thin Client is now available. While the Bridge Bundle which comes with all the adapters, Bridge Thin Client is only 2 MB and downloads the necessary adapters at runtime. Download Bridge Thin Client [here](https://repo.blackduck.com/bds-integrations-release/com/blackduck/integration/bridge/binaries/bridge-cli-thin-client/latest/).

- The Bridge binary name changed from synopsys-bridge to bridge-cli. Make sure you call the new binary in your workflows.

- The stage name has changed from blackduck to blackducksca. Use of the old stage name will make Bridge error out.

- Resource names have changed. Please refer to the full list of [deprecated resources](https://documentation.blackduck.com/bundle/bridge/page/documentation/t_deprecated_cli_resources.html). If your workflows use any of them, update to the new resource names.

- Example(s)

* bridge-cli --stage blackducksca --input input.json

* bridge-cli --stage blackducksca --input input.json detect.search.depth=3

### **GitHub: Migrating to Black Duck Security Scan**

1. Download the new Black Duck Security Scan for GitHub [here](https://github.com/marketplace/actions/black-duck-security-scan).

2. Update your existing action.yml workflow file to use the action name and corresponding latest version.  

   uses: synopsys-sig/<synopsys-action@v1.13.0>

   changes to

   uses: blackduck-inc/<black-duck-security-scan@v2.0.0>

3. If you are using any of the following resource names, update your workflow to use the new ones:  

    | **Old Resource Name**                     | **New Resource Name**                        |
    | ----------------------------------------- | -------------------------------------------- |
    | blackduck\_search\_depth                  | detect\_search\_depth                        |
    | blackduck\_execution\_path                | detect\_execution\_path                      |
    | blackduck\_config\_path                   | detect\_config\_path                         |
    | blackduck\_args                           | detect\_args                                 |
    | lackduck\_install\_directory              | detect\_install\_directory                   |
    | blackduck\_url                            | blackducksca\_url                            |
    | blackduck\_token                          | blackducksca\_token                          |
    | blackduck\_scan\_full                     | blackducksca\_scan\_full                     |
    | blackduck\_scan\_failure\_severities      | blackducksca\_scan\_failure\_severities      |
    | blackduck\_fxpr\_enabled                  | blackducksca\_fixpr\_enabled                 |
    | blackduck\_fixpr\_maxCount                | blackducksca\_fixpr\_maxCount                |
    | blackduck\_fixpr\_createSinglePR          | blackducksca\_fixpr\_createSinglePR          |
    | blackduck\_fixpr\_filter\_severities      | blackducksca\_fixpr\_filter\_severities      |
    | blackduck\_fixpr\_useUpgradeGuidance      | blackducksca\_fixpr\_useUpgradeGuidance      |
    | blackduck\_prComment\_enabled             | blackducksca\_prComment\_enabled             |
    | blackduck\_reports\_sarif\_create         | blackducksca\_reports\_sarif\_create         |
    | blackduck\_reports\_sarif\_file\_path     | blackducksca\_reports\_sarif\_file\_path     |
    | blackduck\_reports\_sarif\_severities     | blackducksca\_reports\_sarif\_severities     |
    | blackduck\_reports\_sarif\_groupSCAIssues | blackducksca\_reports\_sarif\_groupSCAIssues |
    | blackduck\_upload\_sarif\_report          | blackducksca\_upload\_sarif\_report          |
    | blackduck\_waitForScan                    | blackducksca\_waitForScan                    |
    | blackduck\_policy\_badges\_create         | blackducksca\_policy\_badges\_create         |
    | blackduck\_policy\_badges\_maxCount       | blackducksca\_policy\_badges\_maxCount       |

1. If you are using any of the following Bridge resource names, change your workflow to use the new resource names:  

    | **Old Resource Name**                | **New Resource Name**         |
    | ------------------------------------ | ----------------------------- |
    | synopsys\_bridge\_download\_url      | bridgecli\_download\_url      |
    | synopsys\_bridge\_download\_version  | bridgecli\_download\_version  |
    | synopsys\_bridge\_install\_directory | bridgecli\_install\_directory |

2. Review [documentation](https://documentation.blackduck.com/bundle/bridge/page/documentation/c_using-github-action.html)for details.  

### **GitLab: Migrating to Black Duck Security Scan**

1. Download the new Black Duck Security Scan for GitLab [here](https://gitlab.com/blackduck-inc/black-duck-security-scan).

2. Update your existing .gitlab-ci.yml workflow file to use the new template name and corresponding latest version.  

- Old Configuration for repositories in Gitlab cloud (Synopsys-template)

  * include:

    - project: synopsys/synopsys-template

    ref: v1.11.0

    file: templates/synopsys-template.yml

- New Configuration for repositories in Gitlab cloud (black-duck-security-scan)

  * include:

    - project: blackduck-inc/black-duck-security-scan

    ref: v2.0.0

    file: templates/security_scan.yml

- Old Configuration for repositories in Gitlab self-managed (Synopsys-template)

  * Configuration for accessing synopsys-template in Gitlab self-managed which hosted

  * - remote: '<https://gitlab.com/synopsys/synopsys-template/-/raw/v1.11.0/templates/synopsys-template.yml?ref_type=heads'>  

- New Configuration for repositories in Gitlab self-managed (Synopsys-template)

  * - remote: '<https://gitlab.com/blackduck-inc/black-duck-security-scan/-/raw/v2.0.0/templates/security_scan.yml>'

- If you are using bash, update  

  .run-synopsys-tools  
  to  
  .run-black-duck-tools  

- If you are using Powershell, update  

  .run-synopsys-tool-powershell  
  to  
  .run-black-duck-tools-powershell

1. If you are using the SCA tools configuration, update to the new parameter names:  

    | **Old Resource Name**                             | **New Resource Name**                                |
    | ------------------------------------------------- | ---------------------------------------------------- |
    | bridge\_blackduck\_automation\_prcomment          | bridge\_blackduck\_automation\_prcomment             |
    | bridge\_blackduck\_fixpr\_enabled                 | bridge\_blackducksca\_fixpr\_enabled                 |
    | bridge\_blackduck\_fixpr\_filter\_severities      | bridge\_blackducksca\_fixpr\_filter\_severities      |
    | bridge\_blackduck\_fixpr\_maxcount                | bridge\_blackducksca\_fixpr\_maxcount                |
    | bridge\_blackduck\_fixpr\_useupgradeguidance      | bridge\_blackducksca\_fixpr\_useupgradeguidance      |
    | bridge\_blackduck\_install\_directory             | bridge\_blackducksca\_install\_directory             |
    | bridge\_blackduck\_reports\_sarif\_create         | bridge\_blackducksca\_reports\_sarif\_create         |
    | bridge\_blackduck\_reports\_sarif\_file\_path     | bridge\_blackducksca\_reports\_sarif\_file\_path     |
    | bridge\_blackduck\_reports\_sarif\_groupscaissues | bridge\_blackducksca\_reports\_sarif\_groupscaissues |
    | bridge\_blackduck\_reports\_sarif\_severities     | bridge\_blackducksca\_scan\_failure\_severities      |
    | bridge\_blackduck\_scan\_full                     | bridge\_blackducksca\_scan\_full                     |
    | bridge\_blackduck\_token                          | bridge\_blackduck\_token                             |
    | bridge\_project\_directory                        | bridge\_project\_directory                           |
    | bridge\_blackduck\_search\_depth                  | bridge\_detect\_search\_depth                        |
    | bridge\_blackduck\_config\_path                   | bridge\_detect\_config\_path                         |
    | bridge\_blackduck\_args                           | bridge\_blackduck\_args                              |
    | bridge\_blackduck\_waitforscan                    | bridge\_blackducksca\_waitforscan                    |

2. If you are using any of the following Bridge resources, change your workflow to use the new resources:  

    | **Old Resource Name**                | **New Resource Name**         |
    | ------------------------------------ | ----------------------------- |
    | synopsys\_bridge\_download\_url      | bridgecli\_download\_url      |
    | synopsys\_bridge\_download\_version  | bridgecli\_download\_version  |
    | synopsys\_bridge\_install\_directory | bridgecli\_install\_directory |

1. Review [documentation](https://documentation.blackduck.com/bundle/bridge/page/documentation/c_using-gitlab-template.html) for details.

### **Azure DevOps: Migrating to Black Duck Security Scan**

Follow these steps to migrate to the new Black Duck Security Scan Extension:

1. Keep record of existing workflow or classic editor UI for future reference.

2. Uninstall the Synopsys Security scan extension. This needs to be done before you install the new Black Duck Security Scan extension

   1. In Azure DevOps, navigate to your org-->organization settings → Extensions

   2. Select Synopsys Security Scan under Installed Extensions, select uninstall then continue to uninstall.

   3. Once uninstalled, Synopsys Security Scan will not show under installed extensions.

3. Install the new Black Duck Security scan extension  

   1. Click on Browse Marketplace button on right side of the page to navigate to Azure DevOps [Marketplace](https://marketplace.visualstudio.com/items?itemName=blackduck.blackduck-security-scan).

   2. Search for “BlackDuckSecurityScan”, select it.

   3. Click on “Get if free”, choose your org from dropdown and submit on install.

   4. Once installed, Black Duck Security Scan will be listed under Installed extensions

4. Update your azure-pipelines.yml workflow file to use the new extension.  
   old task configuration  
   steps:  
   - task: <SynopsysSecurityScan@1.10.0>   

   to  

   new task configuration   
   steps:  
   - task: <BlackDuckSecurityScan@2.0.0>   

5. If you are using Blackduck SCA, use the new resource names:  

    | **Old Resource Name**                     | **New Resource Name**                        |
    | ----------------------------------------- | -------------------------------------------- |
    | blackduck\_url                            | blackducksca\_url                            |
    | blackduck\_token                          | blackducksca\_token                          |
    | blackduck\_search\_depth                  | detect\_search\_depth                        |
    | blackduck\_execution\_path                | detect\_execution\_path                      |
    | blackduck\_config\_path                   | detect\_config\_path                         |
    | blackduck\_args                           | detect\_args                                 |
    | blackduck\_install\_directory             | detect\_install\_directory                   |
    | blackduck\_scan\_full                     | blackducksca\_scan\_full                     |
    | blackduck\_scan\_failure\_severities      | blackducksca\_scan\_failure\_severities      |
    | blackduck\_fixpr\_enabled                 | blackducksca\_fixpr\_enabled                 |
    | blackduck\_fixpr\_maxCount                | blackducksca\_fixpr\_maxCount                |
    | blackduck\_fixpr\_createSinglePR          | blackducksca\_fixpr\_createSinglePR          |
    | blackduck\_fixpr\_filter\_severities      | blackducksca\_fixpr\_filter\_severities      |
    | blackduck\_fixpr\_useUpgradeGuidance      | blackducksca\_fixpr\_useUpgradeGuidance      |
    | blackduck\_prComment\_enabled             | blackducksca\_prComment\_enabled             |
    | blackduck\_reports\_sarif\_create         | blackducksca\_reports\_sarif\_create         |
    | blackduck\_reports\_sarif\_file\_path     | blackducksca\_reports\_sarif\_file\_path     |
    | blackduck\_reports\_sarif\_severities     | blackducksca\_reports\_sarif\_severities     |
    | blackduck\_reports\_sarif\_groupSCAIssues | blackducksca\_reports\_sarif\_groupSCAIssues |
    | blackduck\_upload\_sarif\_report          | blackducksca\_upload\_sarif\_report          |
    | blackduck\_waitForScan                    | blackducksca\_waitForScan                    |
    | blackduck\_policy\_badges\_create         | blackducksca\_policy\_badges\_create         |
    | blackduck\_policy\_badges\_maxCount       | blackducksca\_policy\_badges\_maxCount       |

6. If you are using any of the resources listed below, replace them with the new resource names:  

    | **Old Resource Name**                | **New Resource Name**         |
    | ------------------------------------ | ----------------------------- |
    | synopsys\_bridge\_download\_url      | bridgecli\_download\_url      |
    | synopsys\_bridge\_download\_version  | bridgecli\_download\_version  |
    | synopsys\_bridge\_install\_directory | bridgecli\_install\_directory |

7. If you are using the classic editor,

   - Create a new task using Black Duck Security Scan and configure user resources.

   - Remove the old Synopsys Security Scan task.

8. Refer to [documentation](https://documentation.blackduck.com/bundle/polaris-developer/page/documentation/c_security-scan-for-azure-devops.html) for detailed information

### **Jenkins: Migrating to Black Duck Security Scan**

Follow these steps to migrate to the new Black Duck Security Scan Plugin:

1. **Upgrade Jenkins Version if necessary:**  
   The new plugin requires Jenkins version 2.440.3 or higher. If your Jenkins instance is running a version lower than 2.440.3, you must upgrade Jenkins before installing the new plugin.
2. **Keep a record of your existing system configuration:** This upgrade should be considered a fresh installation as the domain has changed. Take note of your existing system configuration and post-build setup. You will need this information when configuring or reconfiguring your pipelines. Record the system configurations that you have set in Manage Jenkins > Configure System > Synopsys Security Scan section.
3. **Keep a record of all of your existing pipeline configuration settings:** This information will be required in a later step. Keeping a record of this is important because it will be deleted during the uninstall step.
4. **Uninstall the old Synopsys Security Scan plugin, steps to follow:**
   1. Go to Jenkins Plugin Management:
      1. Navigate to Jenkins Dashboard → Manage Jenkins → Manage Plugins.
      2. Under the Installed tab, search for Synopsys Security Scan.
      3. Select the plugin, then click Uninstall.
5. **Restart** **Jenkins**
6. **Install the new Black Duck Security Scan Plugin:**  
   1. Navigate to Jenkins Dashboard → Manage Jenkins → Manage Plugins → Available tab.
   2. Search for Black Duck Security Scan.
   3. Select the plugin and restart Jenkins instance post installation.
   4. Wait for the installation to complete.
   5. Once Black Duck Security Scan plugin is installed, it will show under installed plugins.
7. **Configure Black Duck Security Scan Plugin (Global Configuration)**
   1. Go to Jenkins Dashboard → Manage Jenkins → System Configuration.
   2. Set Up the New Plugin:
      1. In the System Configuration section, find the Black Duck Security Scan settings and Configure the necessary SCM and product fields.
      2. Click Save once your configuration is complete.
8. **Steps to migrate Freestyle jobs**
   1. Keep a record of your existing Freestyle job configuration.
   2. Remove Synopsys Security scan step.
   3. Add Black Duck Security scan step and reconfigure all resources.
9. **Steps to migrate Pipelines and Multibranch Pipelines:**
   1. Go to your SCM (GitHub/GitLab/BitBucket) repository and update below configuration in Jenkinsfile from

      def status = synopsys_scan product: 'blackduck'

      to

      def status = security_scan product: 'blackducksca'

10. If you are using any of the following SCA related resource names in your workflow, change your workflow to use the new resource names:

| **Old Resource Name**                     | **New Resource Name**                        |
| ----------------------------------------- | -------------------------------------------- |
| blackduck\_prComment\_enabled             | blackducksca\_prComment\_enabled             |
| blackduck\_download\_url                  | detect\_download\_url                        |
| blackduck\_install\_directory             | detect\_install\_directory                   |
| blackduck\_scan\_failure\_severities      | blackducksca\_scan\_failure\_severities      |
| blackduck\_scan\_full                     | blackducksca\_scan\_full                     |
| blackduck\_token                          | blackducksca\_token                          |
| blackduck\_url                            | blackducksca\_url                            |
| blackduck\_reports\_sarif\_create         | blackducksca\_reports\_sarif\_create         |
| blackduck\_reports\_sarif\_file\_path     | blackducksca\_reports\_sarif\_file\_path     |
| blackduck\_reports\_sarif\_severities     | blackducksca\_reports\_sarif\_severities     |
| blackduck\_reports\_sarif\_groupSCAIssues | blackducksca\_reports\_sarif\_groupSCAIssues |
| blackduck\_search\_depth                  | detect\_search\_depth                        |
| blackduck\_config\_path                   | detect\_config\_path                         |
| blackduck\_args                           | detect\_args                                 |
| blackduck\_waitForScan                    | blackducksca\_waitForScan                    |

11. If you are using any of the resources listed below in your workflow, replace them with the new resource names:

| **Old Resource Name**                | **New Resource Name**         |
| ------------------------------------ | ----------------------------- |
| synopsys\_bridge\_download\_url      | bridgecli\_download\_url      |
| synopsys\_bridge\_download\_version  | bridgecli\_download\_version  |
| synopsys\_bridge\_install\_directory | bridgecli\_install\_directory |

12. Refer to the [documentation](https://documentation.blackduck.com/bundle/bridge/page/documentation/c_using-jenkins-plugin.html) for detailed information
