---
ID: 472
title: >
  Some Az Cli 2.0 bulk commands
author: etienne.deneuve
description: ""
tags: [""]
slug: 2018/07/02/az-cli-20-tricks
img: /assets/stock-3.jpg
img_alt: "nice abstract image"
published: true
pubDate: 2018-07-02 12:35:17
---

# Az CLI 2.0

## How to delete multiple managed disk at once ?

```
az disk list -g YourRG --query [].name --output tsv | xargs -n 1 az disk delete -g YourRG --yes -n
```
