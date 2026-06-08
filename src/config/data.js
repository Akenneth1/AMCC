// ── DATA.JS — Données statiques du site AMC ──────────────────
// Centralise tous les contenus hardcodés extraits du HTML.
// Pour modifier un événement, un artiste ou une image : éditer ici.

// ── ÉVÉNEMENTS ────────────────────────────────────────────────
export const evenements = [
  {
    id: 'festival-2026',
    annee: '2026', tag: 'avenir', featured: true,
    titre: 'Festival Culturel du Continent Africain — 4ème Édition',
    date: '11 & 12 JUILLET 2026 · SALLE DES FÊTES DE FIVES, LILLE',
    desc: 'Sous le thème « Afrique créative : héritage, innovation et rayonnement », ce grand rendez-vous rassemble stylistes, designers, artisans et artistes pour célébrer la fusion des cultures.',
    img: '/AMCC/galerie/Affiches/690205248_17964600612086373_2678800670389616223_n.jpg',
    lien: 'festival'
  },
  {
    id: 'concert-mars-2026',
    annee: '2026', tag: 'avenir',
    titre: 'Concert "Unis contre les discriminations"',
    date: '21 MARS 2026 · LE MANDÉ, LILLE',
    desc: 'Concert engagé autour de la lutte contre les discriminations. Une soirée musicale portant un message fort pour le vivre-ensemble.',
    img: '/AMCC/galerie/Affiches/690205248_17964600612086373_2678800670389616223_n.jpg'
  },
  {
    id: 'festival-dec-2025',
    annee: '2025', tag: '2025',
    titre: 'Festival Culturel du Continent Africain',
    date: '6 DÉC. 2025 · SALLE IMPÉRIAL, LILLE',
    desc: 'Une célébration des richesses culturelles du continent africain à travers la musique, la danse, l\'art et la gastronomie.',
    img: '/AMCC/galerie/Backstages/482205438_618966764334404_7375711029498316382_n.jpg'
  },
  {
    id: 'conference-nov-2025',
    annee: '2025', tag: '2025',
    titre: 'Conférence — Transition écologique et implication citoyenne',
    date: '23 NOV. 2025 · MAISON DES ASSOCIATIONS, LILLE',
    desc: 'Table ronde et débat autour des enjeux environnementaux et du rôle des citoyens dans la transition écologique.',
    img: '/AMCC/galerie/concerts/483563526_618806101017137_4543469384887453948_n.jpg'
  },
  {
    id: 'old-school-2025',
    annee: '2025', tag: '2025',
    titre: 'Old School Ambiance',
    date: '12 OCT. 2025 · JOST LILLE',
    desc: 'Une soirée nostalgique célébrant les classiques de la musique soul, funk et R&B dans une ambiance chaleureuse et festive.',
    img: '/AMCC/galerie/Affiches/686413257_17964597315086373_4139380664633702091_n.jpg'
  },
  {
    id: 'after-work-2025',
    annee: '2025', tag: '2025',
    titre: 'After Work Piano Bar',
    date: 'À PARTIR DU 26 JUIN 2025 · CENTRAL HOSTEL, LILLE',
    desc: 'Rendez-vous mensuel autour du piano dans un cadre intimiste et élégant pour terminer la semaine en beauté.',
    img: '/AMCC/galerie/defile/480712816_608440235387057_8403607310011299154_n.jpg'
  },
  {
    id: 'fete-musique-2025',
    annee: '2025', tag: '2025',
    titre: 'Fête de la Musique',
    date: '21 JUIN 2025 · FAVELA BAR, LILLE',
    desc: 'Célébration de la fête nationale de la musique en plein air avec des artistes locaux et régionaux de tous horizons.',
    img: '/AMCC/galerie/concerts/483563526_618806101017137_4543469384887453948_n.jpg'
  },
  {
    id: 'afro-business-2025',
    annee: '2025', tag: '2025',
    titre: 'Afro Business Event',
    date: '4 AVR. 2025 · TWENTY BUSINESS FLATS, LILLE',
    desc: 'Rencontre entre entrepreneurs et professionnels autour du networking, du partage d\'expériences et du développement économique.',
    img: '/AMCC/galerie/Affiches/686413257_17964597315086373_4139380664633702091_n.jpg'
  },
  {
    id: 'festival-2024',
    annee: '2024', tag: '2024',
    titre: 'Festival Culturel du Continent Africain',
    date: '29–30 NOV. 2024 · LILLE',
    desc: 'Première édition du festival culturel africain à Lille : deux jours de festivités, concerts, expositions et gastronomie.',
    img: '/AMCC/galerie/Affiches/658189683_17964597321086373_759194439260050119_n.jpg'
  },
  {
    id: 'defile-2023',
    annee: '2023', tag: '2023',
    titre: 'Exposition & Défilé Mode et Culture',
    date: '4 NOV. 2023 · PLACE SÉBASTOPOL, LILLE',
    desc: 'Premier grand événement d\'AMC mêlant exposition artistique et défilé de mode dans l\'un des lieux iconiques de Lille.',
    img: '/AMCC/galerie/defile/480712816_608440235387057_8403607310011299154_n.jpg'
  }
];

