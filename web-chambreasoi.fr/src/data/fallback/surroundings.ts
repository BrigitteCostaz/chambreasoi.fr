import type { SurroundingsPageContent } from "@components/surroundings-page/types";

export const reservationLabels = {
  obligatoire: "Réservation obligatoire",
  conseillee: "Réservation conseillée",
} as const;

export const fallbackContent: SurroundingsPageContent = {
  heroEyebrow: "Bons plans",
  heroTitle: "Découvrir Challes-les-Eaux et ses environs",
  proximityStatement: "Le centre de Challes-les-Eaux est tout près de votre chambre",
  proximityIntro: [
    "Vous y trouverez tous les services utiles au quotidien : ",
    {
      type: "list",
      items: [
        [{ text: "mini market", marks: ["strong"] }],
        [{ text: "boulangerie", marks: ["strong"] }],
        [{ text: "pharmacie", marks: ["strong"] }],
        [{ text: "laverie", marks: ["strong"] }],
        [{ text: "maison de la presse", marks: ["strong"] }],
      ],
    },
  ],
  proximityReassurance: "",
  editorialLead:
    "Ancienne station thermale, Challes-les-Eaux a conservé le charme et la tranquillité, notamment au détour des parcs, des plans d'eau et des chemins de promenade.",
  images: [
    {
      src: "https://static.photos/900x1200/1",
      alt: "Vue placeholder évoquant une promenade calme autour de Challes-les-Eaux",
      caption: "Promenades, parcs et plans d'eau à proximité de la chambre.",
    },
    {
      src: "https://static.photos/1200x900/2",
      alt: "Vue placeholder évoquant les paysages de Savoie autour de Challes-les-Eaux",
      caption: "Quelques idées faciles pour découvrir les environs selon votre temps disponible.",
    },
    {
      src: "https://static.photos/900x1200/1",
      alt: "Vue placeholder évoquant une promenade calme autour de Challes-les-Eaux",
      caption: "Promenades, parcs et plans d'eau à proximité de la chambre.",
    },
  ],
  accordions: [
    {
      title: "Où faire ses courses à deux pas ? (5 à 10' à pied)",
      description:
        "Les commerces du quotidien sont proches de la chambre, pratiques pour un petit déjeuner, un repas léger ou une course de dernière minute.",
      items: [
        { title: "Mini market Vival", body: ["Une adresse utile pour les achats au quotidien."] },
        {
          title: "Boucherie du Mont Saint Michel",
          body: [
            "Boucherie-traiteur avec charcuterie de qualité, plats cuisinés à réchauffer, pain et fromages de Savoie.",
          ],
        },
        {
          title: "Boulangerie Le Relais du Pain",
          body: [
            "Une boulangerie toute proche pour le pain, les viennoiseries ou une pause rapide.",
          ],
        },
        {
          title: "Pâtissier-chocolatier Cédric Pernot",
          body: ["Une adresse réputée localement pour une touche sucrée pendant votre séjour."],
          url: "https://cedric-pernot.fr",
        },
        {
          title: "Marché local du vendredi",
          body: ["Le marché se tient dans le centre du bourg le vendredi."],
        },
      ],
    },
    {
      title: "Où manger à Challes et aux alentours ?",
      description:
        "Quelques options pour déjeuner, dîner, commander à emporter ou découvrir une table plus champêtre.",
      items: [
        {
          title: "Brasseries et cafés",
          body: [
            "Plusieurs brasseries et cafés sont ouverts en journée et en soirée dans le centre.",
          ],
        },
        {
          title: "Au Bistro de Julie",
          body: ["Une adresse de centre-bourg pour un repas à Challes-les-Eaux."],
          url: "https://au-bistro-de-julie.eatbu.com",
          reservationRequired: "conseillee",
        },
        {
          title: "Le Nok",
          body: ["Restaurant à Challes-les-Eaux, avec réservation possible en ligne."],
          url: "https://nok-challes-les-eaux.eatbu.com",
          reservationRequired: "conseillee",
        },
        {
          title: "La Scuderia",
          body: ["Pizzeria pour manger sur place ou commander à emporter."],
          url: "https://la-scuderia.fr",
          reservationRequired: "conseillee",
        },
        {
          title: "Sushiko",
          body: ["Cuisine japonaise à emporter, sur commande."],
          url: "https://sushiko73.fr",
          reservationRequired: "conseillee",
        },
        {
          title: "Restaurant d'application du lycée hôtelier",
          body: [
            "Ouvert certains jours de la semaine et fermé pendant les vacances scolaires. Les réservations se font via le site du lycée.",
          ],
          url: "https://lyceehoteliercle.fr/restaurants-dapplication-2/",
          reservationRequired: "obligatoire",
        },
        {
          title: "La Ramée",
          body: [
            "À 3 km, dans un décor champêtre, cette ferme-auberge propose des spécialités savoyardes.",
          ],
          url: "https://restaurant-lafermederamee.com",
          reservationRequired: "obligatoire",
        },
      ],
    },
    {
      title: "Que faire dans les environs selon le temps disponible ?",
      description:
        "Des idées simples à choisir selon votre timing, de la petite balade à la découverte plus large des massifs voisins.",
      items: [
        {
          title: "1 à 2 heures",
          category: "Découverte à pied",
          body: [
            {
              type: "list",
              items: [
                "Faire le tour du plan d'eau de Challes, avec son parcours santé et son plateau sportif. Depuis le petit pont de bois, vous pourrez observer les avions et planeurs de l'aérodrome.",
                "Suivre le sentier au pied du Mont Saint Michel en passant par l'arboretum du château des Comtes de Challes et le parc du château de Triviers.",
                "Emprunter le parcours d'orientation patrimonial : facile, accessible en toutes saisons, 3,5 km et 13 balises pour découvrir l'environnement local.",
              ],
            },
          ],
          note: "Itinéraire et fiche descriptive disponibles sur place.",
        },
        {
          title: "2 à 3 heures avec un moyen de transport",
          category: "Petite escapade",
          body: [
            "Rejoindre le lac Saint André, à 8 km, avec une belle vue sur le massif de Belledonne.",
            "Passer par Myans, son église et sa crypte dédiée à la Vierge Noire, puis traverser le vignoble d'Apremont avant de descendre vers ce lac au pied du Mont Granier.",
            "Comptez environ une demi-heure pour en faire le tour, davantage si vous prenez le temps d'une halte sur les pontons de pêche.",
          ],
        },
        {
          title: "Séjour plus long",
          category: "Balades et randonnées",
          body: [
            "Accès facile aux stations de moyenne altitude autour de Challes-les-Eaux,en toutes saisons.",
            "Les massifs de la Chartreuse et des Bauges sont à quelques kilomètres de la chambre et offrent un large choix de balades et randonnées entre vignoble, forêts et alpages.",
            "Pour vos séjours touristiques, nous tenons à votre disposition des fiches explicatives, des cartes et des guides.",
          ],
        },
        {
          title: "Navette Synchrobus",
          category: "Accès aux stations",
          body: [
            "Tous les jours pendant les vacances scolaires et estivales, il est possible de prendre une navette Synchrobus vers la station de la Féclaz - Grand Revard. On vous explique tout à la réservation.",
          ],
        },
        {
          title: "À faire en ville",
          category: "Sur place",
          body: [
            "Casino, cinéma et médiathèque complètent les possibilités de sortie à Challes-les-Eaux, selon vos envies et la saison.",
          ],
        },
      ],
    },
  ],
};
