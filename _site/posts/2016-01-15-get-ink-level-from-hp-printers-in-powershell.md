---
ID: 55
title: "Get ink level from HP printers in Powershell"
author: etienne.deneuve
post_excerpt: ""
layout: layouts/post-sidebar.njk
mySlug: get-ink-level-from-hp-printers-in-powershell
permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/index.html"
tags:
  - Fun
  - PowerShell
  - French
published: true
date: 2016-01-15 09:58:06
updateDate: 2020-03-04 08:35:17
---

# Get ink level from HP printers in Powershell

I've find a way to get details about cardrige on low end hp printer !
<!-- excerpt -->
Get it on my Git ! [HP Snippet](https://github.com/EtienneDeneuve/Powershell/blob/master/HpPrinter/Snippet)

``` powershell
$Web = New-object System.Net.WebClient
[xml]$stringprinter = $Web.DownloadString("http://printerhp/DevMgmt/ConsumableConfigDyn.xml")
$stringprinter.ConsumableConfigDyn.ConsumableInfo | Select ConsumableLabelCode,ConsumablePercentageLevelRemaining 
```
