---
ID: 97
title: 'Visual Studio Code for Ansible, Terraform'
author: etienne.deneuve
post_excerpt: ""
layout: layouts/post-sidebar.njk
mySlug: visual-studio-code-pour-ansible-terraform
permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/index.html"
tags:
  - Infra as Code
  - Visual Studio Code
  - Ansible
  - Terraform
  - macOs
  - Windows
  - French
published: true
date: 2017-01-26 22:42:55
updateDate: 2020-03-04 08:35:17
---

# Visual Studio Code

Infrastructure as Code, that's methods and tooling to allow you to create reproductible infrastructure.

<!-- excerpt -->

I use some tools on all my workstations, including, a MacBook Pro, a Windows 10 and Ubuntu. So when I choose tools, I want them to work on all platform.

I use [Visual Studio Code](https://code.visualstudio.com/) which is open source and free and available on Windows, Linux and macOs.

Here is a list of some plugins I'm using :

- Ansible:
  - [Ansible-Autocomplete](https://marketplace.visualstudio.com/items?itemName=timonwong.ansible-autocomplete)
  - [Language-Ansible](https://marketplace.visualstudio.com/items?itemName=haaaad.ansible)
- Terraform:
  - [Advanced Terraform Snippets Generator](https://marketplace.visualstudio.com/items?itemName=mindginative.terraform-snippets)
  - [Terraform](https://marketplace.visualstudio.com/items?itemName=mauve.terraform)
- [Powershell](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell)

On my [GitHub](https://github.com/etiennedeneuve) you can find some file I update frequently :

- `settings.json`
  Basically, that's my vscode setting file.
