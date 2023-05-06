---
title: "Azure Networking - TP - Part 1 - vNets & Subnets"
description: ""
tags: [""]

slug: 2017/04/25/azure-networking-tp-part-1
permalink: "{{ page.date | pubDate: '%Y/%m/%d' }}/{{ myslug }}/index.html"
pubDate: 2017-04-25 11:00:26
img: /assets/stock-4.jpg
img_alt: "nice abstract image"
---

[Mickael Lopes](https://www.linkedin.com/in/lopesmickael) et moi avons animé une session au Global Azure Bootcamp intitulée : "Le réseau dans Azure : Cas d'usage et Retour d'expériences".

Les slides de  notre session sont dispo sur slideshare ici : [Slideshare de Mickael](https://www.slideshare.net/MickaelLOPES91/gab-le-rseau-dans-azure) Comme prévu, voici des TP pour aller avec notre présentation, a faire vous même :)

## Les vNets et Subnets

Avant d'attaquer des éléments plus complexe, nous allons apprendre a créer un VNet avec un subnet avec les trois moyens disponibles sur Azure. ## Powershell Avant de se lancer, commencez par installer votre station de travail convenablement avec la doc Microsoft qui va bien : [Powershell for Azure](https://docs.microsoft.com/fr-fr/powershell/azureps-cmdlets-docs) Dans Azure, on commence toujours par créer un Resource Group donc :

```powershell
New-AzureRmResourceGroup \`
-Name RG-Vnet-Exo-PS \`
-Location northeurope
```

Ensuite nous allons créer un vNet :

```powershell
    $vnetexo = New-AzureRmVirtualNetwork -ResourceGroupName RG-Vnet-Exo-PS `
    -Name vnet-test-ps `
    -AddressPrefix 10.0.0.0/24 `
    -Location northeurope
```

puis afin d'ajouter un subnet :

```powershell
    Add-AzureRmVirtualNetworkSubnetConfig -Name psfrontend `
    -VirtualNetwork $vnetexo `
    -AddressPrefix 10.0.0.0/26
    Set-AzureRmVirtualNetwork -VirtualNetwork $vnetexo
```

### Azure CLI 2.0

Comme pour la partie Powershell, suivez la doc d'installation de Azure CLI 2.0 ici : [Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) Comme dans l'exemple précédent nous allons créer un Resource Group :

```shell
    az group create \
    --name RG-Vnet-Exo-AZ \
    --location northeurope
```

Ensuite nous allons créer un vNet et le subnet :

```shell
    az network vnet create \
    --name vnet-test-az \
    --resource-group RG-Vnet-Exo-AZ \
    --location northeurope \
    --address-prefixes 10.0.1.0/24 \
    --subnet-name azfrontend \
    --subnet-prefixes 10.0.1.0/26
```

### ARM Template

 Pour commencer, utilisez un éditeur de texte un peu évoluer, le JSON sans outil, ca pique un peu... Je vous recommend Visual Studio Code, avec ce petit article : [sur mon blog](https://etienne.deneuve.xyz/2017/01/26/visual-studio-code-pour-ansible-terraform/) Un Template Json simple contient plusieurs parties : "variables", "parameters", "resources" et "outputs". Sans réexpliquer l'ensemble, voici à quoi notre Template va ressembler :

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "vnetname": {
      "type": "string",
      "metadata": {
        "description": "Nom du Vnet"
      },
      "defaultValue": "vnet-test-json"
    },
    "vnetname": {
      "type": "string",
      "metadata": {
        "description": "Nom du Vnet"
      },
      "defaultValue": "vnet-test-json"
    },
    "addressSpacePrefix": {
      "type": "string",
      "metadata": {
        "description": "IP v4 (RFC1918)"
      },
      "defaultValue": "10.0.2.0/24"
    },
    "subnetName": {
      "type": "string",
      "metadata": {
        "description": "Nom du Subnet"
      },
      "defaultValue": "jsonfrontend"
    },
    "subnetPrefix": {
      "type": "string",
      "metadata": {
        "description": "IP v4 du Subnet"
      },
      "defaultValue": "10.0.2.0/26"
    }
  },
  "variables": {},
  "resources": [
    {
      "apiVersion": "2015-06-15",
      "type": "Microsoft.Network/virtualNetworks",
      "name": "[parameters('VnetName')]",
      "location": "[resourceGroup().location]",
      "tags": {
        "displayName": "JSON-VNET"
      },
      "properties": {
        "addressSpace": {
          "addressPrefixes": ["[parameters('addressSpacePrefix')]"]
        },
        "subnets": [
          {
            "name": "[parameters('subnetName')]",
            "properties": {
              "addressPrefix": "[parameters('subnetPrefix')]"
            }
          }
        ]
      }
    }
  ],
  "outputs": {}
}
```

Ensuite pour déployer ce fichier soit via le portail avec la doc ici : [Azure Template & Portal](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-deploy-portal) ou alors via Powershell et Azure CLI 2.0 :

#### Deploy with Powershell

```powershell
New-AzureRmResourceGroup -Name RG-Vnet-Exo-JSON \`
   -Location " North Europe"
New-AzureRmResourceGroupDeployment -Name RG-Vnet-Exo-JSON \`
   -ResourceGroupName ExampleResourceGroup \`
   -TemplateFile c:\\MyTemplates\\vnet-simple.json
```

#### Deploy with Azure CLI 2.0

```shell
az group create --name RG-XXX --location "North Europe“
az group deployment create \
--name ExampleDeployment \
--resource-group ExampleGroup \
--template-file vnet-simple.json
```
