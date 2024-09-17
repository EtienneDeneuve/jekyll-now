---
title: Azure Devops & MegaLinter Auto PR
pubDate: Jul 28 2023
description: Autofix your code using Azure DevOps & MegaLinter !
tags:
  - Azure Devops
  - Git
slug: 2023/07/28/autofix-megalinter-azure-devops
img: /assets/stock-1.jpg
img_alt: nice abstract image
---

## Mega Linter

[Mega-Linter](https://megalinter.io/) is a tool to run many linter/fixer/tools against your code base.

The basic installation is pretty easy :

```shell
npx mega-linter-runner --install

    .:oool'                                  ,looo;
    .xNXNXl                                 .dXNNXo.
     lXXXX0c.                              'oKXXN0;
     .oKNXNX0kxdddddddoc,.    .;lodddddddxk0XXXX0c
      .:kKXXXXXXXXXXXXNXX0dllx0XXXXXXXXXXXXXXXKd,
        .,cdkOOOOOOOO0KXXXXXXXXXXK0OOOOOOOkxo:'
                      'ckKXNNNXkc'
              ':::::;.  .c0XX0l.  .;::::;.
              'xXXXXXx'   :kx:   ;OXXXXKd.
               .dKNNXXO;   ..   :0XXXXKl.
                .lKXXXX0:     .lKXXXX0:
                  :0XXXXKl.  .dXXXXXk,
                   ;kXXXXKd:cxXXXXXx'
                    'xXNXXXXXXXXXKo.
                     .oKXXXXNXXX0l.
                      .lKNNXNNXO:
                        ,looool'

==========================================================
=============   MegaLinter, by OX Security   =============
=========  https://ox.security?ref=megalinter  ===========
==========================================================

Welcome to the MegaLinter configuration generator !
When you don't know what option to select, please use default values
? What is your project type ? Terraform
? What CI/CD system do you use ? Other, I will install workflow manually
? Do you want to detect excessive copy-pastes ? Yes
? Do you want to detect spelling mistakes ? Yes
? Which MegaLinter version do you want to use ? v6 (Latest official release)
? What is the name of your repository default branch ? main
? Do you want MegaLinter to validate all source code or only updated one ? Validate all sources
? Do you want to automatically apply formatting and auto-fixes (--fix option of linters) ? Yes
? Do you want MegaLinter to upload reports on file.io ? (report is deleted after being downloaded once) No
? Do you want to see elapsed time by linter in logs ? Yes
? Do you want to connect to OX Security to secure your repository ? No
Please follow manual instructions to define CI job at https://megalinter.io/installation/
You may call `npx mega-linter-runner` to run MegaLinter from any system (requires node.js & docker)
Updated .gitignore file to exclude megalinter-reports from commits
   create .mega-linter.yml
   create .cspell.json
   create .jscpd.json
   create .gitignore

No change to package.json was detected. No package manager install will be executed.
You're all set !
Now commit, push and create a pull request to see MegaLinter catching errors !
```

Now, open the `.mega-linter.yml` file and uncomment the last line:

```yaml
DISABLE_ERRORS: true
```

This setting will ensure that our process will work properly

Just commit these files, and push them, and merge in your default branch.

## Azure Devops Settings

To have something cooler, we can configure tweak our Azure Devops configuration to create PR, run Mega-Linter and then push the change back to our repo. You just have to accept the PR if the change are good for you !

### Create a "MegaLinter Scheduler"

Create a file `./pipelines/megalinter/scheduler.yaml`

```yaml
---
pool: simplified-azure # setup your pool here !

trigger: none

parameters:
  - name: azdo_install
    default: true

schedules:
  - cron: "0 0 * * *" # adapt the settings as you need
    displayName: Daily build at midnight
    branches:
      include:
        - main # < Don't forget to have the

jobs:
  - job: CreateBranchPR
    displayName: Create MegaLinter PR
    steps:
      - checkout: self
        persistCredentials: true
      - script: |
          az config set extension.use_dynamic_install=yes_without_prompt   
          az extension add --name azure-devops
        displayName: Install Azure DevOps CLI
        condition: ${{ parameters.azdo_install }}
      - script: |
          # Update the email, if you want
          git config --global user.name "Mega Linter by Simplifi\'ed"
          git config --global user.email "etienne@simplified.fr"
          BRANCH_NAME=MegaLinter-PR/$(date +'%d-%m-%Y')
          echo "##vso[task.setvariable variable=BRANCH_NAME]${BRANCH_NAME}"
          git ls-remote --heads origin "${BRANCH_NAME}" | grep "${BRANCH_NAME}" >/dev/null
          if [ "$?" == "1" ]; then
            echo "Branch doesn't exist"
            git switch -c ${BRANCH_NAME}
          else
            echo "Branch already exist"
            git switch ${BRANCH_NAME}
            git pull --force
          fi
          git commit --allow-empty -m "chore: megalinter run 🏃‍♂️"
          git push -u origin ${BRANCH_NAME}
        displayName: Create a branch for MegaLinter
      - script: |
          echo $(System.AccessToken) | az devops login --org ${AZDO_ORG}
          DEFAULT_BRANCH=$(az repos show --organization ${AZDO_ORG} \
                                         --project "${AZDO_PROJECT}" \
                                         --repository "${AZDO_REPO}" | \
                                         jq .defaultBranch | \
                                         sed -e 's/refs\/heads\///g')
          PULL_REQUEST=$(az repos pr list --organization ${AZDO_ORG} \
                              --project "${AZDO_PROJECT}" \
                              --repository "${AZDO_REPO}" \
                              --source-branch "${BRANCH_NAME}" \
                              --target-branch "${DEFAULT_BRANCH}" --status active)
          if [[ -z "$PULL_REQUEST" ]]; then
            echo "Pull Request doesn't exist yet, creating a new one"
            az repos pr create --organization ${AZDO_ORG} \
                              --project "${AZDO_PROJECT}" \
                              --repository "${AZDO_REPO}" \
                              --source-branch "${BRANCH_NAME}" \
                              --target-branch "${DEFAULT_BRANCH}" \
                              --title "MegaLinter linting for : $(date +'%d-%m-%Y')" \
                              --description "This pull request have been created by Megalinter on $(date +'%d-%m-%Y')."
          fi
        displayName: Create Pull-Request for MegaLinter
        env:
          BRANCH_NAME: $(BRANCH_NAME)
          AZDO_ORG: $(System.TeamFoundationCollectionUri)
          AZDO_REPO: $(Build.Repository.Name)
          AZDO_PROJECT: $(System.TeamProject)

      - script: |
          git switch -c "${BRANCH_NAME}"
          git commit --amend --no-edit
          git push -u origin "${BRANCH_NAME}"
        displayName: Create a branch for MegaLinter
        env:
          BRANCH_NAME: $(BRANCH_NAME)
```

Now, merge this file in your default branch to ensure the trigger will apply.

Using `az cli`, create the pipeline:

```shell
az pipelines create --name 'MegaLinter Scheduler' \
                    --description 'Auto create PR from Pipeline to run Megalinter on' \
                    --yml-path ./pipelines/megalinter/scheduler.yaml
```

### Create a "MegaLinter Runner"

Create the second pipeline `./pipelines/megalinter/runner.yaml`:

```yaml
---
pool: simplified-azure # Adjust here

trigger:
  branches:
    include:
      - MegaLinter-PR/*

resources:
  pipelines:
    - pipeline: start
      source: MegaLinter Scheduler # Change it if your pipeline don't have this name !
      project: Terraform CI-CD # Change this to reflect the project where you are !
      trigger: true

jobs:
  - job: PullMegaLinter
    condition: and(eq(variables['Build.Reason'], 'PullRequest'), startsWith(variables['System.PullRequest.SourceBranch'], 'refs/heads/Megalinter-PR'))
    steps:
      - checkout: self
        persistCredentials: true
      - script: |
          BRANCH_NAME=$(echo "$(System.PullRequest.SourceBranch)" | sed -e 's/refs\/heads\///g')
          echo "##vso[task.setvariable variable=BRANCH_NAME]${BRANCH_NAME}"
          # change the email, if you want...
          git config --global user.name "Mega Linter by Simplifi\'ed"
          git config --global user.email "etienne@simplified.fr"
          git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
          git fetch origin "${BRANCH_NAME}"
          git checkout "${BRANCH_NAME}"
          git reset --hard origin/"${BRANCH_NAME}"
        displayName: Checkout PR Branch
        env:
          PR_SOURCE_BRANCH: $(System.PullRequest.SourceBranch)

      - script: |
          docker run -v $(System.DefaultWorkingDirectory):/tmp/lint \
            --env-file <(env | grep -e SYSTEM_ -e BUILD_ -e TF_ -e AGENT_) \
            -e SYSTEM_ACCESSTOKEN=$(System.AccessToken) \
            -e APPLY_FIXES=all \
            -e GIT_AUTHORIZATION_BEARER=$(System.AccessToken) \
            -e SARIF_REPORTER=true \
            oxsecurity/megalinter:v7.2.0
        displayName: Run MegaLinter

      - script: |
          cp -R $(System.DefaultWorkingDirectory)/megalinter-reports/updated_sources/* $(System.DefaultWorkingDirectory)
          git add .
          git commit -m "chore(megalinter): 🔍 updated sources with fixes"
          git push -u origin $(BRANCH_NAME)
        displayName: Commit updated sources
        condition: succeededOrFailed()

      - script: |
          cp -Rn $(System.DefaultWorkingDirectory)/megalinter-reports/IDE-config/* $(System.DefaultWorkingDirectory)
          git add .
          git commit -m "chore(megalinter): 🔍 add IDE-Config in the root of the repo"
          git push -u origin $(BRANCH_NAME)
        displayName: Commit IDE Config
        condition: succeededOrFailed()

      - task: PublishPipelineArtifact@1
        condition: succeededOrFailed()
        displayName: Upload MegaLinter reports
        inputs:
          targetPath: "$(System.DefaultWorkingDirectory)/megalinter-reports/"
          artifactName: MegaLinterReport

      - task: PublishBuildArtifacts@1
        condition: succeededOrFailed()
        inputs:
          pathToPublish: $(System.DefaultWorkingDirectory)/megalinter-reports/megalinter-report.sarif
          artifactName: CodeAnalysisLogs
```

Same as the first one, merge this file in your default branch to ensure the trigger will apply.

Using `az cli`, create the pipeline:

```shell
az pipelines create --name 'MegaLinter Runner' \
                    --description 'Auto create PR from Pipeline to run Megalinter on' \
                    --yml-path ./pipelines/megalinter/runner.yaml
```

### Set Azure Devops Build Service

Now, we need to allow Pipelines to create branch, contribute to PR.

Go in "Project Settings", "Repositories", "Security", like below:

![Repository Settings for Build Service](/assets/2023/07/Settings-AzDo-Megalinter.png)

### Create Branch policy

To create the branch policy, go in "Repos" > "Branches":

![Branches List](/assets/2023/07/Branches-AzDo-Megalinter.png)

Then click on the "..." and select "Branch Policies"

![Build Validation](/assets/2023/07/Validation-AzDo-Megalinter.png)

Fill the form with the values, and save

### Test

Now, everything should work, just trigger the "Megalinter Scheduler" and _voila_
