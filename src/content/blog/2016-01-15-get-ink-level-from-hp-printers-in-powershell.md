---
title: >
  Get ink level from HP printers in
  Powershell
description: ""
tags: [""]
slug: 2016/01/15/get-ink-level-from-hp-printers-in-powershell
pubDate: 2016-01-15 09:58:06
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
---

I've find a way to get details about cardrige on low end hp printer !

Get it on my Git ! [HP Snippet](https://github.com/EtienneDeneuve/Powershell/blob/master/HpPrinter/Snippet)

```powershell
$Web = New-object System.Net.WebClient
[xml]$stringprinter = $Web.DownloadString("http://printerhp/DevMgmt/ConsumableConfigDyn.xml")
$stringprinter.ConsumableConfigDyn.ConsumableInfo | Select ConsumableLabelCode,ConsumablePercentageLevelRemaining
```
