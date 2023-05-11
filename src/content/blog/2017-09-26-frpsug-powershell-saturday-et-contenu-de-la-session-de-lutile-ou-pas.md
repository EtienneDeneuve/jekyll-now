---
ID: 291
title: "FRPSUG - Powershell Saturday et contenu de la session"
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-4.jpg
img_alt: "nice abstract image"
slug: 2017/09/26/frpsug-powershell-saturday-et-contenu-de-la-session-de-lutile-ou-pas
published: true
pubDate: 2017-09-26 22:19:54
---

Suite au premier French PowerShell Saturday du [FRPSUG](https://frpsug.github.io) à Paris Le Samedi 16 septembre, dans les locaux de [Cellenza.](http://www.cellenza.com/fr/) (la où je bosse, pour ceux qui ne le savent pas!)

Si vous ne connaissez pas encore FRPSUG (Quoi???)

> Utiliser le channel #french sur [PowerShell.slack.com](https://powershell.slack.com/Slack) (
> [S’inscrire](http://slack.poshcode.org/))

Allez sur le GitHub : [https://github.com/FrPSUG](https://github.com/FrPSUG)

## Ma session

Avec [Mickael Lopes](https://twitter.com/LopesMick) on avait décidé de faire une session "à la cool" où on a montré quelques petits scripts inutiles (ou pas...)

Nous considérons que on peut tout aussi bien apprendre en s'amusant, l'event était un samedi, donc il fallait bien s'amuser un peu !

Je vous joins nos slides ! [FRPSUG](https://etienne.deneuve.xyz/assets/2017/09/FRPSUG.pptx) (OpenSource MIT!)

## Première démo

Devant la foule en délire (ou pas... on s'est rendu compte que sur les pc type Surface, ça ne marche pas!) :

```powershell
Start-Job {
    [console]::beep(440, 500)
    [console]::beep(440, 500)
    [console]::beep(440, 500)
    [console]::beep(349, 350)
    [console]::beep(523, 150)
    [console]::beep(440, 500)
    [console]::beep(349, 350)
    [console]::beep(523, 150)
    [console]::beep(440, 1000)
    [console]::beep(659, 500)
    [console]::beep(659, 500)
    [console]::beep(659, 500)
    [console]::beep(698, 350)
    [console]::beep(523, 150)
    [console]::beep(415, 500)
    [console]::beep(349, 350)
    [console]::beep(523, 150)
    [console]::beep(440, 1000)
}
```

Ok bon, pour ceux qui ne peuvent reconnaître, c'est la marche impériale.

## Deuxième Démo

Comment on attaque les API de la SNCF en Powershell :

[https://etienne.deneuve.xyz/2015/12/16/get-nexttrain/](https://etienne.deneuve.xyz/2015/12/16/get-nexttrain/)

## Troisième Démo

Comment on récupère le statut de l'encre sur un printer HP :

[https://etienne.deneuve.xyz/2016/01/15/get-ink-level-from-hp-printers-in-powershell/](https://etienne.deneuve.xyz/2016/01/15/get-ink-level-from-hp-printers-in-powershell/)

## Quatrième Démo

Comment on se connecte à des PaloAlto en PowerShell !

[https://github.com/EtienneDeneuve/Powershell/blob/master/PaloAlto/Get-PaloAlto.ps1](https://github.com/EtienneDeneuve/Powershell/blob/master/PaloAlto/Get-PaloAlto.ps1)

## Cinquième Démo

Manipulation de OneDrive via les API, en Powershell :

[https://github.com/EtienneDeneuve/Powershell/blob/master/OneDriveAPI/Remove-AllOneDriveSharedLink.ps1](https://github.com/EtienneDeneuve/Powershell/blob/master/OneDriveAPI/Remove-AllOneDriveSharedLink.ps1)

## Sixième Démo

Un script que j'ai fait pour un client (merci !), pour mettre en place IpSec en mode transports sur les 5 ou 6 domaines :

[https://github.com/EtienneDeneuve/Powershell/blob/master/IpSec/Invoke-IPSec.ps1](https://github.com/EtienneDeneuve/Powershell/blob/master/IpSec/Invoke-IPSec.ps1)

Vous pouvez bien sûr les utiliser, les modifier et m'en proposer d'autres !

Un grand merci à :

- l'équipe de Cellenza pour les locaux
- Metsys pour la bouffe
- FRPSUG pour être venu
- à tous ceux qui sont venus
- et également à ceux qui ne sont pas venus, la nourriture prévue pour eux est partie nourrir des personnes dans le besoin (Merci [Guillaume Matthieu](https://fr.linkedin.com/in/guillaume-mathieu-785431119) !)

> Si vous étiez là, ça vous a plu ?
