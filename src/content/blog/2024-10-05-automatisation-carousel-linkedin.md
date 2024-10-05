---
title: Automatiser la génération des carousels Linkedin
pubDate: 2024-10-05T12:00:00.000Z
description: Comment utiliser Docker, Pandoc, LaTeX pour générer des carousels pour linkedin
tags:
  - Docker
  - Automatisation
  - LaTeX
  - Pandoc
slug: 2024/10/05/automate-linkedin-carrousel
img: /assets/stock-3.jpg
img_alt: nice abstract image
lastModified: 2024-10-05T12:00:00.000Z
updateDate: 2024-10-05T12:00:00.000Z
---

## Je n'aime pas Canvas

Oui, c'est un chouette outil, c'est vrai. Mais moi, je n'aime pas, à chaque fois que je veux partager un sujet, je passe du temps à copier-coller depuis mon markdown vers Canvas.
Donc, j'ai décidé de faire une "petite" automatisation.

Voici mon nouveau process pour générer des jolis carousels sur Linkedin, sans toucher autre chose qu'un terminal (avec NeoVim quand même... mais VsCode fera l'affaire):

- Ecrire un markdown
- Lancer un script
- Publier le PDF

## Pré-requis

Il faut avoir : 

- un container Engine (Docker, ou autres)
- une belle photo de vous au format carré (650x650 par exemple)
- le plus beau logo de la terre

## Création du setup

### TL&DR

```bash
git clone https://github.com/EtienneDeneuve/linkedin-carousel-generator.git
```

### Creer les dossier pour la structure

```bash
mkdir -p linkedin-generator/{data/fonts,files,output,templates}
```

Ajouter votre photos dans data :

- me.png (une photo de vous)
- logo-with-decors.png (votre joli logo)

Ajouter vos fonts personalisées si besoin dans `data/fonts`

### Image Docker

Il faut customiser l'image pandoc `ubuntu` pour ajouter des modules LaTeX complémentaire :

```dockerfile
FROM pandoc/latex:latest-ubuntu
# Installer les packages LaTeX manquants
RUN tlmgr update --self && \
    tlmgr install titlesec enumitem fancyhdr xcolor geometry fontspec wrapfig ragged2e pgf hyperref
# Installer des polices si nécessaires
RUN apt-get update && \
    apt-get install -y fonts-freefont-ttf && \
    rm -rf /var/lib/apt/lists/*

# Copier les polices personnalisées (optionnel)
# Si vous avez des polices spécifiques, vous pouvez les copier dans l'image
ADD data/fonts/* /usr/share/fonts/truetype/custom/

# Mettre à jour le cache des polices
RUN fc-cache -f -v
```

Builder cette image, `docker build -t pandoc-custom .`

### Preparer le template LaTeX

Bon, on va pas se mentir, on est entre nous, le LaTeX c'est pas hyper sexy, par contre c'est super puissant.

Je vous donne mon template, libre à vous de le customiser ;) 

```latex
\documentclass{article}

% Encodage et polices
\usepackage[utf8]{inputenc}
\usepackage{fontspec}
\setmainfont{Dosis} % Vous pouvez changer la police si nécessaire

% Packages requis
\usepackage{graphicx}
\usepackage{geometry}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{xcolor}
\usepackage{tikz}
\usetikzlibrary{calc, backgrounds, shapes.arrows, shadows}
\usepackage{wrapfig}
\usepackage{ragged2e} % Pour aligner le texte à droite

% Configuration de la géométrie de la page
\geometry{
    paperwidth=210mm,
    paperheight=210mm,
    margin=20mm, 
    tmargin=1mm
}

% Définition des couleurs personnalisées
\definecolor{MainDark}{HTML}{105263}
\definecolor{Main}{HTML}{1a7996}
\definecolor{MainLight}{HTML}{96e0fd}
\definecolor{BcBackground}{HTML}{32809c}
\definecolor{SecondaryDark}{HTML}{7b9c35}
\definecolor{SecondaryLight}{HTML}{a3ce46}
\definecolor{AccentDark}{HTML}{07a6a0}
\definecolor{AccentLight}{HTML}{09d8d2}

% Changer la couleur de fond en MainDark
\pagecolor{MainDark}

% Configuration des en-têtes et pieds de page
\pagestyle{fancy}
\fancyhf{} % Effacer les en-têtes et pieds de page par défaut

% En-tête avec le logo centré
\fancyhead[C]{%
    \includegraphics[width=12cm]{data/logo-with-decors.png}
}

% Supprimer la ligne horizontale sous l'en-tête
\renewcommand{\headrulewidth}{0pt}

% Ajuster l'espace entre l'en-tête et le corps
\setlength{\headsep}{5cm}

% Pied de page avec nom à gauche et flèche à droite
\fancyfoot[L]{%
    \begin{tikzpicture}[remember picture, overlay]
        % Photo de l'auteur dans un masque rond
        \node[anchor=south west, xshift=1cm, yshift=2cm] at (current page.south west) {%
            \begin{tikzpicture}
                \draw[AccentLight, line width=1pt, drop shadow] (0,0) circle (1cm);
                \clip (0,0) circle (1cm);
                \node[anchor=center, inner sep=0pt] at (0,0) {\includegraphics[width=2cm]{data/me.png}};
            \end{tikzpicture}
        };
        % Nom de l'auteur et de l'entreprise
        \node[anchor=south west, xshift=3.2cm, yshift=2.8cm] at (current page.south west) {%
            \begin{minipage}{5cm}
                \raggedright
                \small \textbf{$author$}\\
                \small $company$
            \end{minipage}
        };
    \end{tikzpicture}
}
\fancyfoot[R]{%
    \begin{tikzpicture}[remember picture, overlay]
        % Flèche à droite
        \node[anchor=south east, xshift=-1cm, yshift=2cm] at (current page.south east) {%
            %\includegraphics[height=1cm]{data/arrow.png}
            \begin{tikzpicture}
                \node[
                    single arrow,
                    draw=none,
                    fill=MainLight,
                    minimum width=1.5cm,
                    minimum height=3cm,
                    single arrow head extend=0.5cm,
                    anchor=west,
                    drop shadow
                ] at (0,0) {};
            \end{tikzpicture}
           };
    \end{tikzpicture}
}

% Configuration des titres
\titleformat{\section}{
    \fontsize{42pt}{50pt}\bfseries\color{AccentLight}\centering
}{}{0pt}{}

% Configuration du corps de texte
\renewcommand{\normalsize}{\fontsize{18pt}{22pt}\selectfont}

% Alignement du texte à droite
\let\oldsection\section
\renewcommand{\section}[1]{%
    \oldsection{#1}
    \raggedright % Commence l'alignement à droite
}

% Définition de \tightlist si nécessaire
\providecommand{\tightlist}{
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}
}

% Charger hyperref en dernier
\usepackage[unicode]{hyperref}
\color{MainLight}

\begin{document}

$body$

\end{document}
```

Sauvegarder le dans le dossier `templates`, avec un nom comme par exemple `carousel.tex`.

### Ecrire un markdown

