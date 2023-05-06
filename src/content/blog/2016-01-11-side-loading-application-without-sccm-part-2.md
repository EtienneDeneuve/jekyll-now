---
title: "Side loading application without SCCM - Part 2"
description: ""
tags: [""]
slug: 2016/01/11/side-loading-application-without-sccm-part-2
pubDate: 2016-01-11 18:25:02
img: /assets/stock-3.jpg
img_alt: "nice abstract image"
---

So you have read the first article of these little series ( part 1[here :](http://etienne.deneuve.xyz/2016/01/11/side-loading-application-without-sccm-part-1/)>

## Powershell

With powershell we can automate tasks and manage our servers. Some one asks me to publish an AppxBundle with a need certificate (a good one, sign by a 3rd party provider, not a crappy self signed) for a customer, for side loading the appx and doesn't have to renew the certificate every year. It's not very funny to rebuild a package each year for a certificate, and it's not possible to publish the apps to the market as no one will care about it and there's no use for others. Before making a script for it, I've made the process one time manually and found it too much longer and not very interesting. So I started my scripts by a function to make the XML modifications. Powershell handles XML files better, than me, so I just need to do [xml]$variable = Get-Content $myappxfile. But I realizes my files a differents and need multiples modifications, so created a Switch (hint : Use the Powershell ISE and hit Crtl + J to get Intellisense doing the work for you) and addsome parameters to the function and the ability to choose between multiple values, with the "ValidateSet", useful for autocompletion. (I don't publish the true function right now):

```powershell
Function Update-AppxXML{
param(
[ValidateSet("Option1","Option2","Option3")]
$param1,
$param2,
)
switch($param1){
"Option1" { do that }
"Option2" { do that }
"Option3" { do that }
}
}
```

When I wrote my script, I splitted in multiple functions. It's pretty cool to have a script almost ready, where you don't have to write it again completely from scratch. You can also have a "Main" function for calling all the functions instead of making an intensive use of the magic pipe.

In the part 3, I'll go deeper in the scripts. Stay tuned...

Other Parts  :

- [Part 1](http://etienne.deneuve.xyz/2016/01/11/side-loading-application-without-sccm-part-1/)
- [Part 2](http://etienne.deneuve.xyz/2016/01/11/side-loading-application-without-sccm-part-2/) (you are here)
- [Part 3](http://etienne.deneuve.xyz/2016/01/11/side-loading-application-without-sccm-part-3/)
- The full script is on my (New) Git : [Go to Git !](https://github.com/EtienneDeneuve/Powershell)
