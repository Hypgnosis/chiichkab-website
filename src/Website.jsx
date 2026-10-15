import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, PresentationControls } from '@react-three/drei';
import { DetailedDefenseBee } from './App';
import Chart from 'chart.js/auto';
import {
  Hexagon, Droplet, ShieldPlus, Sparkles, Globe2,
  Award, Leaf, ChevronRight, Menu, X, Image as ImageIcon,
  Heart, Send, Quote
} from 'lucide-react';

// Simplified Placemat Component using local generated images
const StaticPlacemat = ({ imageSrc, label, subLabel }) => {
  return (
    <div className="relative bg-[#fafaf9] h-80 rounded-2xl border border-[#022c22]/10 overflow-hidden group shadow-md transition-all duration-300 hover:shadow-xl">
      <img
        src={imageSrc}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="absolute inset-0 hidden items-center justify-center opacity-25 bg-[#fafaf9]">
        <div className="text-center flex flex-col items-center">
          <ImageIcon className="w-12 h-12 mb-2 text-[#022c22]" />
          <span className="text-xs font-mono text-[#022c22]">Missing: {imageSrc}</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/90 via-[#022c22]/30 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <p className="text-[0.65rem] tracking-[0.2em] text-[#f59e0b] uppercase font-mono mb-1 font-semibold">{subLabel}</p>
        <h4 className="text-lg font-serif text-white font-bold leading-tight">{label}</h4>
      </div>
    </div>
  );
};

const sanctuaryImages = [
  { path: "/website images/Melipona guardian.jpeg", category: "bees", id: "guard" },
  { path: "/website images/Andres y Don Luis.jpeg", category: "life", id: "stewardship" },
  { path: "/website images/Jobones en Casita de Guano.jpeg", category: "hives", id: "casita" },
  { path: "/website images/jobon home setup.jpeg", category: "hives", id: "setup" },
  { path: "/website images/Inside Jobon.jpeg", category: "bees", id: "inside1" },
  { path: "/website images/Inside Jobon2.jpeg", category: "bees", id: "inside2" },
  { path: "/website images/Jobon home.jpeg", category: "hives", id: "home1" },
  { path: "/website images/Jobon Home 2.jpeg", category: "hives", id: "home2" },
  { path: "/website images/Andres con Jobones.jpeg", category: "life", id: "andres1" },
  { path: "/website images/Andres con Jobones 2.jpeg", category: "life", id: "andres2" },
  { path: "/website images/Andres y viejito.jpeg", category: "life", id: "andres3" },
  { path: "/website images/Guardiana del Jobon.jpeg", category: "bees", id: "guardiana1" },
  { path: "/website images/Guardiana con compañia.jpeg", category: "bees", id: "guardiana2" },
  { path: "/website images/Guardiana con compañia 2.jpeg", category: "bees", id: "guardiana3" },
  { path: "/website images/Guardians.jpeg", category: "bees", id: "guardians" },
  { path: "/website images/Queen Bee.jpeg", category: "bees", id: "queen1" },
  { path: "/website images/Queen Bee2.jpeg", category: "bees", id: "queen2" },
  { path: "/website images/The inside of a Jobon.jpeg", category: "bees", id: "inside3" }
];

const groundsImages = [
  { path: "/website images/IMG_20260115_075958.jpg", id: "ground1" },
  { path: "/website images/IMG_20260131_071140.jpg", id: "ground2" },
  { path: "/website images/IMG_20260131_071334.jpg", id: "ground3" },
  { path: "/website images/IMG_20260131_071715.jpg", id: "ground4" },
  { path: "/website images/IMG_20260211_134942.jpg", id: "ground5" },
  { path: "/website images/IMG_20260325_164608.jpg", id: "ground6" }
];

// wrapLabel helper (16 character limit)
function wrapLabel(label, maxChars = 16) {
  if (Array.isArray(label)) return label;
  const words = label.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

const tooltipConfig = {
  callbacks: {
    title: function(tooltipItems) {
      const item = tooltipItems[0];
      let label = item.chart.data.labels[item.dataIndex];
      if (Array.isArray(label)) {
        return label.join(' ');
      } else {
        return label;
      }
    }
  }
};

const ChartComponent = ({ type, data, options, height = "300px" }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        maintainAspectRatio: false,
        plugins: {
          ...options?.plugins,
          tooltip: tooltipConfig
        },
        ...options
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [type, data, options]);

  return (
    <div className="w-full relative" style={{ height }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

const locales = {
  EN: {
    nav: ['Mission', 'Biodiversity', 'Sanctuary Life', 'Mayan Wisdom', 'Healing Protocols', 'About Us', 'Donate'],
    heroTag: "GUARDIANS OF THE SACRED FLIGHT",
    heroTitle: "Guardians of the Sacred Flight",
    heroSubtitle: "Rooted in Hacienda Villa Luna, Mocochá, Yucatán.",
    heroSub: "Chiich Kaab is our Melipona bee preservation project (Xunán Kab), a living sanctuary established within the grounds of Hacienda Villa Luna in Mocochá, Yucatán. Under the ancestral guidance of Father Luis Quintal, we transform this space into a haven for wisdom and biodiversity.",
    heroCTA: "Support the Sanctuary",
    originsTitle: "The Xunán Kab Stewardship Pledge",
    originsText1: "Hacienda Villa Luna is the physical home of Chiich Kaab. In this space in Mocochá, we maintain the optimal conditions to protect the sacred bee. Our strategic partnership with Father Luis Quintal (U Náajil Yuum K'iin, Maní) integrates ancestral stingless beekeeping techniques directly into our infrastructure, ensuring every jobón and colony thrives in a protected environment.",
    originsText2: "Today, deforestation, industrial agriculture, and climate change threaten the survival of these sacred guardians. Through this alliance, we bridge the wisdom of Maní with our sanctuary facilities in Mocochá, ensuring their sacred flight continues and their biocultural legacy is preserved.",
    placemat1Label: "Traditional Jobón Hive",
    placemat1Sub: "U Náajil Yuum K'iin - Hollow-log hives carved from cedar or native Guano palm. Hacienda Villa Luna adopts this traditional setup in Mocochá.",
    placemat2Label: "Sacred Meliponary",
    placemat2Sub: "U Náajil Yuum K'iin - A view inside the Maní sanctuary housing rescued wild colonies. Chiich Kaab replicates this environment in Mocochá.",
    placemat3Label: "Xunán Kab Guard",
    placemat3Sub: "U Náajil Yuum K'iin - A Melipona beecheii worker guarding the trumpet-shaped cerumen entrance.",
    manifestoTitle: "The Legacy of the Sacred Bee: Beyond Honey",
    manifestoSub: "At Hacienda Villa Luna (Mocochá, Yucatán), our project is not a simple point of sale, but a living sanctuary dedicated to the memory of our roots. Meliponiculture is not just a trade; it is an act of cultural preservation and love for biodiversity.",
    manifestoSec1Title: "An Ancestral Bond with Healing",
    manifestoSec1Text: "Since time immemorial, the melipona bee is considered a sacred creature by the Mayan civilization. Our ancestors not only appreciate its honey as a sweet gift, but as an elixir of life capable of curing and restoring well-being. By reclaiming this knowledge, we honor the history of these tiny guardians, sharing with the world why, for centuries, their work is the fundamental pillar of our traditional medicine and natural balance.",
    manifestoSec2Title: "Our Commitment: Conservation and Ethics",
    manifestoSec2Text: "Today, we face an urgent reality: the melipona bee needs allies to avoid disappearing. Our goal is clear and profound: we prevent this species from falling into danger of extinction, creating at Hacienda Villa Luna a protected ecosystem where they thrive and reproduce naturally.",
    manifestoSec2SubText: "To achieve this, we operate under an altruistic and conscious model:",
    manifestoSec2Points: [
      { label: "Transformation with Purpose", text: "Every product you acquire—from our ophthalmic drops to pure pollen and high-quality honey—is a direct link in our chain of care." },
      { label: "Total Reinvestment", text: "Part of the resources obtained from our sales goes entirely to the maintenance and expansion of the meliponary." },
      { label: "Quality of Life", text: "Our commitment is to guarantee that every little bee has an adequate space, a pleasant and stress-free environment, allowing them to complete their life cycle in harmony with nature." }
    ],
    manifestoSec3Title: "Your Participation is Vital",
    manifestoSec3Text: "By choosing our products, you are not just buying honey; you become a guardian of a culture and protector of an essential species. We invite you to be part of this journey: to know the history, value ancestral medicine, and help us ensure that the buzz of the melipona remains part of the soul of our land for generations to come.",
    benefitsTitle: "Meliponini Biodiversity Matrix",
    benefits: [
      { title: "Melipona beecheii", subtitle: "Xunán Kab", desc: "The royal stingless bee of the Maya, nesting inside hollow jobón logs and foraging on deep forest canopy wildflowers. (Endangered)" },
      { title: "Trigona fulviventris", subtitle: "Muul Kab", desc: "Ground-nesting stingless bees that construct complex earthen entrances, vital for pollinating low-lying medicinal forest herbs. (Vulnerable)" },
      { title: "Scaptotrigona pectoralis", subtitle: "K'an Sak", desc: "Highly defensive but stingless, known for their elaborate trumpet-shaped architectural hive entrances. (Stable)" },
      { title: "Plebeia", subtitle: "Yax Kab", desc: "Hyper-localized, tiny stingless bees that require extreme environmental stability and absolute sensitivity to handle. (Rare)" }
    ],
    metricsTitle: "Scientific Metrics & Demographics",
    metricsSub: "Empirical data compiled in collaboration with U Yits Ka'an School of Ecological Agriculture, validating the bio-cultural urgency and nutritional superiority of the Xunán Kab.",
    chart1Title: "The Preservation Crisis",
    chart1Text1: "The Yucatán Peninsula is a global powerhouse for honey production, but this volume is driven almost entirely by introduced European species. The native stingless bee, revered by the Maya for centuries, faces a critical shortage of traditional stewards.",
    chart1Text2: "While over 14,000 keepers manage the European Apis mellifera for mass export, only an estimated 700 traditional meliponiculturists remain to protect the native Xunán Kab, stewarded by Master Meliponiculturist Father Luis Quintal of U Náajil Yuum K'iin (Maní).",
    chart1Quote: '"Quantity is the pursuit of men who do not understand medicine. Their honey is not just sugar... it is the blood of the canopy."',
    chart1Citation: "Father Luis Quintal, U Náajil Yuum K'iin (Maní)",
    chart1DatasetLabel: "Number of Keepers in Yucatán",
    chart1Labels: ['Apis mellifera (European)', 'Melipona beecheii (Native)'],
    chart2Title: "The 61-Day Rhythm & Demographics",
    chart2Text1: "The Melipona hive operates on a precise, biologically mirrored timeline. Unlike modern box hives, traditional hollowed Cedar or Guano logs (Jobones) allow the bees to sculpt their natural, spiritual architecture.",
    chart2Gestation: "Gestation",
    chart2Worker: "Worker Life",
    chart2Queen: "Queen Life",
    chart2Text2: "A healthy jobón houses a delicately balanced population. The hive is defended by 32 specialized guard bees featuring deep blue compound eyes and three primitive light-sensing ocelli to navigate the absolute darkness of the log.",
    chart2Labels: ['Active Worker Bees', 'Developing Pupae', 'Guard Sentinels'],
    chart3Title: "Nutritional Matrix of Melipona Pollen",
    chart3Sub: "Data validated by the U Yits Ka'an School of Ecological Agriculture reveals that the pollen collected by stingless bees drastically outperforms standard animal and plant proteins in essential amino acids, proving its status as a cellular restorer and medicinal food.",
    chart3Labels: ['Arginine', 'Leucine', 'Methionine / Cysteine', 'Glutamine', 'Asparagine'],
    chart3Dataset1Label: 'Dry Melipona Pollen',
    chart3Dataset2Label: 'Egg White',
    chart3Dataset3Label: 'Whey Protein',
    arginineTitle: "The Arginine Champion",
    arginineText: "Dry Melipona pollen contains 13.3g of Arginine per 100g of protein, more than double that of an egg white (5.9g) and nearly five times that of whey protein (2.9g).",
    methionineTitle: "The Methionine Marvel",
    methionineText: "Providing 7.8g of Methionine/Cysteine, wet pollen far outpaces black beans (1.9g) and whey (3.1g), making it a superb natural cellular restorer.",
    galleryTitle: "Sanctuary Life",
    gallerySub: "A visual window detailing our research visit to U Náajil Yuum K'iin (Maní, Yucatán), mapping the traditional beekeeping infrastructure we replicate for the Chiich Kaab sanctuary at Hacienda Villa Luna.",
    filterAll: "All Images",
    filterBees: "Bees (Xunán Kab)",
    filterHives: "Traditional Hives",
    filterLife: "Sanctuary Life",
    wisdomTitle: "Mayan Wisdom & Testimonials",
    wisdomAhMuzenkab: "At Chiich Kaab, we honor the flight of the Xunán Kab not as a mere biological act, but as a sacred cycle governed by Ah Muzenkab. As the Mayan god of bees and honey, he is the guardian of the sacred flight and the protector of the life forces within the jobón. We serve as earthly stewards of this wisdom at Hacienda Villa Luna (Mocochá), guided by the experience and vision of Father Luis Quintal from U Náajil Yuum K'iin (Maní, Yucatán).",
    wisdomSections: [
      { title: "Father Luis Quintal", subtitle: "Master Meliponiculturist", content: "Quantity is the pursuit of men who do not understand medicine. Their honey is not just sugar... it is the blood of the canopy." },
      { title: "Dr. Sofia Mendez", subtitle: "Ecologist", content: "The Melipona beecheii is a keystone species. Without their specialized pollination, the high canopy medicinal trees of the Yucatán would cease to reproduce." },
      { title: "Doña Maria", subtitle: "X'men (Mayan Healer)", content: "The honey from the jobón is not food; it is medicine. It carries the spirit of the forest flora, used for generations to heal the eyes and the spirit." },
      { title: "Restoration Team", subtitle: "Hacienda Villa Luna (Mocochá)", content: "By reforesting native nectar-rich trees like the Ramón, Chacá, and Dzidzilché, we rebuild the ancient biological corridors for the Xunán Kab." }
    ],
    healingTitle: "Medicinal Healing Protocols",
    healingSub: "The clinical applications of Xunán Kab honey, validated by traditional Mayan medicine and contemporary science.",
    protocols: [
      { title: "Powerful Antibacterial Action", subtitle: "Conjunctivitis & Ulcers", text: "Melipona honey eliminates bacteria by generating natural hydrogen peroxide and utilizing high levels of flavonoids to break down bacterial cell walls. Studies show it is as effective as Gentamicin for shortening bacterial conjunctivitis." },
      { title: "Treatment for Severe Dry Eyes", subtitle: "Keratoconjunctivitis", text: "Its hygroscopic nature actively draws in moisture while drastically reducing pro-inflammatory markers that cause redness and burning." },
      { title: "Traditional Claims", subtitle: "Cataracts & Pterygium", text: "Rich antioxidant content helps delay the progression of lens opacification. Note: Science has not proven it can completely reverse fully formed cataracts in humans." },
      { title: "Application - Expect the Burn", subtitle: "Sensory Response", text: "Tilt your head back, pull down the lower eyelid, and apply 1 to 2 drops. Even when diluted, honey causes a sharp, intense stinging sensation lasting 30 to 60 seconds. This causes heavy tearing, which is a normal, necessary reaction to flush the eye surface." }
    ],
    aboutTitle: "About Us",
    aboutSub: "Meet the team behind the preservation sanctuary at Hacienda Villa Luna.",
    aboutIntro: "Welcome to Chiich Kaab, a meliponary sanctuary located at Hacienda Villa Luna. We are a group of passionate individuals, united by the enthusiasm of embarking on a project that transcends commercial interests to become a legacy of love, healing, and preservation of our ancestral culture.",
    team: [
      {
        name: "Dra. Mya Parra Perera",
        role: "Co-Founder & Health Director",
        image: "/website images/Dra. Mya Parra.jpeg",
        bio: "A medical doctor dedicated to elder care, an artist, painter, and music lover. Mya leads this adventure with a vision that unites health, art, and nature. Her commitment is not only to the creation of a project, but to opening a gathering space for those wishing to explore the richness of the Melipona bees and honor the Mayan heritage."
      },
      {
        name: "Andrés Fernando Navarrete Parra",
        role: "Co-Founder & Cultural Director",
        image: "/website images/Andres Navarrete.jpeg",
        bio: "Musician, composer, and spiritual guide. Andrés is a tireless student of Mayan culture, its history, ancestors, and worldview. His role is to transmit the spiritual depth of this legacy. He teaches us that the food produced by the Meliponas is a gift that is not only healing for the body, but a spiritual elixir that can heal and nourish homes worldwide."
      },
      {
        name: "Luis Fernando Martínez Chávez",
        role: "Co-Founder & Marketing Director",
        image: "/website images/Luis Martinez.jpeg",
        bio: "An entrepreneur specializing in marketing and public relations. Luis is the visual architect of our projection. He transforms our essence into an aesthetic experience, taking care of every detail of Chiich Kaab's image so that our mission reaches as many hearts as possible through a beautiful digital presence consistent with our values."
      }
    ],
    groundsTitle: "Sanctuary Grounds at Hacienda Villa Luna",
    groundsSub: "Visual glimpses of our physical location in Mocochá, where we house the sacred Xunán Kab.",
    donateTitle: "Become a Guardian of the Xunán Kab",
    donateText: "By backing the Chiich Kaab conservation sanctuary at Hacienda Villa Luna (Mocochá, Yucatán), in active collaboration with Don Luis's ancestral sanctuary in Maní, you directly fund the rescue of damaged wild hives, the reforestation of native medicinal trees, and the preservation of sacred Mayan herbalism.",
    donateCTA: "Donate to the Sanctuary",
    donateSim: "Launch the Simulator",
    contactTitle: "Connect with the Sanctuary",
    contactSub: "Reach out to join our volunteer network, schedule educational visits to our sanctuary in Mocochá, or learn more about biocultural conservation.",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    messagePlaceholder: "Message",
    sendBtn: "Send Message",
    sendBtnSuccess: "Message Sent",
    footerDesc: "Dedicated to the preservation of the Melipona beecheii and Mayan biocultural heritage at Hacienda Villa Luna (Mocochá, Yucatán).",
    footerLocation: "Hacienda Villa Luna — Mocochá, Yucatán, Mexico",
    footerCopyright: "© 2026 Chiich Kaab. All rights reserved.",
    gallery: {
      guard: { title: "The Sentinel Guard", description: "U Náajil Yuum K'iin - A single Xunán Kab worker defending the narrow entrance of a traditional Cedar Jobón hive." },
      stewardship: { title: "Generations of Stewardship", description: "U Náajil Yuum K'iin - Andrés Navarrete and Father Luis Quintal, a master meliponiculturist with over 30 years of experience, inspecting the open-air structures." },
      casita: { title: "The Ancestral Meliponario", description: "U Náajil Yuum K'iin - Traditional log hives safely arranged under the protective shade of the Guano palm thatched roof." },
      setup: { title: "The Guano Log Hive", description: "U Náajil Yuum K'iin - A traditional jobón installation showing the hollow-log structure suspended for pest control." },
      inside1: { title: "Cerumen Storage Pots", description: "U Náajil Yuum K'iin - A macro look inside the jobón log showing the complex organic structure of cerumen pots containing honey and pollen." },
      inside2: { title: "Brood Combs and Larvae", description: "U Náajil Yuum K'iin - Horizontal combs where the queen deposits her eggs, surrounded by protective food storage chambers." },
      home1: { title: "Traditional Guano Shelters", description: "U Náajil Yuum K'iin - Hollow tree log hives arranged horizontally to mimic natural forest nesting sites." },
      home2: { title: "Sanctuary Nesting Site", description: "U Náajil Yuum K'iin - An aligned row of jobón logs providing stable temperature and humidity levels for breeding colonies." },
      andres1: { title: "Meliponiculture Science", description: "U Náajil Yuum K'iin - Andrés inspecting wild hive health and monitoring foraging behavior." },
      andres2: { title: "Sanctuary Caretaking", description: "U Náajil Yuum K'iin - Carefully checking the exterior seal of the log hives to ensure total protection against predators." },
      andres3: { title: "Preserving Ancestral Knowledge", description: "U Náajil Yuum K'iin - Passing down the ancient oral traditions and specialized techniques of Mayan stingless beekeeping." },
      guardiana1: { title: "The Gatekeeper", description: "U Náajil Yuum K'iin - A guard bee stationed at the narrow entrance hole, preventing entry of foreign insects." },
      guardiana2: { title: "Stewardship at the Gate", description: "U Náajil Yuum K'iin - Bees gathering at the entrance to regulate the hive's internal ventilation and coordinate foraging flights." },
      guardiana3: { title: "Preparing for Foraging", description: "U Náajil Yuum K'iin - Xunán Kab workers warming up their flight muscles before leaving for canopy wildflowers." },
      guardians: { title: "Sanctuary Protectors", description: "U Náajil Yuum K'iin - The gentle stingless Melipona beecheii bees that have sustained Yucatecan ecosystems for over 3,000 years." },
      queen1: { title: "The Queen Bee", description: "U Náajil Yuum K'iin - The Melipona queen bee surrounded by worker attendants within the dark hollow log hive." },
      queen2: { title: "The Mother Queen (Matriarch)", description: "U Náajil Yuum K'iin - The queen of the hive, pregnant for 6 years, with vestigial wings and too large to exit the log." },
      inside3: { title: "Interior Architecture", description: "U Náajil Yuum K'iin - A view inside the jobón log detailing the cerumen food pots and the brood combs where the queen lays her eggs." }
    },
    grounds: {
      ground1: "Lush grounds surrounding the sanctuary structure in Mocochá.",
      ground2: "Historic hacienda walls and paths leading to the meliponario.",
      ground3: "Restored stone structures housing traditional jobón logs.",
      ground4: "Protected canopy gardens where Xunán Kab bees forage for wildflowers.",
      ground5: "Meliponario shelter nestled under native trees at Hacienda Villa Luna.",
      ground6: "Sunset over the peaceful gardens of our preservation sanctuary."
    }
  },
  ES: {
    nav: ['Misión', 'Biodiversidad', 'Vida del Santuario', 'Sabiduría Maya', 'Protocolos de Sanación', 'Nosotros', 'Donar'],
    heroTag: "GUARDIANES DEL VUELO SAGRADO",
    heroTitle: "Guardianes del Vuelo Sagrado",
    heroSubtitle: "Enraizado en la Hacienda Villa Luna, Mocochá, Yucatán.",
    heroSub: "Chiich Kaab es nuestro proyecto de preservación de la abeja Melipona (Xunán Kab), un santuario vivo establecido en los terrenos de la Hacienda Villa Luna en Mocochá, Yucatán. Bajo la guía ancestral de Don Luis Quintal, transformamos este espacio en un refugio para la sabiduría y la biodiversidad.",
    heroCTA: "Apoyar al Santuario",
    originsTitle: "El Compromiso de Custodia de Xunán Kab",
    originsText1: "Hacienda Villa Luna es el hogar físico de Chiich Kaab. En este espacio en Mocochá, mantenemos las condiciones óptimas para proteger a la abeja sagrada. Nuestra alianza estratégica con Don Luis Quintal (U Náajil Yuum K'iin, Maní) integra técnicas ancestrales de meliponicultura directamente en nuestra infraestructura, garantizando que cada jobón y colonia prospere en un entorno protegido.",
    originsText2: "Hoy en día, la deforestación, la agricultura industrial y el cambio climático amenazan la supervivencia de estos guardianes sagrados. A través de esta alianza, conectamos la sabiduría de Maní con nuestras instalaciones del santuario en Mocochá, asegurando que su vuelo sagrado continúe y su legado biocultural se preserve.",
    placemat1Label: "Colmena de Jobón Tradicional",
    placemat1Sub: "U Náajil Yuum K'iin - Colmenas de troncos huecos tallados en cedro o palma de Guano nativa. Hacienda Villa Luna adopta esta configuración tradicional en Mocochá.",
    placemat2Label: "Meliponario Sagrado",
    placemat2Sub: "U Náajil Yuum K'iin - Una vista del meliponario de Maní que alberga colonias silvestres rescatadas. Chiich Kaab replica este entorno en Mocochá.",
    placemat3Label: "Guardiana Xunán Kab",
    placemat3Sub: "U Náajil Yuum K'iin - Una obrera de Melipona beecheii vigilando la entrada de cerumen en forma de trompeta.",
    manifestoTitle: "El Legado de la Abeja Sagrada: Más allá de la Miel",
    manifestoSub: "En la Hacienda Villa Luna (Mocochá, Yucatán), nuestro proyecto no nace con el fin de ser un simple punto de venta, sino como un santuario vivo dedicado a la memoria de nuestras raíces. La meliponicultura no es solo un oficio para nosotros; es un acto de preservación cultural y amor por la biodiversidad.",
    manifestoSec1Title: "Un Vínculo Ancestral con la Sanación",
    manifestoSec1Text: "Desde tiempos inmemoriales, la abeja melipona es considerada una criatura sagrada por la civilización maya. Nuestros antepasados no solo aprecian su miel como un regalo dulce, sino como un elixir de vida capaz de curar y restaurar el bienestar. Al recuperar este conocimiento, buscamos honrar la historia de estas pequeñas guardianas, compartiendo con el mundo por qué, durante siglos, su labor es el pilar fundamental de nuestra medicina tradicional y equilibrio natural.",
    manifestoSec2Title: "Nuestro Compromiso: Conservación y Ética",
    manifestoSec2Text: "Hoy, nos enfrentamos a una realidad urgente: la abeja melipona necesita aliados para no desaparecer. Nuestro objetivo es claro y profundo: evitamos que esta especie caiga en peligro de extinción, creando en Hacienda Villa Luna un ecosistema protegido donde ellas puedan prosperar y reproducirse de manera natural.",
    manifestoSec2SubText: "Para lograrlo, operamos bajo un esquema altruista y consciente:",
    manifestoSec2Points: [
      { label: "Transformación con Propósito", text: "Cada producto que adquieres —desde nuestras gotas oftálmicas hasta el polen puro y la miel de alta calidad— es un eslabón directo en nuestra cadena de cuidado." },
      { label: "Reinversión Total", text: "Parte de los recursos obtenidos de nuestras ventas se destina íntegramente al mantenimiento y expansión del meliponario." },
      { label: "Calidad de Vida", text: "Nuestro compromiso es garantizar que cada abejita tenga un espacio adecuado, un entorno agradable y libre de estrés, permitiéndoles cumplir su ciclo vital en armonía con la naturaleza." }
    ],
    manifestoSec3Title: "Tu Participación es Vital",
    manifestoSec3Text: "Al elegir nuestros productos, no estás comprando solo miel; te estás convirtiendo en guardián de una cultura y protector de una especie esencial. Te invitamos a ser parte de este camino: conocer la historia, valorar la medicina ancestral y ayudarnos a asegurar que el zumbido de la melipona siga siendo parte del alma de nuestra tierra por muchas generaciones más.",
    benefitsTitle: "Matriz de Biodiversidad Meliponini",
    benefits: [
      { title: "Melipona beecheii", subtitle: "Xunán Kab", desc: "La abeja real sin aguijón de los mayas, que anida en troncos huecos (jobones) y se alimenta de flores silvestres del dosel. (En Peligro)" },
      { title: "Trigona fulviventris", subtitle: "Muul Kab", desc: "Abejas sin aguijón que anidan en el suelo y construyen complejas entradas de tierra, vitales para la polinización de hierbas medicinales. (Vulnerable)" },
      { title: "Scaptotrigona pectoralis", subtitle: "K'an Sak", desc: "Muy defensivas pero sin aguijón, conocidas por sus elaboradas entradas de colmena en forma de trompeta de cera. (Estable)" },
      { title: "Plebeia", subtitle: "Yax Kab", desc: "Abejas sin aguijón diminutas y sumamente localizadas, que requieren una extrema estabilidad ambiental y gran delicadeza. (Rara)" }
    ],
    metricsTitle: "Métricas Científicas y Demografía",
    metricsSub: "Datos empíricos recopilados en colaboración con la Escuela de Agricultura Ecológica U Yits Ka'an, que validan la urgencia biocultural y la superioridad nutricional de la Xunán Kab.",
    chart1Title: "La Crisis de Preservación",
    chart1Text1: "La península de Yucatán es una potencia mundial en producción de miel, pero este volumen proviene casi en su totalidad de especies europeas introducidas. La abeja nativa sin aguijón, venerada por los mayas durante siglos, enfrenta una escasez crítica de custodios tradicionales.",
    chart1Text2: "Mientras más de 14,000 apicultores manejan la Apis mellifera europea para exportación masiva, solo unos 700 meliponicultores tradicionales permanecen para proteger a la Xunán Kab nativa, bajo la guía del maestro meliponicultor Don Luis Quintal de U Náajil Yuum K'iin (Maní).",
    chart1Quote: '"La cantidad es la búsqueda de los hombres que no entienden de medicina. Su miel no es solo azúcar... es la sangre de la selva."',
    chart1Citation: "Don Luis Quintal, U Náajil Yuum K'iin (Maní)",
    chart1DatasetLabel: "Número de Criadores en Yucatán",
    chart1Labels: ['Apis mellifera (Europea)', 'Melipona beecheii (Nativa)'],
    chart2Title: "El Ritmo de 61 Días y Demografía",
    chart2Text1: "La colmena de Melipona opera en una línea de tiempo biológicamente precisa. A diferencia de las cajas modernas, los troncos tradicionales de cedro o guano (Jobones) permiten a las abejas esculpir su arquitectura natural y espiritual.",
    chart2Gestation: "Gestación",
    chart2Worker: "Vida Obrera",
    chart2Queen: "Vida Reina",
    chart2Text2: "Un jobón sano alberga una población delicadamente equilibrada. La colmena es defendida por 32 abejas guardianas especializadas con ojos compuestos azules y tres ocelos para navegar en la oscuridad absoluta.",
    chart2Labels: ['Abejas Obreras', 'Capullos en Crecimiento', 'Guardias Centinelas'],
    chart3Title: "Matriz Nutricional del Polen de Melipona",
    chart3Sub: "Los datos validados por la Escuela de Agricultura Ecológica U Yits Ka'an revelan que el polen recolectado por abejas sin aguijón supera drásticamente a las proteínas vegetales y animales comunes en aminoácidos esenciales, demostrando su estatus como restaurador celular y alimento medicinal.",
    chart3Labels: ['Arginina', 'Leucina', 'Metionina / Cisteína', 'Glutamina', 'Aspagina'],
    chart3Dataset1Label: 'Polen Seco de Melipona',
    chart3Dataset2Label: 'Clara de Huevo',
    chart3Dataset3Label: 'Proteína de Suero',
    arginineTitle: "El Campeón de la Arginina",
    arginineText: "El polen seco de Melipona contiene 13.3g de arginina por 100g de proteína, más del doble que la clara de huevo (5.9g) y casi cinco veces más que la proteína de suero de leche (2.9g).",
    methionineTitle: "La Maravilla de la Metionina",
    methionineText: "Al aportar 7.8g de metionina/cisteína, el polen húmedo supera con creces a los frijoles negros (1.9g) y al suero de leche (3.1g), siendo un excelente regenerador celular.",
    galleryTitle: "Vida del Santuario",
    gallerySub: "Una ventana visual que detalla nuestra visita de investigación a U Náajil Yuum K'iin (Maní, Yucatán), documentando la infraestructura de meliponicultura tradicional que replicamos en el santuario Chiich Kaab en la Hacienda Villa Luna.",
    filterAll: "Todas las Imágenes",
    filterBees: "Abejas (Xunán Kab)",
    filterHives: "Colmenas Tradicionales",
    filterLife: "Vida del Santuario",
    wisdomTitle: "Sabiduría Maya y Testimonios",
    wisdomAhMuzenkab: "En Chiich Kaab, honramos el vuelo de la Xunán Kab no como un mero acto biológico, sino como un ciclo sagrado gobernado por Ah Muzenkab. Como dios maya de las abejas y la miel, él es el guardián del vuelo sagrado y el protector de las fuerzas vitales dentro del jobón. Servimos como custodios terrenales de esta sabiduría en la Hacienda Villa Luna (Mocochá), guiados por la experiencia y visión de Don Luis Quintal de U Náajil Yuum K'iin (Maní, Yucatán).",
    wisdomSections: [
      { title: "Don Luis Quintal", subtitle: "Maestro Meliponicultor", content: "La cantidad es la búsqueda de los hombres que no entienden de medicina. Su miel no es solo azúcar... es la sangre de la selva." },
      { title: "Dra. Sofía Méndez", subtitle: "Ecóloga", content: "La Melipona beecheii es una especie clave. Sin su polinización especializada, los árboles medicinales del dosel de Yucatán dejarían de reproducirse." },
      { title: "Doña María", subtitle: "X'men (Curandera Maya)", content: "La miel del jobón no es alimento; es medicina. Lleva el espíritu de la flora de la selva, utilizada por generaciones para sanar los ojos y el alma." },
      { title: "Equipo de Restauración", subtitle: "Hacienda Villa Luna (Mocochá)", content: "Al reforestar árboles nativos ricos en néctar como el Ramón, el Chacá y el Dzidzilché, reconstruimos los antiguos corredores biológicos de la Xunán Kab." }
    ],
    healingTitle: "Protocolos de Sanación Medicinal",
    healingSub: "Las aplicaciones clínicas de la miel de Xunán Kab, validadas por la medicina tradicional maya y la ciencia contemporánea.",
    protocols: [
      { title: "Acción Antibacteriana Potente", subtitle: "Conjuntivitis y Úlceras", text: "La miel de melipona elimina las bacterias mediante la generación de peróxido de hidrógeno natural y el uso de altos niveles de flavonoides para romper las paredes celulares bacterianas. Los estudios muestran que es tan eficaz como la gentamicina para acortar la conjuntivitis bacteriana." },
      { title: "Tratamiento para el Ojo Seco Severo", subtitle: "Queratoconjuntivitis", text: "Su naturaleza higroscópica atrae activamente la humedad al tiempo que reduce drásticamente los marcadores proinflamatorios que causan enrojecimiento y ardor." },
      { title: "Afirmaciones Tradicionales", subtitle: "Cataratas y Pterigión", text: "Su rico contenido antioxidante ayuda a retrasar la progresión de la opacificación del cristalino. Nota: La ciencia no ha demostrado que pueda revertir por completo las cataratas completamente formadas en humanos." },
      { title: "Aplicación - Espera el Ardor", subtitle: "Respuesta Sensorial", text: "Incline la cabeza hacia atrás, jale el párpado inferior hacia abajo y aplique 1 o 2 gotas. Incluso diluida, la miel causa una sensación de ardor aguda e intensa que dura de 30 a 60 segundos. Esto provoca un lagrimeo abundante, que es una reacción normal y necesaria para limpiar la superficie del ojo." }
    ],
    aboutTitle: "Nosotros",
    aboutSub: "Conoce al equipo detrás del santuario de preservación en la Hacienda Villa Luna.",
    aboutIntro: "Bienvenidos a Chiich Kaab, un santuario meliponario ubicado en la Hacienda Villa Luna. Somos un grupo de personas apasionadas, unidas por el entusiasmo de emprender un proyecto que trasciende lo comercial para convertirse en un legado de amor, sanación y preservación de nuestra cultura ancestral.",
    team: [
      {
        name: "Dra. Mya Parra Perera",
        role: "Co-Fundadora y Directora de Salud",
        image: "/website images/Dra. Mya Parra.jpeg",
        bio: "Médica dedicada al cuidado de los adultos mayores, artista, pintora y amante de la música. Mya lidera esta aventura con una visión que une la salud, el arte y la naturaleza. Su compromiso no es solo con la creación de un proyecto, sino con la apertura de un espacio de encuentro para quienes deseen explorar la riqueza de las abejas meliponas y honrar la herencia maya."
      },
      {
        name: "Andrés Fernando Navarrete Parra",
        role: "Co-Fundador y Director Cultural",
        image: "/website images/Andres Navarrete.jpeg",
        bio: "Músico, compositor y guía espiritual. Andrés es un estudioso incansable de la cultura maya, su historia, sus ancestros y su cosmovisión. Su labor es transmitir la profundidad espiritual de este legado. Él nos enseña que el alimento que producen las meliponas es un don no solo curativo para el cuerpo, sino un elixir espiritual que puede sanar y nutrir hogares en todo el mundo."
      },
      {
        name: "Luis Fernando Martínez Chávez",
        role: "Co-Fundador y Director de Marketing",
        image: "/website images/Luis Martinez.jpeg",
        bio: "Empresario experto en marketing y relaciones públicas. Luis es el arquitecto visual de nuestra proyección. Él transforma nuestra esencia en una experiencia estética, cuidando cada detalle de la imagen de Chiich Kaab para que nuestra misión alcance todos los corazones posibles a través de una presencia digital bella y coherente con nuestros valores."
      }
    ],
    groundsTitle: "Instalaciones del Santuario en la Hacienda Villa Luna",
    groundsSub: "Vistas de nuestra ubicación física en Mocochá, donde albergamos a la sagrada Xunán Kab.",
    donateTitle: "Conviértete en Guardián de la Xunán Kab",
    donateText: "Al respaldar el santuario de conservación Chiich Kaab en la Hacienda Villa Luna (Mocochá, Yucatán), en colaboración activa con el santuario ancestral de Don Luis en Maní, financias directamente el rescate de colmenas silvestres dañadas, la reforestación de árboles medicinales nativos y la preservación de la herbolaria maya sagrada.",
    donateCTA: "Donar al Santuario",
    donateSim: "Iniciar Simulador",
    contactTitle: "Conéctate con el Santuario",
    contactSub: "Contáctanos para unirte a nuestra red de voluntarios, programar visitas educativas a nuestro santuario en Mocochá o aprender más sobre conservación biocultural.",
    namePlaceholder: "Tu Nombre",
    emailPlaceholder: "Tu Correo",
    messagePlaceholder: "Mensaje",
    sendBtn: "Enviar Mensaje",
    sendBtnSuccess: "Mensaje Enviado",
    footerDesc: "Dedicado a la preservación de la abeja Melipona beecheii y el patrimonio biocultural maya en la Hacienda Villa Luna (Mocochá, Yucatán).",
    footerLocation: "Hacienda Villa Luna — Mocochá, Yucatán, México",
    footerCopyright: "© 2026 Chiich Kaab. Todos los derechos reservados.",
    gallery: {
      guard: { title: "La Guardia Centinela", description: "U Náajil Yuum K'iin - Una sola obrera Xunán Kab defendiendo la entrada estrecha de un jobón de cedro tradicional." },
      stewardship: { title: "Generaciones de Custodia", description: "U Náajil Yuum K'iin - Andrés Navarrete y Don Luis Quintal, maestro meliponicultor con más de 30 años de experiencia, inspeccionando las estructuras." },
      casita: { title: "El Meliponario Ancestral", description: "U Náajil Yuum K'iin - Colmenas de troncos tradicionales dispuestas bajo la sombra protectora del techo de palma de guano." },
      setup: { title: "La Colmena de Tronco de Guano", description: "U Náajil Yuum K'iin - Instalación tradicional de un jobón mostrando la estructura de tronco hueco suspendida para control de plagas." },
      inside1: { title: "Vasos de Almacenamiento de Cerumen", description: "U Náajil Yuum K'iin - Una mirada macro dentro del tronco del jobón mostrando la compleja estructura orgánica de los vasos de cerumen." },
      inside2: { title: "Panales de Cría y Larvas", description: "U Náajil Yuum K'iin - Panales horizontales donde la reina deposita sus huevos, rodeados de cámaras de almacenamiento de alimento." },
      home1: { title: "Refugios Tradicionales de Guano", description: "U Náajil Yuum K'iin - Colmenas de troncos de árboles huecos dispuestas horizontalmente para imitar los sitios de anidación naturales." },
      home2: { title: "Sitio de Anidación del Santuario", description: "U Náajil Yuum K'iin - Una fila alineada de troncos de jobón que proporciona niveles estables de temperatura y humedad para las colonias." },
      andres1: { title: "Ciencia de la Meliponicultura", description: "U Náajil Yuum K'iin - Andrés inspeccionando la salud de la colmena silvestre y monitoreando el comportamiento de forrajeo." },
      andres2: { title: "Cuidado del Santuario", description: "U Náajil Yuum K'iin - Comprobando cuidadosamente el sello exterior de las colmenas para garantizar la protección total contra depredadores." },
      andres3: { title: "Preservando el Conocimiento Ancestral", description: "U Náajil Yuum K'iin - Transmitiendo las tradiciones orales antiguas y las técnicas especializadas de la meliponicultura maya." },
      guardiana1: { title: "La Guardiana del Portal", description: "U Náajil Yuum K'iin - Una abeja guardiana estacionada en el estrecho agujero de entrada, evitando el ingreso de insectos extraños." },
      guardiana2: { title: "Custodia en la Entrada", description: "U Náajil Yuum K'iin - Abejas reunidas en la entrada para regular la ventilación interna de la colmena y coordinar los vuelos." },
      guardiana3: { title: "Preparándose para el Forrajeo", description: "U Náajil Yuum K'iin - Obreras Xunán Kab calentando sus músculos de vuelo antes de salir hacia las flores silvestres del dosel." },
      guardians: { title: "Protectoras del Santuario", description: "U Náajil Yuum K'iin - Las gentiles abejas Melipona beecheii sin aguijón que han sostenido los ecosistemas de Yucatán por más de 3,000 años." },
      queen1: { title: "La Abeja Reina", description: "U Náajil Yuum K'iin - La reina Melipona rodeada de obreras acompañantes dentro del tronco hueco oscuro." },
      queen2: { title: "La Reina Madre (Matriarca)", description: "U Náajil Yuum K'iin - La reina de la colmena, embarazada durante 6 años, con alas vestigiales y demasiado grande para salir del tronco." },
      inside3: { title: "Arquitectura Interior", description: "U Náajil Yuum K'iin - Una vista dentro del tronco del jobón que detalla los vasos de alimento y los panales de cría." }
    },
    grounds: {
      ground1: "Exuberantes terrenos que rodean la estructura del santuario en Mocochá.",
      ground2: "Paredes históricas de la hacienda y senderos que conducen al meliponario.",
      ground3: "Estructuras de piedra restauradas que albergan los troncos tradicionales de jobón.",
      ground4: "Jardines protegidos del dosel donde las abejas Xunán Kab buscan néctar de flores silvestres.",
      ground5: "Refugio del meliponario enclavado bajo árboles nativos en la Hacienda Villa Luna.",
      ground6: "Atardecer sobre los pacíficos jardines de nuestro santuario de preservación."
    }
  },
  SK: {
    nav: ['Misia', 'Biodiverzita', 'Život v Sanktuáriu', 'Mayská Múdrosť', 'Liečivé Protokoly', 'O Nás', 'Darovať'],
    heroTag: "STRÁŽCOVIA SVÄTÉHO LETU",
    heroTitle: "Strážcovia Svätého Letu",
    heroSubtitle: "Zasadené v Hacienda Villa Luna, Mocochá, Yucatán.",
    heroSub: "Chiich Kaab je náš projekt na záchranu včiel Melipona (Xunán Kab), živé sanktuárium zriadené na pozemkoch Hacienda Villa Luna v Mocochá na Yucatáne. Pod prastarým vedením dona Luisa Quintala premieňame tento priestor na útočisko múdrosti a biodiverzity.",
    heroCTA: "Podporiť Sanktuárium",
    originsTitle: "Záväzok Ochrany Xunán Kab",
    originsText1: "Hacienda Villa Luna je fyzickým domovom Chiich Kaab. V tomto priestore v Mocochá udržiavame optimálne podmienky na ochranu svätej včely. Naše strategické partnerstvo s donom Luisom Quintalom (U Náajil Yuum K'iin, Maní) integruje tradičné metódy chovu bezžihadlových včiel priamo do našej infraštruktúry, čo zaisťuje, že každý jobón a kolónia prospieva v chránenom prostredí.",
    originsText2: "Dnes odlesňovanie, priemyselné poľnohospodárstvo a klimatické zmeny ohrozujú prežitie týchto svätých strážcov. Prostredníctvom tohto spojenectva prepájame múdrosť z Maní s naším sanktuáriom v Mocochá, čím zaisťujeme pokračovanie ich svätého letu a zachovanie biokultúrneho dedičstva.",
    placemat1Label: "Tradičný Úľ Jobón",
    placemat1Sub: "U Náajil Yuum K'iin - Úle z dutých kmeňov vyrobené z cédra alebo miestnej palmy Guano. Hacienda Villa Luna zavádza toto tradičné usporiadanie v Mocochá.",
    placemat2Label: "Posvätný Meliponár",
    placemat2Sub: "U Náajil Yuum K'iin - Pohľad do meliponára v Maní, ktorý prichýlil zachránené divoké kolónie. Chiich Kaab napodobňuje toto prostredie v Mocochá.",
    placemat3Label: "Strážkyňa Xunán Kab",
    placemat3Sub: "U Náajil Yuum K'iin - Robotnica Melipona beecheii strážiaca lievikovitý voskový vchod do úľa.",
    manifestoTitle: "Odkaz Svätej Včely: Viac než Med",
    manifestoSub: "V Hacienda Villa Luna (Mocochá, Yucatán) náš projekt nevzniká ako obyčajné predajné miesto, ale ako živé sanktuárium venované pamiatke našich koreňov. Chov včiel melipona pre nás nie je len prácou; je to čin kultúrneho zachovania a lásky k biodiverzite.",
    manifestoSec1Title: "Prastaré Puto s Liečením",
    manifestoSec1Text: "Od nepamäti je včela melipona považovaná mayskou civilizáciou za posvätné stvorenie. Naši predkovia si necenili jej med len ako sladký dar, ale ako elixír života schopný liečiť a obnovovať zdravie. Obnovením týchto znalostí chceme vzdať úctu histórii týchto maličkých strážcov a ukázať svetu, prečo je ich práca po stáročia základným pilierom našej tradiční medicíny a prírodnej rovnováhy.",
    manifestoSec2Title: "Náš Záväzok: Ochrana a Etika",
    manifestoSec2Text: "Dnes čelíme naliehavej realite: včela melipona potrebuje spojencov, aby nevyhynula. Náš cieľ je jasný a hlboký: bránime vyhynutiu tohto druhu a vytvárame v Hacienda Villa Luna chránený ekosystém, kde môžu prirodzene prosperovať a rozmnožovať sa.",
    manifestoSec2SubText: "Aby sme to dosiahli, fungujeme na altruistickom a vedomom modeli:",
    manifestoSec2Points: [
      { label: "Transformácia s Cieľom", text: "Každý produkt, ktorý získate — od našich očných kvapiek až po čistý peľ a vysokokvalitný med — je priamym článkom v našom reťazci starostlivosti." },
      { label: "Celková Reinvestícia", text: "Časť prostriedkov získaných z predaja putuje výhradne na údržbu a rozširovanie meliponára." },
      { label: "Kvalita Života", text: "Náš záväzok je zaručiť, aby každá včielka mala primeraný priestor, príjemné prostredie bez stresu, čo im umožní dokončiť svoj životný cyklus v súlade s prírodou." }
    ],
    manifestoSec3Title: "Vaša Účasť je Naliehavá",
    manifestoSec3Text: "Výberom našich produktov nekupujete len med; stávate sa strážcom kultúry a ochrancom dôležitého druhu. Pozývame vás stať sa súčasťou tejto cesty: spoznať históriu, vážiť si tradičnú medicínu a pomôcť nám zabezpečiť, aby bzukot melipony zostal súčasťou duše našej krajiny po celé generácie.",
    benefitsTitle: "Matrica Biodiverzity Meliponini",
    benefits: [
      { title: "Melipona beecheii", subtitle: "Xunán Kab", desc: "Kráľovská bezžihadlová včela Mayov, hniezdiaca v dutých kmeňoch (jobónoch) a zbierajúca nektár z divokých kvetov v korunách stromov. (Ohrozená)" },
      { title: "Trigona fulviventris", subtitle: "Muul Kab", desc: "Včely hniezdiace v zemi, ktoré stavajú zložité hlinené vchody, kľúčové pre opelenie nízkych lesných liečivých bylín. (Zraniteľná)" },
      { title: "Scaptotrigona pectoralis", subtitle: "K'an Sak", desc: "Vysoko defenzívne bezžihadlové včely, známe svojimi prepracovanými voskovými vchodmi v tvare trubiek. (Stabilná)" },
      { title: "Plebeia", subtitle: "Yax Kab", desc: "Veľmi lokalizované drobné včely, ktoré vyžadujú extrémnu stabilitu prostredia a maximálnu citlivosť pri zaobchádzaní. (Vzácna)" }
    ],
    metricsTitle: "Vedecké Metriky a Demografia",
    metricsSub: "Empirické dáta zostavené v spolupráci s Ekologickou poľnohospodárskou školou U Yits Ka'an, potvrdzujúce biokultúrnu naliehavosť a nutričnú nadradenosť Xunán Kab.",
    chart1Title: "Kríza Zachovania",
    chart1Text1: "Polostrov Yucatán je globálnym lídrom v produkcii medu, ale tento objem poháňajú takmer výhradne dovezené európske druhy. Pôvodná bezžihadlová včela, ktorú Mayovia uctievali po stáročia, čelí kritickému nedostatku tradičných chovateľov.",
    chart1Text2: "Zatiaľ čo viac ako 14 000 včelárov chová európsku Apis mellifera na hromadný export, odhaduje sa, že na ochranu pôvodnej Xunán Kab zostáva len 700 tradičných včelárov pod vedením dona Luisa Quintala z U Náajil Yuum K'iin (Maní).",
    chart1Quote: '"Množstvo je cieľom ľudí, ktorí nerozumejú medicíne. Ich med nie je len cukor... je to krv lesa."',
    chart1Citation: "Don Luis Quintal, U Náajil Yuum K'iin (Maní)",
    chart1DatasetLabel: "Počet včelárov na Yucatáne",
    chart1Labels: ['Apis mellifera (Európska)', 'Melipona beecheii (Pôvodná)'],
    chart2Title: "Rytmus 61 Dní a Demografia",
    chart2Text1: "Úľ Melipona funguje na presnom, biologicky zrkadlenom časovom harmonograme. Na rozdiel od moderných debien, tradičné duté kmene z cédra alebo guana (Jobones) umožňujú včelám vytvárať ich prirodzenú, duchovnú architektúru.",
    chart2Gestation: "Gestácia",
    chart2Worker: "Život Robotnice",
    chart2Queen: "Život Kráľovnej",
    chart2Text2: "Zdravý jobón ukrýva jemne vyváženú populáciu. Úľ bráni 32 špecializovaných strážnych včiel s hlbokomodrými zloženými očami a tromi jednoduchými očkami na navigáciu v absolútnej tme kmeňa.",
    chart2Labels: ['Aktívne Robotnice', 'Vyvíjajúce sa Kukly', 'Strážni Sentineli'],
    chart3Title: "Nutričná Matrica Peľu Melipony",
    chart3Sub: "Údaje overené Ekologickou poľnohospodárskou školou U Yits Ka'an ukazujú, že peľ zbieraný bezžihadlovými včelami v obsahu esenciálnych aminokyselín drasticky prekonáva bežné živočíšne a rastlinné bielkoviny, čo potvrdzuje jeho status bunkového regenerátora a liečivej potraviny.",
    chart3Labels: ['Arginín', 'Leucín', 'Metionín / Cysteín', 'Glutamín', 'Asparagín'],
    chart3Dataset1Label: 'Suchý Peľ Melipony',
    chart3Dataset2Label: 'Vaječný Bielok',
    chart3Dataset3Label: 'Srvátkový Proteín',
    arginineTitle: "Šampión v Arginíne",
    arginineText: "Suchý peľ Melipony obsahuje 13.3g Arginínu na 100g bielkovín, čo je viac než dvojnásobok vaječného bielka (5.9g) and takmer päťnásobok srvátkového proteínu (2.9g).",
    methionineTitle: "Zázrak Metionínu",
    methionineText: "S obsahom 7.8g Metionínu/Cysteínu vlhký peľ výrazne prekonáva čiernu fazuľu (1.9g) a srvátku (3.1g), vďaka čomu je vynikajúcim prírodným regenerátorom buniek.",
    galleryTitle: "Život v Sanktuáriu",
    gallerySub: "Vizuálny pohľad na našu výskumnú návštevu v U Náajil Yuum K'iin (Maní, Yucatán), dokumentujúci tradičnú infraštruktúru chovu včiel, ktorú replikujeme v sanktuáriu Chiich Kaab v Hacienda Villa Luna.",
    filterAll: "Všetky Obrázky",
    filterBees: "Včely (Xunán Kab)",
    filterHives: "Tradičné Úle",
    filterLife: "Život v Sanktuáriu",
    wisdomTitle: "Mayská Múdrosť a Svedectvá",
    wisdomAhMuzenkab: "V Chiich Kaab uctievame let Xunán Kab nie ako obyčajný biologický fakt, ale ako posvätný cyklus riadený Ah Muzenkabom. Ako mayský boh včiel a medu je strážcom svätého letu a ochrancom životných síl v jobóne. Slúžime ako pozemskí strážcovia tejto múdrosti v Hacienda Villa Luna (Mocochá) pod vedením skúseností a vízie dona Luisa Quintala z U Náajil Yuum K'iin (Maní, Yucatán).",
    wisdomSections: [
      { title: "Don Luis Quintal", subtitle: "Majster Včelár", content: "Množstvo je cieľom ľudí, ktorí nerozumejú medicíne. Ich med nie je len cukor... je to krv lesa." },
      { title: "Dr. Sofia Mendez", subtitle: "Ekologička", content: "Melipona beecheii je kľúčovým druhom. Bez ich špecializovaného opelenia by sa liečivé stromy v korunách yucatánskeho lesa prestali rozmnožovať." },
      { title: "Doña Maria", subtitle: "X'men (Mayská Liečiteľka)", content: "Med z jobónu nie je jedlo; je to liek. Nesie v sebe ducha lesnej flóry, používaný po generácie na liečenie očí a duše." },
      { title: "Tím Obnovy", subtitle: "Hacienda Villa Luna (Mocochá)", content: "Zalesňovaním pôvodných stromov bohatých na nektár, ako sú Ramón, Chacá a Dzidzilché, obnovujeme starodávne biologické koridory pre Xunán Kab." }
    ],
    healingTitle: "Liečivé Protokoly Uzdravenia",
    healingSub: "Klinické aplikácie medu Xunán Kab, potvrdené tradičnou mayskou medicínou a súčasnou vedou.",
    protocols: [
      { title: "Silný Antibakteriálny Účinok", subtitle: "Konjunktivitída a Vredy", text: "Med z melipony eliminuje baktérie generovaním prírodného peroxidu vodíka a využívaním vysokej úrovne flavonoidov na rozklad bunkových stien baktérií. Štúdie ukazujú, že je rovnako účinný ako Gentamicín pri skracovaní bakteriálnej konjunktivitídy." },
      { title: "Liečba Ťažkého Suchého Oka", subtitle: "Keratokonjunktivitída", text: "Jeho hygroskopická povaha aktívne priťahuje vlhkosť a zároveň drasticky znižuje prozápalové markery, ktoré spôsobujú začervenanie a pálenie." },
      { title: "Tradičné Tvrdenia", subtitle: "Sivý Zákal a Pterýgium", text: "Bohatý obsah antioxidantov pomáha oddialiť progresiu zakalenia šošovky. Poznámka: Veda nedokázala, že dokáže úplne zvrátiť plne vyvinutý sivý zákal u ľudí." },
      { title: "Aplikácia - Očakávajte Pálenie", subtitle: "Zmyslová Odozva", text: "Zakloňte hlavu, potiahnite dolné viečko a kvapnite 1 až 2 kvapky. Aj keď je med zriedený, spôsobuje ostré, intenzívne pálenie trvajúce 30 až 60 sekúnd. To vyvoláva silné slzenie, čo je normálna, nevyhnutná reakcia na prepláchnutie povrchu oka." }
    ],
    aboutTitle: "O Nás",
    aboutSub: "Spoznajte tím stojaci za záchranným sanktuáriom v Hacienda Villa Luna.",
    aboutIntro: "Vitajte v Chiich Kaab, meliponárnom sanktuáriu nachádzajúcom sa v Hacienda Villa Luna. Sme skupina vášnivých ľudí spojených nadšením pre projekt, ktorý presahuje komerčné záujmy a stáva sa odkazom lásky, uzdravenia a zachovania našej kultúry predkov.",
    team: [
      {
        name: "Dra. Mya Parra Perera",
        role: "Spoluzakladateľka a riaditeľka pre zdravie",
        image: "/website images/Dra. Mya Parra.jpeg",
        bio: "Lekárka venujúca sa starostlivosti o seniorov, umelkyňa, maliarka a milovníčka hudby. Mya vedie toto dobrodružstvo s víziou spájajúcou zdravie, umenie a prírodu. Jej záväzkom nie je len vytvorenie projektu, ale aj otvorenie priestoru na stretávanie sa pre tých, ktorí chcú objavovať bohatstvo včiel melipona a ctiť si mayské dedičstvo."
      },
      {
        name: "Andrés Fernando Navarrete Parra",
        role: "Spoluzakladateľ a kultúrny riaditeľ",
        image: "/website images/Andres Navarrete.jpeg",
        bio: "Hudobník, skladateľ a duchovný sprievodca. Andrés je neúnavným študentom mayskej kultúry, jej histórie, predkov a svetonázoru. Jeho úlohou je odovzdávať duchovnú hĺbku tohto dedičstva. Učí nás, že potrava produkovaná meliponami je darom nielen pre uzdravenie tela, ale aj duchovným elixírom, ktorý dokáže uzdraviť a vyživiť domovy po celom svete."
      },
      {
        name: "Luis Fernando Martínez Chávez",
        role: "Spoluzakladateľ a riaditeľ pre marketing",
        image: "/website images/Luis Martinez.jpeg",
        bio: "Podnikateľ a odborník na marketing a vzťahy s verejnosťou. Luis je vizuálnym architektom našej prezentácie. Premieňa našu podstatu na estetický zážitok a dbá o každý detail obrazu Chiich Kaab, aby naša misia zasiahla čo najviac sŕdc prostredníctvom krásnej digitálnej prezentácie v súlade s našimi hodnotami."
      }
    ],
    groundsTitle: "Pozemky Sanktuária v Hacienda Villa Luna",
    groundsSub: "Vizuálne pohľady na našu fyzickú lokáciu v Mocochá, kde chováme posvätnú Xunán Kab.",
    donateTitle: "Staňte sa Strážcom Xunán Kab",
    donateText: "Podporou záchranného sanktuária Chiich Kaab v Hacienda Villa Luna (Mocochá, Yucatán), v aktívnej spolupráci s tradičným meliponárom dona Luisa v Maní, priamo financujete záchranu poškodených divokých úľov, zalesňovanie pôvodných liečivých stromov a zachovanie posvätnej mayskej herbológie.",
    donateCTA: "Darovať Sanktuáriu",
    donateSim: "Spustiť Simulátor",
    contactTitle: "Spojte sa so Sanktuáriom",
    contactSub: "Obráťte sa na nás, ak sa chcete pripojiť k našej sieti dobrovoľníkov, naplánovať si vzdelávaciu návštevu nášho sanktuária v Mocochá alebo sa dozvedieť viac o biokultúrnej ochrane.",
    namePlaceholder: "Vaše Meno",
    emailPlaceholder: "Váš E-mail",
    messagePlaceholder: "Správa",
    sendBtn: "Odoslať Správu",
    sendBtnSuccess: "Správa Odoslaná",
    footerDesc: "Venované ochrane včely Melipona beecheii a mayského biokultúrneho dedičstva v Hacienda Villa Luna (Mocochá, Yucatán).",
    footerLocation: "Hacienda Villa Luna — Mocochá, Yucatán, Mexiko",
    footerCopyright: "© 2026 Chiich Kaab. Všetky práva vyhradené.",
    gallery: {
      guard: { title: "Strážny Centinel", description: "U Náajil Yuum K'iin - Jedna robotnica Xunán Kab brániaca úzky vchod do tradičného cédrového úľa jobón." },
      stewardship: { title: "Generácie Ochrancov", description: "U Náajil Yuum K'iin - Andrés Navarrete a Don Luis Quintal, majster včelár s viac ako 30 rokmi skúseností, kontrolujúci vonkajšie konštrukcie." },
      casita: { title: "Prastarý Meliponár", description: "U Náajil Yuum K'iin - Tradičné kmeňové úle bezpečne usporiadané pod ochranným tieňom slamenej strechy z palmy guano." },
      setup: { title: "Úľ z Kmeňa Guano", description: "U Náajil Yuum K'iin - Tradičná inštalácia jobónu zobrazujúca dutý kmeň zavesený kvôli ochrane pred škodcami." },
      inside1: { title: "Zásobné Nádoby z Vosku", description: "U Náajil Yuum K'iin - Makro pohľad do vnútra kmeňa jobón zobrazujúci zložitú organickú štruktúru voskových nádob s medom a peľom." },
      inside2: { title: "Plásty s Plodom a Larvy", description: "U Náajil Yuum K'iin - Horizontálne plásty, kde kráľovná kladie vajíčka, obklopené ochrannými komorami na zásoby jedla." },
      home1: { title: "Tradičné Prístrešky Guano", description: "U Náajil Yuum K'iin - Úle z dutých kmeňov stromov usporiadané horizontálne, aby napodobňovali prirodzené miesta na hniezdenie." },
      home2: { title: "Hniezdisko v Sanktuáriu", description: "U Náajil Yuum K'iin - Zarovnaný rad kmeňov jobón poskytujúci stabilnú teplotu a vlhkosť pre chovné kolónie." },
      andres1: { title: "Veda o Meliponikultúre", description: "U Náajil Yuum K'iin - Andrés kontrolujúci zdravie divokého úľa a monitorujúci správanie včiel pri hľadaní potravy." },
      andres2: { title: "Starostlivosť o Sanktuárium", description: "U Náajil Yuum K'iin - Starostlivá kontrola vonkajšieho tesnenia kmeňových úľov, aby sa zabezpečila úplná ochrana pred predátormi." },
      andres3: { title: "Zachovanie Prastarých Znalostí", description: "U Náajil Yuum K'iin - Odovzdávanie starodávnych ústnych tradícií a špecializovaných techník mayského včelárstva." },
      guardiana1: { title: "Strážkyňa Brány", description: "U Náajil Yuum K'iin - Strážna včela stojaca pri úzkom vchodovom otvore, ktorá zabraňuje vstupu cudziemu hmyzu." },
      guardiana2: { title: "Stráž na Vchode", description: "U Náajil Yuum K'iin - Včely zhromažďujúce sa pri vchode, aby regulovali vnútorné vetranie úľa a koordinovali lety za potravou." },
      guardiana3: { title: "Príprava na Let", description: "U Náajil Yuum K'iin - Robotnice Xunán Kab zahrievajúce svoje svaly pred odletom za lesnými kvetmi." },
      guardians: { title: "Ochrancovia Sanktuária", description: "U Náajil Yuum K'iin - Jemné bezžihadlové včely Melipona beecheii, ktoré udržiavajú ekosystémy Yucatánu už viac ako 3000 rokov." },
      queen1: { title: "Včelia Kráľovná", description: "U Náajil Yuum K'iin - Kráľovná Melipona obklopená robotnicami vo vnútri tmavého dutého kmeňa." },
      queen2: { title: "Matka Kráľovná (Matriarcha)", description: "U Náajil Yuum K'iin - Kráľovná úľa, tehotná 6 rokov, s zakrpatenými krídlami a príliš veľká na to, aby opustila kmeň." },
      inside3: { title: "Vnútorná Architektúra", description: "U Náajil Yuum K'iin - Pohľad do vnútra kmeňa jobón detailne zobrazujúci voskové nádoby na jedlo a plásty s plodom." }
    },
    grounds: {
      ground1: "Svieže záhrady obklopujúce budovu sanktuária v Mocochá.",
      ground2: "Historické steny haciendy a chodníky vedúce k meliponáru.",
      ground3: "Obnovené kamenné konštrukcie ukrývajúce tradičné kmeňové úle jobón.",
      ground4: "Chránené záhrady pod korunami stromov, kde včely Xunán Kab hľadajú divoké kvety.",
      ground5: "Prístrešok pre meliponár umiestnený pod pôvodnými stromami v Hacienda Villa Luna.",
      ground6: "Západ slnka nad pokojnými záhradami nášho záchranného sanktuária."
    }
  },
  DE: {
    nav: ['Mission', 'Biodiversität', 'Leben im Schutzgebiet', 'Maya-Weisheit', 'Heilungsprotokolle', 'Über Uns', 'Spenden'],
    heroTag: "HÜTER DES HEILIGEN FLUGES",
    heroTitle: "Hüter des Heiligen Fluges",
    heroSubtitle: "Beheimatet in Hacienda Villa Luna, Mocochá, Yucatán.",
    heroSub: "Chiich Kaab ist unser Schutzprojekt für die Melipona-Biene (Xunán Kab), ein lebendiges Reservat auf dem Gelände der Hacienda Villa Luna in Mocochá, Yucatán. Unter der überlieferten Führung von Don Luis Quintal verwandeln wir diesen Ort in ein Zentrum für Weisheit und Biodiversität.",
    heroCTA: "Das Schutzgebiet unterstützen",
    originsTitle: "Das Xunán Kab Hüter-Versprechen",
    originsText1: "Hacienda Villa Luna ist die physische Heimat von Chiich Kaab. An diesem Ort in Mocochá pflegen wir die optimalen Bedingungen zum Schutz der heiligen Biene. Unsere strategische Partnerschaft mit Don Luis Quintal (U Náajil Yuum K'iin, Maní) integriert traditionelle Techniken der stachellosen Bienenzucht direkt in unsere Infrastruktur, damit jeder Jobón und jedes Volk in einer geschützten Umgebung gedeiht.",
    originsText2: "Heute bedrohen Abholzung, industrielle Landwirtschaft und Klimawandel das Überleben dieser heiligen Hüter. Durch diese Allianz schlagen wir eine Brücke zwischen dem Wissen aus Maní und unseren Einrichtungen in Mocochá, um den Fortbestand ihres heiligen Fluges zu sichern und ihr biokulturelles Erbe zu bewahren.",
    placemat1Label: "Traditioneller Jobón-Bienenkorb",
    placemat1Sub: "U Náajil Yuum K'iin - Aus Zeder oder einheimischer Guano-Palme gefertigte hohle Baumstämme. Die Hacienda Villa Luna übernimmt dieses traditionelle System in Mocochá.",
    placemat2Label: "Heiliges Meliponarium",
    placemat2Sub: "U Náajil Yuum K'iin - Ein Blick in das Schutzgebiet in Maní, das gerettete Wildvölker beherbergt. Chiich Kaab repliziert diese Umgebung in Mocochá.",
    placemat3Label: "Xunán Kab Wächterin",
    placemat3Sub: "U Náajil Yuum K'iin - Eine Melipona beecheii Arbeiterin, die den trichterförmigen Eingang aus Wachsharz bewacht.",
    manifestoTitle: "Das Erbe der heiligen Biene: Mehr als Honig",
    manifestoSub: "Auf der Hacienda Villa Luna (Mocochá, Yucatán) entsteht unser Projekt nicht als Verkaufsstelle, sondern als ein lebendiges Schutzgebiet, das der Erinnerung an unsere Wurzeln gewidmet ist. Die Meliponicultura ist für uns nicht nur ein Beruf, sondern ein Akt der kulturellen Bewahrung und Liebe zur Biodiversität.",
    manifestoSec1Title: "Eine uralte Verbindung zur Heilung",
    manifestoSec1Text: "Seit unvordenklichen Zeiten gilt die Melipona-Biene in der Maya-Zivilisation als heiliges Geschöpf. Unsere Vorfahren schätzten ihren Honig nicht nur als süße Gabe, sondern als Lebenselixier, das heilen und das Wohlbefinden wiederherstellen kann. Indem wir dieses Wissen zurückgewinnen, ehren wir die Geschichte dieser kleinen Hüterinnen und zeigen der Welt, warum ihre Arbeit seit Jahrhunderten die tragende Säule unserer traditionellen Medizin und unseres natürlichen Gleichgewichts ist.",
    manifestoSec2Title: "Unser Versprechen: Naturschutz und Ethik",
    manifestoSec2Text: "Heute stehen wir vor einer dringenden Realität: Die Melipona-Biene braucht Verbündete, um nicht zu verschwinden. Unser Ziel ist klar und tiefgründig: Wir verhindern das Aussterben dieser Art und schaffen auf der Hacienda Villa Luna ein geschütztes Ökosystem, in dem sie sich natürlich vermehren und gedeihen können.",
    manifestoSec2SubText: "Um dies zu erreichen, arbeiten wir nach einem altruistischen und bewussten Modell:",
    manifestoSec2Points: [
      { label: "Veränderung mit Sinn", text: "Jedes Produkt, das Sie erwerben – von unseren Augentropfen bis hin zu reinem Pollen und hochwertigem Honig – ist ein direktes Glied in unserer Kette der Fürsorge." },
      { label: "Vollständige Reinvestition", text: "Ein Teil der Einnahmen aus unseren Verkäufen fließt vollständig in den Erhalt und Ausbau des Meliponariums." },
      { label: "Lebensqualität", text: "Unsere Verpflichtung ist es, zu garantieren, dass jede kleine Biene einen angemessenen Raum, eine angenehme und stressfreie Umgebung hat, damit sie ihren Lebenszyklus im Einklang mit der Natur vollenden kann." }
    ],
    manifestoSec3Title: "Ihre Mitwirkung ist entscheidend",
    manifestoSec3Text: "Wenn Sie sich für unsere Produkte entscheiden, kaufen Sie nicht nur Honig; Sie werden zum Hüter einer Kultur und zum Beschützer einer lebenswichtigen Art. Wir laden Sie ein, Teil dieser Reise zu sein: Lernen Sie die Geschichte kennen, schätzen Sie die traditionelle Medizin und helfen Sie uns zu sichern, dass das Summen der Melipona auch für kommende Generationen Teil der Seele unseres Landes bleibt.",
    benefitsTitle: "Biodiversitäts-Matrix der Meliponini",
    benefits: [
      { title: "Melipona beecheii", subtitle: "Xunán Kab", desc: "Die königliche stachellose Biene der Maya, die in hohlen Baumstämmen (Jobones) nistet und an den Wildblüten des Dschungeldaches sammelt. (Vom Aussterben bedroht)" },
      { title: "Trigona fulviventris", subtitle: "Muul Kab", desc: "Im Boden nistende stachellose Bienen, die komplexe Erdeingänge bauen, die für die Bestäubung von Heilkräutern am Waldboden wichtig sind. (Gefährdet)" },
      { title: "Scaptotrigona pectoralis", subtitle: "K'an Sak", desc: "Sehr verteidigungsbereite, aber stachellose Bienen, bekannt für ihre kunstvollen, trichterförmigen Nesteingänge aus Wachs. (Stabil)" },
      { title: "Plebeia", subtitle: "Yax Kab", desc: "Sehr lokal vorkommende winzige stachellose Bienen, die extreme Umweltstabilität und höchste Sensibilität bei der Pflege erfordern. (Selten)" }
    ],
    metricsTitle: "Wissenschaftliche Kennzahlen & Demografie",
    metricsSub: "Empirische Daten in Zusammenarbeit mit der Landwirtschaftsschule U Yits Ka'an, die die biokulturelle Dringlichkeit und nutritive Überlegenheit der Xunán Kab belegen.",
    chart1Title: "Die Erhaltungskrise",
    chart1Text1: "Die Halbinsel Yucatán ist eine weltweite Macht in der Honigproduktion, doch dieses Volumen wird fast ausschließlich von eingeführten europäischen Arten getragen. Die stachellose Urbiene, die von den Maya über Jahrhunderte verehrt wurde, leidet unter einem kritischen Mangel an traditionellen Hütern.",
    chart1Text2: "Während über 14.000 Imker die europäische Apis mellifera für den Massenexport halten, verbleiben schätzungsweise nur 700 traditionelle Meliponizüchter zum Schutz der heimischen Xunán Kab, betreut vom erfahrenen Züchter Don Luis Quintal aus U Náajil Yuum K'iin (Maní).",
    chart1Quote: '"Menge ist das Streben von Menschen, die nichts von Medizin verstehen. Ihr Honig ist nicht nur sugar... er ist das Blut des Urwalds."',
    chart1Citation: "Don Luis Quintal, U Náajil Yuum K'iin (Maní)",
    chart1DatasetLabel: "Anzahl der Imker in Yucatán",
    chart1Labels: ['Apis mellifera (Europäisch)', 'Melipona beecheii (Einheimisch)'],
    chart2Title: "Der 61-Tage-Rhythmus & Demografie",
    chart2Text1: "Das Melipona-Volk arbeitet nach einem präzisen, biologisch gespiegelten Zeitplan. Im Gegensatz zu modernen Holzkästen ermöglichen traditionelle hohle Stämme (Jobones) den Bienen, ihre natürliche, spirituelle Architektur zu formen.",
    chart2Gestation: "Tragzeit",
    chart2Worker: "Arbeiterinnenleben",
    chart2Queen: "Königinnenleben",
    chart2Text2: "Ein gesunder Jobón beherbergt eine fein abgestimmte Population. Das Volk wird von 32 spezialisierten Wächterbienen verteidigt, die tiefblaue Facettenaugen und drei primitive Punktaugen besitzen, um in der absoluten Dunkelheit des Stammes zu navigieren.",
    chart2Labels: ['Aktive Arbeiterinnen', 'Sich entwickelnde Puppen', 'Wächterinnen'],
    chart3Title: "Nährstoffmatrix von Melipona-Pollen",
    chart3Sub: "Vom U Yits Ka'an Institut validierte Daten zeigen, dass der von stachellosen Bienen gesammelte Pollen die gängigen tierischen und pflanzlichen Proteine bei essenziellen Aminosäuren drastisch übertrifft, was seine Rolle als Zellrestaurator und medizinische Nahrung untermauert.",
    chart3Labels: ['Arginin', 'Leucin', 'Methionin / Cystein', 'Glutamin', 'Asparagin'],
    chart3Dataset1Label: 'Trockener Melipona-Pollen',
    chart3Dataset2Label: 'Eiweiß',
    chart3Dataset3Label: 'Molkenprotein',
    arginineTitle: "Der Arginin-Champion",
    arginineText: "Trockener Melipona-Pollen enthält 13.3g Arginin pro 100g Protein, mehr als das Doppelte von Eiklar (5.9g) und fast das Fünffache von Molkenprotein (2.9g).",
    methionineTitle: "Das Methonin-Wunder",
    methionineText: "Mit 7.8g Methionin/Cystein übertrifft feuchter Pollen schwarze Bohnen (1.9g) und Molke (3.1g) bei Weitem und dient als hervorragendes natürliches Zellregenerationsmittel.",
    galleryTitle: "Leben im Schutzgebiet",
    gallerySub: "Ein Einblick in unseren Forschungsbesuch bei U Náajil Yuum K'iin (Maní, Yucatán) zur Dokumentation der traditionellen Infrastruktur, die wir im Schutzgebiet Chiich Kaab auf der Hacienda Villa Luna nachbilden.",
    filterAll: "Alle Bilder",
    filterBees: "Bienen (Xunán Kab)",
    filterHives: "Traditionelle Stämme",
    filterLife: "Leben im Schutzgebiet",
    wisdomTitle: "Maya-Weisheit & Testimonials",
    wisdomAhMuzenkab: "Bei Chiich Kaab ehren wir den Flug der Xunán Kab nicht als bloßen biologischen Akt, sondern als einen heiligen Kreislauf, der von Ah Muzenkab regiert wird. Als Maya-Gott der Bienen und des Honigs ist er der Hüter des heiligen Fluges und der Beschützer der Lebenskräfte im Jobón. Wir dienen als irdische Hüter dieser Weisheit auf der Hacienda Villa Luna (Mocochá), geleitet von der Erfahrung und Vision von Don Luis Quintal aus U Náajil Yuum K'iin (Maní, Yucatán).",
    wisdomSections: [
      { title: "Don Luis Quintal", subtitle: "Imkermeister", content: "Menge ist das Streben von Menschen, die nichts von Medizin verstehen. Ihr Honig ist nicht nur Zucker... er ist das Blut des Urwalds." },
      { title: "Dr. Sofia Mendez", subtitle: "Ökologin", content: "Die Melipona beecheii is eine Schlüsselart. Ohne ihre spezialisierte Bestäubung würden sich die medizinischen Bäume im Dschungeldach von Yucatán nicht mehr vermehren." },
      { title: "Doña Maria", subtitle: "X'men (Maya-Heilerin)", content: "Der Honig aus dem Jobón ist keine Nahrung; er ist Medizin. Er trägt den Geist der Urwaldflora in sich und wird seit Generationen zur Heilung der Augen und der Seele verwendet." },
      { title: "Restaurierungsteam", subtitle: "Hacienda Villa Luna (Mocochá)", content: "Durch die Wiederaufforstung einheimischer, nektarreicher Bäume wie Ramón, Chacá und Dzidzilché bauen wir die alten biologischen Korridore für die Xunán Kab wieder auf." }
    ],
    healingTitle: "Medizinische Heilungsprotokolle",
    healingSub: "Die klinischen Anwendungen des Xunán Kab Honigs, validiert durch die traditionelle Maya-Medizin und die moderne Wissenschaft.",
    protocols: [
      { title: "Starke antibakterielle Wirkung", subtitle: "Bindehautentzündung & Geschwüre", text: "Melipona-Honig eliminiert Bakterien, indem er natürliches Wasserstoffperoxid erzeugt und hohe Konzentrationen an Flavonoiden nutzt, um bakterielle Zellwände abzubauen. Studien zeigen, dass er bei der Verkürzung von bakterieller Bindehautentzündung ebenso wirksam ist wie Gentamicin." },
      { title: "Behandlung von schwerem trockenem Auge", subtitle: "Keratokonjunktivitis", text: "Seine hygroskopische Natur zieht aktiv Feuchtigkeit an, während sie proinflammatorische Marker, die Rötungen und Brennen verursachen, drastisch reduziert." },
      { title: "Traditionelle Behauptungen", subtitle: "Grauer Star & Flügelfell", text: "Der hohe Gehalt an Antioxidantien hilft, das Fortschreiten der Linsentrübung zu verzögern. Hinweis: Die Wissenschaft hat nicht bewiesen, dass er einen voll ausgebildeten Grauen Star beim Menschen vollständig rückgängig machen kann." },
      { title: "Anwendung - Stellen Sie sich auf das Brennen ein", subtitle: "Sensorische Reaktion", text: "Neigen Sie den Kopf nach hinten, ziehen Sie das untere Augenlid nach unten und tragen Sie 1 bis 2 Tropfen auf. Selbst in verdünnter Form verursacht Honig ein stechendes, intensives Brennen, das 30 bis 60 Sekunden anhält. Dies führt zu starkem Tränenfluss, was eine normale, notwendige Reaktion zur Spülung der Augenoberfläche ist." }
    ],
    aboutTitle: "Über Uns",
    aboutSub: "Lernen Sie das Team hinter dem Erhaltungsprojekt auf der Hacienda Villa Luna kennen.",
    aboutIntro: "Willkommen bei Chiich Kaab, einem Melipona-Schutzgebiet auf der Hacienda Villa Luna. Wir sind eine Gruppe leidenschaftlicher Menschen, vereint durch die Begeisterung für ein Projekt, das über das Kommerzielle hinausgeht und zu einem Vermächtnis der Liebe, Heilung und Bewahrung unserer angestammten Kultur wird.",
    team: [
      {
        name: "Dra. Mya Parra Perera",
        role: "Mitgründerin & Gesundheitsdirektorin",
        image: "/website images/Dra. Mya Parra.jpeg",
        bio: "Ärztin für Altenpflege, Künstlerin, Malerin und Musikliebhaberin. Mya leitet dieses Abenteuer mit einer Vision, die Gesundheit, Kunst und Natur verbindet. Ihr Engagement gilt nicht nur der Verwirklichung eines Projekts, sondern auch der Schaffung eines Begegnungsraums für alle, die den Reichtum der Melipona-Bienen erkunden und das Erbe der Maya ehren möchten."
      },
      {
        name: "Andrés Fernando Navarrete Parra",
        role: "Mitgründer & Kulturdirektor",
        image: "/website images/Andres Navarrete.jpeg",
        bio: "Musiker, Komponist und spiritueller Führer. Andrés ist ein unermüdlicher Erforscher der Maya-Kultur, ihrer Geschichte, ihrer Vorfahren und ihrer Kosmovision. Seine Aufgabe ist es, die spirituelle Tiefe dieses Erbes zu vermitteln. Er lehrt uns, dass die Nahrung der Meliponas nicht nur eine Medizin für den Körper ist, sondern ein spirituelles Elixier, das Heime weltweit heilen und nähren kann."
      },
      {
        name: "Luis Fernando Martínez Chávez",
        role: "Mitgründer & Marketingdirektor",
        image: "/website images/Luis Martinez.jpeg",
        bio: "Unternehmer und Experte für Marketing und Öffentlichkeitsarbeit. Luis ist der visuelle Architekt unserer Außenwirkung. Er verwandelt unsere Essenz in eine ästhetische Erfahrung und pflegt jedes Detail des Markenauftritts von Chiich Kaab, damit unsere Mission durch eine schöne und mit unseren Werten im Einklang stehende digitale Präsenz möglichst viele Herzen erreicht."
      }
    ],
    groundsTitle: "Gelände des Schutzgebiets auf der Hacienda Villa Luna",
    groundsSub: "Visuelle Eindrücke von unserem physischen Standort in Mocochá, an dem wir die heilige Xunán Kab beherbergen.",
    donateTitle: "Werden Sie ein Hüter der Xunán Kab",
    donateText: "Mit Ihrer Unterstützung für das Schutzgebiet Chiich Kaab auf der Hacienda Villa Luna (Mocochá, Yucatán) in aktiver Zusammenarbeit mit Don Luis' traditionellem Meliponarium in Maní finanzieren Sie direkt die Rettung beschädigter Wildvölker, die Wiederaufforstung einheimischer Heilbäume und die Bewahrung der heiligen Maya-Kräuterkunde.",
    donateCTA: "Dem Schutzgebiet spenden",
    donateSim: "Simulator starten",
    contactTitle: "Verbinden Sie sich mit dem Schutzgebiet",
    contactSub: "Kontaktieren Sie uns, um sich unserem Freiwilligennetzwerk anzuschließen, Bildungsbesuche in unserem Reservat in Mocochá zu vereinbaren oder mehr über den biokulturellen Schutz zu erfahren.",
    namePlaceholder: "Ihr Name",
    emailPlaceholder: "Ihre E-Mail",
    messagePlaceholder: "Nachricht",
    sendBtn: "Nachricht senden",
    sendBtnSuccess: "Nachricht gesendet",
    footerDesc: "Gewidmet dem Schutz der Melipona beecheii und dem biokulturellen Erbe der Maya auf der Hacienda Villa Luna (Mocochá, Yucatán).",
    footerLocation: "Hacienda Villa Luna — Mocochá, Yucatán, Mexiko",
    footerCopyright: "© 2026 Chiich Kaab. Alle Rechte vorbehalten.",
    gallery: {
      guard: { title: "Die Wächterin", description: "U Náajil Yuum K'iin - Eine einzelne Xunán Kab Arbeiterin, die den engen Eingang eines traditionellen Jobón-Stammes bewacht." },
      stewardship: { title: "Generationen der Pflege", description: "U Náajil Yuum K'iin - Andrés Navarrete und Don Luis Quintal, ein Imkermeister mit über 30 Jahren Erfahrung, bei der Inspektion." },
      casita: { title: "Das traditionelle Meliponarium", description: "U Náajil Yuum K'iin - Traditionelle Holzstamm-Bienenstöcke unter dem schützenden Schatten eines Guano-Palmbeplankten Daches." },
      setup: { title: "Der Guano-Hohlstamm", description: "U Náajil Yuum K'iin - Eine traditionelle Jobón-Installation, die den zur Schädlingsbekämpfung aufgehängten Hohlstamm zeigt." },
      inside1: { title: "Wachsharz-Vorratsbehälter", description: "U Náajil Yuum K'iin - Ein Makroblick in den Jobón-Stamm, der die komplexe organische Struktur der Wachsbehälter mit Honig zeigt." },
      inside2: { title: "Brutwaben und Larven", description: "U Náajil Yuum K'iin - Horizontale Waben, in denen die Königin ihre Eier ablegt, umgeben von schützenden Nahrungskammern." },
      home1: { title: "Traditionelle Palmdächer", description: "U Náajil Yuum K'iin - Hohle Baumstämme, die horizontal angeordnet sind, um natürliche Nistplätze im Wald nachzuahmen." },
      home2: { title: "Nistplatz des Schutzgebiets", description: "U Náajil Yuum K'iin - Eine Reihe von Jobón-Stämmen, die für stabile Temperatur- und Feuchtigkeitswerte sorgen." },
      andres1: { title: "Wissenschaft der Meliponicultura", description: "U Náajil Yuum K'iin - Andrés bei der Inspektion der Gesundheit wilder Völker und der Überwachung des Sammelverhaltens." },
      andres2: { title: "Pflege des Schutzgebiets", description: "U Náajil Yuum K'iin - Sorgfältige Überprüfung der äußeren Abdichtung der Stämme, um Schutz vor Fressfeinden zu gewährleisten." },
      andres3: { title: "Erhalt des alten Wissens", description: "U Náajil Yuum K'iin - Weitergabe der mündlichen Überlieferungen und speziellen Techniken der stachellosen Maya-Bienenzucht." },
      guardiana1: { title: "Die Torwächterin", description: "U Náajil Yuum K'iin - Eine Wächterbiene am engen Eingangsloch, die das Eindringen fremder Insekten verhindert." },
      guardiana2: { title: "Wache am Nesteingang", description: "U Náajil Yuum K'iin - Bienen am Eingang, die die Belüftung des Stocks regulieren und Sammelflüge koordinieren." },
      guardiana3: { title: "Vorbereitung auf den Sammelflug", description: "U Náajil Yuum K'iin - Xunán Kab Arbeiterinnen beim Aufwärmen der Flugmuskeln vor dem Abflug zu den Waldblüten." },
      guardians: { title: "Schützer des Reservats", description: "U Náajil Yuum K'iin - Die sanften stachellosen Melipona beecheii Bienen, die seit über 3000 Jahren Yucatáns Ökosysteme erhalten." },
      queen1: { title: "Die Bienenkönigin", description: "U Náajil Yuum K'iin - Die Melipona-Königin, umgeben von Arbeiterinnen im dunklen Inneren des Hohlstammes." },
      queen2: { title: "Die Mutterkönigin (Matriarchin)", description: "U Náajil Yuum K'iin - Die Königin des Stocks, seit 6 Jahren trächtig, mit rückgebildeten Flügeln und zu groß, um den Stamm zu verlassen." },
      inside3: { title: "Innenarchitektur", description: "U Náajil Yuum K'iin - Ein Blick in das Innere des Jobóns, der die Honigtöpfe und Brutwaben im Detail zeigt." }
    },
    grounds: {
      ground1: "Üppiges Gelände um das Gebäude des Schutzgebiets in Mocochá.",
      ground2: "Historische Mauern der Hacienda und Wege, die zum Meliponarium führen.",
      ground3: "Restaurierte Steinstrukturen, in denen die traditionellen Jobones untergebracht sind.",
      ground4: "Geschützte Gärten, in denen Xunán Kab Bienen nach Dschungelblüten suchen.",
      ground5: "Unterstand des Meliponariums unter einheimischen Bäumen auf der Hacienda Villa Luna.",
      ground6: "Sonnenuntergang über den friedlichen Gärten unseres Schutzgebiets."
    }
  },
  CS: {
    nav: ['Mise', 'Biodiverzita', 'Život v Sanktuáriu', 'Mayská Moudrost', 'Léčivé Protokoly', 'O Nás', 'Darovat'],
    heroTag: "STRÁŽCI POSVÁTNÉHO LETU",
    heroTitle: "Strážci Posvátného Letu",
    heroSubtitle: "Zasazeno v Hacienda Villa Luna, Mocochá, Yucatán.",
    heroSub: "Chiich Kaab je náš projekt na záchranu včel Melipona (Xunán Kab), živé sanktuárium zřízené na pozemcích Hacienda Villa Luna v Mocochá na Yucatánu. Pod prastarým vedením dona Luise Quintala přeměňujeme tento prostor v útočiště moudrosti a biodiverzity.",
    heroCTA: "Podpořit Sanktuárium",
    originsTitle: "Závazek Ochrany Xunán Kab",
    originsText1: "Hacienda Villa Luna je fyzickým domovem Chiich Kaab. V tomto prostoru v Mocochá udržujeme optimální podmínky pro ochranu posvátné včely. Naše strategické partnerství s donem Luisem Quintalem (U Náajil Yuum K'iin, Maní) integruje tradiční metody chovu bezžihadlových včel přímo do naší infrastruktury, což zajišťuje, že každý jobón a kolonie prospívá v chráneném prostředí.",
    originsText2: "Dnes odlesňování, průmyslové zemědělství a klimatické změny ohrožují přežití těchto posvátných strážců. Prostřednictvím tohoto spojenectví propojujeme moudrost z Maní s naším sanktuáriem v Mocochá, čímž zajišťujeme pokračování jejich posvátného letu a zachování biokulturního dědictví.",
    placemat1Label: "Tradiční Úl Jobón",
    placemat1Sub: "U Náajil Yuum K'iin - Úly z dutých kmenů vyrobené z cedru nebo místní palmy Guano. Hacienda Villa Luna zavádí toto tradiční uspořádání v Mocochá.",
    placemat2Label: "Posvátný Meliponář",
    placemat2Sub: "U Náajil Yuum K'iin - Pohled do meliponáře v Maní, který přichýlil zachráněné divoké kolonie. Chiich Kaab napodobuje toto prostředí v Mocochá.",
    placemat3Label: "Strážkyně Xunán Kab",
    placemat3Sub: "U Náajil Yuum K'iin - Dělnice Melipona beecheii strážící trubkovitý voskový vchod do úlu.",
    manifestoTitle: "Odkaz Posvátné Včely: Více než Med",
    manifestoSub: "V Hacienda Villa Luna (Mocochá, Yucatán) náš projekt nevzniká jako pouhé prodejní místo, ale jako živé sanktuárium věnované památce našich kořenů. Chov včel melipona pro nás není jen prací; je to čin kulturního zachování a lásky k biodiverzitě.",
    manifestoSec1Title: "Prastaré Pouto s Léčením",
    manifestoSec1Text: "Od nepaměti je včela melipona považována mayskou civilizací za posvátné stvorení. Naši předkové si necenili jejího medu jen jako sladkého daru, ale jako elixíru života schopného léčit a obnovovat zdraví. Obnovením těchto znalostí chceme vzdát úctu historii těchto maličkých strážců a ukázat světu, proč je jejich práce po staletí základním pilířem naší tradiční medicíny a přírodní rovnováhy.",
    manifestoSec2Title: "Náš Závazek: Ochrana a Etika",
    manifestoSec2Text: "Dnes čelíme naléhavé realitě: včela melipona potřebuje spojence, aby nevyhynula. Náš cíl je jasný a hluboký: bráníme vyhynutí tohoto druhu a vytváříme v Hacienda Villa Luna chráněný ekosystém, kde mohou přirozeně prosperovat a rozmnožovat se.",
    manifestoSec2SubText: "Abychom toho dosáhli, fungujeme na altruistickém a vědomém modelu:",
    manifestoSec2Points: [
      { label: "Transformace s Cílem", text: "Každý produkt, který získáte — od našich očních kapek až po čistý pyl a vysoce kvalitní med — je přímým článkem v našem řetězci péče." },
      { label: "Celková Reinvestice", text: "Část prostředků získaných z prodeje putuje výhradně na údržbu a rozšiřování meliponáře." },
      { label: "Kvalita Života", text: "Náš závazek je zaručit, aby každá včelka měla přiměřený prostor, příjemné prostředí bez stresu, což jim umožní dokončit svůj životní cyklus v souladu s přírodou." }
    ],
    manifestoSec3Title: "Vaše Účast je Naléhavá",
    manifestoSec3Text: "Výběrem našich produktů nekupujete jen med; stáváte se strážcem kultury a ochráncem důležitého druhu. Zveme vás stát se součástí této cesty: poznat historii, vážit si tradiční medicíny a pomoci nám zajistit, aby bzukot melipony zůstal součástí duše naší země po celé generace.",
    benefitsTitle: "Matrice Biodiverzity Meliponini",
    benefits: [
      { title: "Melipona beecheii", subtitle: "Xunán Kab", desc: "Královská bezžihadlová včela Mayů, hnízdící v dutých kmenech (jobonech) a sbírající nektár z divokých květů v korunách stromů. (Ohrožená)" },
      { title: "Trigona fulviventris", subtitle: "Muul Kab", desc: "Včely hnízdící v zemi, které staví složité hliněné vchody, klíčové pro opylení nízkých lesních léčivých bylin. (Zranitelná)" },
      { title: "Scaptotrigona pectoralis", subtitle: "K'an Sak", desc: "Vysoce defenzivní bezžihadlové včely, známé svými propracovanými voskovými vchody ve tvaru trubek. (Stabilní)" },
      { title: "Plebeia", subtitle: "Yax Kab", desc: "Velmi lokalizované drobné včely, které vyžadují extrémní stabilitu prostředí a absolutní citlivost při zacházení. (Vzácná)" }
    ],
    metricsTitle: "Vědecké Metriky a Demografie",
    metricsSub: "Empirická data sestavená ve spolupráci s Ekologickou zemědělskou školou U Yits Ka'an, potvrzující biokulturní naléhavost a nutriční nadřazenost Xunán Kab.",
    chart1Title: "Krize Zachování",
    chart1Text1: "Polostrov Yucatán je globálním lídrem v produkci medu, ale tento objem poháňejí téměř výhradně dovezené evropské druhy. Původní bezžihadlová včela, kterou Mayové uctívali po staletí, čelí kritickému nedostatku tradičních chovatelů.",
    chart1Text2: "Zatímco více než 14 000 včelařů chová evropskou Apis mellifera pro hromadný export, odhaduje se, že na ochranu původní Xunán Kab zůstává pouze 700 tradičních včelařů pod vedením dona Luise Quintala z U Náajil Yuum K'iin (Maní).",
    chart1Quote: '"Množství je cílem lidí, kteří nerozumí medicíně. Jejich med není jen cukr... je to krev lesa."',
    chart1Citation: "Don Luis Quintal, U Náajil Yuum K'iin (Maní)",
    chart1DatasetLabel: "Počet včelařů na Yucatánu",
    chart1Labels: ['Apis mellifera (Evropská)', 'Melipona beecheii (Původní)'],
    chart2Title: "Rytmus 61 Dní a Demografie",
    chart2Text1: "Úl Melipona funguje na přesném, biologicky zrcadleném časovém harmonogramu. Na rozdíl od moderních beden, tradiční duté kmeny z cedru nebo guana (Jobones) umožňují včelám vytvářet jejich přirozenou, duchovní architekturu.",
    chart2Gestation: "Gestace",
    chart2Worker: "Život Dělnice",
    chart2Queen: "Život Královny",
    chart2Text2: "Zdravý jobón ukrývá jemně vyváženou populaci. Úl brání 32 specializovaných strážních včel s hlubokomodrýma složenýma očima a třemi jednoduchými očky pro navigaci v absolutní tmě kmene.",
    chart2Labels: ['Aktivní Dělnice', 'Vyvíjející se Kukly', 'Strážní Sentinely'],
    chart3Title: "Nutriční Matrice Pylu Melipony",
    chart3Sub: "Údaje ověřené Ekologickou zemědělskou školou U Yits Ka'an ukazují, že pyl sbíraný bezžihadlovými včelami v obsahu esenciálních aminokyselin drasticky překonává běžné živočišné a rostlinné bílkoviny, což potvrzuje jeho status buněčného regenerátoru a léčivé potraviny.",
    chart3Labels: ['Arginin', 'Leucin', 'Metionin / Cystein', 'Glutamin', 'Asparagin'],
    chart3Dataset1Label: 'Suchý Pyl Melipony',
    chart3Dataset2Label: 'Vaječný Bílek',
    chart3Dataset3Label: 'Syrovátkový Protein',
    arginineTitle: "Šampión v Argininu",
    arginineText: "Suchý pyl Melipony obsahuje 13.3g Argininu na 100g bílkovin, což je více než dvojnásobek vaječného bílku (5.9g) a téměř pětinásobek syrovátkového proteinu (2.9g).",
    methionineTitle: "Zázrak Metioninu",
    methionineText: "S obsahem 7.8g Metioninu/Cysteinu vlhký pyl výrazně překonává černé fazole (1.9g) a syrovátku (3.1g), díky čemuž je vynikajícím přírodním regenerátorem buněk.",
    galleryTitle: "Život v Sanktuáriu",
    gallerySub: "Vizuální pohled na naši výzkumnou návštěvu v U Náajil Yuum K'iin (Maní, Yucatán), dokumentující tradiční infrastrukturu chovu včel, kterou replikujeme v sanktuáriu Chiich Kaab v Hacienda Villa Luna.",
    filterAll: "Všechny Obrázky",
    filterBees: "Včely (Xunán Kab)",
    filterHives: "Tradiční Úly",
    filterLife: "Život v Sanktuáriu",
    wisdomTitle: "Mayská Moudrost a Svědectví",
    wisdomAhMuzenkab: "V Chiich Kaab uctíváme let Xunán Kab ne jako pouhý biologický fakt, ale jako posvátný cyklus řízený Ah Muzenkabem. Jako mayský bůh včel a medu je strážcem svatého letu a ochráncem životních sil v jobonu. Sloužíme jako pozemští strážci této moudrosti v Hacienda Villa Luna (Mocochá) pod vedením zkušeností a vize dona Luise Quintala z U Náajil Yuum K'iin (Maní, Yucatán).",
    wisdomSections: [
      { title: "Don Luis Quintal", subtitle: "Mistr Včelař", content: "Množství je cílem lidí, kteří nerozumí medicíně. Jejich med není jen cukr... je to krev lesu." },
      { title: "Dr. Sofia Mendez", subtitle: "Ekoložka", content: "Melipona beecheii je klíčovým druhem. Bez jejich specializovaného opylení by se léčivé stromy v korunách yucatánského lesa přestaly rozmnožovat." },
      { title: "Doña Maria", subtitle: "X'men (Mayská Léčitelka)", content: "Med z jobonu není jídlo; je to lék. Nese v sobě ducha lesní flóry, používaný po generace k léčení očí a duše." },
      { title: "Tým Obnovy", subtitle: "Hacienda Villa Luna (Mocochá)", content: "Zalesňováním původních stromů bohatých na nektar, jako jsou Ramón, Chacá a Dzidzilché, obnovujeme starodávné biologické koridory pro Xunán Kab." }
    ],
    healingTitle: "Léčivé Protokoly Uzdravení",
    healingSub: "Klinické aplikace medu Xunán Kab, potvrzené tradiční mayskou medicínou a současnou vědou.",
    protocols: [
      { title: "Silný Antibakteriální Účinek", subtitle: "Zánět Spojivek a Vředy", text: "Med z melipony eliminuje bakterie generováním přírodního peroxidu vodíku a využíváním vysoké úrovně flavonoidů k rozkladu buněčných stěn bakterií. Studie ukazují, že je stejně účinný jako Gentamicin při zkracování bakteriálního zánětu spojivek." },
      { title: "Léčba Těžkého Suchého Oka", subtitle: "Keratokonjunktivitida", text: "Jeho hygroskopická povaha aktivně přitahuje vlhkost a zároveň drasticky snižuje prozánětlivé markery, které způsobují zarudnutí a pálení." },
      { title: "Tradiční Tvrzení", subtitle: "Šedý Zákal a Pterygium", text: "Bohatý obsah antioxidantů pomáhá oddálit progresi zakalení čočky. Poznámka: Věda neprokázala, že dokáže zcela zvrátit plně vyvinutý šedý zákat u lidí." },
      { title: "Aplikace - Očekávejte Pálení", subtitle: "Smyslová Odezva", text: "Zakloňte hlavu, stáhněte dolní víčko a aplikujte 1 až 2 kapky. I když je med zředěný, způsobuje ostré, intenzivní pálení trvající 30 až 60 sekund. To vyvolává silné slzení, což je normální, nezbytná reakce k propláchnutí povrchu oka." }
    ],
    aboutTitle: "O Nás",
    aboutSub: "Seznamte se s týmem stojícím za záchranným sanktuáriem v Hacienda Villa Luna.",
    aboutIntro: "Vítejte v Chiich Kaab, meliponárním sanktuáriu nacházejícím se v Hacienda Villa Luna. Jsme skupina nadšených lidí spojených touhou uskutečnit projekt, který přesahuje komerční rozměr a stává se odkazem lásky, uzdravení a zachování naší kultury předků.",
    team: [
      {
        name: "Dra. Mya Parra Perera",
        role: "Spoluzakladatelka a ředitelka pro zdraví",
        image: "/website images/Dra. Mya Parra.jpeg",
        bio: "Lékařka věnující se péči o seniory, umělkyně, malířka a milovnice hudby. Mya vede toto dobrodružství s vizí spojující zdraví, umění a přírodu. Jejím závazkem není pouze vytvoření projektu, ale také otevření prostoru pro setkávání těch, kteří chtějí objevovat bohatství včel melipona a ctít mayské dědictví."
      },
      {
        name: "Andrés Fernando Navarrete Parra",
        role: "Spoluzakladatel a kulturní ředitel",
        image: "/website images/Andres Navarrete.jpeg",
        bio: "Hudebník, skladatel a duchovní průvodce. Andrés je neúnavným badatelem v oblasti mayské kultury, její historie, předků a světonázoru. Jeho úkolem je předávat duchovní hloubku tohoto dědictví. Učí nás, že potrava produkovaná meliponami je darem nejen pro uzdravení těla, ale také duchovním elixírem, který dokáže uzdravit a vyživit domovy po celém světě."
      },
      {
        name: "Luis Fernando Martínez Chávez",
        role: "Spoluzakladatel a ředitel pro marketing",
        image: "/website images/Luis Martinez.jpeg",
        bio: "Podnikatel a odborník na marketing a public relations. Luis je vizuálním architektem naší prezentace. Proměňuje naši podstatu v estetický zážitek a dbá o každý detail image Chiich Kaab, aby naše poslání oslovilo co nejvíce srdcí prostřednictvím krásné digitální prezentace v souladu s našimi hodnotami."
      }
    ],
    groundsTitle: "Pozemky Sanktuária v Hacienda Villa Luna",
    groundsSub: "Vizuální pohled na naši fyzickou lokaci v Mocochá, kde chováme posvátnou Xunán Kab.",
    donateTitle: "Staňte se Strážcem Xunán Kab",
    donateText: "Podporou záchranného sanktuária Chiich Kaab v Hacienda Villa Luna (Mocochá, Yucatán), v aktivní spolupráci s tradičním meliponářem dona Luise v Maní, přímo financujete záchranu poškozených divokých úlů, zalesňování původních léčivých stromů a zachování posvátné mayské herbológie.",
    donateCTA: "Darovat Sanktuáriu",
    donateSim: "Spustit Simulátor",
    contactTitle: "Spojte se se Sanktuáriem",
    contactSub: "Obraťte se na nás, pokud se chcete připojit k naší síti dobrovoníků, naplánovat si vzdělávací návštěvu našeho sanktuária v Mocochá nebo se dozvědět více o biokulturní ochraně.",
    namePlaceholder: "Vaše Jméno",
    emailPlaceholder: "Váš E-mail",
    messagePlaceholder: "Zpráva",
    sendBtn: "Odeslat Zprávu",
    sendBtnSuccess: "Zpráva Odeslána",
    footerDesc: "Věnováno ochraně včely Melipona beecheii a mayského biokulturního dědictví v Hacienda Villa Luna (Mocochá, Yucatán).",
    footerLocation: "Hacienda Villa Luna — Mocochá, Yucatán, Mexiko",
    footerCopyright: "© 2026 Chiich Kaab. Všechna práva vyhrazena.",
    gallery: {
      guard: { title: "Strážní Centinel", description: "U Náajil Yuum K'iin - Jedna dělnice Xunán Kab bránící úzký vchod do tradičního cédrového úlu jobón." },
      stewardship: { title: "Generace Ochránců", description: "U Náajil Yuum K'iin - Andrés Navarrete a Don Luis Quintal, mistr včelař s více než 30 lety zkušeností, při kontrole." },
      casita: { title: "Prastarý Meliponář", description: "U Náajil Yuum K'iin - Tradiční kmenové úly bezpečně uspořádané pod ochranným stínem doškové střechy z palmy guano." },
      setup: { title: "Úl z Kmene Guano", description: "U Náajil Yuum K'iin - Tradiční instalace jobónu zobrazující dutý kmen zavěšený kvůli ochraně před škůdci." },
      inside1: { title: "Zásobní Nádoby z Vosku", description: "U Náajil Yuum K'iin - Makro pohled do vnitra kmene jobón zobrazující složitou organickou strukturu voskových nádob s medem a pylem." },
      inside2: { title: "Plásty s Plodem a Larvy", description: "U Náajil Yuum K'iin - Horizontální plásty, kde královna klade vajíčka, obklopené ochrannými komorami na zásoby jídla." },
      home1: { title: "Tradiční Přístřešky Guano", description: "U Náajil Yuum K'iin - Úly z dutých kmenů stromů uspořádané horizontálně, aby napodobovaly přirozená místa k hnízdění." },
      home2: { title: "Sanctuary Nesting Site", description: "U Náajil Yuum K'iin - Zarovnaná řada kmenů jobón poskytující stabilní teplotu a vlhkost pro chovné kolonie." },
      andres1: { title: "Věda o Meliponikultuře", description: "U Náajil Yuum K'iin - Andrés kontrolující zdraví divokého úlu a monitorující chování včel při hledání potravy." },
      andres2: { title: "Péče o Sanktuárium", description: "U Náajil Yuum K'iin - Pečlivá kontrola vnějšího těsnění kmenových úlů k zajištění úplné ochrany před predátory." },
      andres3: { title: "Zachování Prastarých Znalostí", description: "U Náajil Yuum K'iin - Předávání starodávných ústních tradic a specializovaných technik mayského včelařství." },
      guardiana1: { title: "Strážkyně Brány", description: "U Náajil Yuum K'iin - Strážní včela stojící u úzkého vchodového otvoru, která zabraňuje vstupu cizímu hmyzu." },
      guardiana2: { title: "Stráž na Vchodu", description: "U Náajil Yuum K'iin - Včely shromažďující se u vchodu, aby regulovaly vnitřní větrání úlu a koordinovaly lety za potravou." },
      guardiana3: { title: "Příprava na Let", description: "U Náajil Yuum K'iin - Dělnice Xunán Kab zahřívající své svaly před odletem za lesními květy." },
      guardians: { title: "Ochránci Sanktuária", description: "U Náajil Yuum K'iin - Jemné bezžihadlové včely Melipona beecheii, které udržují ekosystémy Yucatánu již více než 3000 let." },
      queen1: { title: "Včelí Královná", description: "U Náajil Yuum K'iin - Královna Melipona obklopená dělnicemi uvnitř tmavého dutého kmene." },
      queen2: { title: "Matka Královná (Matriarcha)", description: "U Náajil Yuum K'iin - Královna úlu, těhotná 6 let, s zakrslými křídly a příliš velká na to, aby opustila kmen." },
      inside3: { title: "Vnitřní Architektura", description: "U Náajil Yuum K'iin - Pohled do vnitra kmene jobón detailně zobrazující voskové nádoby na jídlo a plásty s plodem." }
    },
    grounds: {
      ground1: "Svěží zahrady obklopující budovu sanktuária v Mocochá.",
      ground2: "Historické zdi haciendy a stezky vedoucí k meliponáři.",
      ground3: "Obnovené kamenné konstrukce ukrývající tradiční kmenové úly jobón.",
      ground4: "Chráněné zahrady pod korunami stromů, kde včely Xunán Kab hledají divoké květy.",
      ground5: "Přístřešek pro meliponář umístěný pod původními stromy v Hacienda Villa Luna.",
      ground6: "Západ slunce nad klidnými zahradami našeho záchranného sanktuária."
    }
  }
};

export default function Website({ onPlayGame, lang = 'EN', setLang }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const t = locales[lang] || locales.EN;
  const navAnchors = ['mission', 'biodiversity', 'sanctuary-life', 'mayan-wisdom', 'healing-protocols', 'about-us', 'donate'];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
  };

  const getBenefitIcon = (idx) => {
    switch (idx) {
      case 0: return <Sparkles className="w-8 h-8 text-[#f59e0b]" />;
      case 1: return <Leaf className="w-8 h-8 text-[#f59e0b]" />;
      case 2: return <Hexagon className="w-8 h-8 text-[#f59e0b]" />;
      case 3: return <Droplet className="w-8 h-8 text-[#f59e0b]" />;
      default: return <Sparkles className="w-8 h-8 text-[#f59e0b]" />;
    }
  };

  const ChiichKaabLogo = () => (
    <div className="flex items-center gap-3 select-none">
      <img 
        src="/Chiich Kaab logo.png" 
        alt="Chiich Kaab Logo" 
        className="w-12 h-12 object-contain"
      />
      <div className="flex flex-col">
        <span className="font-serif text-xl tracking-widest text-[#022c22] font-black leading-none">CHIICH KAAB</span>
        <span className="text-[0.6rem] tracking-[0.25em] text-[#f59e0b] uppercase font-semibold mt-1">Sanctuary · Mocochá, Yucatán</span>
      </div>
    </div>
  );

  const EcologySection = () => (
    <section id="mayan-wisdom" className="py-24 bg-[#fafaf9] border-t border-[#022c22]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-[#022c22] mb-4 font-bold">{t.wisdomTitle}</h2>
          <div className="w-24 h-1 bg-[#f59e0b] mx-auto rounded-full mb-8"></div>
          
          {/* Ah Muzenkab Sacred Attribution Statement */}
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-3xl border border-[#022c22]/10 shadow-sm border-t-4 border-[#f59e0b] text-left mt-6">
            <div className="text-[#f59e0b] text-3xl mb-3 font-serif font-semibold">Ah Muzenkab</div>
            <p className="text-[#022c22] font-light leading-relaxed text-base md:text-lg italic font-serif">
              "{t.wisdomAhMuzenkab}"
            </p>
          </div>
        </div>

        {/* Testimonials Quote Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.wisdomSections.map((section, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-[#022c22]/10 hover:border-[#f59e0b]/50 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-[#022c22]">
                <Quote className="w-24 h-24 transform rotate-180" />
              </div>
              <div className="relative z-10">
                <p className="text-[#022c22]/80 font-light italic leading-relaxed text-lg mb-6">
                  "{section.content}"
                </p>
                <div className="flex flex-col">
                  <h4 className="text-lg font-serif text-[#022c22] font-bold">{section.title}</h4>
                  <span className="text-xs font-mono text-[#f59e0b] uppercase tracking-wider font-semibold mt-0.5">{section.subtitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const HealingProtocolsSection = () => (
    <section id="healing-protocols" className="py-24 bg-white border-t border-[#022c22]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif text-[#022c22] mb-4 font-bold">{t.healingTitle}</h2>
          <div className="w-24 h-1 bg-[#f59e0b] mx-auto rounded-full mb-6"></div>
          <p className="text-stone-600 font-light text-base md:text-lg leading-relaxed">
            {t.healingSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.protocols.map((protocol, idx) => (
            <div 
              key={idx} 
              className="bg-[#fafaf9] p-8 rounded-3xl border border-[#022c22]/10 hover:border-[#f59e0b]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#022c22] text-[#f59e0b] flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-serif text-[#022c22] font-bold">{protocol.title}</h3>
                </div>
                <h4 className="text-xs font-mono text-[#f59e0b] uppercase tracking-wider font-semibold mb-4 pl-11">
                  {protocol.subtitle}
                </h4>
                <p className="text-stone-600 font-light text-sm leading-relaxed pl-11">
                  {protocol.text}
                </p>
              </div>
              {idx === 3 && (
                <div className="mt-6 ml-11 bg-white rounded-xl p-4 text-xs font-mono text-[#022c22]/80 border border-[#022c22]/5">
                  <strong>Notice:</strong> This is a standard physiological reaction to the high osmotic pressure of pure Melipona honey.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const AboutUsSection = () => (
    <section id="about-us" className="py-24 bg-[#fafaf9] border-t border-[#022c22]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif text-[#022c22] mb-4 font-bold">{t.aboutTitle}</h2>
          <div className="w-24 h-1 bg-[#f59e0b] mx-auto rounded-full mb-6"></div>
          <p className="text-stone-600 font-light text-base md:text-lg leading-relaxed">
            {t.aboutSub}
          </p>
        </div>

        {/* Welcome Intro Banner */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#022c22]/10 shadow-sm max-w-4xl mx-auto mb-16 text-center">
          <p className="text-[#022c22]/85 font-light leading-relaxed text-base md:text-lg italic font-serif">
            "{t.aboutIntro}"
          </p>
        </div>

        {/* Co-founder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {t.team.map((member, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl overflow-hidden border border-[#022c22]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center p-8 text-center"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-2 border-[#f59e0b]/30 shadow-md">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-serif text-[#022c22] font-bold mb-1">{member.name}</h3>
              <span className="text-xs font-mono text-[#f59e0b] uppercase tracking-wider font-semibold mb-4">{member.role}</span>
              <p className="text-stone-600 font-light text-xs sm:text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Grounds Gallery */}
        <div className="border-t border-[#022c22]/10 pt-16">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-serif text-[#022c22] font-bold mb-4">{t.groundsTitle}</h3>
            <p className="text-stone-600 font-light text-sm md:text-base leading-relaxed">
              {t.groundsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groundsImages.map((img, idx) => (
              <div 
                key={idx} 
                className="group relative bg-[#fafaf9] rounded-2xl border border-[#022c22]/10 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img 
                    src={img.path} 
                    alt={`Grounds ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-white border-t border-[#022c22]/5">
                  <p className="text-xs text-stone-600 font-light italic">
                    {t.grounds[img.id]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#022c22]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/95 backdrop-blur-md border-b border-emerald-950/10 transition-all py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <ChiichKaabLogo />

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6 border-r border-[#022c22]/10 pr-6 mr-2">
              {t.nav.map((item, idx) => (
                <a 
                  key={idx} 
                  href={`#${navAnchors[idx]}`} 
                  className="text-xs font-bold hover:text-[#f59e0b] transition-colors uppercase tracking-widest text-[#022c22]/80"
                >
                  {item}
                </a>
              ))}
            </div>
            
            {/* Desktop Language Selector */}
            <div className="flex items-center gap-1.5 bg-[#022c22]/5 p-1 rounded-full border border-[#022c22]/5">
              {['EN', 'ES', 'SK', 'DE', 'CS'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                    lang === l
                      ? 'bg-[#022c22] text-white shadow-sm'
                      : 'text-[#022c22]/65 hover:text-[#022c22] hover:bg-[#022c22]/5'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button className="lg:hidden text-[#022c22]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#fafaf9] border-b border-[#022c22]/10 py-6 px-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5 duration-300">
            {t.nav.map((item, idx) => (
              <a 
                key={idx} 
                href={`#${navAnchors[idx]}`} 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-sm font-bold hover:text-[#f59e0b] uppercase tracking-widest py-2 border-b border-[#022c22]/5"
              >
                {item}
              </a>
            ))}

            {/* Mobile Language Selector */}
            <div className="flex items-center justify-between bg-[#022c22]/5 p-1.5 rounded-2xl border border-[#022c22]/5 mt-4">
              {['EN', 'ES', 'SK', 'DE', 'CS'].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 text-center rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                    lang === l
                      ? 'bg-[#022c22] text-white shadow-sm'
                      : 'text-[#022c22]/65 hover:text-[#022c22] hover:bg-[#022c22]/5'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-16 overflow-hidden bg-gradient-to-b from-[#fafaf9] via-stone-50 to-[#fafaf9]">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-[#f59e0b]/5 rounded-full filter blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-emerald-900/5 rounded-full filter blur-[150px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Column: Text */}
          <div className="space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/10 backdrop-blur-sm mx-auto lg:mx-0">
              <Award className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-[0.65rem] tracking-[0.25em] text-[#f59e0b] uppercase font-bold">{t.heroTag}</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#022c22] leading-tight font-extrabold">
                {t.heroTitle.split(' ').map((word, i) => (
                  <span key={i} className={word.includes('Sacred') || word.includes('Flight') || word.includes('Sagrado') || word.includes('Vuelo') || word.includes('Svätého') || word.includes('Letu') || word.includes('Heiligen') || word.includes('Fluges') || word.includes('Posvátného') || word.includes('Letu') ? "text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#b45309]" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-sm sm:text-base font-serif italic text-stone-600 font-medium">
                {t.heroSubtitle}
              </p>
            </div>
            <p className="text-base sm:text-lg text-[#022c22]/80 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => {
                  const element = document.getElementById('donate');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="w-full sm:w-auto px-8 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold tracking-wider uppercase text-xs rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
              >
                {t.heroCTA}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: 3D Bee & Portal */}
          <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto z-20 gap-6">
            {/* Isolated 3D Canvas viewport container with explicit bounds */}
            <div className="w-full h-72 sm:h-[350px] relative z-10">
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="w-full h-full">
                <Environment preset="city" />
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={2} />
                <PresentationControls 
                  global 
                  config={{ mass: 1, tension: 170, friction: 26 }} 
                  snap={false}
                  rotation={[0.1, -0.3, 0]} 
                  polar={[-Math.PI, Math.PI]}
                  azimuth={[-Infinity, Infinity]}
                >
                  <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
                    <group 
                      onPointerOver={() => { document.body.style.cursor = 'pointer'; }} 
                      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                      scale={[1.8, 1.8, 1.8]}
                      rotation={[0, Math.PI, 0]}
                    >
                      <DetailedDefenseBee faceCamera={false} />
                    </group>
                  </Float>
                </PresentationControls>
              </Canvas>
            </div>

            {/* Mayan Temple Archway - z-indexed and layered below/behind interaction bounds */}
            <div className="hidden lg:flex flex-col items-center justify-center w-full relative z-20 max-w-xs mx-auto">
              <div className="relative w-full aspect-[3/4] flex flex-col items-center justify-end group rounded-t-full overflow-hidden shadow-2xl border border-[#022c22]/10 transition-transform duration-500 hover:scale-[1.03] cursor-pointer">
                <img 
                  src="./mayan_portal.png" 
                  alt="Sacred Mayan Temple Portal" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/10 via-[#022c22]/40 to-[#022c22]/90 pointer-events-none"></div>

                {/* Portal Interior Text Area */}
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full pb-8">
                  <h3 className="text-2xl font-serif text-[#f59e0b] mb-2 font-bold z-10">Interactive Temple</h3>
                  <p className="text-white/80 text-[0.75rem] mb-5 z-10 leading-relaxed font-light">Enter the sacred realm of the Xunán Kab. Manage the swarm, fly through the canopy, and defend the hive.</p>
                  <button onClick={() => onPlayGame('tutorial')} className="px-5 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold uppercase tracking-widest text-[0.65rem] rounded-full transition-all shadow-md z-10 hover:scale-105 flex items-center gap-2 cursor-pointer">
                    <Globe2 className="w-3.5 h-3.5" /> Enter Game
                  </button>
                  <div className="mt-4 z-10">
                    <span className="text-amber-300 text-[0.55rem] uppercase tracking-widest font-semibold opacity-90">
                      WASD · E/Shift · Click
                    </span>
                  </div>
                </div>
              </div>

              {/* Temple Base */}
              <div className="relative w-[106%] h-5 bg-[#022c22] border-x border-t border-[#022c22]/20 z-30 shadow-md flex justify-center items-center rounded-t-sm">
                <Hexagon className="w-2.5 h-2.5 text-[#f59e0b]/40" />
              </div>
              <div className="relative w-[114%] h-5 bg-emerald-950 border-x border-t border-emerald-900/20 z-30 shadow-md rounded-t-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ANCESTRAL MANIFESTO SECTION */}
      <section className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="font-serif text-3xl md:text-5xl text-emerald-950 font-bold mb-8 text-center tracking-wide">
            {t.manifestoTitle}
          </h2>
          
          <p className="text-stone-700 font-light leading-relaxed text-lg mb-8 text-center italic">
            {t.manifestoSub}
          </p>

          <div className="space-y-8 text-stone-800 font-light leading-relaxed text-base md:text-lg">
            <div>
              <h3 className="font-serif text-xl md:text-2xl text-emerald-900 font-semibold mb-3">
                {t.manifestoSec1Title}
              </h3>
              <p>
                {t.manifestoSec1Text}
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl md:text-2xl text-emerald-900 font-semibold mb-3">
                {t.manifestoSec2Title}
              </h3>
              <p className="mb-4">
                {t.manifestoSec2Text}
              </p>
              <p className="mb-4 font-normal text-emerald-950">
                {t.manifestoSec2SubText}
              </p>
              <ul className="list-none space-y-3 pl-2 border-l-2 border-amber-500">
                {t.manifestoSec2Points.map((pt, i) => (
                  <li key={i}>
                    <span className="font-semibold text-emerald-950">{pt.label}:</span> {pt.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-serif text-xl md:text-2xl text-emerald-900 font-semibold mb-3">
                {t.manifestoSec3Title}
              </h3>
              <p>
                {t.manifestoSec3Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 0: Stewardship Pledge & Jobón Gallery */}
      <section id="mission" className="py-24 bg-[#fafaf9] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#022c22]/5 text-[#022c22] font-mono text-[0.65rem] tracking-wider uppercase font-semibold">
                <Leaf className="w-3.5 h-3.5 text-[#022c22]" /> Sanctuary Stewardship
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-[#022c22] font-bold leading-tight">{t.originsTitle}</h2>
              <div className="w-20 h-1 bg-[#f59e0b] rounded-full"></div>
            </div>
            <div className="lg:col-span-5 text-[#022c22]/80 font-light leading-relaxed space-y-4 text-base md:text-lg">
              <p>{t.originsText1}</p>
              <p>{t.originsText2}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaticPlacemat
              imageSrc="/website images/Jobones en Casita de Guano.jpeg"
              label={t.placemat1Label}
              subLabel={t.placemat1Sub}
            />
            <StaticPlacemat
              imageSrc="/website images/The inside of a Jobon.jpeg"
              label={t.placemat2Label}
              subLabel={t.placemat2Sub}
            />
            <StaticPlacemat
              imageSrc="/website images/Melipona guardian.jpeg"
              label={t.placemat3Label}
              subLabel={t.placemat3Sub}
            />
          </div>
        </div>
      </section>

      {/* Section 1: Biodiversity Matrix */}
      <section id="biodiversity" className="py-24 bg-white border-t border-[#022c22]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#022c22] mb-4 font-bold">{t.benefitsTitle}</h2>
            <div className="w-24 h-1 bg-[#f59e0b] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-[#fafaf9] p-8 rounded-2xl border border-[#022c22]/10 hover:border-[#f59e0b]/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="mb-6 bg-[#022c22]/5 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {getBenefitIcon(idx)}
                </div>
                <h3 className="text-xl font-serif text-[#022c22] font-bold mb-1">{benefit.title}</h3>
                <p className="text-xs font-mono text-[#f59e0b] uppercase tracking-wider font-semibold mb-4">{benefit.subtitle}</p>
                <p className="text-[#022c22]/75 font-light text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* SCIENTIFIC METRICS DASHBOARD */}
          <div className="mt-20 border-t border-[#022c22]/10 pt-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-2xl md:text-4xl font-serif text-[#022c22] font-bold mb-4">{t.metricsTitle}</h3>
              <p className="text-[#022c22]/80 font-light text-sm md:text-base leading-relaxed">
                {t.metricsSub}
              </p>
            </div>

            <div className="space-y-16">
              {/* Chart 1: The Preservation Crisis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#fafaf9] p-8 md:p-10 rounded-3xl border border-[#022c22]/10 shadow-sm">
                <div className="w-full max-w-[600px] mx-auto bg-white p-6 rounded-2xl border border-stone-200/50 shadow-inner">
                  <ChartComponent 
                    type="bar"
                    data={{
                      labels: t.chart1Labels.map(l => wrapLabel(l, 16)),
                      datasets: [{
                        label: t.chart1DatasetLabel,
                        data: [14000, 700],
                        backgroundColor: ['#e2e8f0', '#f59e0b'],
                        borderRadius: 6
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                        x: { grid: { display: false } }
                      }
                    }}
                    height="320px"
                  />
                </div>
                <div className="space-y-6">
                  <h4 className="text-2xl font-serif font-bold text-[#022c22]">{t.chart1Title}</h4>
                  <p className="text-stone-600 font-light leading-relaxed text-sm md:text-base">
                    {t.chart1Text1}
                  </p>
                  <p className="text-stone-600 font-light leading-relaxed text-sm md:text-base">
                    {t.chart1Text2}
                  </p>
                  <div className="bg-white p-6 rounded-xl border-l-4 border-[#f59e0b] shadow-sm italic">
                    <p className="text-sm font-serif text-[#022c22] leading-relaxed">
                      {t.chart1Quote}
                    </p>
                    <span className="text-[0.65rem] uppercase font-mono tracking-wider text-[#f59e0b] font-bold block mt-2">— {t.chart1Citation}</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: The 61-Day Rhythm & Hive Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#fafaf9] p-8 md:p-10 rounded-3xl border border-[#022c22]/10 shadow-sm">
                <div className="space-y-6 order-2 lg:order-1">
                  <h4 className="text-2xl font-serif font-bold text-[#022c22]">{t.chart2Title}</h4>
                  <p className="text-stone-600 font-light leading-relaxed text-sm md:text-base">
                    {t.chart2Text1}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm text-center">
                      <div className="text-xl font-serif font-bold text-[#022c22]">61 Days</div>
                      <div className="text-[0.55rem] uppercase tracking-wider text-[#f59e0b] font-bold mt-1">{t.chart2Gestation}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm text-center">
                      <div className="text-xl font-serif font-bold text-[#022c22]">61 Days</div>
                      <div className="text-[0.55rem] uppercase tracking-wider text-[#f59e0b] font-bold mt-1">{t.chart2Worker}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm text-center">
                      <div className="text-xl font-serif font-bold text-[#10b981]">6 Years</div>
                      <div className="text-[0.55rem] uppercase tracking-wider text-[#10b981] font-bold mt-1">{t.chart2Queen}</div>
                    </div>
                  </div>
                  <div className="text-xs text-stone-500 font-light leading-relaxed">
                    {t.chart2Text2}
                  </div>
                </div>
                <div className="w-full max-w-[600px] mx-auto bg-white p-6 rounded-2xl border border-stone-200/50 shadow-inner order-1 lg:order-2">
                  <ChartComponent 
                    type="doughnut"
                    data={{
                      labels: t.chart2Labels.map(l => wrapLabel(l, 16)),
                      datasets: [{
                        data: [3000, 1200, 32],
                        backgroundColor: ['#f59e0b', '#10b981', '#022c22'],
                        borderWidth: 0,
                        hoverOffset: 4
                      }]
                    }}
                    options={{
                      cutout: '70%',
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                    height="320px"
                  />
                </div>
              </div>

              {/* Chart 3: Nutritional Superiority of Melipona Pollen */}
              <div className="bg-[#fafaf9] p-8 md:p-10 rounded-3xl border border-[#022c22]/10 shadow-sm flex flex-col items-center">
                <h4 className="text-2xl font-serif font-bold text-[#022c22] mb-6 text-center">{t.chart3Title}</h4>
                <p className="text-stone-600 font-light text-center max-w-2xl text-sm md:text-base mb-8 leading-relaxed">
                  {t.chart3Sub}
                </p>
                <div className="w-full max-w-[600px] bg-white p-6 rounded-2xl border border-stone-200/50 shadow-inner mb-8">
                  <ChartComponent 
                    type="bar"
                    data={{
                      labels: t.chart3Labels.map(l => wrapLabel(l, 16)),
                      datasets: [
                        {
                          label: t.chart3Dataset1Label,
                          data: [13.3, 9.3, 7.3, 15.6, 9.4],
                          backgroundColor: '#f59e0b',
                          borderRadius: 4
                        },
                        {
                          label: t.chart3Dataset2Label,
                          data: [5.9, 9.9, 5.4, 15.7, 9.2],
                          backgroundColor: '#e2e8f0',
                          borderRadius: 4
                        },
                        {
                          label: t.chart3Dataset3Label,
                          data: [2.9, 15.2, 3.1, 18.4, 11.3],
                          backgroundColor: '#10b981',
                          borderRadius: 4
                        }
                      ]
                    }}
                    options={{
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true, 
                          title: { display: true, text: 'Grams per 100g of Protein', font: { size: 10 } },
                          grid: { color: '#f3f4f6' }
                        },
                        x: { grid: { display: false } }
                      }
                    }}
                    height="350px"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-sm border-l-4 border-[#10b981]">
                    <h5 className="font-bold text-[#022c22] text-base mb-2">{t.arginineTitle}</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">{t.arginineText}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-sm border-l-4 border-[#f59e0b]">
                    <h5 className="font-bold text-[#022c22] text-base mb-2">{t.methionineTitle}</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">{t.methionineText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SANCTUARY LIFE GALLERY */}
      <section id="sanctuary-life" className="py-24 bg-[#fafaf9] border-t border-[#022c22]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-5xl text-[#022c22] font-bold mb-4">
              {t.galleryTitle}
            </h2>
            <p className="text-stone-600 font-light text-base md:text-lg">
              {t.gallerySub}
            </p>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['all', 'bees', 'hives', 'life'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-emerald-950 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-[#022c22]'
                }`}
              >
                {filter === 'all' ? t.filterAll : filter === 'bees' ? t.filterBees : filter === 'hives' ? t.filterHives : t.filterLife}
              </button>
            ))}
          </div>

          {/* INTERACTIVE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sanctuaryImages
              .filter(img => activeFilter === 'all' || img.category === activeFilter)
              .map((img, index) => {
                const originalIndex = sanctuaryImages.findIndex(i => i.path === img.path);
                const imgMeta = t.gallery[img.id] || { title: '', description: '' };
                return (
                  <div
                    key={index}
                    onClick={() => setActiveImageIndex(originalIndex)}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/60 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative">
                      <img
                        src={img.path}
                        alt={imgMeta.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h4 className="font-serif text-lg text-[#022c22] font-bold mb-1">{imgMeta.title}</h4>
                      <p className="text-[#022c22]/70 font-light text-xs italic line-clamp-2">{imgMeta.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Section 3: Ecology (Wisdom of the Jobón Testimonials) */}
      <EcologySection />

      {/* Section 4: Healing Protocols */}
      <HealingProtocolsSection />

      {/* Section 5: About Us */}
      <AboutUsSection />

      {/* Section 6: GoFundMe Donation Hub */}
      <section id="donate" className="py-24 bg-white border-t border-[#022c22]/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="py-20 bg-gradient-to-b from-[#022c22] to-emerald-950 text-stone-100 rounded-3xl border border-emerald-800/40 relative overflow-hidden shadow-2xl px-6 md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08)_0,transparent_60%)] pointer-events-none"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] mx-auto animate-pulse">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-white font-bold leading-tight">{t.donateTitle}</h2>
              <p className="max-w-2xl mx-auto text-stone-300 font-light leading-relaxed text-base md:text-lg">
                {t.donateText}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full pt-4">
                <a 
                  href="https://www.gofundme.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto px-8 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold tracking-wider uppercase text-xs rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                >
                  {t.donateCTA}
                </a>
                <button 
                  onClick={() => onPlayGame('tutorial')} 
                  className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 border-2 border-white/20 hover:border-white text-white font-bold tracking-wider uppercase text-xs rounded-full transition-all duration-300 text-center cursor-pointer"
                >
                  {t.donateSim}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form Container */}
          <div className="mt-20 max-w-2xl mx-auto bg-[#fafaf9] p-8 md:p-10 rounded-2xl border border-[#022c22]/10 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-serif text-[#022c22] font-bold text-center mb-2">{t.contactTitle}</h3>
            <p className="text-sm text-[#022c22]/70 text-center font-light leading-relaxed mb-8 max-w-md mx-auto">{t.contactSub}</p>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-[#022c22] font-bold">{t.namePlaceholder}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#022c22]/10 bg-white focus:outline-none focus:border-[#f59e0b] text-[#022c22] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-[#022c22] font-bold">{t.emailPlaceholder}</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#022c22]/10 bg-white focus:outline-none focus:border-[#f59e0b] text-[#022c22] transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-mono uppercase tracking-wider text-[#022c22] font-bold">{t.messagePlaceholder}</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#022c22]/10 bg-white focus:outline-none focus:border-[#f59e0b] text-[#022c22] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitted}
                className="w-full py-4 bg-[#022c22] hover:bg-[#044c3c] text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {formSubmitted ? t.sendBtnSuccess : t.sendBtn}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#022c22] text-stone-300 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 select-none">
              <img 
                src="/Chiich Kaab logo.png" 
                alt="Chiich Kaab Logo" 
                className="w-10 h-10 object-contain invert brightness-0"
              />
              <span className="font-serif text-lg tracking-widest text-white font-black">CHIICH KAAB</span>
            </div>
            <p className="text-xs text-stone-400 font-light max-w-sm mx-auto md:mx-0">
              {t.footerDesc}
            </p>
          </div>
          <div className="text-center md:text-right space-y-3 font-light text-xs text-stone-400">
            <p className="font-serif text-sm text-white font-semibold">Chiich Kaab Sanctuary</p>
            <p>{t.footerLocation}</p>
            <p className="pt-4 border-t border-emerald-900/30">{t.footerCopyright}</p>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX MODAL CONTAINER */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-md flex flex-col justify-between p-6 animate-fadeIn">
          {/* Close Button Top Right */}
          <button 
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 z-50 text-stone-400 hover:text-white p-2 transition-colors text-xs uppercase tracking-widest cursor-pointer"
          >
            ✕ Close (ESC)
          </button>

          {/* Main Viewport Container */}
          <div className="flex-1 flex items-center justify-center relative max-w-5xl mx-auto w-full h-full">
            {/* Navigation Arrows */}
            <button 
              onClick={() => setActiveImageIndex((prev) => (prev === 0 ? sanctuaryImages.length - 1 : prev - 1))}
              className="absolute left-0 p-4 text-white/50 hover:text-white text-2xl transition-colors cursor-pointer z-50"
            >
              ◀
            </button>

            <img 
              src={sanctuaryImages[activeImageIndex].path} 
              alt={(t.gallery[sanctuaryImages[activeImageIndex].id] || {}).title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl select-none"
            />

            <button 
              onClick={() => setActiveImageIndex((prev) => (prev === sanctuaryImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-0 p-4 text-white/50 hover:text-white text-2xl transition-colors cursor-pointer z-50"
            >
              ▶
            </button>
          </div>

          {/* Contextual Typography Area */}
          <div className="max-w-2xl mx-auto text-center pb-8">
            <h3 className="font-serif text-xl md:text-2xl text-white font-bold mb-2">
              {(t.gallery[sanctuaryImages[activeImageIndex].id] || {}).title}
            </h3>
            <p className="text-stone-400 font-light text-sm md:text-base italic leading-relaxed">
              {(t.gallery[sanctuaryImages[activeImageIndex].id] || {}).description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
