---
ID: 298
title: "Azure Powershell - Nettoyer les Tags"
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
slug: 2017/09/27/azure-powershell-nettoyer-les-tags
published: true
pubDate: 2017-09-27 10:48:30
---

Quand on fait de l'Azure, il peut arriver qu'on souhaite nettoyer les Tags, pour de multiples raisons.

Voici un peu  de Powershell pour :

1. Enlever les Tags des Ressources Groupes
2. Enlever les Tags des Ressources
3. et enfin Supprimer les Tags

Comme hier, dans notre script, il faut être connecter sur Azure donc on utilise la [fonction d'hier](https://etienne.deneuve.xyz/2017/09/26/azurepscmdnotfound/) (pratique :)):

````powershell
    function Check-AzureRMSession () {
    $Error.Clear()
    #if context already exist
    try {
        Get-AzureRmVM -ErrorAction Stop | Out-Null
    }
    catch [System.Management.Automation.PSInvalidOperationException] {
        Login-AzureRmAccount
    }
    $Error.Clear()
}

Ensuite la fonction :

```powershell
function Remove-AzureRMAllTags () {
    Get-AzureRmResourceGroup | `
        Out-GridView -PassThru | `
        Set-AzureRmResourceGroup -Tag @{}
    Get-AzureRmResource | `
        Select-Object Name, ResourceType, Tags, ResourceGroupName | `
        Out-GridView -PassThru | `
        Set-AzureRmResource -Tag @{} -Force
    Get-AzureRMTag | `
        Out-GridView -PassThru | `
        Remove-AzureRMTag
}
````

> `Out-GridView -PassThru` Vous permet de choisir ceux que vous souhaitez supprimer :)
