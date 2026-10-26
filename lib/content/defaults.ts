import type {
  GlobalContent,
  RoomsContent,
  GalleryContent,
  HomeContent,
  ChambresPageContent,
  ContactContent,
} from "./schemas";

export const DEFAULT_GLOBAL_CONTENT: GlobalContent = {
  phoneNumber: "221781292929",
  phoneDisplay: "+221 78 129 29 29",
  whatsappNumber: "221781608275",
  whatsappDisplay: "+221 78 160 82 75",
  email: "hotelaicha.tamba@gmail.com",
  addressLine1: "Liberté Ouest, Lot 636",
  addressLine2: "Tambacounda 26000, Sénégal",
  mapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=H%C3%B4tel%20R%C3%A9sidence%20A%C3%AFcha%2C%20Libert%C3%A9%20Ouest%2C%20Lot%20636%2C%20Tambacounda%2C%20S%C3%A9n%C3%A9gal",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=H%C3%B4tel%20R%C3%A9sidence%20A%C3%AFcha%2C%20Libert%C3%A9%20Ouest%2C%20Lot%20636%2C%20Tambacounda%2C%20S%C3%A9n%C3%A9gal&output=embed",
  seoTitle: "Hôtel Résidence Aïcha — Tambacounda",
  seoDescription:
    "Chambres confortables, accueil attentionné et emplacement central à Tambacounda. Réservez directement sur WhatsApp.",
};

export const DEFAULT_ROOMS_CONTENT: RoomsContent = [
  {
    id: "standard",
    name: "Chambre Standard",
    capacity: "2 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Salle de bain privée", "Rangement et miroir"],
    description: "",
    image: "/images/chambre-standard.jpg",
    imageAlt: "Chambre Standard — lit double, tête de lit en bois sombre, literie blanche",
  },
  {
    id: "confort",
    name: "Chambre Confort",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Liseuses de chevet", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-confort.jpg",
    imageAlt: "Chambre Confort — tête de lit capitonnée gris-bleu, liseuses intégrées, tableau décoratif",
  },
  {
    id: "deluxe",
    name: "Chambre Deluxe",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Armoire avec miroir", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-deluxe.jpg",
    imageAlt: "Chambre Deluxe — ambiance chaleureuse, tons chauds, armoire miroir",
  },
  {
    id: "cosy",
    name: "Chambre Cosy",
    capacity: "2 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Coin salon", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-cosy.jpg",
    imageAlt: "Chambre Cosy — ambiance chaleureuse aux tons chauds, coin salon",
  },
  {
    id: "rosee",
    name: "Chambre Rosée",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Décoration soignée", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-rose.jpg",
    imageAlt: "Chambre Rosée — tons rosés, fauteuil doré, décoration soignée",
  },
  {
    id: "prestige",
    name: "Chambre Prestige",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Tête de lit capitonnée", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-deluxe-2.jpg",
    imageAlt: "Chambre Prestige — tête de lit capitonnée, ambiance chaleureuse",
  },
];

