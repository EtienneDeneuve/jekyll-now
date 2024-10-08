---
title: Utiliser Ansible et Azure, oui c'est possible !
description: Intégrez Ansible, l'outil d'orchestration de Red Hat, avec Azure pour le déploiement et la gestion de vos infrastructures cloud.
tags:
  - Ansible
  - Azure
  - Orchestration
  - Déploiement
slug: 2017/01/26/utiliser-ansible-et-azure-oui-cest-possible
pubDate: 2017-01-26 18:54:27
updateDate: 2024-02-12 11:16:00
img: /assets/stock-2.jpg
img_alt: nice abstract image
---

## Avant-Propos

[Ansible](https://www.ansible.com/), proposé par [Red Hat](https://www.redhat.com/fr), est largement adopté pour l'orchestration et le déploiement dans le monde de l'Open Source. En préparation des démonstrations pour le [MS Cloud Summit](https://mscloudsummit.fr/fr/accueil/), [Stanislas Quastana](https://stanislas.io/) et moi avons exploré l'utilisation d'Ansible et Terraform pour déployer des services dans Azure. Retrouvez les détails de notre session "Infrastructures dans Azure : C’est comme du lego" : [ici](http://aka.ms/cloudsummitlego).

## Ansible

Ansible sert à gérer les configurations. Plutôt que de répéter ce que de nombreux tutoriels couvrent déjà, je vous propose de consulter les ressources disponibles via [Bing](https://www.bing.com/search?q=tutorial+installation+ansible&go=Envoyer&qs=n&form=QBLH&sp=-1&pq=tutorial+installation+ansible&sc=3-24&sk=&cvid=12AEAA43E790440088D942223E35173A) ou [Google](https://www.google.fr/#q=tutorial+install+ansible). Cependant, configurer Ansible pour Azure peut s'avérer complexe. J'ai opté pour une installation d'Ansible sur une VM Azure déployée via Terraform. Consultez un exemple dans mon repo Azure sur [GitHub](https://github.com/EtienneDeneuve/Azure/tree/master/Terraform/01%20-%20IaaS) pour déployer une VM Ubuntu 16.04-LTS prête à l’emploi.

### Installation de dépendances

Mettez à jour votre système et installez les dépendances nécessaires, y compris Python :

```shell
sudo apt-get update
sudo apt-get install software-properties-common
sudo apt-get install libffi-dev libssl-dev
```

### Installation de Ansible

Ajoutez le PPA Ansible et installez Ansible ainsi que quelques outils supplémentaires :

```shell
sudo apt-add-repository ppa:ansible/ansible
sudo apt-get update
sudo apt-get install ansible sshpass git
```

### Installation des prérequis pour Azure

Utilisez pip pour installer les composants nécessaires à la gestion d'Azure :

```shell
sudo apt-get install python-pip
sudo pip install --upgrade pip
sudo pip install urllib3 --upgrade
sudo pip install msrest==0.4.4
sudo pip install msrestazure==0.4.4
sudo pip install azure==2.0.0rc5
```

### Configuration de Ansible (a minima)

Sauvegardez et configurez `ansible.cfg` et le fichier hosts pour inclure la machine locale :

```shell
mv /etc/ansible/ansible.cfg /etc/ansible/ansible.cfg.backup
printf "[defaults]\nhost_key_checking = False\n\n" >> /etc/ansible/ansible.cfg
echo '[ssh_connection]\ncontrol_path = ~/.ssh/ansible-%%h-%%r' >> /etc/ansible/ansible.cfg
echo "\nscp_if_ssh=True" >> /etc/ansible/ansible.cfg
echo "localhost" > /etc/ansible/hosts
```

### Azure

Préparez votre environnement pour les scripts d'inventaire Ansible et téléchargez le module `azure_rm.py` :

```shell
mkdir -p /opt/azure/playbook
mkdir -p /opt/azure/inventory
mkdir -p ~/azure
cd /opt/azure/inventory
wget https://raw.githubusercontent.com/ansible/ansible/devel/contrib/inventory/azure_rm.py
wget https://raw.githubusercontent.com/

ansible/ansible/devel/contrib/inventory/azure_rm.ini
chmod +x /opt/azure/inventory/azure_rm.py
```

Configurez un Service Principal pour Ansible dans Azure et créez un fichier `.credentials` avec vos informations d'identification :

```shell
cd ~/azure/
touch .credentials
echo "[default]" > .credentials
echo "subscription_id=YOUR-SUBID" >> .credentials
echo "client_id=YOUR-ClientID" >> .credentials
echo "secret=YOUR-SECRET" >> .credentials
echo "tenant=YOUR-TENANTID" >> .credentials
```

### Le test

Créez un playbook de test pour vérifier votre configuration et lancez-le :

```yaml
- name: Test the inventory script
  hosts: azure
  connection: local
  gather_facts: no
  tasks:
    - debug: msg="{{ inventory_hostname }} has powerstate {{ powerstate }}"
```

Enregistrez-le sous `/opt/azure/playbook/test.yml` et exécutez-le :

```bash
ansible-playbook -i /opt/azure/inventory/azure_rm.py /opt/azure/playbook/test.yml
```

Vous devriez voir le statut de vos ressources Azure, prouvant que tout est correctement configuré pour le déploiement et la gestion d'Azure avec Ansible.

Cet article vous guide à travers l'installation et la configuration d'Ansible pour gérer vos ressources Azure, offrant une solution puissante pour l'orchestration de votre infrastructure cloud.
