---
title: "Side loading application without SCCM - Part 1"
description: ""
tags: [""]
slug: 2016/01/11/side-loading-app
pubDate: 2016-01-11 17:20:38
img: /assets/stock-2.jpg
img_alt: "nice abstract image"
---

I publish my way to install side loaded application to Windows 8 and above. I looked on Internet and found nothing to install theses apps  on  computers in a company which doesn't have SCCM. I've written a powershell script which will do the work but I want to share the way I built it, instead of sharing it without any kind of explanation. This blog post is the first one of the series for passing to a long and non interesting tasks to a near complete automated one. You will need makeappx and signtool on the computer to run the script or make the process manually. It's preferable to make the process one time before launching the script. It's easier to debug something you know (yes ! ;)).

## Applications for Windows Modern UI

Let's start this post by a little explanation about Windows Sideloading Mechanics. When you build application with tools like Adobe DPS, you will get a "appxbundle". For side loading you need sign the appxbundle and the appx in the bundle. So, you need to "unbundle" the bundle, and then unpack the appx. Unfortunately you need to modify the AppManifest.xml and the BlockMap.xml (a file where all the hash are stored), and theses two files exist for both AppxBundle and Appx.

The tree of an AppxBundle look like :

- / (root of the AppxBundle)
- /AppManifest
- /AppManifest/AppxManifest.xml
- /BlockMaps.xml
- /ARM.appx
- /x86.appx
- /x64.appx
- (all the architectures are in the bundle, I removed the non essential files)

For Sideloading and changing the certificate to a good one here are the steps we need :

1. Unbundle appxbundle
2. Unpack all the appx
3. Modify the AppManifest.xml, for all of them. We need to change the "Publisher" attributes in the XML.
4. Modify the BlockMaps.xml, for all of them. We need to remove the Hash and size of the modified AppManifest.xml.
5. Pack the appx and sign it
6. Create the bundle and sign it
7. Create a powershell script to install the dependencies and the bundle.
8. Find a way to launch the Powershell Script on all our client
   The part 2 is coming, soon...

Other Parts  :

- [Part 2](http://etienne.deneuve.xyz/2016/01/11/side-loading-application-without-sccm-part-2/)
- [Part 3](http://etienne.deneuve.xyz/2016/01/11/side-loading-application-without-sccm-part-3/)
- The full script is on my (New) Git : [Go to Git !](https://github.com/EtienneDeneuve/Powershell)
