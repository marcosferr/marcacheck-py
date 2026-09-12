export interface NizaClass {
  number: number;
  category: "Productos" | "Servicios";
  title: string;
  description: string;
  keywords: string[];
  related_classes: number[];
}

export const NIZA_CLASSES: Record<number, NizaClass> = {
  1: {
    number: 1,
    category: "Productos",
    title: "Químicos e industriales",
    description: "Productos químicos para la industria, ciencia, agricultura, horticultura y silvicultura; resinas artificiales, abonos, adhesivos.",
    keywords: ["químico", "fertilizante", "abono", "adhesivo", "resina", "silvicultura", "reactivo"],
    related_classes: [4, 5, 17]
  },
  2: {
    number: 2,
    category: "Productos",
    title: "Pinturas y barnices",
    description: "Pinturas, barnices, lacas; conservantes contra la herrumbre y el deterioro de la madera; colorantes; mordientes.",
    keywords: ["pintura", "barniz", "laca", "esmalte", "tinta", "anticorrosivo", "colorante"],
    related_classes: [1, 19]
  },
  3: {
    number: 3,
    category: "Productos",
    title: "Cosméticos y productos de limpieza",
    description: "Preparaciones para blanquear y otras sustancias para lavar la ropa; preparaciones para limpiar, pulir, desengrasar; perfumes, aceites esenciales, cosméticos, lociones capilares; dentífricos.",
    keywords: ["cosmético", "perfume", "crema", "shampoo", "jabón", "limpieza", "maquillaje", "dentífrico", "detergente", "belleza"],
    related_classes: [5, 21, 44]
  },
  4: {
    number: 4,
    category: "Productos",
    title: "Lubricantes y combustibles",
    description: "Aceites y grasas para uso industrial; lubricantes; productos para absorber, rociar y asentar el polvo; combustibles y materiales de alumbrado; velas.",
    keywords: ["combustible", "gasolina", "diesel", "lubricante", "grasa", "vela", "aceite de motor", "energía"],
    related_classes: [1, 7, 37]
  },
  5: {
    number: 5,
    category: "Productos",
    title: "Farmacéuticos y veterinarios",
    description: "Productos farmacéuticos, preparaciones médicas y veterinarias; productos higiénicos y sanitarios para uso médico; alimentos y sustancias dietéticas para uso médico; suplementos dietéticos; desinfectantes.",
    keywords: ["farmacia", "medicamento", "remedio", "suplemento", "vitamina", "veterinario", "desinfectante", "analgésico", "antibiótico"],
    related_classes: [3, 10, 44]
  },
  6: {
    number: 6,
    category: "Productos",
    title: "Metales y cerrajería",
    description: "Metales comunes y sus aleaciones; materiales de construcción metálicos; construcciones metálicas transportables; cables e hilos metálicos no eléctricos; cerrajería y ferretería metálica.",
    keywords: ["metal", "acero", "hierro", "aluminio", "cerradura", "candado", "tubo metálico", "tornillo", "ferretería"],
    related_classes: [19, 20]
  },
  7: {
    number: 7,
    category: "Productos",
    title: "Maquinarias y motores",
    description: "Máquinas herramientas, herramientas mecánicas; motores (excepto motores para vehículos terrestres); acoplamientos y elementos de transmisión; instrumentos agrícolas que no sean manuales.",
    keywords: ["máquina", "motor", "generador", "bomba", "compresor", "robot industrial", "turbina", "herramienta eléctrica"],
    related_classes: [8, 9, 12, 37]
  },
  8: {
    number: 8,
    category: "Productos",
    title: "Herramientas manuales",
    description: "Herramientas e instrumentos de mano accionados manualmente; artículos de cuchillería, tenedores y cucharas; armas blancas; maquinillas de afeitar.",
    keywords: ["herramienta manual", "cuchillo", "tijera", "martillo", "destornillador", "afeitadora", "alicate"],
    related_classes: [7, 21]
  },
  9: {
    number: 9,
    category: "Productos",
    title: "Tecnología, software y electrónica",
    description: "Aparatos e instrumentos científicos, de investigación, de navegación, señalización, control; aparatos de grabación o reproducción de sonido o imagen; software descargable, aplicaciones móviles, ordenadores, teléfonos.",
    keywords: ["software", "app", "aplicación", "computadora", "ordenador", "celular", "electrónica", "inteligencia artificial", "ia", "pantalla", "cámara", "auricular", "chip", "hardware", "plataforma"],
    related_classes: [38, 42]
  },
  10: {
    number: 10,
    category: "Productos",
    title: "Aparatos médicos y prótesis",
    description: "Aparatos e instrumentos quirúrgicos, médicos, odontológicos y veterinarios; miembros, ojos y dientes artificiales; artículos ortopédicos; material de sutura.",
    keywords: ["médico", "quirúrgico", "odontológico", "prótesis", "termómetro", "jeringa", "aparato ortopédico", "mascarilla médica"],
    related_classes: [5, 44]
  },
  11: {
    number: 11,
    category: "Productos",
    title: "Aparatos de iluminación y climatización",
    description: "Aparatos e instalaciones de alumbrado, calefacción, enfriamiento, producción de vapor, cocción, secado, ventilación, distribución de agua e instalaciones sanitarias.",
    keywords: ["lámpara", "foco", "aire acondicionado", "estufa", "heladera", "refrigerador", "calefón", "ventilador", "purificador"],
    related_classes: [7, 9, 21]
  },
  12: {
    number: 12,
    category: "Productos",
    title: "Vehículos y transporte",
    description: "Vehículos; aparatos de locomoción terrestre, aérea o acuática; automóviles, motocicletas, bicicletas, partes y accesorios para vehículos.",
    keywords: ["vehículo", "auto", "coche", "automóvil", "moto", "motocicleta", "bicicleta", "camión", "neumático", "llanta", "embarcación", "avión"],
    related_classes: [7, 37, 39]
  },
  13: {
    number: 13,
    category: "Productos",
    title: "Armas de fuego y pirotecnia",
    description: "Armas de fuego; municiones y proyectiles; explosivos; fuegos artificiales.",
    keywords: ["arma", "munición", "pistola", "rifle", "fuego artificial", "petardo", "explosivo"],
    related_classes: [8]
  },
  14: {
    number: 14,
    category: "Productos",
    title: "Joyería y relojería",
    description: "Metales preciosos y sus aleaciones; artículos de joyería, bisutería, piedras preciosas y semipreciosas; artículos de relojería e instrumentos cronométricos.",
    keywords: ["joya", "anillo", "collar", "pulsera", "reloj", "oro", "plata", "diamante", "bisutería"],
    related_classes: [18, 26]
  },
  15: {
    number: 15,
    category: "Productos",
    title: "Instrumentos musicales",
    description: "Instrumentos musicales; atriles para música y soportes para instrumentos musicales; batutas para directores de orquesta.",
    keywords: ["guitarra", "piano", "batería", "violín", "arpa", "instrumento musical", "acordeón"],
    related_classes: [9, 41]
  },
  16: {
    number: 16,
    category: "Productos",
    title: "Papelería, imprenta y libros",
    description: "Papel y cartón; productos de imprenta; material de encuadernación; fotografías; artículos de papelería y artículos de oficina; adhesivos para papelería; material de dibujo y para artistas; libros.",
    keywords: ["papelería", "libro", "revista", "cuaderno", "bolígrafo", "impresión", "folleto", "caja de cartón", "editorial"],
    related_classes: [35, 41]
  },
  17: {
    number: 17,
    category: "Productos",
    title: "Caucho, plásticos aislantes y mangueras",
    description: "Caucho, gutapercha, goma, amianto, mica en bruto o semielaborados; materias plásticas y resinas en forma extruida para su uso en fabricación; materiales para calafatear, cerrar con estopa y aislar; tubos flexibles no metálicos.",
    keywords: ["caucho", "goma", "aislante", "manguera", "tubo flexible", "resina plástica", "sellador"],
    related_classes: [1, 19]
  },
  18: {
    number: 18,
    category: "Productos",
    title: "Cueros, bolsos y equipaje",
    description: "Cuero y cuero de imitación; pieles de animales; artículos de equipaje y bolsas de transporte; paraguas y sombrillas; bastones; fustas, arneses y artículos de guarnicionería; collares, correas y ropa para animales.",
    keywords: ["cuero", "cartera", "mochila", "bolso", "valija", "maleta", "billetera", "cinturón de cuero", "paraguas"],
    related_classes: [14, 25]
  },
  19: {
    number: 19,
    category: "Productos",
    title: "Materiales de construcción no metálicos",
    description: "Materiales de construcción no metálicos; tubos rígidos no metálicos para la construcción; asfalto, pez, alquitrán y betún; construcciones transportables no metálicas; monumentos no metálicos.",
    keywords: ["cemento", "ladrillo", "hormigón", "yeso", "madera para construcción", "asfalto", "baldosa", "cerámica"],
    related_classes: [6, 37]
  },
  20: {
    number: 20,
    category: "Productos",
    title: "Muebles y artículos de madera o plástico",
    description: "Muebles, espejos, marcos; contenedores no metálicos de almacenamiento o transporte; hueso, cuerno, ballena o nácar, en bruto o semielaborados; conchas; espuma de mar; ámbar amarillo.",
    keywords: ["mueble", "mesa", "silla", "cama", "colchón", "estante", "espejo", "marco", "contenedor de plástico"],
    related_classes: [19, 21]
  },
  21: {
    number: 21,
    category: "Productos",
    title: "Utensilios domésticos y vajilla",
    description: "Utensilios y recipientes para uso doméstico y culinario; peines y esponjas; cepillos; materiales para fabricar cepillos; material de limpieza; vidrio en bruto o semielaborado; artículos de cristalería, porcelana y loza.",
    keywords: ["vaso", "plato", "olla", "sartén", "taza", "termo", "guampa", "cepillo", "utensilio de cocina", "cristalería"],
    related_classes: [8, 11, 20]
  },
  22: {
    number: 22,
    category: "Productos",
    title: "Cuerdas, lonas y sacos",
    description: "Cuerdas y cordeles; redes; tiendas de campaña y lonas; toldos de materias textiles o sintéticas; velas de navegación; sacos para el transporte y almacenamiento de mercancías a granel.",
    keywords: ["cuerda", "lona", "toldo", "red", "saco", "bolsa de arpillera", "tienda de campaña"],
    related_classes: [24]
  },
  23: {
    number: 23,
    category: "Productos",
    title: "Hilos para uso textil",
    description: "Hilos e hilados para uso textil.",
    keywords: ["hilo", "hilado", "lana para tejer", "hilo de coser", "madeja"],
    related_classes: [24, 25]
  },
  24: {
    number: 24,
    category: "Productos",
    title: "Tejidos, mantas y ropa de cama",
    description: "Tejidos y sus sucedáneos; ropa de hogar; cortinas de materias textiles o de plástico.",
    keywords: ["tela", "tejido", "sábana", "toalla", "cortina", "manta", "frazada", "mantel", "acolchado"],
    related_classes: [23, 25]
  },
  25: {
    number: 25,
    category: "Productos",
    title: "Prendas de vestir, calzado y sombrerería",
    description: "Prendas de vestir, calzado, artículos de sombrerería.",
    keywords: ["ropa", "camisa", "remera", "pantalón", "calzado", "zapato", "zapatilla", "gorra", "sombrero", "vestido", "indumentaria", "moda"],
    related_classes: [18, 24, 26]
  },
  26: {
    number: 26,
    category: "Productos",
    title: "Mercería, encajes y adornos para el cabello",
    description: "Encajes, cordones y bordados, cintas y lazos de mercería; botones, ganchos y ojetes, alfileres y agujas; flores artificiales; adornos para el cabello; pelo postizo.",
    keywords: ["botón", "cierre", "cremallera", "cinta", "hebilla", "aguja", "adorno de pelo", "peluca", "flor artificial"],
    related_classes: [14, 25]
  },
  27: {
    number: 27,
    category: "Productos",
    title: "Alfombras y revestimientos de suelos",
    description: "Alfombras, felpudos, esteras, linóleo y otros revestimientos de suelos; tapices murales que no sean de materias textiles.",
    keywords: ["alfombra", "tapete", "felpudo", "revestimiento de piso", "papel tapiz", "linóleo"],
    related_classes: [19, 24]
  },
  28: {
    number: 28,
    category: "Productos",
    title: "Juegos, juguetes y artículos de deporte",
    description: "Juegos y juguetes; aparatos de videojuegos; artículos de gimnasia y deporte; adornos para árboles de Navidad.",
    keywords: ["juego", "juguete", "pelota", "videojuego", "gimnasio", "artículo deportivo", "raqueta", "pesa", "muñeca"],
    related_classes: [9, 25, 41]
  },
  29: {
    number: 29,
    category: "Productos",
    title: "Carnes, lácteos, aceites y conservas",
    description: "Carne, pescado, carne de ave y de caza; extractos de carne; frutas y verduras, hortalizas y legumbres en conserva, congeladas, secas y cocidas; jaleas, confituras, compotas; huevos; leche, quesos, mantequilla, yogur y otros productos lácteos; aceites y grasas para uso alimenticio.",
    keywords: ["carne", "queso", "leche", "yogur", "aceite comestible", "embutido", "fruta seca", "conserva", "pollo", "pescado"],
    related_classes: [30, 31, 32]
  },
  30: {
    number: 30,
    category: "Productos",
    title: "Café, té, yerba mate, harina, pan y dulces",
    description: "Café, té, cacao y sucedáneos; yerba mate; arroz, pastas alimenticias y fideos; tapioca y sagú; harinas y preparaciones a base de cereales; pan, pastelería y confitería; chocolate; helados; azúcar, miel, jarabe de melaza; levadura, polvos para hornear; sal; especias.",
    keywords: ["café", "yerba", "yerba mate", "pan", "harina", "chocolate", "dulce", "galletita", "azúcar", "helado", "arroz", "té", "especia"],
    related_classes: [29, 31, 32]
  },
  31: {
    number: 31,
    category: "Productos",
    title: "Granos, frutas frescas y alimentos para animales",
    description: "Productos agrícolas, acuícolas, hortícolas y forestales en bruto y sin procesar; granos y semillas en bruto o sin procesar; frutas y verduras, hortalizas y legumbres frescas, hierbas aromáticas frescas; plantas y flores naturales; bulbos, plántulas y semillas para plantar; animales vivos; alimentos y piensos para animales; malta.",
    keywords: ["grano", "semilla", "soja", "maíz", "fruta fresca", "verdura fresca", "planta", "flor", "alimento balanceado", "mascota"],
    related_classes: [29, 30]
  },
  32: {
    number: 32,
    category: "Productos",
    title: "Cervezas, aguas minerales y bebidas sin alcohol",
    description: "Cervezas; bebidas no alcohólicas; aguas minerales y gaseosas; bebidas a base de frutas y zumos de frutas; siropes y otras preparaciones sin alcohol para elaborar bebidas.",
    keywords: ["cerveza", "agua", "agua mineral", "gaseosa", "jugo", "refresco", "bebida energizante", "isótonica"],
    related_classes: [30, 33]
  },
  33: {
    number: 33,
    category: "Productos",
    title: "Bebidas alcohólicas (excepto cervezas)",
    description: "Bebidas alcohólicas (excepto cervezas); preparaciones alcohólicas para elaborar bebidas; vinos, licores, caña paraguaya, whisky, vodka, ginebra.",
    keywords: ["vino", "caña", "whisky", "vodka", "licor", "gin", "ginebra", "ron", "tequila", "bebida alcohólica"],
    related_classes: [32]
  },
  34: {
    number: 34,
    category: "Productos",
    title: "Tabaco, cigarrillos y cigarrillos electrónicos",
    description: "Tabaco y sucedáneos del tabaco; cigarrillos y puros; cigarrillos electrónicos y vaporizadores orales para fumadores; artículos para fumadores; cerillas.",
    keywords: ["tabaco", "cigarrillo", "cigarro", "puro", "vape", "vaporizador", "encendedor", "cenicero", "fósforo"],
    related_classes: [35]
  },
  35: {
    number: 35,
    category: "Servicios",
    title: "Publicidad, gestión comercial y tiendas/e-commerce",
    description: "Publicidad; gestión, organización y administración de negocios comerciales; trabajos de oficina; servicios de venta al por menor o al por mayor; comercio electrónico; marketing y consultoría empresarial.",
    keywords: ["tienda", "comercio", "venta", "distribución", "supermercado", "publicidad", "marketing", "consultoría", "administración", "e-commerce", "negocio"],
    related_classes: [36, 38, 41, 42]
  },
  36: {
    number: 36,
    category: "Servicios",
    title: "Servicios financieros, bancarios e inmobiliarios",
    description: "Servicios financieros, monetarios y bancarios; servicios de seguros; operaciones inmobiliarias; inversiones, créditos, préstamos y criptoactivos.",
    keywords: ["banco", "financiera", "crédito", "préstamo", "seguro", "inmobiliaria", "alquiler de inmuebles", "inversión", "fintech", "cripto"],
    related_classes: [35, 42]
  },
  37: {
    number: 37,
    category: "Servicios",
    title: "Construcción, reparación e instalación",
    description: "Servicios de construcción; servicios de instalación y reparación; extracción minera, perforación de petróleo y gas.",
    keywords: ["construcción", "reparación", "instalación", "mantenimiento", "taller mecánico", "plomería", "electricista", "pintor"],
    related_classes: [19, 39, 42]
  },
  38: {
    number: 38,
    category: "Servicios",
    title: "Telecomunicaciones y transmisión de datos",
    description: "Servicios de telecomunicaciones; transmisión de mensajes e imágenes por ordenador; difusión de radio y televisión; acceso a redes de telecomunicaciones.",
    keywords: ["telecomunicaciones", "internet", "fibra óptica", "telefonía", "streaming", "radio", "televisión", "transmisión de datos"],
    related_classes: [9, 35, 41, 42]
  },
  39: {
    number: 39,
    category: "Servicios",
    title: "Transporte, logística y viajes",
    description: "Transporte; embalaje y almacenamiento de mercancías; organización de viajes y excursiones; fletes y logística.",
    keywords: ["transporte", "logística", "flete", "mudanza", "almacenamiento", "depósito", "agencia de viajes", "turismo", "delivery"],
    related_classes: [12, 35]
  },
  40: {
    number: 40,
    category: "Servicios",
    title: "Tratamiento de materiales y reciclaje",
    description: "Tratamiento de materiales; reciclaje de residuos y desechos; purificación del aire y tratamiento del agua; servicios de imprenta; conservación de alimentos y bebidas.",
    keywords: ["reciclaje", "tratamiento de agua", "imprenta", "serigrafía", "carpintería a medida", "soldadura"],
    related_classes: [16, 37, 42]
  },
  41: {
    number: 41,
    category: "Servicios",
    title: "Educación, formación y entretenimiento",
    description: "Educación; formación; servicios de entretenimiento; actividades deportivas y culturales; producción musical y audiovisual; eventos y conferencias.",
    keywords: ["educación", "colegio", "universidad", "curso", "capacitación", "entretenimiento", "show", "concierto", "cine", "deporte", "evento"],
    related_classes: [9, 16, 35, 42]
  },
  42: {
    number: 42,
    category: "Servicios",
    title: "Servicios tecnológicos, software y desarrollo web",
    description: "Servicios científicos y tecnológicos, así como servicios de investigación y diseño en estos ámbitos; servicios de análisis e investigación industriales; diseño y desarrollo de hardware y software informático; SaaS, computación en la nube.",
    keywords: ["software", "desarrollo web", "programación", "sistemas", "tecnología", "saas", "ciberseguridad", "inteligencia artificial", "diseño web", "app", "ingeniería", "arquitectura"],
    related_classes: [9, 35, 38]
  },
  43: {
    number: 43,
    category: "Servicios",
    title: "Restaurantes, cafeterías y hospedaje",
    description: "Servicios de restauración (alimentación); hospedaje temporal; restaurantes, bares, cafeterías, catering; hoteles y moteles.",
    keywords: ["restaurante", "bar", "cafetería", "comida", "hotel", "hospedaje", "alojamiento", "catering", "gastronomía", "pizzería"],
    related_classes: [29, 30, 32, 35]
  },
  44: {
    number: 44,
    category: "Servicios",
    title: "Servicios médicos, veterinarios y estética",
    description: "Servicios médicos; servicios veterinarios; tratamientos de higiene y de belleza para personas o animales; servicios de agricultura, acuicultura, horticultura y silvicultura.",
    keywords: ["médico", "clínica", "hospital", "odontología", "veterinaria", "peluquería", "spa", "estética", "agronomía"],
    related_classes: [3, 5, 10, 42]
  },
  45: {
    number: 45,
    category: "Servicios",
    title: "Servicios jurídicos y de seguridad",
    description: "Servicios jurídicos; servicios de seguridad para la protección física de bienes materiales y personas; servicios de citas; gestión de derechos de autor y marcas.",
    keywords: ["abogado", "jurídico", "legal", "seguridad", "vigilancia", "patentes", "marcas", "investigación privada"],
    related_classes: [35, 36, 42]
  }
};

export function getNizaClass(classNumber: number): NizaClass | null {
  return NIZA_CLASSES[classNumber] || null;
}

export function searchNizaClasses(query: string, maxResults: number = 5): NizaClass[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored: Array<{ cls: NizaClass; score: number }> = [];

  for (const cls of Object.values(NIZA_CLASSES)) {
    let score = 0;
    if (cls.number.toString() === q) {
      score += 100;
    }
    if (cls.title.toLowerCase().includes(q)) {
      score += 40;
    }
    if (cls.description.toLowerCase().includes(q)) {
      score += 20;
    }
    for (const kw of cls.keywords) {
      if (kw === q) {
        score += 50;
      } else if (kw.includes(q) || q.includes(kw)) {
        score += 25;
      }
    }
    if (score > 0) {
      scored.push({ cls, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map(s => s.cls);
}

export function getAllNizaClasses(): NizaClass[] {
  return Object.values(NIZA_CLASSES);
}
