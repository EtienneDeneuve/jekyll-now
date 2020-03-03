---
layout: layouts/post-sidebar.njk
title: 'Working with test'
summary: "I was looking for the easiest way to test Azure infrastructure."
# hero: /images/posts/chromeextensions.png
# thumb: /images/posts/chromeextensions_tn.png
sidebar: infratesting
# mySlug: infra-testing-easy-path
# permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/05_working_with_tests/index.html"
eleventyNavigation:
  key: working-test
  sidebar: infratesting
  title: 'Working with tests'
  parent: infra-testing
  order: 4
updateDate: 2020-02-28 12:35:17
date: 2020-02-07 12:35:17
tags:
  - Azure
  - PowerShell
  - Azure Devops
  - Cloud
  - Tests
---
## Working with the tests

Now, if we want to deploy something in our new infra, we will need to write the tests before deploying the resources themselves.

### Adding some tests

In this scenario, we want to deploy a VM, in our subscription. Let's do a quick list of what we should have after a successful deployment :

- 1 Subscription
- 1 Resource Group
- 1 Virtual Network
- 1 Subnet
- 1 Network Interface
- 1 Disk
- 1 VM
- Optionally: 1 Public IP

With our list, we can now write the test we want, in the feature file:

``` gherkin
# GherkinTests/etienne_exo.feature
Feature: Validate Azure Deployment

  Scenario: Someone start a new vm deployment
    Given someone start a new vm deployment in the subscription
    When the deployment is completed we should have 1 resource group
    Then we should have 1 Virtual Network
    And 1 Subnet
    And 1 Network interface
    And 1 Disk
    And 1 VM
    And 1 Public IP
```

Now, in our steps.ps1 file we will update it:

``` powershell
# GherkinTests/etienne_exo.steps.ps1
Given "someone start a new vm deployment in the subscription"{
  Get-AzSubscription | Should -not -throw
}

When "the deployment is completed we should have 1 resource group" {
  Get-AzResourceGroup -name RG-GherkinTests | Should -exists
}

Then "We should have 1 Virtual Network"{

}
And "1 Subnet"{

}
And "1 Network interface"{

}
And "1 Disk"{

}
And "1 VM"{

}
And "1 Public IP"{

}
```