export const DEFAULT_GALLERY_CONTENT: GalleryContent = {
  heroEyebrow: "Galerie photos",
  heroTitle: "Un aperçu en images de l'hôtel",
  heroText:
    "Chambres, salles de bain, espaces communs et façade — toutes les photos ci-dessous sont celles du bâtiment, prises sur place à Tambacounda.",
  photos: [
    { id: "facade-principale", image: "/images/facade-principale.jpg", imageAlt: "Façade de l'Hôtel Résidence Aïcha", caption: "Façade de l'hôtel" },
    { id: "reception", image: "/images/reception.jpg", imageAlt: "Accueil et réception de l'Hôtel Résidence Aïcha", caption: "Accueil et réception" },
    { id: "facade-soir", image: "/images/facade-soir.jpg", imageAlt: "Façade de l'hôtel illuminée en soirée", caption: "Façade de l'hôtel — en soirée" },
    { id: "facade-jour", image: "/images/facade-jour.jpg", imageAlt: "Façade de l'hôtel en journée", caption: "Façade de l'hôtel — en journée" },
    { id: "chambre-standard", image: "/images/chambre-standard.jpg", imageAlt: "Chambre Standard avec salle de bain ouverte attenante", caption: "Chambre Standard — ambiance épurée" },
    { id: "chambre-confort", image: "/images/chambre-confort.jpg", imageAlt: "Chambre Confort — tête de lit capitonnée gris-bleu", caption: "Chambre Confort — tête de lit capitonnée" },
    { id: "chambre-deluxe", image: "/images/chambre-deluxe.jpg", imageAlt: "Chambre Deluxe aux tons chaleureux avec tableau décoratif", caption: "Chambre Deluxe — ambiance chaleureuse" },
    { id: "chambre-deluxe-2", image: "/images/chambre-deluxe-2.jpg", imageAlt: "Chambre Deluxe — autre vue", caption: "Chambre Deluxe — autre chambre" },
    { id: "chambre-rose", image: "/images/chambre-rose.jpg", imageAlt: "Chambre aux tons rosés avec fauteuil doré", caption: "Chambre — tons rosés et touches dorées" },
    { id: "chambre-jaune", image: "/images/chambre-jaune.jpg", imageAlt: "Chambre avec coin bureau et téléviseur", caption: "Chambre — coin bureau et TV" },
    { id: "chambre-corail", image: "/images/chambre-corail.jpg", imageAlt: "Chambre avec coin salon et rideaux cuivrés", caption: "Chambre — coin salon privatif" },
    { id: "chambre-cosy", image: "/images/chambre-cosy.jpg", imageAlt: "Chambre cosy aux tons chauds", caption: "Chambre — ambiance cosy" },
    { id: "chambre-placard", image: "/images/chambre-placard.jpg", imageAlt: "Rangement intégré avec penderie et bureau", caption: "Rangement intégré et coin bureau" },
    { id: "chambre-rangement", image: "/images/chambre-rangement.jpg", imageAlt: "Armoire intégrée avec mini-réfrigérateur", caption: "Armoire intégrée et mini-bar" },
    { id: "salle-bain-noire", image: "/images/salle-bain-noire.jpg", imageAlt: "Salle de bain avec vasque suspendue", caption: "Salle de bain — vasque suspendue" },
    { id: "salle-bain-marbre", image: "/images/salle-bain-marbre.jpg", imageAlt: "Salle de bain en marbre clair avec douche pluie", caption: "Salle de bain — finitions en marbre clair" },
    { id: "salle-bain-beige", image: "/images/salle-bain-beige.jpg", imageAlt: "Salle de bain aux tons beiges", caption: "Salle de bain — tons beiges" },
    { id: "salle-bain-pluie", image: "/images/salle-bain-pluie.jpg", imageAlt: "Salle de bain avec douche pluie et finitions en marbre", caption: "Salle de bain — douche à l'italienne" },
    { id: "salon-cuisine", image: "/images/salon-cuisine.jpg", imageAlt: "Espace salon avec canapés en cuir noir", caption: "Espace salon commun" },
    { id: "salon-cuisine-2", image: "/images/salon-cuisine-2.jpg", imageAlt: "Espace salon et cuisine commune", caption: "Espace salon et cuisine" },
    { id: "couloir", image: "/images/couloir.jpg", imageAlt: "Couloir et accès aux chambres", caption: "Couloir et accès aux chambres" },
  ],
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroEyebrow: "Bienvenue à Tambacounda",
  heroTitle: "Un séjour chaleureux, au cœur de la ville",
  heroText:
    "Chambres confortables, accueil attentionné et emplacement central — l'Hôtel Résidence Aïcha vous reçoit comme chez vous, pour une nuit ou un long séjour.",
  introEyebrow: "Notre hôtel",
  introTitle: "Un accueil sénégalais, pensé dans les moindres détails",
  introText:
    "Situé dans le quartier Liberté Ouest à Tambacounda, l'Hôtel Résidence Aïcha propose des chambres climatisées avec salle de bain privée, un immeuble sécurisé sous vidéosurveillance et une équipe joignable directement sur WhatsApp. Que vous soyez de passage pour affaires ou en famille, vous trouverez ici calme, propreté et un service attentif.",
  trustItems: [
    { icon: "mapPin", label: "Liberté Ouest, Tambacounda" },
    { icon: "camera", label: "Immeuble sous vidéosurveillance" },
    { icon: "sparkles", label: "Chambres climatisées et soignées" },
    { icon: "zap", label: "Réponse rapide sur WhatsApp" },
  ],
  reasons: [
    {
      icon: "mapPin",
      title: "Emplacement pratique",
      text: "Situé à Liberté Ouest, à proximité des axes principaux de Tambacounda — facile à trouver, facile à rejoindre.",
    },
    {
      icon: "camera",
      title: "Sécurité et sérénité",
      text: "Couloirs et accès sous vidéosurveillance, pour un séjour l'esprit tranquille, seul, en famille ou entre collègues.",
    },
    {
      icon: "zap",
      title: "Réservation simple",
      text: "Un message sur WhatsApp suffit : nous confirmons votre disponibilité et votre chambre rapidement.",
    },
  ],
  testimonials: [
    {
      quote:
        "Une expérience mémorable au cœur de Tambacounda. La sérénité du lieu et la gentillesse de l'équipe en font le point de chute idéal pour explorer la région, avec un confort optimal.",
      author: "Avis vérifié",
    },
    { quote: "Meilleur hôtel de Tambacounda avec un accueil chaleureux et agréable.", author: "Avis Google" },
    { quote: "Belle surprise. Bon accueil, chambre propre, bon petit déjeuner.", author: "Avis Google" },
  ],
};

