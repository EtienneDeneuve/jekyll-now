---
ID: 429
title: Documentation as Code
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-1.jpg
slug: 2018/06/26/documentation-as-code
published: true
pubDate: 2018-06-26 13:43:44
---

## Le constat

Bien souvent, dans l'Infra as Code, la documentation est assez sommaire, trop manuelle et donc par conséquents obsolète, une heure après l'avoir terminée ( et puis globalement, c'est ch\*\*\* non ?).

<!--more-->

Si vous n'avez pas encore lu les articles suivants :

- [Git for ops](https://etienne.deneuve.xyz/2018/06/23/git-pour-ops-par-un-ops/)
- [Mon Setup de VS Code pour Bash et Git](https://etienne.deneuve.xyz/2018/06/26/setup-vs-code-bash-git/)
- [[Terraform](https://etienne.deneuve.xyz/2017/10/01/microsoft-experience-17-infrastructure-code-modelisez-et-provisionnez-vos-services-azure-avec-terraform-et-packer/)
- [Visual Studio Code](https://etienne.deneuve.xyz/2017/10/09/vsts-for-ops-1/)

Je vous invite à le faire, ils sont en quelques sortes des pré-requis, si vous ne connaissez pas encore git, VS Code ou encore Terraform.

## "Ma" solution

J'utilise des outils comme ansible-docgen ou terraform-docs, ou encore PlatyPS pour générer mes documentations automatiquement, et ce a chaque commit. Ces outils vont parser le code Ansible, Terraform ou Powershell (et il en existe surement pleins d'autres!). Ainsi je suis sûr que ma documentation reflete bien l'etat actuel de mon code, et non pas une version antidaté, mise à jour une fois tout les 6 mois.

### Préparation

Comme dans l'article [Open Source + Windows = VS Code + Bash + Git](https://etienne.deneuve.xyz/2018/06/26/setup-vs-code-bash-git/), installez les binaires suivants dans votre bash :

Packages à installer sur le bash Windows :

```shell
#!/bin/bash

# (obligatoire) installation de git, wget, unzip, python et curl
sudo apt install git wget unzip python curl

# (obligatoire) recuperation du gestionnaire de package "pip"
wget https://bootstrap.pypa.io/get-pip.py

# (optionnel) recuperation de terraform
wget https://releases.hashicorp.com/terraform/0.11.7/terraform_0.11.7_linux_amd64.zip -O terraform.zip

# (obligatoire pour la génération des docs de terraform)
wget https://github.com/segmentio/terraform-docs/releases/download/v0.3.0/terraform-docs_linux_amd64 -O terraform-docs

# (optionnel) extraction de terraform

unzip terraform.zip

# (optionnel) déplacement de terraform dans bin

mv terraform /home/${USER}/.local/bin/

# (obligatoire pour la génération des docs de terraform) déplacement de terraform-docs dans bin

mv terraform-docs /home/${USER}/.local/bin/

# (Obligatoire) installation de pip
python get-pip.py --user

# Correction du path si necessaire pour l"execution de terraform et terraform docs
if [[ ":$PATH:" == *":$HOME/.local/bin"* ]]; then
echo "Your path is correctly set"
else
PATH=$PATH:/home/${USER}/.local/bin
export PATH
fi

# (obligatoire) upgrade de pip
pip install pip --upgrade --user

# (obligatoire pour ansible) installation de ansible-lint ansible-docgen ansible avec les module azure et pywirm
pip install ansible-lint ansible-docgen ansible[azure] pywinrm --user
# (obligatoire) installation de pre-commit
pip install pre-commit
```

Récupérer le script de génération d'un sommaire dans notre future doc (toujours mieux d'avoir une belle table des matière !):

```shell
wget https://raw.githubusercontent.com/ekalinin/github-markdown-toc/master/gh-md-toc -O ./gh-md-toc
mv ./gh-md-toc /home/${USER}/.local/bin
chmod +x /home/${USER}/.local/bin/gh-md-toc
```

Récupérer le fichier `.pre-commit-config.yaml` dans ce même article ou sur mon [GitHub](https://raw.githubusercontent.com/EtienneDeneuve/vsts-for-ops/master/.pre-commit-config.yaml) :

```shell
cat <<EOF > .pre-commit-config.yaml
---
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v1.3.0
    hooks:
      - id: trailing-whitespace
      - id: check-yaml
      - id: check-xml
      - id: check-json
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-case-conflict
      - id: check-merge-conflict
      - id: check-executables-have-shebangs
      - id: check-added-large-files
      - id: detect-private-key
      - id: pretty-format-json
      - id: sort-simple-yaml
  - repo: https://github.com/willthames/ansible-lint.git
    rev: v3.5.0rc1
    hooks:
      - id: ansible-lint
        files: \.(yaml|yml)$
        exclude: ./env/
  - repo: git://github.com/antonbabenko/pre-commit-terraform
    rev: v1.7.3
    hooks:
      - id: terraform_fmt
      - id: terraform_docs
EOF
# puis on l"ajoute à l"index :
git add .pre-commit-config.yaml
git commit -m "adding pre-commit-config"
```

Puis, lancer l'installation avec `pre-commit install`. Ceci nous permet de bien valider nos fichiers avant les commits.

### Génération manuelle de la documentation pour Ansible

Le package `ansible-docgen` permets de générer une documentation des rôles et des playbook présents dans le dossier.

### Generation manuelle de la documentation pour Terraform

Le package "terraform-docs" permets de générer une documentation des roles et des playbook présents dans le dossier.

### Automatisation de la doc pour Ansible

Voici un script que j'utilises pour générer ma documentation Ansible :

```shell
#!/bin/bash
# je genere la documentation avec ansible-docget pour tout le dossier
ansible-docgen -p .
# je créer un dossier "docs" dans le projet github
mkdir -p ./docs
# si le dossier contien déjà un fichier fullreadme.md je le déplace
if [ -d "./docs/fullreadme.md" ]; then
mv ./docs/fullreadme.md ./docs/fullreadme-$(date +"%m_%d_%Y").old
else
# sinon j"affiche un mesage
echo "full readme doesn"t exists yet"
fi
# j"ajoute le titre à mon document
echo "# Ansible documentation" > ./docs/fullreadme.md
# J"ajoute les placeholders pour injecter la table des matieres
echo ">!--ts-->" >> ./docs/fullreadme.md
echo ">!--te-->" >> ./docs/fullreadme.md
# J"ajoute un titre interimédiaire
echo "## Roles et Playbook Ansible" >> ./docs/fullreadme.md
# Je créer une section pour les playbooks
echo "### Playbook" >> ./docs/fullreadme.md
# et j"ajoute le contenu du readme.md générer par ansible-docgen (ce sont les playbooks)
# l"expression sed permet de promouvoir les titres sur un niveau plus haut (# vers ##)
cat ./README.md | sed "/^#/s/^/##/" >> ./docs/fullreadme.md
# je créer maintenant la section pour les roles
echo "### Roles" >> ./docs/fullreadme.md
# et j"ajoute le contenu
# l"expression sed permet de promouvoir les titres sur un niveau plus haut (# vers ##)
cat ./roles/README.md| sed "/^#/s/^/##/" >> ./docs/fullreadme.md
# Je génère la table des matières et je l"injecte
gh-md-toc --insert ./docs/fullreadme.md
# je pousse mon fullreadme.md vers readme.md pour qu"il soit afficher par defaut dans GitHub ou vsts
cp ./docs/fullreadme.md ./README.md
```

### Automatisation de la doc pour Terraform

Voici un script que j'utilises pour générer ma documentation Terraform:

```shell
#!/bin/bash
# conservation de l"ancien readme (backup)
mv ./README.md ./README.old
# recherche de tout les repertoires et execution de terraform-docs dans chacun d"eux
find . -type d -exec bash -c "terraform-docs md "{}" > "{}"/README.md;" \;
# recherche de tout les readme.md vide et suppression
find . -name "README.md" -size 1c -type f -delete
# creation du titre du document
echo "# Terraform Modules Documentation" > modules.md
# ajout des placeholder pour la generation de la tables des matières
echo ">!--ts-->" >> modules.md
echo ">!--te-->" >> modules.md
# boucle sur tout les readme.md present
for f in $(find ./ -name "README.md")
do
# ajout du nom du fichier pour la table des matieres
echo "## $f" >> modules.md
# ajout du contenu du fichier avec une expression sed pour ajouter un niveau dans l"arboresence
cat $f | sed "/^#/s/^/#/" >> modules.md
done
# insertion de la table des matières
gh-md-toc --insert modules.md
# copie du fichier modules.md temporaire vers README.md pour un affichage directe sur GitHub et VSTS
cp ./modules.md ./README.md
```

## Ajout de ces scripts dans Git

Afin de transformer ces scripts en "hooks" il suffit de les placer dans le repertoire caché `.git/hooks`.

Dans mon autre article `Open Source + Windows = VS Code + Bash + Git`, nous avons utiliser les pré-commit hooks, cette fois-ci nous allons utiliser le post-commit

Ajoutez un fichier post-commit (executable) ajoutez le contenu suivant :

```bash
#!/bin/bash
"$(dirname $0)/generate_docs.sh"
```

puis créer un fichier "`generate_docs.sh`" avec comme contenu le script, de votre choix (Terraform ou Ansible).

Voila, maintenant à chaque commit réussi, la doc de votre projet sera mise à jour.
