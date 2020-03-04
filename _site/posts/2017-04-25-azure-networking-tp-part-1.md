---
ID: 144
title: 'Azure Networking'
author: etienne.deneuve
post_excerpt: ""
layout: layouts/post-sidebar.njk
mySlug: azure-networking-tp-part-1
permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/index.html"
tags:
  - Azure Cli
  - PowerShell
  - Azure
  - Networking
  - French
published: true
date: 2017-04-25 11:00:26
updateDate: 2020-03-04 22:06:17
---
[Mickael Lopes](https://www.linkedin.com/in/lopesmickael) et moi avons animé une session au Global Azure Bootcamp intitulée : "Le réseau dans Azure : Cas d'usage et Retour d'expériences".

<!-- excerpt -->

Les slides de  notre session sont dispo sur slideshare ici : [Slideshare de Mickael](https://www.slideshare.net/MickaelLOPES91/gab-le-rseau-dans-azure)

Comme prévu, voici des TP pour aller avec notre présentation, a faire vous même :)

# Les vNets et Subnets

Avant d'attaquer des éléments plus complexe, nous allons apprendre a créer un VNet avec un subnet avec les trois moyens disponibles sur Azure.

## Powershell

Avant de se lancer, commencez par installer votre station de travail convenablement avec la doc Microsoft qui va bien : [Powershell for Azure](https://docs.microsoft.com/fr-fr/powershell/azureps-cmdlets-docs)

Dans Azure, on commence toujours par créer un Resource Group donc :

``` powershell
New-AzureRmResourceGroup `
-Name RG-Vnet-Exo-PS `
-Location northeurope
```

Ensuite nous allons créer un vNet :

``` powershell
$vnetexo = New-AzureRmVirtualNetwork -ResourceGroupName RG-Vnet-Exo-PS `
-Name vnet-test-ps `
-AddressPrefix 10.0.0.0/24 `
-Location northeurope
```

puis afin d'ajouter un subnet :

``` powershell
Add-AzureRmVirtualNetworkSubnetConfig -Name psfrontend `
-VirtualNetwork $vnetexo `
-AddressPrefix 10.0.0.0/26
Set-AzureRmVirtualNetwork -VirtualNetwork $vnetexo
```

## Azure CLI 2.0

Comme pour la partie Powershell, suivez la doc d'installation de Azure CLI 2.0 ici : [Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
Comme dans l'exemple précédent nous allons créer un Resource Group :

``` shell
az group create \
--name RG-Vnet-Exo-AZ \
--location northeurope
```

Ensuite nous allons créer un vNet et le subnet :

``` shell
az network vnet create \
--name vnet-test-az \
--resource-group RG-Vnet-Exo-AZ \
--location northeurope \
--address-prefixes 10.0.1.0/24 \
--subnet-name azfrontend \
--subnet-prefixes 10.0.1.0/26
```

## ARM Template

Pour commencer, utilisez un éditeur de texte un peu évolue, le JSON sans outil, ca pique un peu...  
Je vous recommande Visual Studio Code, avec ce petit article : [sur mon blog](https://etienne.deneuve.xyz/2017/01/26/visual-studio-code-pour-ansible-terraform/)  
Un Template Json simple contient plusieurs parties : "variables", "parameters", "resources" et "outputs". Sans réexpliquer l'ensemble, voici à quoi notre Template va ressembler :

``` json
{
  "$schema": "<https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#> ",
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
          "addressPrefixes": [
            "[parameters('addressSpacePrefix')]"
          ]
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

Ensuite pour déployer ce fichier soit via le portail avec
[la doc ici](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-deploy-portal)
ou alors via Powershell et Azure CLI 2.0 :

### Deploy ARM using Powershell

``` powershell
New-AzureRmResourceGroup -Name RG-Vnet-Exo-JSON `
   -Location " North Europe"
New-AzureRmResourceGroupDeployment -Name RG-Vnet-Exo-JSON `
   -ResourceGroupName ExampleResourceGroup `
   -TemplateFile c:\MyTemplates\vnet-simple.json
```

### Deploy ARM using Azure CLI 2.0

``` shell
az group create --name RG-XXX --location "North Europe“
az group deployment create \
--name ExampleDeployment \
--resource-group ExampleGroup \
--template-file vnet-simple.json
```

vNet Peering
============

L'objectif est de connecter nos 3 Vnets, avec nos 3 outils :

* vnet-test-ps
* vnet-test-az
* vnet-test-json

Powershell
----------

Nous allons créer le lien entre vnet-test-ps et vnet-test-az :

``` powershell
    $vnetPS = Get-AzureRmVirtualNetwork -ResourceGroupName RG-Vnet-Exo-PS -Name vnet-test-ps
    $vnetAZ = Get-AzureRmVirtualNetwork -ResourceGroupName RG-Vnet-Exo-AZ -Name vnet-test-az
```

Puis nous créons le lien PS2AZ :

``` powershell
    Add-AzureRmVirtualNetworkPeering -Name PS2AZ -VirtualNetwork $vnetPS -RemoteVirtualNetworkId $vnetAZ.Id

    Add-AzureRmVirtualNetworkPeering -Name AZ2PS -VirtualNetwork $vnetAZ -RemoteVirtualNetworkId $vnetPS.Id
```

nous pouvons vérifié si le peering est fonctionnel via la commande Powershell :

``` powershell
     Get-AzureRmVirtualNetworkPeering -VirtualNetworkName vnetPS -ResourceGroupName vnetPS -Name PS2AZ
```

en l'état, notre peering est configuré mais certaines options ne sont pas activées :

* Forwarded Traffic
* Gateway Transit
* Remote Gateways

Dans notre cas, nous avons besoin d'activer le transfert du trafic.

``` powershell
    $ps2az = Get-AzureRmVirtualNetworkPeering -VirtualNetworkName vnetPS -ResourceGroupName vnetPS -Name PS2AZ
    $ps2az.AllowForwardedTraffic = $true
    Set-AzureRmVirtualNetworkPeering -VirtualNetworkPeering $ps2az
```

Azure CLI 2.0
-------------

Avec Azure CLI, il faudra recupéré l'id du réseau distant pour le peering avec la commande :

``` shell
    az network vnet list -g RG-Vnet-Exo-JSON
```

et vous recuperez un objets json, cherchez votre id qui sera du type : `/subscriptions/VOTREIDDESOUSCRPTION/resourceGroups/RG-Vnet-Exo-JSON/providers/Microsoft.Network/virtualNetworks/vnet-test-json` Si vous utilisez le bash (Ubuntu on Windows par exemple) créer une variable comme ceci :

``` shell
    JSON_VNET_ID="/subscriptions/VOTREIDDESOUSCRPTION/resourceGroups/RG-Vnet-Exo-JSON/providers/Microsoft.Network/virtualNetworks/vnet-test-json"
```

Ce sera beaucoup plus simple pour l'appeler dans la commande suivante :

``` shell
az network vnet peering create --name AZ2JSON \
  --remote-vnet-id ${$JSON_VNET_ID} \
  --resource-group RG-Vnet-Exo-AZ \
  --vnet-name vnet-test-az \
  --allow-forwarded-traffic \
  --allow-vnet-access \
```

Théoriquement, nous pourrions executer la commande pour effectuer le peering dans l'autre sens, mais nous allons la faire avec notre template de la partie 1.

ARM Template
------------

Pour déclarer un vnet peering dans un template ARM, à l'heure actuelle, via le portail ou la ligne de commande (Powershell ou Azure CLI 2.0) il n'est pas possible dans le "contexte" de manipuler deux Resource Group. Du coup, il faut le faire d'un coté puis de l'autre, ou utiliser des templates "nested" c'est à dire un template "parent" puis deux "enfants". Nous n'allons (pas encore ;)) aborder ce type de template. (Stay Tuned !) Donc, reprenons notre template et ajoutons un nouveau type de resource Azure `"Microsoft.Network/virtualNetworks/virtualNetworkPeerings"`

``` json
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
        "vNetRemote": {
            "type": "string",
            "metadata": {
                "description": "Nom du Vnet distant"
            },
            "defaultValue": "vnet-test-az"
        },
        "RGvNetRemote": {
            "type": "string",
            "metadata": {
                "description": "Nom du Resource Group"
            },
            "defaultValue": "RG-Vnet-Exo-AZ"
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
    "variables": {
    },
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
                    "addressPrefixes": [
                        "[parameters('addressSpacePrefix')]"
                    ]
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
        },
        {
            "apiVersion": "2017-03-01",
            "type": "Microsoft.Network/virtualNetworks/virtualNetworkPeerings",
            "name": "[concact( parameters('VnetName') , '/JSON2AZ')]",
            "location": "[resourceGroup().location]",
            "properties": {
                "allowVirtualNetworkAccess": true,
                "allowForwardedTraffic": true,
                "allowGatewayTransit": false,
                "useRemoteGateways": false,
                "remoteVirtualNetwork": {
                    "id": "[resourceId( subscription().subscriptionid, parameters('RGvNetRemote') , 'Microsoft.Network/virtualNetworks', parameters('vNetRemote'))]"
                }
            }
        }
    ],
    "outputs": {
    }
}
```

La méthode de déploiement reste la même que dans la partie 1.
