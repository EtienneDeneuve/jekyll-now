---
title: Utiliser Ansible et Azure, oui c'est possible !
description: ""
tags: [""]
slug: 2017/01/26/utiliser-ansible-et-azure-oui-cest-possible
pubDate: 2017-01-26 18:54:27
img: /assets/stock-2.jpg
img_alt: nice abstract image
type: default
---

## Avant Propos

[Ansible](https://www.ansible.com/) est un outil d’orchestration et déploiment proposé par [Red Hat](https://www.redhat.com/fr). Il est utilisé par de nombreuses entreprises dans le domaine de l’Open Source. Pendant la préparation des démos pour le [MS Cloud Summit](https://mscloudsummit.fr/fr/accueil/), [Stanislas Quastana](https://stanislas.io/) et moi-même avons donc décidé de présenter les outils Open Source Terraform et Ansible afin de déployer des services dans Azure. Vous pouvez retrouver tous les détails de notre session “Infrastructures dans Azure : C’est comme du lego” : [ici](http://aka.ms/cloudsummitlego)

## Ansible

Ansible est donc un outil de gestion des configurations, je ne vais pas vous refaire un tutorial d’installation vu le nombre déjà disponible avec votre ami [Bing](https://www.bing.com/search?q=tutorial+installation+ansible&go=Envoyer&qs=n&form=QBLH&sp=-1&pq=tutorial+installation+ansible&sc=3-24&sk=&cvid=12AEAA43E790440088D942223E35173A) ou [Google](https://www.google.fr/#q=tutorial+install+ansible). En revanche l’installation des éléments nécessaires pour Azure peuvent être un peu complexe à installer et les documentations peu présentes. J’ai décidé d’installer Ansible sur une machine dans Azure que j’ai déployé avec Terraform, vous pouvez trouver un fichier d’example dans mon repo Azure sur [GitHub](https://github.com/EtienneDeneuve/Azure/tree/master/Terraform/01%20-%20IaaS) afin de créer une machine virtuelle prête à l’emploi. Mon example déploie une machine Ubuntu 16.04-LTS et mon installation fonctionnera sur d’autres machines du même type.

### Installation de dépendances

Première chose à faire sur une nouvelle machine c’est bien entendu les mises à jour :
`sudo apt-get update`
Ensuite il faut installer les dépendances nécessaires a Ansible à savoir Phython :
`sudo apt-get install software-properties-common`
Il faut également installer des librairies de convention et ssl :
`sudo apt-get install libffi-dev libssl-dev`

### Installation de Ansible

Sur Ubuntu le repository PPA propose une version de Ansible il faut donc simplement l’ajouter et faire une petite mise à jour du cache apt-get:

```shell
sudo apt-add-repository ppa:ansible/ansible
sudo apt-get update
```

Lorsqu’on utilise Ansible ou d’autres outils de configuration management il est intéressant d’utiliser git ainsi que sshpass on installera donc les trois paquets :

```shell
sudo apt-get install ansible sshpass git
```

### Installation des prérequis pour Azure

Pour installer les éléments nécessaires, pip est assez pratique :

```shell
sudo apt-get install python-pip
sudo pip install --upgrade pip
```

Le paquet urllib3 fourni dans les repository d’Ubuntu n’est pas installé de la bonne manière pour les dépendances Azure et donc il faut le mettre à jour par pip :

```shell
sudo pip install urllib3 --upgrade
```

Ensuite on installe MS rest …

```shell
sudo pip install msrest==0.4.4
```

et MS Rest Azure …

```shell
sudo pip install msrestazure==0.4.4
```

Puis le SDK Python pour Azure :

```
sudo pip install azure==2.0.0rc5
```

### Configuration de Ansible (a minima)

Première chose à faire comme toujours lorsqu’on modifie des fichiers sur un serveur c’est le backup du fichier de configuration :

```shell
mv /etc/ansible/ansible.cfg /etc/ansible/ansible.cfg.backup
```

J’ai glané sur le web quelques modifications à faire dans le fichier de configuration et on ajoute la machine locale dans le fichier hosts de Ansible :

```shell
printf "[defaults]\nhost_key_checking = False\n\n" \
        >> /etc/ansible/ansible.cfg
echo '[ssh_connection]\ncontrol_path = ~/.ssh/ansible-%%h-%%r' \
        >> /etc/ansible/ansible.cfg
echo "\nscp_if_ssh=True" >> /etc/ansible/ansible.cfg
echo "localhost" > etc/ansible/hosts
```

### Azure

Pour tester que notre configuration fonctionne correctement on va utiliser un module disponible sur le GitHub de Ansible, azure_rm.py et son fichier de configuration azure_rm.ini. Mais avant, préparons quelques dossiers pour ranger les Playbook Ansible et les scripts d’inventaire.

```shell
mkdir -p /opt/azure/playbook
mkdir -p /opt/azure/inventory
mkdir -p ~/azure
```

Il faut télécharger le module :

```shell
cd /opt/azure/inventory
wget https://raw.githubusercontent.com/ansible/ansible/devel/contrib/inventory/azure_rm.py
wget https://raw.githubusercontent.com/ansible/ansible/devel/contrib/inventory/azure_rm.ini
chmod +x /opt/azure/inventory/azure_rm.py
```

Ansible a besoin tout comme Terraform d’un Service Principal sur votre tenant Azure afin de d’accéder à vos ressources, je ne vais détailler la méthode ici, rendez-vous sur le blog de [Stanislas](https://stanislas.io/2017/01/02/modeliser-deployer-et-gerer-des-ressources-azure-avec-terraform-de-hashicorp/)afin d’avoir la méthode qui
est exactement la même. Une fois ces informations collectées, créer un fichier `.credentials` dans votre `$HOME/azure` :

```shell
cd ~ /azure/
touch .credentials
```

et renseigner le contenu tel que ci dessous :

```ini
[default]
subscription_id=YOUR-SUBID
client_id=YOUR-ClientID
secret=SECRET
tenant=TENANTID
```

Attention : vous devez indiquer les renseignements sans placer de quote au quels cas Azure vous refusera l’authentification. Pensez également à ne jamais diffuser vos clés, elles permettent d’avoir accès à votre tenant de manière similaire a un administrateur !

### Le test

Pour vérifier que tout est bien configuré, nous allons créer un playbook basé sur les informations de l’inventaire que nous avons téléchargé. Avant de faire votre premier playbook il est peut-être nécessaire de faire un petit rappel sur les fichier YML ou YAML.

Les fichiers YML (Yet Another Language Markup) est un langage simple mais qui comporte quelques subtilités qui peuvent se révéler frustrates au départ. En effet les tabulations doivent être de 2 espaces. J’utilise [Visual Studio Code](https://code.visualstudio.com/) qui comporte la possibilité d’être configuré afin de ne pas être ennuyé, de plus si vous travaillez sur un Pc sous Windows, les fichiers doivent être en retour de ligne LF et non CRLF! Je détaillerai très prochainement ma configuration et mes plugins que j’utilise sur VS Code.
Le playbook :

```yaml
- name: Test the inventory script
  hosts: azure
  connection: local
  gather_facts: no
  tasks:
    - debug: msg="{{ inventory_hostname }} has powerstate {{ powerstate }}"
```

On l’enregistre dans /opt/azure/playbook/test.yml puis on le lance avec la commande :

```bash

ansible-playbook -i /opt/azure/inventory/azure_rm.py /opt/azure/playbook/test.yml

```

Vous obtiendrez normalement un retour de ce type :

```bash
PLAY [Test the inventory script] ***********************************************

TASK [debug] *******************************************************************
ok: [ansiblevm01] => {
    "msg": "ansiblevm01 has powerstate running"
}
ok: [RG-Terraform-Ansible-vm] => {
    "msg": "RG-Terraform-Ansible-vm has powerstate running"
}
ok: [Blog] => {
    "msg": "Blog has powerstate running"
}

PLAY RECAP *********************************************************************
Blog                    : ok=1 changed=0 unreachable=0 failed=0
RG-Terraform-Ansible-vm : ok=1 changed=0 unreachable=0 failed=0
ansiblevm01             : ok=1 changed=0 unreachable=0 failed=0
```

Vous devez retrouver vos ressources groupes déjà présents dans votre tenant Azure !!

Tout est donc prêt pour pouvoir déployer des ressources dans Azure et les configurer.
