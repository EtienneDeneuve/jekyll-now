---
title: "Terraform AzureRM 2.0 Provider"
author: etienne.deneuve
pubDate: 2020-02-25
slug: 2020/02/25/terraform-azurerm-2
img: /assets/stock-2.jpg
img_alt: "nice abstract image"
description: ""
tags:
  - Azure
  - PowerShell
  - Azure Devops
  - Cloud
  - Tests
---

# New Azure RM Provider 2.0

This article will be updated every times I found something not yet documented on the 2.0 Azure RM provider for Terraform.

## New mandatory

In the past, the provider was optional, today, it is _mandatory_ !

You need to write this part :

```hcl
provider "azurerm" {
  version = "=2.0.0"
  features {}
}
```

If you don't add the `features {}` your plan and deployment will fail.

As today, the features block is the new way to activate some features :

> features block supports the following:
>
> - key_vault - (Optional) A key_vault block as defined below.
>
> - virtual_machine - (Optional) A virtual_machine block as > defined below.
>
> - virtual_machine_scale_set - (Optional) A > virtual_machine_scale_set block as defined below.