// ── IMAGES GALERIE ────────────────────────────────────────────
export const galerieImages = [
  // Backstages
  { src: '/AMCC/galerie/Backstages/482205438_618966764334404_7375711029498316382_n.jpg', cat: 'backstages', alt: 'Backstage 1' },
  { src: '/AMCC/galerie/Backstages/482220618_618966727667741_1688682726219756296_n.jpg', cat: 'backstages', alt: 'Backstage 2' },
  { src: '/AMCC/galerie/Backstages/483537993_618967074334373_6618017891576534424_n.jpg', cat: 'backstages', alt: 'Backstage 3' },
  { src: '/AMCC/galerie/Backstages/483551213_618967024334378_8024226022234423736_n.jpg', cat: 'backstages', alt: 'Backstage 4' },
  // Concerts
  { src: '/AMCC/galerie/concerts/482272315_618966761001071_98029328264799427_n.jpg',  cat: 'concerts', alt: 'Concert 1' },
  { src: '/AMCC/galerie/concerts/483563526_618806101017137_4543469384887453948_n.jpg', cat: 'concerts', alt: 'Concert 2' },
  { src: '/AMCC/galerie/concerts/483601817_618966741001073_5278090855474888729_n.jpg', cat: 'concerts', alt: 'Concert 3' },
  // Défilés
  { src: '/AMCC/galerie/defile/480712816_608440235387057_8403607310011299154_n.jpg',  cat: 'defiles', alt: 'Défilé 1' },
  { src: '/AMCC/galerie/defile/483349989_618966877667726_2241248726068483989_n.jpg',  cat: 'defiles', alt: 'Défilé 2' },
  { src: '/AMCC/galerie/defile/483355188_618966804334400_2090516695424882729_n.jpg',  cat: 'defiles', alt: 'Défilé 3' },
  { src: '/AMCC/galerie/defile/483357026_618967084334372_5700571063987618327_n.jpg',  cat: 'defiles', alt: 'Défilé 4' },
  { src: '/AMCC/galerie/defile/483358430_618967044334376_1026100490462477127_n.jpg',  cat: 'defiles', alt: 'Défilé 5' },
  { src: '/AMCC/galerie/defile/483360091_618966907667723_4823745665046697621_n.jpg',  cat: 'defiles', alt: 'Défilé 6' },
  { src: '/AMCC/galerie/defile/483361071_618966864334394_6779193753052041618_n.jpg',  cat: 'defiles', alt: 'Défilé 7' },
  { src: '/AMCC/galerie/defile/483363271_618967004334380_6753600701977649369_n.jpg',  cat: 'defiles', alt: 'Défilé 8' },
  { src: '/AMCC/galerie/defile/483364501_618966747667739_5684989046803649680_n.jpg',  cat: 'defiles', alt: 'Défilé 9' },
  { src: '/AMCC/galerie/defile/483365226_618966834334397_7049891636629386225_n.jpg',  cat: 'defiles', alt: 'Défilé 10' },
  { src: '/AMCC/galerie/defile/483366014_618967177667696_6698046105104225187_n.jpg',  cat: 'defiles', alt: 'Défilé 11' },
  { src: '/AMCC/galerie/defile/483368648_618966821001065_6223246756326395759_n.jpg',  cat: 'defiles', alt: 'Défilé 12' },
  { src: '/AMCC/galerie/defile/483488472_618967167667697_7471697935474561291_n.jpg',  cat: 'defiles', alt: 'Défilé 13' },
  { src: '/AMCC/galerie/defile/483488991_618966711001076_7346727947991655038_n.jpg',  cat: 'defiles', alt: 'Défilé 14' },
  { src: '/AMCC/galerie/defile/483504575_618966814334399_8330919529165964489_n.jpg',  cat: 'defiles', alt: 'Défilé 15' },
  { src: '/AMCC/galerie/defile/483507209_618966937667720_2061252704893513512_n.jpg',  cat: 'defiles', alt: 'Défilé 16' },
  { src: '/AMCC/galerie/defile/483511239_618966774334403_4423579860401880320_n.jpg',  cat: 'defiles', alt: 'Défilé 17' },
  { src: '/AMCC/galerie/defile/483525229_618966894334391_45712332276326500_n.jpg',    cat: 'defiles', alt: 'Défilé 18' },
  { src: '/AMCC/galerie/defile/483527748_618966971001050_7259697559630947894_n.jpg',  cat: 'defiles', alt: 'Défilé 19' },
  // Expositions
  { src: '/AMCC/galerie/expositions/482249128_618966844334396_1053770020662939835_n.jpg', cat: 'expositions', alt: 'Exposition 1' },
  { src: '/AMCC/galerie/expositions/482250275_618966884334392_6967045390271826367_n.jpg', cat: 'expositions', alt: 'Exposition 2' },
  { src: '/AMCC/galerie/expositions/482250827_618966717667742_2402897254331100407_n.jpg', cat: 'expositions', alt: 'Exposition 3' },
  { src: '/AMCC/galerie/expositions/482251698_618966781001069_8122961068557577304_n.jpg', cat: 'expositions', alt: 'Exposition 4' },
  { src: '/AMCC/galerie/expositions/482253717_618966954334385_7099923346892202962_n.jpg', cat: 'expositions', alt: 'Exposition 5' },
  { src: '/AMCC/galerie/expositions/482270303_618966787667735_8749587643515469700_n.jpg', cat: 'expositions', alt: 'Exposition 6' },
  { src: '/AMCC/galerie/expositions/482359920_618966921001055_6814623326155378899_n.jpg', cat: 'expositions', alt: 'Exposition 7' },
  { src: '/AMCC/galerie/expositions/483368915_618967161001031_290151601710801648_n.jpg',  cat: 'expositions', alt: 'Exposition 8' },
  { src: '/AMCC/galerie/expositions/483509439_618966797667734_3209274064644636270_n.jpg', cat: 'expositions', alt: 'Exposition 9' },
  // Public
  { src: '/AMCC/galerie/public/472700731_17911223979086373_7301952942377907097_n.jpg', cat: 'public', alt: 'Public AMC' }
];

