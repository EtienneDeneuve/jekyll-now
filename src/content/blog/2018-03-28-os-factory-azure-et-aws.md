---
ID: 386
title: >
  Os Factory Azure et Aws en Open Source
  avec Microsoft et Société Générale !
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-3.jpg
img_alt: "nice abstract image"
slug: 2018/03/28/os-factory-azure-et-aws
published: true
pubDate: 2018-03-28 12:25:01
---

Nous venons de publier le deuxième provider (Azure ;)) dans notre OS Factory qui permets de générer des images pour AWS et Azure ainsi que de les partager entre deux souscriptions Azure. Il reste encore du travail, mais elle est fonctionnelle et cerise sur le gateau, c'est en Open Source!

Un grand merci à la Société Générale (Yannick Neff), Microsoft France (Mandy Ayme),</span> [WeScale](https://www.wescale.fr/) (Maxence Maireaux) et [Cellenza](https://www.cellenza.com/fr/) (moi).

Le code est par ici :
[https://github.com/societe-generale/os-factory](https://github.com/societe-generale/os-factory)

Coté techno, nous utilisons Ansible et Packer. Il faut effectuer un petit setup coté Azure, il vous faudra une VM Ubuntu, avec le MSI de configurer et un SPN, tout est dans le [readme](https://github.com/societe-generale/os-factory#infrastructure-for-azure):)
