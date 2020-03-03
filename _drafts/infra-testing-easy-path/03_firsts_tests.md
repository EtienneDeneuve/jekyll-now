---
layout: layouts/post-sidebar.njk
title: 'Writing First Tests'
summary: "I was looking for the easiest way to test Azure infrastructure."
# hero: /images/posts/chromeextensions.png
# thumb: /images/posts/chromeextensions_tn.png

# mySlug: infra-testing-easy-path
# permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/03_firsts_tests/index.html"
eleventyNavigation:
  key: first-test
  sidebar: infratesting
  title: 'Writing First Tests'
  parent: infra-testing
  order: 2

updateDate: 2020-02-28 12:35:17
date: 2020-02-07 12:35:17
tags:
  - Azure
  - PowerShell
  - Azure Devops
  - Cloud
  - Tests
---
## Create the first tests

### Pester, Gherkin and testing

First of all, you will need some detail on Pester, Gherkin and testing like I think they can be useful and easy as possible.

[Pester](https://github.com/pester/Pester), is a world community framework for testing in Powershell. So, if you know a bit in PowerShell, you won't be lost at all. This module add some new function to do the magic of testing.

[Gherkin](https://cucumber.io/docs/gherkin/reference/), is a syntax for BDD (Behavior-Driven Development) testing. To explain a bit, for me, in our infrastructure testing purpose, is to have some human readable scenario to show to management/customers.

Fortunately, Pester support the Gherkin syntax using the `Invoke-Gherkin` cmdlet and do a bit of magic for us.

### Let's play

We need to create our workspace, so do it like that (Using PowerShell's Shell):

``` powershell
Set-Location ~
New-Item ./Documents/GherkinTests -type Directory
code ./Documents/GherkinTests
```

Create few file :

- etienne_exo.feature <-- This is the Gherkin File
- etienne_exo.steps.ps1 <-- This is our magic

In the Feature File write the following :

``` gherkin
# GherkinTests/etienne_exo.feature
Feature: Validate Azure Deployment

  Scenario: We should have some subscriptions to work
    Given we list the subscriptions using powershell
    Then we should be able to have at least one
```

``` powershell
# GherkinTests/etienne_exo.steps.ps1
Given "we list the subscriptions using powershell"{
  Get-AzSubscription | Should -not -throw
}

Then "we should be able to have at least one" {
  (Get-AzSubscription).Count | Should -Not -BeNullOrEmpty
}
```

Now, let's run that to check if the test are working or not :

``` powershell
❯ Invoke-Gherkin
Pester v4.10.0
Executing all tests in '/home/etienne/Documents/GherkinTests'

Feature: Validate Azure Deployment

  Scenario: We should have some subscriptions to work
    [+] Given we list the subscriptions using powershell 6.17s
    [+] Then we should be able to have at least one 5.01s
Tests completed in 11.39s
Tests Passed: 2, Failed: 0, Skipped: 0, Pending: 0, Inconclusive: 0
```

Ok, tests are working, and we have something to show to customers/managment.

> Wait, can't we do nothing better ? Are we lazy enough ?
> Of course, not, let's wait for the next blog part.