// ── ARTISTES HOME (vitrines statiques) ───────────────────────
export const artistesHome = [
  {
    nom: 'Sophie Martin', discipline: 'Peintre · Arts visuels',
    bio: 'Artiste peintre spécialisée dans l\'art abstrait contemporain.',
    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=75'
  },
  {
    nom: 'Kévin Toussaint', discipline: 'Musicien · Électronique',
    bio: 'Producteur de musique électronique créant des expériences sonores immersives.',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=75'
  },
  {
    nom: 'Aïcha Diallo', discipline: 'Danseuse · Danse contemporaine',
    bio: 'Chorégraphe mêlant tradition et modernité dans ses créations innovantes.',
    img: 'https://images.unsplash.com/photo-1494790108755-2616b7f2b78b?w=400&q=75'
  }
];

// ── EXPOSANTS FESTIVAL 2026 ───────────────────────────────────
export const exposants = [
  { nom: 'Kameleon', cat: 'Artiste · Performance scénique', desc: 'Artiste camerounaise complète — danseuse, comédienne et chanteuse. MAK\'CAMÉLÉON est une personnalité aux multiples facettes, prête à enflammer la scène du festival.' },
  { nom: 'The Witcher', badge: 'Sponsor officiel', cat: 'Beauté & Bien-être · Sponsor officiel', desc: 'Maya est une entrepreneure passionnée par le bien-être, la beauté et les produits du quotidien. Elle proposera une gamme de produits de soin, parfums et entretien alliant qualité et efficacité.' },
  { nom: 'Kara & Compagnie', cat: 'Communication & Événementiel', desc: 'Agence créative en communication et événementiel spécialisée dans la Mode et les Cultures Urbaines. Elle accompagne artistes et entrepreneurs dans la valorisation de leur identité et de leurs services.' },
  { nom: 'Coin des Tresses', cat: 'Coiffure afro · Lille', desc: 'Ndella Amédée DIAGNE, coiffeuse spécialisée dans les tresses pour enfants, les coiffures protectrices express pour adultes et le resserrage de locks. Basée à Lille.' },
  { nom: 'A. Kate Design', cat: 'Mode africaine · Artisanat', desc: 'La marque de la styliste modéliste-artiste ANNA KATE, originaire du Togo. Créations de vêtements, accessoires de mode et poupées artisanales en tissus africains et perles traditionnelles.' },
  { nom: 'Leyane', cat: 'Bougies artisanales · Parfumerie', desc: 'Maison artisanale spécialisée dans les bougies, fondants parfumés et compositions olfactives faites à la main. Bouquets parfumés avec touches de wax, bougies de massage et dragées sur mesure.' },
  { nom: 'GF Ébène Beauty', cat: 'Beauté & Féminité', desc: 'Univers dédié à la beauté, à la féminité et à l\'élégance : Press On Nails réutilisables, Press On Lashes auto-adhésifs et prestations beauté sur place.' },
  { nom: 'PhilOburo', cat: 'Coworking · Vauban, Lille', desc: 'Espace de coworking situé dans une ancienne usine de torréfaction du quartier Vauban à Lille. Bureaux, salles de réunion et espaces créatifs pour entrepreneurs, indépendants et porteurs de projets.' },
  { nom: 'Nastar', cat: 'Finance & Patrimoine', desc: 'Conseillère en Gestion de Patrimoine indépendante. Au festival, elle animera un espace d\'échange sur l\'épargne, l\'investissement, le budget, l\'immobilier, la retraite et la transmission du patrimoine.' },
  { nom: 'Fidschi\'Invest', cat: 'Investissement & Finance', desc: 'Acteur du domaine de l\'investissement et de la finance, Fidschi\'Invest sera présent pour accompagner et informer le public sur les opportunités d\'investissement accessibles à tous.' },
  { nom: 'Afro News TV', cat: 'Média & Presse africaine', wide: true, desc: 'Média d\'informations couvrant l\'actualité africaine et de la diaspora. Afro News TV sera présent au festival pour assurer la couverture médiatique de l\'événement et diffuser les temps forts auprès de leur audience.' }
];
