import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const k = () => Math.random().toString(36).slice(2, 12);
const blocks = (paras: string[]) =>
  paras.map(text => ({
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  }));

type Seed = {
  id: string; slug: string; title: string; order: number;
  fiber: string; applications: string[];
  tagline: { en: string; pt: string; es: string };
  story: { en: string[]; pt: string[]; es: string[] };
  seo: { title: { en: string; pt: string; es: string }; description: { en: string; pt: string; es: string } };
};

const data: Seed[] = [
  {
    id: "collection.pure-linen-pure-style",
    slug: "pure-linen-pure-style",
    title: "Pure Linen. Pure Style",
    order: 10,
    fiber: "linen",
    applications: ["residential", "hospitality", "workplace"],
    tagline: {
      en: "Linen in its most honest form — woven for interiors that value restraint.",
      pt: "O linho em sua forma mais honesta — tecido para interiores que valorizam a contenção.",
      es: "El lino en su forma más honesta — tejido para interiores que valoran la contención.",
    },
    story: {
      en: [
        "Linen carries a quiet authority. It creases, it breathes, it ages with the room rather than against it. This collection works that character into upholstery-grade cloth — durable enough to specify, refined enough to leave uncommented.",
        "Grown without synthetic shortcuts and finished for contract use, each weave balances tactile softness with the structure a furniture brief demands.",
      ],
      pt: [
        "O linho tem uma autoridade silenciosa. Ele amassa, respira e envelhece junto com o ambiente, e não contra ele. Esta coleção traduz esse caráter em tecidos de estofamento — duráveis o bastante para especificar, refinados o bastante para não pedir explicação.",
        "Cultivado sem atalhos sintéticos e acabado para uso contract, cada tecelagem equilibra maciez tátil com a estrutura que um projeto de mobiliário exige.",
      ],
      es: [
        "El lino tiene una autoridad silenciosa. Se arruga, respira y envejece con la sala, no contra ella. Esta colección traslada ese carácter a tejidos de tapicería: duraderos para especificar, refinados para no necesitar explicación.",
        "Cultivado sin atajos sintéticos y acabado para uso contract, cada tejido equilibra suavidad táctil con la estructura que exige un proyecto de mobiliario.",
      ],
    },
    seo: {
      title: {
        en: "Pure Linen Collection — Premium Linen Upholstery Fabrics",
        pt: "Coleção Pure Linen — Tecidos de Linho para Estofamento",
        es: "Colección Pure Linen — Tejidos de Lino para Tapicería",
      },
      description: {
        en: "Contract-grade linen upholstery fabrics for residential, hospitality and workplace interiors. Request samples from Lady Fabrics.",
        pt: "Tecidos de linho para estofamento em projetos residenciais, hotelaria e corporativos. Solicite amostras à Lady Fabrics.",
        es: "Tejidos de lino para tapicería en proyectos residenciales, hostelería y corporativos. Solicite muestras a Lady Fabrics.",
      },
    },
  },
  {
    id: "collection.wool-for-contract",
    slug: "wool-for-contract",
    title: "Wool for Contract",
    order: 20,
    fiber: "wool",
    applications: ["contract", "hospitality", "corporate", "acoustic"],
    tagline: {
      en: "Engineered wool for residential, hospitality, corporate and acoustic environments.",
      pt: "Lã desenvolvida para ambientes residenciais, de hotelaria, corporativos e acústicos.",
      es: "Lana desarrollada para entornos residenciales, de hostelería, corporativos y acústicos.",
    },
    story: {
      en: [
        "Wool is the original performance fibre — naturally flame-resistant, sound-absorbing and resilient under daily use. This collection translates that into contract-ready textiles for the spaces with the highest demands.",
        "From upholstery to acoustic panels, every construction is specified for longevity: textiles that hold their surface, colour and integrity across years of use.",
      ],
      pt: [
        "A lã é a fibra de performance original — naturalmente resistente ao fogo, absorvente acústica e resiliente ao uso diário. Esta coleção traduz isso em tecidos prontos para contract, nos espaços de maior exigência.",
        "Do estofamento aos painéis acústicos, cada construção é especificada para durar: tecidos que mantêm superfície, cor e integridade ao longo dos anos.",
      ],
      es: [
        "La lana es la fibra de rendimiento original: naturalmente ignífuga, absorbente acústica y resistente al uso diario. Esta colección lo traduce en tejidos listos para contract, en los espacios más exigentes.",
        "De la tapicería a los paneles acústicos, cada construcción se especifica para durar: tejidos que mantienen superficie, color e integridad durante años.",
      ],
    },
    seo: {
      title: {
        en: "Wool for Contract — Performance Wool Textiles & Acoustic Fabrics",
        pt: "Wool for Contract — Tecidos de Lã de Performance e Acústicos",
        es: "Wool for Contract — Tejidos de Lana de Rendimiento y Acústicos",
      },
      description: {
        en: "Engineered wool fabrics for contract, hospitality, corporate and acoustic environments. Naturally flame-resistant and durable.",
        pt: "Tecidos de lã para contract, hotelaria, corporativo e painéis acústicos. Naturalmente resistentes ao fogo e duráveis.",
        es: "Tejidos de lana para contract, hostelería, corporativo y paneles acústicos. Naturalmente ignífugos y duraderos.",
      },
    },
  },
  {
    id: "collection.synthetics-polyester",
    slug: "synthetics-polyester",
    title: "Synthetics",
    order: 30,
    fiber: "polyester",
    applications: ["workplace", "healthcare", "hospitality", "contract"],
    tagline: {
      en: "Polyester engineered to outlast the brief.",
      pt: "Poliéster desenvolvido para durar mais que o projeto.",
      es: "Poliéster desarrollado para durar más que el proyecto.",
    },
    story: {
      en: [
        "Performance is not a compromise — it is a discipline. These polyester constructions are built for spaces that never slow down: high-traffic seating, healthcare, education, transit. They resist abrasion, shrug off cleaning agents and hold colour long after softer fibres would fade.",
        "What they do not do is announce themselves. The hand is refined, the surface considered. Specification-grade durability, dressed with restraint.",
      ],
      pt: [
        "Performance não é concessão — é disciplina. Estas construções em poliéster são feitas para espaços que nunca desaceleram: assentos de alto tráfego, saúde, educação, transporte. Resistem à abrasão, ignoram agentes de limpeza e mantêm a cor muito depois de fibras mais macias desbotarem.",
        "O que elas não fazem é se anunciar. O toque é refinado, a superfície é pensada. Durabilidade de especificação, vestida com contenção.",
      ],
      es: [
        "El rendimiento no es una concesión: es una disciplina. Estas construcciones en poliéster están hechas para espacios que nunca se detienen: asientos de alto tránsito, salud, educación, transporte. Resisten la abrasión, ignoran los agentes de limpieza y mantienen el color mucho después de que fibras más suaves se destiñan.",
        "Lo que no hacen es anunciarse. El tacto es refinado, la superficie es pensada. Durabilidad de especificación, vestida con contención.",
      ],
    },
    seo: {
      title: {
        en: "Synthetics — Performance Polyester Upholstery Fabrics",
        pt: "Sintéticos — Tecidos de Poliéster de Performance",
        es: "Sintéticos — Tejidos de Poliéster de Rendimiento",
      },
      description: {
        en: "Durable polyester contract fabrics for workplace, healthcare and hospitality. Abrasion- and stain-resistant. Request samples from Lady Fabrics.",
        pt: "Tecidos de poliéster para contract, corporativo, saúde e hotelaria. Resistentes à abrasão e a manchas. Solicite amostras.",
        es: "Tejidos de poliéster para contract, corporativo, salud y hostelería. Resistentes a la abrasión y a las manchas. Solicite muestras.",
      },
    },
  },
  {
    id: "collection.naturals-cotton-blends",
    slug: "naturals-cotton-blends",
    title: "Naturals",
    order: 40,
    fiber: "cotton",
    applications: ["residential", "hospitality", "workplace"],
    tagline: {
      en: "Cotton and blends — texture you can read with your hands.",
      pt: "Algodões e blends — textura que se lê com as mãos.",
      es: "Algodones y mezclas — textura que se lee con las manos.",
    },
    story: {
      en: [
        "Cotton is memory. It softens, it settles, it carries the warmth of the room into the fibre itself. This collection pairs pure cotton with considered blends — adding resilience without trading away the honesty of a natural surface.",
        "Each weave is developed for interiors that prefer their materials quiet and tactile: cloth that feels lived-in on day one and only improves from there.",
      ],
      pt: [
        "O algodão é memória. Ele amacia, assenta e leva o calor do ambiente para dentro da própria fibra. Esta coleção une algodão puro a blends bem pensados — somando resiliência sem abrir mão da honestidade de uma superfície natural.",
        "Cada tecelagem é desenvolvida para interiores que preferem seus materiais discretos e táteis: um tecido que parece vivido já no primeiro dia — e só melhora a partir dali.",
      ],
      es: [
        "El algodón es memoria. Se suaviza, se asienta y lleva el calor de la sala a la propia fibra. Esta colección une algodón puro con mezclas bien pensadas: añade resistencia sin renunciar a la honestidad de una superficie natural.",
        "Cada tejido se desarrolla para interiores que prefieren sus materiales discretos y táctiles: una tela que se siente vivida desde el primer día y solo mejora después.",
      ],
    },
    seo: {
      title: {
        en: "Naturals — Cotton & Blend Upholstery Fabrics",
        pt: "Naturais — Tecidos de Algodão e Blends para Estofamento",
        es: "Naturales — Tejidos de Algodón y Mezclas para Tapicería",
      },
      description: {
        en: "Pure cotton and cotton-blend upholstery textiles for residential and hospitality interiors. Soft, tactile, durable.",
        pt: "Tecidos de algodão puro e blends para estofamento residencial e de hotelaria. Macios, táteis e duráveis.",
        es: "Tejidos de algodón puro y mezclas para tapicería residencial y de hostelería. Suaves, táctiles y duraderos.",
      },
    },
  },
  {
    id: "collection.in-and-out-indoor-outdoor",
    slug: "performance",
    title: "Performance",
    order: 50,
    fiber: "technical",
    applications: ["hospitality", "residential", "contract", "outdoor"],
    tagline: {
      en: "One textile. No threshold.",
      pt: "Um tecido. Sem fronteira.",
      es: "Un tejido. Sin frontera.",
    },
    story: {
      en: [
        "The line between inside and outside has all but disappeared. These textiles are made for that blur — UV-stable, moisture-resistant and easy to clean, yet refined enough to specify for an interior without explanation.",
        "Terraces, lobbies, poolside lounges, sunlit reading rooms — Performance moves freely between them, holding its colour and character through weather and use alike.",
      ],
      pt: [
        "A fronteira entre dentro e fora praticamente desapareceu. Estes tecidos são feitos para esse limite difuso — estáveis ao UV, resistentes à umidade e fáceis de limpar, mas refinados o bastante para serem especificados em um interior sem justificativa.",
        "Terraços, lobbies, áreas de piscina, salas de leitura banhadas de sol — Performance circula livremente entre eles, mantendo cor e caráter diante do tempo e do uso.",
      ],
      es: [
        "La frontera entre dentro y fuera casi ha desaparecido. Estos tejidos están hechos para ese límite difuso: estables a los rayos UV, resistentes a la humedad y fáciles de limpiar, pero lo bastante refinados para especificarse en un interior sin justificación.",
        "Terrazas, lobbies, zonas de piscina, salas de lectura bañadas de sol — Performance se mueve libremente entre ellas, manteniendo color y carácter frente al clima y al uso.",
      ],
    },
    seo: {
      title: {
        en: "Performance — Indoor / Outdoor Performance Textiles",
        pt: "Performance — Tecidos Indoor e Outdoor de Alta Performance",
        es: "Performance — Tejidos Indoor y Outdoor de Alto Rendimiento",
      },
      description: {
        en: "UV-stable, moisture-resistant indoor-outdoor fabrics for hospitality and residential spaces. Refined performance from Lady Fabrics.",
        pt: "Tecidos indoor/outdoor estáveis ao UV e resistentes à umidade para hotelaria e residencial. Performance refinada da Lady Fabrics.",
        es: "Tejidos indoor/outdoor estables a los UV y resistentes a la humedad para hostelería y residencial. Rendimiento refinado de Lady Fabrics.",
      },
    },
  },
];

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ error: "missing SANITY_API_WRITE_TOKEN" }, { status: 500 });
  }

  try {
    const tx = data.reduce((t, c) => t.createOrReplace({
      _id: c.id,
      _type: "collection",
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      order: c.order,
      fiber: c.fiber,
      applications: c.applications,
      tagline: { _type: "localeString", ...c.tagline },
      story: {
        _type: "localeBlock",
        en: blocks(c.story.en),
        pt: blocks(c.story.pt),
        es: blocks(c.story.es),
      },
      seo: {
        _type: "seo",
        title: { _type: "localeString", ...c.seo.title },
        description: { _type: "localeText", ...c.seo.description },
        noIndex: false,
      },
    }), writeClient.transaction());

    await tx.commit({ autoGenerateArrayKeys: true });
    return NextResponse.json({ ok: true, count: data.length, slugs: data.map(d => d.slug) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
