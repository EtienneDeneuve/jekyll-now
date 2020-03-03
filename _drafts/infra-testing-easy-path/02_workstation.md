---
layout: layouts/post-sidebar.njk
title: 'Prepare your workstation'
summary: "I was looking for the easiest way to test Azure infrastructure."
# hero: /images/posts/chromeextensions.png
# thumb: /images/posts/chromeextensions_tn.png
# sidebar: infra-test
# mySlug: infra-testing-easy-path
# permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/index.html"
# eleventyNavigation:
#   key: workstation
#   title: 'Prepare your workstation'
#   parent: infra-testing-easy-path
#   order: 1
# mySlug: infra-testing-easy-path
# permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/02_workstation/index.html"
eleventyNavigation:
  sidebar: infratesting
  key: workstation
  parent: infra-testing
  title: 'Prepare your workstation'
  order: 1
updateDate: 2020-02-28 12:35:17
date: 2020-02-07 12:35:17
tags:
  - Azure
  - PowerShell
  - Azure Devops
  - Cloud
  - Tests
---

## Workstation preparation

I work on 3 kind of platform : macOs, Ubuntu and Windows 10, and my tests are working on all of them.

You will need to install :

1. PowerShell (6.2.3 at least)
   1. Powershell Az module
   2. Pester (at least 4.9)
2. VS Code
   1. [Gherkin plugin](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete)
   2. [PowerShell](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell)

### Install Powershell and modules

#### Powershell 6

##### Manual installation

First, download the suitable version of powershell for your system on GitHub. Yes, if you miss it, that is now fully open source.  
<https://github.com/PowerShell/PowerShell/releases>

##### Package Manager

###### macOS

If you use macOs, [brew](https://brew.sh/) can manage it  for you:

``` shell
brew install powershell
```

###### Ubuntu

On Ubuntu, snap can do the job also :

``` shell
sudo snap install powershell --classic
```

###### Windows

On Windows, Chocolatey is working well:  

``` powershell
choco install pwsh
```

#### Modules

Installing module in PowerShell is quite easy. You only need to type the following :

``` powershell
Install-PackageProvider Nuget -ForceBootstrap -Force
Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
Update-Module
Install-Module -Name Pester -Force -SkipPublisherCheck
Install-Module -Name Az -force
```

> Some command may not be useful on your setup, but this way ensure that you have the latest version of each module

### Visual Studio Code

You can install Vs Code manually or by using a Package Manager using choco, snap or brew. I'll not detail this part.

#### Extensions installation

To install the extension, you can use the GUI of Vs Code or the cmdline. For Gui, take a look at the doc [here](https://code.visualstudio.com/docs/editor/extension-gallery).

For the cmdline :

``` shell
code --install-extension alexkrechik.cucumberautocomplete
code --install-extension ms-vscode.powershell
```

> on Linux and macOs, you'll need to add the following in your profile, adapt the path to Vs Code to yours :
>
> __bash__:
>
> ``` shell
> cat << EOF >> ~/.bash_profile
> # Add Visual Studio Code (code)
> export PATH="\$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
> EOF
> ```
>
> __zsh__:
>
> ``` shell
> cat << EOF >> ~/.zsh_profile
> # Add Visual Studio Code (code)
> export PATH="\$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
> EOF
> ```