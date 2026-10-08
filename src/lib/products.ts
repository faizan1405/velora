import pSerum from "@/assets/p-serum.jpg";
import pCleanser from "@/assets/p-cleanser.jpg";
import pMoisturizer from "@/assets/p-moisturizer.jpg";
import pEssence from "@/assets/p-essence.jpg";
import pNight from "@/assets/p-night.jpg";
import pSpf from "@/assets/p-spf.jpg";
import edApply from "@/assets/ed-apply.jpg";
import edSkin from "@/assets/ed-skin.jpg";
import edPortrait from "@/assets/ed-portrait.jpg";
import edVanity from "@/assets/ed-vanity.jpg";
import texture from "@/assets/texture.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  short: string;
  price: number;
  size: string;
  rating: number;
  reviews: number;
  img: string;
  img2: string;
  gallery: string[];
  description: string;
  benefits: string[];
  ingredients: string;
  howTo: string;
  has3d?: boolean;
};

export const products: Product[] = [
  {
    slug: "radiance-serum",
    name: "Radiance Serum",
    category: "Serum",
    short: "A weightless daily serum for hydrated, luminous, even-looking skin.",
    price: 2499,
    size: "30 ML",
    rating: 4.9,
    reviews: 486,
    img: pSerum,
    img2: edApply,
    gallery: [pSerum, edApply, texture, edSkin],
    description:
      "Our signature serum layers a 2% hyaluronic complex with stabilised 10% vitamin C, 5% niacinamide and a peptide complex. It sinks in within seconds, leaving skin cushioned, brighter and visibly smoother — never sticky.",
    benefits: ["Deep hydration", "Brighter skin", "Smoother texture", "Barrier support"],
    ingredients:
      "Aqua, Sodium Hyaluronate (2% complex), 3-O-Ethyl Ascorbic Acid (10%), Niacinamide (5%), Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Glycerin, Panthenol, Squalane, Allantoin, Sodium PCA.",
    howTo:
      "Morning and evening, warm 3–4 drops between fingertips and press into clean skin. Follow with moisturiser, and SPF in the morning.",
    has3d: true,
  },
  {
    slug: "hydrating-cleanser",
    name: "Hydrating Cleanser",
    category: "Cleanse",
    short: "A milky gel that lifts the day away without stripping.",
    price: 1299,
    size: "150 ML",
    rating: 4.8,
    reviews: 312,
    img: pCleanser,
    img2: edVanity,
    gallery: [pCleanser, edVanity, texture],
    description:
      "A pH-balanced gel-to-milk cleanser with glycerin and oat lipids that removes sunscreen and impurities while keeping skin soft.",
    benefits: ["Gentle", "Non-stripping", "pH balanced"],
    ingredients: "Aqua, Glycerin, Coco-Glucoside, Avena Sativa Kernel Oil, Panthenol, Allantoin.",
    howTo: "Massage onto damp skin for 30 seconds, then rinse with lukewarm water.",
  },
  {
    slug: "barrier-moisturizer",
    name: "Barrier Moisturizer",
    category: "Moisturise",
    short: "Ceramide-rich cream that seals in every layer beneath it.",
    price: 1899,
    size: "50 ML",
    rating: 4.8,
    reviews: 274,
    img: pMoisturizer,
    img2: texture,
    gallery: [pMoisturizer, texture, edPortrait],
    description:
      "A soft, cushiony cream with three essential ceramides, cholesterol and fatty acids in a skin-identical ratio.",
    benefits: ["Barrier repair", "All-day comfort", "Fragrance free"],
    ingredients: "Aqua, Ceramide NP, Ceramide AP, Ceramide EOP, Cholesterol, Squalane, Shea Butter.",
    howTo: "Apply a pea-sized amount after serum, morning and night.",
  },
  {
    slug: "vitamin-c-essence",
    name: "Vitamin C Essence",
    category: "Essence",
    short: "A golden first-step essence for a brighter, more even tone.",
    price: 2199,
    size: "100 ML",
    rating: 4.7,
    reviews: 198,
    img: pEssence,
    img2: edSkin,
    gallery: [pEssence, edSkin, texture],
    description:
      "A fluid essence with stabilised vitamin C and ferulic acid that preps skin to drink in what comes next.",
    benefits: ["Brightening", "Antioxidant", "Prep step"],
    ingredients: "Aqua, Ascorbyl Glucoside, Ferulic Acid, Glycerin, Citrus Peel Extract.",
    howTo: "Pat a few drops into skin after cleansing, before serum.",
  },
  {
    slug: "overnight-repair-cream",
    name: "Overnight Repair Cream",
    category: "Night",
    short: "A rich nocturnal cream that works while you sleep.",
    price: 2799,
    size: "50 ML",
    rating: 4.9,
    reviews: 221,
    img: pNight,
    img2: edPortrait,
    gallery: [pNight, edPortrait, texture],
    description:
      "Encapsulated retinal and peptides in a velvety balm-cream for smoother, firmer-looking skin by morning.",
    benefits: ["Renewal", "Firming", "Overnight comfort"],
    ingredients: "Aqua, Retinal (encapsulated), Palmitoyl Tripeptide-5, Squalane, Bisabolol.",
    howTo: "Apply as the last step of your evening ritual, 3–4 nights a week to start.",
  },
  {
    slug: "spf-50-sunscreen",
    name: "SPF 50 Sunscreen",
    category: "Protect",
    short: "Invisible daily protection with a soft-focus finish.",
    price: 1499,
    size: "50 ML",
    rating: 4.8,
    reviews: 403,
    img: pSpf,
    img2: edVanity,
    gallery: [pSpf, edVanity, edSkin],
    description:
      "Broad-spectrum SPF 50 PA++++ in a weightless fluid that leaves no white cast on any skin tone.",
    benefits: ["SPF 50 PA++++", "No white cast", "Primer finish"],
    ingredients: "Aqua, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Niacinamide.",
    howTo: "Apply generously as the final morning step. Reapply every two hours outdoors.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const editorial = { edApply, edSkin, edPortrait, edVanity, texture };

export const reviews = [
  { name: "Ananya R.", city: "Mumbai", text: "My skin has never looked this rested. It feels like a glass of water for my face.", rating: 5 },
  { name: "Meera K.", city: "Bengaluru", text: "Two weeks in and my dark spots have softened. The texture is pure silk.", rating: 5 },
  { name: "Riya S.", city: "Delhi", text: "Finally a vitamin C serum that doesn't sting or turn orange. Worth every rupee.", rating: 5 },
  { name: "Kavya P.", city: "Pune", text: "Layers beautifully under makeup. My foundation just sits better now.", rating: 5 },
  { name: "Isha M.", city: "Chennai", text: "The dropper, the glass, the glow. It's become the best part of my morning.", rating: 5 },
];
