---
ID: 224
title: "Azure Powershell - Comment on fait quand ca n&#8217;existe pas ?"
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-2.jpg
img_alt: "nice abstract image"
slug: 2017/09/26/azurepscmdnotfound
published: true
pubDate: 2017-09-26 21:16:06
---

## La vie dans Azure

Bon, admettons, vous avez besoin de filter vos VM avec le type d'OS déployé dessus afin de savoir si vous avez plus de Linux ou de Windows dans Azure.

Avec Powershell, on se dit "ouais, c'est facile". Un petit coup de Get-AzureRMVM et hop...

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-1-gvm.png)
Cool, "OsType", pile ce qu'on cherche, aller hop, on filtre avec | Select-Object

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-2-so.png)

et ouais, c'est tout vide ! Et l'aide elle dit quoi ? Pas grand chose de plus :
![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-3-help.png)

On a plus le choix, on y va!

> On va dedans !

## Vérification des membres

Avec un petit Get-Member on liste les membres de la commande Get-AzureRMVM

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-4-gm.png)

On voit que `OsType` n'existe pas, c'est donc une commande qui utilise une propriété calculée.
En revanche un élément , `OsProfile`, parait correspondre au besoin.

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-5-osp.png)

On tente le `Select-Object` ?

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-6-os.png)
Raté, ce coquin est un autre objet ! Etendons le !

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-7-exp.png)

Super! On a trouvé un truc!

## On script ?

Déjà, on sait de base que le Script, on va s'en servir au moins une fois ;) donc pour le construire, il faut se poser quelques bonnes questions.

1. Connexion a Azure ?
2. Son nom (qui claque !)

### Le nom j'ai déjà choisi (après tout...)

```powershell
Get-cAzureRMVMOs
```

> Personnellement, j'essaye de mettre un indicateur "c" pour "custom" sur mes functions pour les différencier des autres.

### La connexion à Azure

J'utilise un petit bout de script que j'ai récupéré (je ne sais plus où, si l'auteur se manifeste !)

```powershell
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
```

En gros, c'est simple, si on est connecté, il se passe rien, sinon on nous demande notre login. Simple, Efficace...

### Le script en lui même

```powershell
Function Get-cAzureRMVMOs {
    [CmdletBinding()]
    param(

    )
    Check-AzureRMSession
    $vms = get-azurermvm
    foreach ($vm in $vms) {
        $osprofile = $($vm.OSProfile)
        if ($($osprofile.LinuxConfiguration) -eq $null) {
            $OsType = &quot; Windows&quot
        }
        elseif ($($osprofile.WindowsConfiguration) -eq $null) {
            $OsType = &quot; Linux&quot
        }
        else {
            $OsType = $osprofile
        }
        [PSCustomObject]@{
            AvailabilitySetReference = $vm.AvailabilitySetReference
            DiagnosticsProfile       = $vm.DiagnosticsProfile
            DisplayHint              = $vm.DisplayHint
            Extensions               = $vm.Extensions
            HardwareProfile          = $vm.HardwareProfile
            Id                       = $vm.Id
            Identity                 = $vm.Identity
            InstanceView             = $vm.InstanceView
            LicenseType              = $vm.LicenseType
            Location                 = $vm.Location
            Name                     = $vm.Name
            NetworkProfile           = $vm.NetworkProfile
            OSType                   = $OsType
            Plan                     = $vm.Plan
            ProvisioningState        = $vm.ProvisioningState
            RequestId                = $vm.RequestId
            ResourceGroupName        = $vm.ResourceGroupName
            StatusCode               = $vm.StatusCode
            StorageProfile           = $vm.StorageProfile
            Tags                     = $vm.Tags
            Type                     = $vm.Type
            VmId                     = $vm.VmId
        }
    }
}
```

### Résultat ?

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-8-Cool.png)

Ca fonctionne ! et le filtre ?

![](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-9-youpi.png)

Du coup, avec notre super fonction, on peut filtrer comme on voulait :)

```powershell
Get-cAzureRMVMOsType |?{ $_.OsType -eq "Windows" }
```

> PS: Ce sript fonctionne très bien avec AzureRM.NetCore sur macOs :![macos powershell](https://etienne.deneuve.xyz/wp-content/uploads/2017/09/get-cazurevmos-10-youpi.png)
