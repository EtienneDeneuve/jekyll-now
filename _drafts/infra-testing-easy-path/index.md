---
layout: layouts/post-sidebar.njk
title: 'IaC & Tests'
summary: "I was looking for the easiest way to test Azure infrastructure."
# hero: /images/posts/chromeextensions.png
# thumb: /images/posts/chromeextensions_tn.png
sidebar: infra-test
# mySlug: infra-testing-easy-path
# permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/index.html"
eleventyNavigation:
  key: infra-testing
  sidebar: infratesting
  parent: posts
updateDate: 2020-02-28 12:35:17
date: 2020-02-07 12:35:17
tags:
  - Azure
  - PowerShell
  - Azure Devops
  - Cloud
  - Tests
---

# IaC & Tests

## Overview

I was looking for the easiest way to test Azure infrastructure.
I take a look into great project like Molecule, Terratest and so on.
Even if they are very cool and powerful, I wanted to find something easier (or lazier).

I already use pester for testing purpose, so I manage to use pester for testing Azure infrastructure,
 using the Gherkin syntax and I'll show you, how you can do that.