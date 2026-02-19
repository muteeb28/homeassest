export type GalleryItem = {
  src: string;
  title: string;
  room: string;
  style: string;
  dims: string;
  rating: number;
  description: string;
  features: string[];
  category: string;
};

export type GalleryCategory = {
  title: string;
  slug: string;
  items: GalleryItem[];
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function findItemBySlug(
  slug: string,
): { item: GalleryItem; category: GalleryCategory } | null {
  for (const cat of GALLERY_CATEGORIES) {
    for (const item of cat.items) {
      if (slugify(item.title) === slug) {
        return { item, category: cat };
      }
    }
  }
  return null;
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  {
    title: "Modular Kitchen Designs",
    slug: "modular-kitchen",
    items: [
      {
        src: "https://super.homelane.com/Modular%20Kitchens/coastal-chic-island-kitchen-white-marble-countertops.webp",
        title: "Coastal Chic Island Kitchen",
        room: "Kitchen",
        style: "Contemporary",
        dims: "10 × 12 ft",
        rating: 4.9,
        category: "Modular Kitchen",
        description:
          "A bright, airy island kitchen that blends coastal whites with warm marble countertops. The open-island layout maximises workflow while creating a natural social hub for family gatherings.",
        features: [
          "Carrara marble island countertop",
          "Handleless shaker-style cabinets",
          "Under-cabinet LED task lighting",
          "Soft-close hinges and drawer runners",
          "Integrated appliance panels",
        ],
      },
      {
        src: "https://super.homelane.com/Modular%20Kitchens/exclusive-modern-l-kitchen-glossy.webp",
        title: "Exclusive Modern L Kitchen",
        room: "Kitchen",
        style: "Glossy Modern",
        dims: "9 × 13 ft",
        rating: 4.8,
        category: "Modular Kitchen",
        description:
          "High-gloss lacquer cabinets in a sleek L-configuration bring a polished, magazine-ready look to everyday cooking. Seamless surfaces and integrated handles keep the aesthetic clean and clutter-free.",
        features: [
          "High-gloss lacquer finish",
          "Integrated stainless steel sink",
          "Recessed ceiling lights",
          "Tall pantry pull-out storage",
          "Quartz worktop with waterfall edge",
        ],
      },
      {
        src: "https://super.homelane.com/Modular%20Kitchens/summer-bloom-l-shaped-kitchen.webp",
        title: "Summer Bloom L-Shaped Kitchen",
        room: "Kitchen",
        style: "Vibrant",
        dims: "11 × 10 ft",
        rating: 4.7,
        category: "Modular Kitchen",
        description:
          "Cheerful colour accents paired with natural wood tones create an energising kitchen that feels like summer all year round. Ideal for compact homes that refuse to compromise on personality.",
        features: [
          "Two-tone cabinet palette",
          "Open floating shelves",
          "Patterned ceramic backsplash",
          "Built-in breakfast counter",
          "Soft-close drawer organisers",
        ],
      },
      {
        src: "https://super.homelane.com/Modular%20Kitchens/mojave-desert-modern-metallic-kitchen-ocean-view.webp",
        title: "Mojave Desert Metallic Kitchen",
        room: "Kitchen",
        style: "Metallic",
        dims: "12 × 11 ft",
        rating: 4.8,
        category: "Modular Kitchen",
        description:
          "Warm desert tones meet brushed-metal hardware for a kitchen that exudes understated luxury. Large windows flood the space with natural light, amplifying the rich tactile finishes.",
        features: [
          "Brushed brass handles and fixtures",
          "Terracotta-toned matte cabinets",
          "Stone-effect laminate worktop",
          "Concealed range hood",
          "Full-height pantry cabinet",
        ],
      },
      {
        src: "https://super.homelane.com/Modular%20Kitchens/contemporary-l-shaped-kitchen-blue-cabinets.webp",
        title: "Contemporary Blue L-Kitchen",
        room: "Kitchen",
        style: "Bold Blue",
        dims: "10 × 12 ft",
        rating: 4.6,
        category: "Modular Kitchen",
        description:
          "Rich navy-blue cabinets anchored by a crisp white countertop deliver maximum visual impact in a classic L-layout. A confident choice for homeowners who want a kitchen that makes a statement.",
        features: [
          "Navy matte-finish lower cabinets",
          "White upper cabinets with glass inserts",
          "Waterfall quartz island",
          "Pendant lighting over island",
          "Pull-out spice and cutlery organisers",
        ],
      },
      {
        src: "https://super.homelane.com/Modular%20Kitchens/sky-blue-straight-kitchen-open-shelves.webp",
        title: "Sky Blue Straight Kitchen",
        room: "Kitchen",
        style: "Open Shelf",
        dims: "8 × 10 ft",
        rating: 4.7,
        category: "Modular Kitchen",
        description:
          "Soft sky-blue tones and open timber shelving keep this straight-line kitchen feeling light and editorial. Perfect for urban apartments where every inch of vertical space counts.",
        features: [
          "Open floating timber shelves",
          "Sky-blue slab cabinet doors",
          "Exposed brick-effect backsplash",
          "Integrated under-bench fridge",
          "Magnetic knife strip and hook rail",
        ],
      },
      {
        src: "https://super.homelane.com/Modular%20Kitchens/dark-phoenix-l-shaped-modular-kitchen-glossy-cabinets.webp",
        title: "Dark Phoenix L-Shaped Kitchen",
        room: "Kitchen",
        style: "Dark Gloss",
        dims: "11 × 12 ft",
        rating: 4.9,
        category: "Modular Kitchen",
        description:
          "A dramatic all-dark palette with high-gloss lacquer cabinets and veined black countertops turns the kitchen into a showstopper. Warm accent lighting prevents the space from feeling heavy.",
        features: [
          "Charcoal high-gloss lacquer cabinets",
          "Veined black quartz worktop",
          "Warm LED strip under cabinets",
          "Integrated oven and microwave tower",
          "Hidden toe-kick drawers",
        ],
      },
    ],
  },
  {
    title: "Living Room Designs",
    slug: "living-room",
    items: [
      {
        src: "https://super.homelane.com/other%20interiors/1681378715189588de527c069-HLKT00000841_batch-3-800x600_8-main.jpg",
        title: "Chic Contrast Open Plan Living",
        room: "Living Room",
        style: "Contemporary",
        dims: "14 × 16 ft",
        rating: 4.9,
        category: "Living Room",
        description:
          "A bold contrast of dark and light surfaces defines this open-plan living area. Statement furniture pieces anchor the space while the open layout encourages effortless flow between zones.",
        features: [
          "Feature wall with fluted wood panelling",
          "Bespoke sofa in bouclé fabric",
          "Recessed ceiling cove lighting",
          "Integrated bookshelf with display niches",
          "Large-format porcelain floor tiles",
        ],
      },
      {
        src: "https://super.homelane.com/other%20interiors/1681378728222c2a97b0b0c0c-HLKT00000841_batch-3-800x600_9-main.jpg",
        title: "Pastel Open Plan Living Room",
        room: "Living Room",
        style: "Open Plan",
        dims: "15 × 14 ft",
        rating: 4.8,
        category: "Living Room",
        description:
          "Soft pastel hues and layered textiles create a serene, welcoming atmosphere in this open-plan living space. The palette encourages relaxation while maintaining a stylish edge.",
        features: [
          "Dusty rose and sage green palette",
          "Linen modular sofa with chaise",
          "Rattan accent chairs",
          "Sheer curtains with blackout lining",
          "Herringbone hardwood floor",
        ],
      },
      {
        src: "https://super.homelane.com/other%20interiors/1681378737474300570b584af-HLKT00000841_batch-3-800x600_10-main.jpg",
        title: "Modern Accent Living Space",
        room: "Living Room",
        style: "Modern",
        dims: "13 × 15 ft",
        rating: 4.7,
        category: "Living Room",
        description:
          "Carefully chosen accent colours and curated décor elevate this modern living room beyond the ordinary. Clean lines and thoughtful storage solutions keep the space uncluttered.",
        features: [
          "Accent wall in deep teal",
          "Low-profile modern sofa set",
          "Geometric coffee table",
          "Built-in media unit with closed storage",
          "Statement pendant light fixture",
        ],
      },
      {
        src: "https://super.homelane.com/products/07dec18/entertainment_unit/5.jpg",
        title: "Oceanus Wall TV Unit Room",
        room: "Living Room",
        style: "Minimalist",
        dims: "12 × 14 ft",
        rating: 4.8,
        category: "Living Room",
        description:
          "The Oceanus wall-mounted TV unit dissolves into the room through clever use of negative space and flush-fit panels. A calm, minimalist backdrop lets your artwork and plants take centre stage.",
        features: [
          "Wall-mounted floating TV unit",
          "Integrated cable management channels",
          "Backlit display shelves",
          "Matching side console units",
          "Matte finish with wood-grain accents",
        ],
      },
      {
        src: "https://super.homelane.com/products/07dec18/entertainment_unit/8.jpg",
        title: "Cronos TV Feature Wall",
        room: "Living Room",
        style: "Contemporary",
        dims: "14 × 16 ft",
        rating: 4.7,
        category: "Living Room",
        description:
          "The Cronos feature wall combines an expansive TV panel with decorative niches and ambient backlighting to create a truly immersive home entertainment experience.",
        features: [
          "Full-height feature wall panel",
          "Ambient LED backlighting",
          "Decorative display niches",
          "Hidden wiring conduits",
          "Soft-close cabinet doors",
        ],
      },
      {
        src: "https://super.homelane.com/products/07dec18/entertainment_unit/3.jpg",
        title: "Aphrodite Entertainment Wall",
        room: "Living Room",
        style: "Classic",
        dims: "12 × 13 ft",
        rating: 4.6,
        category: "Living Room",
        description:
          "Aphrodite's timeless proportions and warm tones deliver a classic entertainment wall that complements both traditional and transitional interiors with effortless grace.",
        features: [
          "Warm walnut veneer finish",
          "Glass-panel display doors",
          "Integrated speaker grille cover",
          "Pull-out bar drawer",
          "Adjustable internal shelving",
        ],
      },
      {
        src: "https://super.homelane.com/products/07dec18/entertainment_unit/13.jpg",
        title: "Poseidon Modern Media Wall",
        room: "Living Room",
        style: "Bold Modern",
        dims: "15 × 16 ft",
        rating: 4.9,
        category: "Living Room",
        description:
          "Poseidon's dramatic scale and dark lacquer finish command attention in any living room. Designed for large spaces, this media wall integrates seamlessly with home-automation systems.",
        features: [
          "Glossy charcoal lacquer panels",
          "Motorised roller-shutter TV compartment",
          "Integrated smart home hub panel",
          "Deep storage drawers with push-open mechanism",
          "Continuous LED strip cove detail",
        ],
      },
    ],
  },
  {
    title: "Wardrobe Designs",
    slug: "wardrobe",
    items: [
      {
        src: "https://super.homelane.com/wardrobes/16812826479900de199faa8ef-HLKT00000836_batch-2-800x600_23-main.jpg",
        title: "Contemporary Oasis Wardrobe",
        room: "Bedroom",
        style: "Contemporary",
        dims: "8 × 10 ft",
        rating: 4.9,
        category: "Wardrobe",
        description:
          "The Oasis wardrobe wraps the bedroom in a warm, contemporary embrace. Thoughtful internal organisation — from hanging rails to velvet-lined jewellery drawers — makes every morning effortless.",
        features: [
          "Full-height sliding mirror doors",
          "Velvet-lined jewellery and accessory drawer",
          "Double hanging rails with belt hooks",
          "Pull-out trouser rack",
          "Soft-close drawer runners throughout",
        ],
      },
      {
        src: "https://super.homelane.com/wardrobes/1681282660140976c0b3fb5ce-HLKT00000836_batch-2-800x600_24-main.jpg",
        title: "Oasis Walk-In Wardrobe",
        room: "Bedroom",
        style: "Luxury",
        dims: "10 × 11 ft",
        rating: 4.8,
        category: "Wardrobe",
        description:
          "Step into a personal boutique with the Oasis walk-in wardrobe. Island dresser, open display shelving, and bespoke lighting transform the dressing routine into a daily ritual.",
        features: [
          "Central island dresser with mirror",
          "LED-lit open shoe display shelves",
          "Colour-coded hanging sections",
          "Pull-out laundry basket",
          "Recessed ceiling downlights with dimmer",
        ],
      },
      {
        src: "https://super.homelane.com/wardrobes/1681282669183a8fff01c67e9-HLKT00000836_batch-2-800x600_25-main.jpg",
        title: "Oasis Bedroom Suite",
        room: "Bedroom",
        style: "Modern",
        dims: "12 × 14 ft",
        rating: 4.7,
        category: "Wardrobe",
        description:
          "The Oasis bedroom suite seamlessly integrates wardrobe storage with headboard panelling and bedside units, delivering a cohesive, hotel-like bedroom environment.",
        features: [
          "Integrated bed-panel and wardrobe system",
          "Bedside niches with USB charging points",
          "Upholstered headboard panel",
          "Under-bed storage drawers",
          "Ambient back-panel lighting",
        ],
      },
      {
        src: "https://super.homelane.com/MAVUWZ5233_srp-1446729327_sicily-straight-wardrobe.jpg",
        title: "Sicily Straight Wardrobe",
        room: "Bedroom",
        style: "Straight",
        dims: "6 × 8 ft",
        rating: 4.6,
        category: "Wardrobe",
        description:
          "Sicily's compact straight form belies a surprisingly spacious interior. Ideal for guest rooms and smaller bedrooms, it packs smart storage into a slender silhouette.",
        features: [
          "Swing-door with full-length mirror",
          "Adjustable internal shelves",
          "Single hanging rail with hooks",
          "Compact shoe rack at base",
          "Laminate finish in natural oak",
        ],
      },
      {
        src: "https://super.homelane.com/MHCYUG5447_srp-1448017011_larissa-straight-wardrobe.jpg",
        title: "Larissa Straight Wardrobe",
        room: "Bedroom",
        style: "Minimalist",
        dims: "7 × 9 ft",
        rating: 4.7,
        category: "Wardrobe",
        description:
          "Larissa's handle-free doors and monochrome palette embody minimalist design philosophy. Clean surfaces and a concealed hinge system ensure a seamless, uninterrupted look.",
        features: [
          "Handleless push-to-open doors",
          "Concealed soft-close hinge system",
          "Modular shelf inserts",
          "Integrated full-height mirror panel",
          "White matte lacquer finish",
        ],
      },
      {
        src: "https://super.homelane.com/MONLAQ6060_srp-1451454519_devon-straight-wardrobe.jpg",
        title: "Devon Straight Wardrobe",
        room: "Bedroom",
        style: "Classic",
        dims: "6 × 8 ft",
        rating: 4.5,
        category: "Wardrobe",
        description:
          "Devon's shaker-style doors and classic proportions bring timeless charm to the bedroom. The versatile design pairs beautifully with both period and contemporary furniture.",
        features: [
          "Shaker-style recessed panel doors",
          "Antique brass knob handles",
          "Adjustable hanging and shelf sections",
          "Locking cabinet doors",
          "Painted finish in heritage white",
        ],
      },
      {
        src: "https://super.homelane.com/MTBUVZ6511_srp-1451556443_madre-l-shaped-wardrobe.jpg",
        title: "Madre L-Shaped Wardrobe",
        room: "Bedroom",
        style: "L-Shaped",
        dims: "9 × 10 ft",
        rating: 4.8,
        category: "Wardrobe",
        description:
          "Madre's L-shaped configuration wraps around the corner to double usable storage without eating into the bedroom footprint. A practical luxury for families who need it all.",
        features: [
          "Corner carousel pull-out unit",
          "Separate his-and-hers sections",
          "Full-length sliding mirror on long wing",
          "Built-in trouser press compartment",
          "Textured linen-look laminate finish",
        ],
      },
    ],
  },
];
