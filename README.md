# Emergence
A little simulation of evolution

-= Objectif du projet : =-

Ce projet a pour objectif premier de réaliser une simulation minimaliste d'environnement. Cette simulation se déroulera sur une grille hexagonale, mettra en scène des individus provenant d'une ou plusieurs espèces (avec leurs caractéristiques et comportements propres), et offrira des ressources exploitables par ces individus (certains individus pouvant devenir des ressources pour d'autres dans une interaction de prédation).

Cette simulation démarrera avec la naissance d'un individu ou d'une portée d'individus, et se clôturera avec le décès de l'individu ou celui du dernier individu de cette portée.

Description des étapes :

    1° générer une grille hexagonale de dimension choisie et un système de coordonnées cubiques (trois dimensions) associé. Cette grille sera composée de cases hexagonales pouvant à terme comporter un certain nombre d'attributs environnementaux (température, humidité, ...),
    2° générer de façon aléatoire des ressources sur la grille,
    3° créer un premier individu qui sera capable de se déplacer sur cette grille, d'abord de façon aléatoire,
    4° permettre à l'individu de se nourrir des ressources de son environnement en créant les comportements associés (recherche, acquisition, consommation, digestion...).
    5° si possible dans le temps imparti, permettre l'incubation, la naissance, la croissance, la reproduction des individus des différentes espèces...

-= Développement ultérieur au stage, dans l'idéal : =-

Dans un développement ultérieur, nous pourrions également envisager le recueil des données concernant l'évolution des individus considérés pendant la simulation (nombre de partenaires, durée de vie, ère d'apparition, etc.).

A l'issue de chaque simulation, un tableau récapitulatif comprenant les indicateurs clefs (données ci-dessus) permettra dans l'étape suivante de sélectionner (automatiquement dans un premier temps, par le "joueur" par la suite) un couple à l'origine de la prochaine génération.

Après sélection, les données seront transférées sur une base de données, et une nouvelle simulation démarrera avec la future génération sélectionnée.

Si la diversité offerte par l'application est suffisante, les espèces enregistrées dans la base de données pourront être réutilisées pour enrichir les simulations futures.

Description des étapes backend :

    1° réaliser si nécessaire les dernières finitions de la phase de simulation,
    2° concevoir un nombre de propriétés communes pour l'ensemble des espèces, en vue de pouvoir envoyer les valeurs des propriétés des différentes espèces à une base de données distante. Les propriétés transmises de cette façon devront pouvoir être récupérées et exploitées par l'application pour alimenter de nouveaux environnements dans la phase de simulation,
    3° implémenter un système de récupération des données après chaque simulation,
    4° créer la base de données distante de façon à recueillir ces données,
    5° réaliser le corps de l'API REST d'échange avec la base de données (api.js),
    6° réaliser les "controllers" permettant d'utiliser de façon automatique l'api lors du déroulement de l'application,
    7° définir la méthode de sélection automatique lors de la phase de reproduction sélective (tableau d'indicateurs trié par couples, puis par durée de vie = > définir l'ordre de priorité des indicateurs et sélectionner dans le tableau résultant le haut du panier),
    8° contrôler le bon fonctionnement de l'ensemble

Dans un dernier temps, il sera nécessaire de développer des interfaces pour transformer la simulation en mini-jeu. Différentes scènes (création, simulation, sélection) formeront les phases du jeu. Après la phase de création, les phases de simulation et de sélection s'alterneront. Ce cycle s'interrompra selon le bon vouloir du joueur, ou si l'espèce disparaît.

Description des interfaces homme-machine des différentes phases (frontend) :

    1° une interface de démarrage (création) permettrait de choisir la taille du monde généré, son ère, de créer sa propre espèce, voire de proposer un outil de personnalisation visuelle de son espèce...
    2° par ailleurs, la phase de simulation devrait permettre d'être mise en pause, en lecture, en lecture accélérée, de zoomer et dézoomer, et de pouvoir suivre chaque individu de la portée encore vivant, en passant automatiquement d'un individu décédé à un individu vivant, jusqu'à la fin de la simulation.
    3° entre chaque simulation, la phase de reproduction sélective devra présenter une interface permettant de visualiser le génome de chaque individu représentant la génération passée. Cette interface mettra en évidence les couples formés, et permettra d'en sélectionner un. Le couple sélectionné se reproduira en combinant ses génomes, combinaison à laquelle viendra éventuellement s'ajouter de façon aléatoire une ou plusieurs mutations chez un ou plusieurs descendants. La liste des descendants et leur génome sera alors présentée dans une nouvelle scène, et les mutations éventuelles seront mises en avant.

-= Notes d'utilisation : =-

Ce projet utilise NodeJS pour gérer ses dépendances. Celles-ci s'installent via la commande "npm install" après installation de NodeJS :

https://nodejs.org/en/

Ce projet est développé via Parcel, un framework de mise-en-forme de projet pour la production, et qui permet également de lancer un serveur en local via la commande "npm run start". Il utilise également le framework Phaser pour le développement de l'application en HTLM5.