---
title: "Azure et le backup ? (d&#8217;un Mac)"
author: etienne.deneuve
layout: layouts/post-sidebar.njk
mySlug: azure-et-le-backup-dun-mac
permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/index.html"
tags:
  - Fun
  - macOs
  - Azure
  - French
published: true
date: 2017-03-14 22:29:37
updateDate: 2020-03-04 08:35:17
---
Un petit article "Quick &amp; very very dirty" qui est soyons honnêtes complètement inutile.
<!-- excerpt -->
Mais quand c'est inutile, c'est possible que ce soit fun !

> Disclaimer : Je suis pas responsable de vos données perdues !

![boom](http://giphy.com/gifs/nuke-atomic-bomb-a-ULsH97rqqbf68)

## Pré-requis

Du crédit Azure, un Mac avec Sierra.
<!--more-->
## Azure Side

### Préparation sur un Mac

Comme on est sur macOs, on va commencer par utiliser le CLI azure, dispo ici : [aka.ms/mac-azure-cli](http://aka.ms/mac-azure-cli)(aka.ms/mac-azure-cli). Je vous passe la bête installation Next Next Finish...

Une fois bien installé sur le macOs, ouvrez le terminal lancez les commandes suivantes :

``` shell
azure login
```

suivez le lien [aka.ms/devicelogin](https://aka.ms/devicelogin) avec le code généré dans le terminal

puis vérifiez vos informations de facturation avec :

``` shell
azure account show
```

### Création de l'environnement Azure

On crée un petit resource group qui va bien (c'est du Poc Quick &amp; very Dirty, mais on est pas des sauvages !)

``` shell
azure group create RG_Backup NorthEurope
```

et si tout se passe bien :

``` shell
info:    Executing command group create
+ Getting resource group RG_Backup
+ Creating resource group RG_Backup
info:    Created resource group RG_Backup
data:    Id:                  /subscriptions/XXXXXXXXXXXX/resourceGroups/RG_Backup
data:    Name:                RG_Backup
data:    Location:            northeurope
data:    Provisioning State:  Succeeded
data:    Tags: null
data:
info:    group create command OK
```

On va créer maintenant un compte de stockage :

``` shell
azure storage account create stobackupmac \
--kind Storage \
--sku-name LRS \
--resource-group RG_BACKUP \
--location NorthEurope
```

Normalement, si tout va bien on a un petit message "info: storage account create command OK", continuons, nous avons besoin d'une clé sur ce compte de stockage :

``` shell
azure storage account keys list stobackupmac -g RG_Backup
```

on récupère des clefs d'accès ici :

``` shell
info:    Executing command storage account keys list
+ Getting storage account keys
data:    Name  Key                                                                                       Permissions
data:    ----  ----------------------------------------------------------------------------------------  -----------
data:    key1  ONsztQjA44F+S+ffVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXTNROw1yPOQdcHVynXOOt3g==  Full
data:    key2  dppNGuvyIn1li/ffVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXTNROw1yPOQdcHVynXOOt3g==  Full
info:    storage account keys list command OK
```

Maintenant, on crée un partage Azure :
Le plus simple, c'est de créer des variables d'environnement pour se simplifier l'exécution des commandes qui vont suivre :

``` shell
export AZURE_STORAGE_ACCOUNT=stobackupmac
export AZURE_STORAGE_ACCESS_KEY=dppNGuvyIn1li/ffVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXTNROw1yPOQdcHVynXOOt3g==
```

Ainsi on peut maintenant taper la commande suivante :

``` shell
azure storage share create --share sharebkp --quota 100
```

Ce qui nous donnera "info:    storage share create command OK" et donc, c'est prêt !

## Mac Side

Connectons le mac avec le Share dans Azure. Je suppose que le port TCP 445 est ouvert en sortie de chez vous.

Ouvrez le Finder puis Menu "Aller", "Se connecter au serveur..." (ou Command + K)

Indiquez : `smb://sharebkp@stobackupmac.file.core.windows.net/sharebkp` (si vous avez tout suivi)

au prompt du mot de passe, indiquez "sharebkp" et une des clés comme celle exportée dans "`AZURE_STORAGE_ACCESS_KEY`". Normalement, vous devriez le voir dans le Finder correctement.

On arrête la partie graphique du mac et on retourne dans un terminal :

``` shell
cd /Volumes/sharebkp
#création du SparseBundle
hdiutil create \
-library NONE \
-fs HFS+ \
-volname "Azure Time Machine" \
-encryption AES-128 \ #Attention, oubliez pas le mot de passe !
-size 99g \
MacBookPro-Etienne.sparsebundle
```

Maintenant, allez allumer la cafetière, lancer un détartrage, nettoyez la, faites un café, ca devrait être prêt...
Si tout est bien prêt, avec le Finder, double cliquer sur l'image SparseBundle, vous devriez la retrouver dans "/Volumes/Azure\ Time\ Machine/", retournons dans le terminal :

``` shell
sudo tmutil setdestination /Volumes/Azure\ Time\ Machine/
```

Et Hop, Time Machine sur Azure !
(oui, je sais ;))