export const DEFAULT_CHAMBRES_PAGE_CONTENT: ChambresPageContent = {
  heroEyebrow: "Nos chambres",
  heroTitle: "Un espace confortable pour chaque type de séjour",
  heroText:
    "Toutes nos chambres sont climatisées et disposent d'une salle de bain privée. Les tarifs vous sont confirmés directement sur WhatsApp selon la durée du séjour.",
  moreRooms: [
    { id: "coin-salon", image: "/images/chambre-corail.jpg", imageAlt: "Chambre avec coin salon privatif et rideaux cuivrés", caption: "Chambre avec coin salon privatif" },
    { id: "coin-bureau", image: "/images/chambre-jaune.jpg", imageAlt: "Chambre avec coin bureau et téléviseur", caption: "Chambre avec coin bureau" },
    { id: "espace-salon", image: "/images/salon-cuisine.jpg", imageAlt: "Espace salon commun avec canapés en cuir noir", caption: "Espace salon commun" },
    { id: "couloir", image: "/images/couloir.jpg", imageAlt: "Couloir et accès aux chambres", caption: "Couloir et accès aux chambres" },
    { id: "rangement", image: "/images/chambre-placard.jpg", imageAlt: "Rangement intégré avec penderie et bureau", caption: "Rangement intégré et coin bureau" },
    { id: "mini-bar", image: "/images/chambre-rangement.jpg", imageAlt: "Armoire intégrée avec mini-réfrigérateur", caption: "Armoire intégrée et mini-bar" },
  ],
  bathroomEyebrow: "Salles de bain privées",
  bathroomTitle: "Douche à l'italienne et finitions en marbre",
  bathroomImage1: "/images/salle-bain-noire.jpg",
  bathroomImage1Alt: "Salle de bain avec vasque suspendue et miroir",
  bathroomImage2: "/images/salle-bain-marbre.jpg",
  bathroomImage2Alt: "Salle de bain avec vasque, douche et finitions carrelées",
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  heroEyebrow: "Services, localisation & contact",
  heroTitle: "Tout ce qu'il faut savoir avant votre arrivée",
  heroText: "Nos équipements, notre adresse exacte et la marche à suivre pour réserver votre chambre à Tambacounda.",
  services: [
    { icon: "snowflake", title: "Climatisation", text: "Présente dans toutes les chambres." },
    { icon: "wifi", title: "Wi-Fi très haut débit", text: "Connexion rapide dans tout l'hôtel." },
    { icon: "coffee", title: "Petit déjeuner", text: "Servi chaque matin pour bien démarrer la journée." },
    { icon: "showerHead", title: "Salle de bain privée", text: "Douche à l'italienne, finitions en marbre dans chaque chambre." },
    { icon: "shieldCheck", title: "Gardien & sécurité", text: "Environnement sécurisé avec gardien et vidéosurveillance." },
    { icon: "sofa", title: "Espace salon & cuisine", text: "Un espace commun chaleureux, pour se détendre entre deux visites." },
    { icon: "heartHandshake", title: "Accueil chaleureux", text: "La chaleur de l'hospitalité sénégalaise, à chaque étape du séjour." },
    { icon: "messageCircle", title: "Contact direct WhatsApp", text: "Une question, une demande spéciale ? Nous répondons rapidement." },
    { icon: "mapPin", title: "Emplacement central", text: "Quartier Liberté Ouest, facile d'accès à Tambacounda." },
  ],
  steps: [
    { icon: "messageCircle", title: "Écrivez-nous", text: "Contactez-nous sur WhatsApp avec vos dates et le type de chambre souhaité." },
    { icon: "calendarCheck", title: "Confirmez", text: "Nous vérifions la disponibilité et confirmons votre réservation avec vous." },
    { icon: "keyRound", title: "Profitez du séjour", text: "Arrivez à l'adresse indiquée, votre chambre vous attend." },
  ],
};
