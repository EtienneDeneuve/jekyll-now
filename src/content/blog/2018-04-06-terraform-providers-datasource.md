---
ID: 391
title: "Terraform: Providers à connaître, DataSource à redécouvrir !"
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-3.jpg
img_alt: "nice abstract image"
slug: 2018/04/06/terraform-providers-datasource
published: true
pubDate: 2018-04-06 16:30:52
---

## Terraform

### Avant de "coder"

Je ne vous présente pas à nouveau Terraform, je l'ai déjà fait [ici](https://etienne.deneuve.xyz/2017/10/01/microsoft-experience-17-infrastructure-code-modelisez-et-provisionnez-vos-services-azure-avec-terraform-et-packer/), [ici](https://stanislas.io/2017/01/24/infrastructure-dans-azure-c-est-comme-du-lego-slides-et-ressources-utiles/) ou sinon sur mon [github](https://github.com/etiennedeneuve/Azure/tree/master/Terraform). Je vous invite également à regarder la [vidéo](https://stanislas.io/2017/09/18/video-infrastructure-as-code-dans-azure-avec-terraform/) de Stanislas Quastana.
Si vous êtes des partenaires Microsoft, vous pouvez (devez) suivre les webinars [Azure Lab Experiences](http://aka.ms/azure-lab) de [Mickael Debois](https://www.linkedin.com/in/oseborn/) et de [Florent Chambon](https://www.linkedin.com/in/florent-chambon/).
L'objet de cet article est de vous montrer quelques points intéressants qu'il est bon de connaître !

## Providers

Terraform repose sur des providers que nous pouvons déclarer tel que :

```hcl
provider "nomduprovider" {
}
```

J'en ai trouvé qui sont plutôt sympas fournis par Hashicorp:

- [Random](https://www.terraform.io/docs/providers/random/index.html)
- [Template](https://www.terraform.io/docs/providers/template/index.html)

ou encore ceux de la communauté que je ne détaillerai pas, mais à  noter la présense d'un provider Active Directory, Google Calendar, Let's encrypt... la liste complète [ici](https://www.terraform.io/docs/providers/type/community-index.html).

### Random

Voici un example pour le provider random :

```hcl
provider "random" {}

resource "random_pet" "demo_pet" {
prefix = "myad"
separator = "."
}

resource "random_id" "demo_id" {
prefix = "web"
byte_length = 8
}

output "demo" {
value = "${random_pet.demo_pet.id}"
}

output "demo-id" {
value = "${random_id.demo_id.dec}"
}
```

Recopiez cet example puis exécutez la commande `terraform init` :

```powershell
PS C:\Users\etien\Documents\it\blog> terraform init

Initializing provider plugins...
- Checking for available provider plugins on https://releases.hashicorp.com...
- Downloading plugin for provider "random" (1.2.0)...

The following providers do not have any version constraints in configuration,
so the latest version was installed.

To prevent automatic upgrades to new major versions that may contain breaking
changes, it is recommended to add version = "..." constraints to the
corresponding provider blocks in configuration, with the constraint strings
suggested below.

* provider.random: version = "~> 1.2"

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

Une fois que l'init est fait, nous sommes prêts ! lancez donc `terraform apply` :

```powershell
PS C:\Users\etien\Documents\it\blog> terraform apply

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
+ create

Terraform will perform the following actions:

+ random_id.demo_id
id:
b64:
b64_std:
b64_url:
byte_length: "8"
dec:
hex:
prefix: "web"

+ random_pet.demo_pet
id:
length: "2"
prefix: "myad"
separator: "."

Plan: 2 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
Terraform will perform the actions described above.
Only "yes" will be accepted to approve.

Enter a value: yes

random_pet.demo_pet: Creating...
length: "" => "2"
prefix: "" => "myad"
separator: "" => "."
random_id.demo_id: Creating...
b64: "" => ""
b64_std: "" => ""
b64_url: "" => ""
byte_length: "" => "8"
dec: "" => ""
hex: "" => ""
prefix: "" => "web"
random_pet.demo_pet: Creation complete after 0s (ID: myad.quiet.filly)
random_id.demo_id: Creation complete after 0s (ID: aZLeiFCrOno)

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

demo = myad.quiet.filly
demo-id = web7607387397632506490
```

Voilà, grâce à ce provider, plus besoin de chercher des noms pour vos tests et vos déploiments de cattle !

### Template

Pour le provider template, reprenez votre fichier et ajoutez les éléments suivants :

```hcl
provider "random" {}

resource "random_pet" "demo_pet" {
  prefix    = "myad"
  separator = "."
}

resource "random_id" "demo_id" {
  prefix      = "web"
  byte_length = 4
}

output "demo" {
  value = random_pet.demo_pet.id
}

output "demo-id" {
  value = random_id.demo_id.dec
}

provider "template" {}

data "template_file" "demo" {

  template = <<-EOF
    #/bin/shell 
    hostname $${hostname} 
EOF

  vars = {
    hostname = "${random_pet.demo_pet.id}"
  }
}

output "demo-template" {
  value = data.template_file.demo.*.rendered
}
``` 

puis faites votre `init`, comme nous avons un nouveau provider, 
puis votre apply : 
```powershell
PS C:\Users\etien\Documents\it\blog> terraform apply
random_pet.demo_pet: Refreshing state... (ID: myad.quiet.filly)
random_id.demo_id: Refreshing state... (ID: ksLYNA)
data.template_file.demo: Refreshing state...

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.

Outputs:

demo = myad.quiet.filly
demo-id = web2462242868
demo-template = [
#/bin/shell

hostname myad.quiet.filly

]
```

Ce provider est assez pratique pour générer des user_data ou des scripts customisés à chaque lancement en fonction des variables du contexte.

## DataSources

Comme nous venons de le voir, à moins d"avoir fait un copier coller sans lire le code, dans Terraform nous avions plusieurs type dont "provider", "resource" ou encore "output" et "variable", mais aussi "data". Ce type est assez intéressant puisqu"il permet d"interroger dynamiquement le provider.
Admettons, vous avez une belle infra réseau dans Azure et vous souhaitez ajouter une belle machine dans ce beau réseau, avant ce n"était pas super pratique, il fallait jouer avec les imports, au risque de supprimer le vnet (par erreur, un vendredi soir vers 17h, au hazard) lors de l"invocation de la meilleure commande de terraform (destroy).

Voici un petit example de l"utilisation de ces datasources :

```hcl
provider "azurerm" {

}

data "azurerm_virtual_network" "test" {
name = "production"
resource_group_name = "networking"
}

output "virtual_network_id" {
value = "${data.azurerm_virtual_network.test.id}"
}
```

> Vous noterez surement que mon provider azurerm est vide, non je n"ai pas effacé mes infos, mais je vais vous donner deux solutions pour ne pas les oublier avant de faire un commit sur un github public avec votre SPN en clair pour tous.
>
> - Solution 1 :
>   Installez Azure Cli 2.0
> - Solution 2 :
>   Ajouter a vos variables d"environnement les elements :
>
>   - `ARM_SUBSCRIPTION_ID`,
>   - `ARM_CLIENT_ID`,
>   - `ARM_CLIENT_SECRET`,
>   - `ARM_TENANT_ID`
>
> Si vous utilisez Powershell, n"oubliez pas que vous pouvez les créer de cette façon :
> `Set-Item env:\ARM_SUBSCRIPTION_ID -Value votrevalue`

## Pour conclure

J'èspere que ça vous sera utile :)

Si vous souhaitez en savoir plus, je présente une session au Global Azure Bootcamp le 21 avril à l'école 42 répondant au titre de : "(Terraform + Packer + Ansible) + Azure = <3 ?"
