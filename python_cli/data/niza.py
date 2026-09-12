"""
Base de conocimiento de la Clasificación Internacional de Niza (11ª/12ª Edición)
Utilizada oficialmente por la DINAPI en Paraguay.
Incluye clases de productos (1-34) y servicios (35-45).
"""

from dataclasses import dataclass
from typing import List, Optional, Dict

@dataclass
class NizaClass:
    number: int
    category: str  # "Productos" o "Servicios"
    title: str
    description: str
    keywords: List[str]
    related_classes: List[int]

NIZA_CLASSES: Dict[int, NizaClass] = {
    1: NizaClass(
        number=1,
        category="Productos",
        title="Químicos e industriales",
        description="Productos químicos para la industria, ciencia, agricultura, horticultura y silvicultura; resinas artificiales, abonos, adhesivos.",
        keywords=["químico", "fertilizante", "abono", "adhesivo", "resina", "silvicultura", "reactivo"],
        related_classes=[4, 5, 17]
    ),
    2: NizaClass(
        number=2,
        category="Productos",
        title="Pinturas y barnices",
        description="Pinturas, barnices, lacas; conservantes contra la herrumbre y el deterioro de la madera; colorantes; mordientes.",
        keywords=["pintura", "barniz", "laca", "esmalte", "tinta", "anticorrosivo", "colorante"],
        related_classes=[1, 19]
    ),
    3: NizaClass(
        number=3,
        category="Productos",
        title="Cosméticos y productos de limpieza",
        description="Preparaciones para blanquear y otras sustancias para lavar la ropa; preparaciones para limpiar, pulir, desengrasar; perfumes, aceites esenciales, cosméticos, lociones capilares; dentífricos.",
        keywords=["cosmético", "perfume", "crema", "shampoo", "jabón", "limpieza", "maquillaje", "dentífrico", "detergente", "belleza"],
        related_classes=[5, 21, 44]
    ),
    4: NizaClass(
        number=4,
        category="Productos",
        title="Lubricantes y combustibles",
        description="Aceites y grasas para uso industrial; lubricantes; productos para absorber, rociar y asentar el polvo; combustibles y materiales de alumbrado; velas.",
        keywords=["combustible", "gasolina", "diesel", "lubricante", "grasa", "vela", "aceite de motor", "energía"],
        related_classes=[1, 7, 37]
    ),
    5: NizaClass(
        number=5,
        category="Productos",
        title="Farmacéuticos y veterinarios",
        description="Productos farmacéuticos, preparaciones médicas y veterinarias; productos higiénicos y sanitarios para uso médico; alimentos y sustancias dietéticas para uso médico; suplementos dietéticos; desinfectantes.",
        keywords=["farmacia", "medicamento", "remedio", "suplemento", "vitamina", "veterinario", "desinfectante", "analgésico", "antibiótico"],
        related_classes=[3, 10, 44]
    ),
    6: NizaClass(
        number=6,
        category="Productos",
        title="Metales y cerrajería",
        description="Metales comunes y sus aleaciones; materiales de construcción metálicos; construcciones metálicas transportables; cables e hilos metálicos no eléctricos; cerrajería y ferretería metálica.",
        keywords=["metal", "acero", "hierro", "aluminio", "cerradura", "candado", "tubo metálico", "tornillo", "ferretería"],
        related_classes=[19, 20]
    ),
    7: NizaClass(
        number=7,
        category="Productos",
        title="Maquinarias y motores",
        description="Máquinas herramientas, herramientas mecánicas; motores (excepto motores para vehículos terrestres); acoplamientos y elementos de transmisión; instrumentos agrícolas que no sean manuales.",
        keywords=["máquina", "motor", "generador", "bomba", "compresor", "robot industrial", "turbina", "herramienta eléctrica"],
        related_classes=[8, 9, 12, 37]
    ),
    8: NizaClass(
        number=8,
        category="Productos",
        title="Herramientas manuales",
        description="Herramientas e instrumentos de mano accionados manualmente; artículos de cuchillería, tenedores y cucharas; armas blancas; maquinillas de afeitar.",
        keywords=["herramienta manual", "cuchillo", "tijera", "martillo", "destornillador", "afeitadora", "alicate"],
        related_classes=[7, 21]
    ),
    9: NizaClass(
        number=9,
        category="Productos",
        title="Tecnología, software y electrónica",
        description="Aparatos e instrumentos científicos, de investigación, de navegación, señalización, control; aparatos de grabación o reproducción de sonido o imagen; software descargable, aplicaciones móviles, ordenadores, teléfonos.",
        keywords=["software", "app", "aplicación", "computadora", "ordenador", "celular", "electrónica", "inteligencia artificial", "ia", "pantalla", "cámara", "auricular", "chip", "hardware", "plataforma"],
        related_classes=[38, 42]
    ),
    10: NizaClass(
        number=10,
        category="Productos",
        title="Aparatos médicos y prótesis",
        description="Aparatos e instrumentos quirúrgicos, médicos, odontológicos y veterinarios; miembros, ojos y dientes artificiales; artículos ortopédicos; material de sutura.",
        keywords=["médico", "quirúrgico", "odontológico", "prótesis", "termómetro", "jeringa", "aparato ortopédico", "mascarilla médica"],
        related_classes=[5, 44]
    ),
    11: NizaClass(
        number=11,
        category="Productos",
        title="Aparatos de iluminación, calefacción y refrigeración",
        description="Aparatos e instalaciones de alumbrado, calefacción, enfriamiento, producción de vapor, cocción, secado, ventilación, distribución de agua e instalaciones sanitarias.",
        keywords=["lámpara", "foco", "aire acondicionado", "refrigerador", "calefactor", "horno", "ventilador", "purificador de agua"],
        related_classes=[7, 9, 21]
    ),
    12: NizaClass(
        number=12,
        category="Productos",
        title="Vehículos y medios de transporte",
        description="Vehículos; aparatos de locomoción terrestre, aérea o acuática; automóviles, motocicletas, bicicletas, camiones, barcos, aviones.",
        keywords=["vehículo", "auto", "automóvil", "moto", "motocicleta", "camión", "bicicleta", "avión", "barco", "neumático", "repuesto"],
        related_classes=[7, 37, 39]
    ),
    13: NizaClass(
        number=13,
        category="Productos",
        title="Armas de fuego y fuegos artificiales",
        description="Armas de fuego; municiones y proyectiles; explosivos; fuegos artificiales.",
        keywords=["arma", "munición", "fusil", "pistola", "pólvora", "pirotecnia", "explosivo"],
        related_classes=[8]
    ),
    14: NizaClass(
        number=14,
        category="Productos",
        title="Joyería y relojería",
        description="Metales preciosos y sus aleaciones; artículos de joyería, bisutería, piedras preciosas y semipreciosas; artículos de relojería e instrumentos cronométricos.",
        keywords=["joya", "reloj", "oro", "plata", "anillo", "collar", "diamante", "pulsera", "bisutería"],
        related_classes=[18, 26]
    ),
    15: NizaClass(
        number=15,
        category="Productos",
        title="Instrumentos musicales",
        description="Instrumentos musicales; atriles para partituras e instrumentos; batutas.",
        keywords=["instrumento musical", "guitarra", "piano", "batería", "violín", "teclado musical", "trompeta"],
        related_classes=[9, 41]
    ),
    16: NizaClass(
        number=16,
        category="Productos",
        title="Papelería, imprenta y libros",
        description="Papel y cartón; productos de imprenta; material de encuadernación; fotografías; artículos de papelería y oficina; adhesivos de papelería; material didáctico.",
        keywords=["papelería", "libro", "revista", "cuaderno", "bolígrafo", "impresión", "editorial", "embalaje de papel", "folleto"],
        related_classes=[35, 41]
    ),
    17: NizaClass(
        number=17,
        category="Productos",
        title="Caucho, plástico y aislantes",
        description="Caucho, gutapercha, goma, amianto, mica en bruto o semielaborados; materias plásticas y resinas extruidas para uso industrial; materiales de calafateo y aislamiento; tubos flexibles no metálicos.",
        keywords=["caucho", "goma", "plástico", "aislante", "manguera", "sellador", "espuma aislante"],
        related_classes=[1, 19]
    ),
    18: NizaClass(
        number=18,
        category="Productos",
        title="Cuero, maletas y marroquinería",
        description="Cuero y cuero de imitación; pieles de animales; artículos de equipaje y bolsas de transporte; paraguas y sombrillas; bastones; fustas, arneses y artículos de guarnicionería; collares y ropa para animales.",
        keywords=["cuero", "bolso", "cartera", "mochila", "maleta", "billetera", "paraguas", "marroquinería"],
        related_classes=[14, 25]
    ),
    19: NizaClass(
        number=19,
        category="Productos",
        title="Materiales de construcción no metálicos",
        description="Materiales de construcción no metálicos; tubos rígidos no metálicos para la construcción; asfalto, pez, alquitrán y betún; construcciones transportables no metálicas; monumentos no metálicos.",
        keywords=["cemento", "hormigón", "ladrillo", "yeso", "madera para construcción", "asfalto", "baldosa", "cerámica"],
        related_classes=[6, 37]
    ),
    20: NizaClass(
        number=20,
        category="Productos",
        title="Muebles y artículos de madera o plástico",
        description="Muebles, espejos, marcos; contenedores no metálicos de almacenamiento o transporte; hueso, cuerno, ballena o nácar en bruto o semielaborados; conchas; espuma de mar; ámbar amarillo.",
        keywords=["mueble", "silla", "mesa", "cama", "colchón", "estante", "espejo", "marco", "armario"],
        related_classes=[19, 21, 24]
    ),
    21: NizaClass(
        number=21,
        category="Productos",
        title="Utensilios de cocina y recipientes domésticos",
        description="Utensilios y recipientes para uso doméstico y culinario; peines y esponjas; cepillos; material de cepillería; artículos de limpieza; vidrio en bruto o semielaborado; vajilla, cristalería y porcelana.",
        keywords=["vaso", "plato", "taza", "olla", "sartén", "botella", "cepillo", "utensilio de cocina", "termo", "guampa"],
        related_classes=[8, 11, 20]
    ),
    22: NizaClass(
        number=22,
        category="Productos",
        title="Cuerdas, lonas y fibras textiles",
        description="Cuerdas y cordeles; redes; tiendas de campaña y lonas; toldos de materias textiles o sintéticas; velas de barco; sacos para el transporte y almacenamiento de mercancías a granel; materiales de relleno.",
        keywords=["cuerda", "lona", "toldos", "tienda de campaña", "red", "saco", "bolsa de arpillera"],
        related_classes=[23, 24]
    ),
    23: NizaClass(
        number=23,
        category="Productos",
        title="Hilos para uso textil",
        description="Hilos e hilados para uso textil.",
        keywords=["hilo", "hilado", "lana para tejer", "estambre"],
        related_classes=[24, 25]
    ),
    24: NizaClass(
        number=24,
        category="Productos",
        title="Tejidos y textiles",
        description="Tejidos y sus sucedáneos; ropa de hogar; cortinas de materias textiles o de plástico.",
        keywords=["tela", "tejido", "sábana", "toalla", "cortina", "mantel", "funda"],
        related_classes=[20, 23, 25]
    ),
    25: NizaClass(
        number=25,
        category="Productos",
        title="Prendas de vestir, calzado y sombrerería",
        description="Prendas de vestir, calzado, artículos de sombrerería.",
        keywords=["ropa", "camisa", "pantalón", "vestido", "zapato", "zapatilla", "calzado", "remera", "gorra", "sombrero", "moda"],
        related_classes=[18, 24, 26, 35]
    ),
    26: NizaClass(
        number=26,
        category="Productos",
        title="Mercería y adornos",
        description="Encajes, cordones y bordados, cintas y lazos de mercería; botones, ganchos y ojetillos, alfileres y agujas; flores artificiales; adornos para el pelo; cabello postizo.",
        keywords=["botón", "cierre", "cinta", "adorno de pelo", "aguja", "broche", "peluca", "flor artificial"],
        related_classes=[14, 25]
    ),
    27: NizaClass(
        number=27,
        category="Productos",
        title="Alfombras y revestimientos de suelos",
        description="Alfombras, felpudos, esteras, linóleo y otros revestimientos de suelos; tapices murales que no sean de materias textiles.",
        keywords=["alfombra", "felpudo", "estera", "tapiz", "pasto sintético", "césped artificial"],
        related_classes=[19, 24]
    ),
    28: NizaClass(
        number=28,
        category="Productos",
        title="Juegos, juguetes y artículos de deporte",
        description="Juegos y juguetes; aparatos de videojuegos; artículos de gimnasia y deporte; adornos para árboles de Navidad.",
        keywords=["juguete", "juego", "videojuego", "pelota", "consola", "deporte", "muñeca", "gimnasia", "pesca"],
        related_classes=[9, 41]
    ),
    29: NizaClass(
        number=29,
        category="Productos",
        title="Alimentos (carnes, lácteos, aceites)",
        description="Carne, pescado, carne de ave y de caza; extractos de carne; frutas y verduras congeladas, secas y cocidas; jaleas, confituras, compotas; huevos; leche, queso, mantequilla, yogur y otros productos lácteos; aceites y grasas para uso alimenticio.",
        keywords=["carne", "pollo", "pescado", "leche", "queso", "yogur", "huevo", "aceite comestible", "fruta seca", "embutido", "fiambre"],
        related_classes=[30, 31, 32, 43]
    ),
    30: NizaClass(
        number=30,
        category="Productos",
        title="Alimentos (café, té, harinas, dulces, especias)",
        description="Café, té, cacao y sucedáneos del café; arroz, pastas alimenticias y fideos; tapioca y sagú; harinas y preparaciones a base de cereales; pan, pastelería y confitería; chocolate; helados; azúcar, miel, jarabe de melaza; levadura, polvos de hornear; sal; condimentos, especias; yerba mate.",
        keywords=["café", "té", "yerba mate", "chocolate", "pan", "harina", "galletita", "azúcar", "dulce", "helado", "pasta", "arroz", "chipa", "condimento"],
        related_classes=[29, 31, 32, 43]
    ),
    31: NizaClass(
        number=31,
        category="Productos",
        title="Productos agrícolas, granos y alimentos para animales",
        description="Productos agrícolas, acuícolas, hortícolas y forestales en bruto y sin procesar; granos y semillas en bruto o sin procesar; frutas y verduras frescas, hierbas aromáticas frescas; plantas y flores naturales; bulbos, plantones y semillas para plantar; animales vivos; alimentos y sustancias para animales; malta.",
        keywords=["grano", "semilla", "soja", "maíz", "fruta fresca", "verdura fresca", "flor", "planta", "alimento balanceado", "ganado"],
        related_classes=[29, 30, 44]
    ),
    32: NizaClass(
        number=32,
        category="Productos",
        title="Cervezas, aguas y bebidas no alcohólicas",
        description="Cervezas; bebidas no alcohólicas; aguas minerales y gaseosas; bebidas a base de frutas y zumos de frutas; siropes y otras preparaciones para elaborar bebidas no alcohólicas.",
        keywords=["cerveza", "agua", "gaseosa", "jugo", "refresco", "bebida energética", "bebida isotónica", "guaraná", "zumo"],
        related_classes=[29, 30, 33, 43]
    ),
    33: NizaClass(
        number=33,
        category="Productos",
        title="Bebidas alcohólicas (excepto cervezas)",
        description="Bebidas alcohólicas (excepto cervezas); preparaciones alcohólicas para elaborar bebidas; vinos, licores, whisky, caña paraguaya, ron, vodka.",
        keywords=["vino", "whisky", "caña", "ron", "vodka", "licor", "ginebra", "tequila", "espumante", "alcohol"],
        related_classes=[32, 43]
    ),
    34: NizaClass(
        number=34,
        category="Productos",
        title="Tabaco y artículos para fumadores",
        description="Tabaco y sucedáneos del tabaco; cigarrillos y puros; cigarrillos electrónicos y vaporizadores orales; artículos para fumadores; cerillas.",
        keywords=["tabaco", "cigarrillo", "cigarro", "vape", "vapeador", "cigarrillo electrónico", "encendedor", "fósforo"],
        related_classes=[35]
    ),
    35: NizaClass(
        number=35,
        category="Servicios",
        title="Publicidad, gestión comercial y retail / tiendas",
        description="Publicidad; gestión, organización y administración de negocios comerciales; trabajos de oficina; servicios de venta minorista o mayorista (tiendas, e-commerce, supermercados).",
        keywords=["tienda", "comercio", "supermercado", "venta", "e-commerce", "publicidad", "marketing", "consultoría", "administración", "negocios"],
        related_classes=[36, 41, 42]
    ),
    36: NizaClass(
        number=36,
        category="Servicios",
        title="Financieros, bancarios e inmobiliarios",
        description="Servicios financieros, bancarios y monetarios; servicios de seguros; operaciones inmobiliarias; préstamos, inversiones, pasarelas de pago, fintech.",
        keywords=["banco", "financiera", "crédito", "préstamo", "seguro", "inmobiliaria", "alquiler", "fintech", "criptomoneda", "inversión"],
        related_classes=[35, 42]
    ),
    37: NizaClass(
        number=37,
        category="Servicios",
        title="Construcción, reparación e instalación",
        description="Servicios de construcción; servicios de instalación y reparación; extracción minera, perforación de pozos de petróleo y gas.",
        keywords=["construcción", "obra", "reparación", "instalación", "mantenimiento mecánico", "taller", "fontanería", "electricidad"],
        related_classes=[19, 42]
    ),
    38: NizaClass(
        number=38,
        category="Servicios",
        title="Telecomunicaciones",
        description="Servicios de telecomunicaciones; transmisión de datos, radiodifusión, streaming, telefonía, acceso a internet, mensajería electrónica.",
        keywords=["telecomunicaciones", "internet", "telefonía", "streaming", "radio", "televisión", "fibra óptica", "satélite"],
        related_classes=[9, 41, 42]
    ),
    39: NizaClass(
        number=39,
        category="Servicios",
        title="Transporte, logística y viajes",
        description="Transporte; embalaje y almacenamiento de mercancías; organización de viajes; envíos, encomiendas, delivery, flete.",
        keywords=["transporte", "flete", "logística", "delivery", "almacenamiento", "mudanza", "aerolínea", "agencia de viajes", "encomienda"],
        related_classes=[35, 43]
    ),
    40: NizaClass(
        number=40,
        category="Servicios",
        title="Tratamiento de materiales y producción a medida",
        description="Tratamiento de materiales; reciclaje de residuos; purificación del aire y tratamiento del agua; servicios de impresión; conservación de alimentos y bebidas.",
        keywords=["reciclaje", "impresión gráfica", "carpintería a medida", "tratamiento de metales", "maquila", "purificación"],
        related_classes=[16, 37]
    ),
    41: NizaClass(
        number=41,
        category="Servicios",
        title="Educación, entretenimiento y eventos",
        description="Educación; formación; servicios de entretenimiento; actividades deportivas y culturales; academias, universidades, espectáculos, conferencias.",
        keywords=["educación", "colegio", "universidad", "curso", "capacitación", "entretenimiento", "evento", "música", "concierto", "cine", "deportes"],
        related_classes=[9, 16, 43]
    ),
    42: NizaClass(
        number=42,
        category="Servicios",
        title="Servicios científicos, tecnológicos y desarrollo de software",
        description="Servicios científicos y tecnológicos, así como servicios de investigación y diseño en estos ámbitos; servicios de análisis e investigación industrial; diseño y desarrollo de equipos informáticos y de software; saas, hosting, ciberseguridad.",
        keywords=["desarrollo de software", "programación", "saas", "cloud", "ciberseguridad", "diseño web", "arquitectura", "ingeniería", "hosting"],
        related_classes=[9, 35, 38]
    ),
    43: NizaClass(
        number=43,
        category="Servicios",
        title="Restaurantes, bares y hotelería",
        description="Servicios de restauración (alimentación); hospedaje temporal; restaurantes, bares, cafeterías, hoteles, catering.",
        keywords=["restaurante", "bar", "café", "cafetería", "hotel", "hospedaje", "comida rápida", "catering", "gastronomía"],
        related_classes=[29, 30, 32, 33]
    ),
    44: NizaClass(
        number=44,
        category="Servicios",
        title="Servicios médicos, belleza y agricultura",
        description="Servicios médicos; servicios veterinarios; tratamientos de higiene y de belleza para personas o animales; servicios de agricultura, acuicultura, horticultura y silvicultura.",
        keywords=["clínica", "hospital", "médico", "dentista", "veterinaria", "peluquería", "spa", "estética", "agronomía"],
        related_classes=[3, 5, 10]
    ),
    45: NizaClass(
        number=45,
        category="Servicios",
        title="Servicios jurídicos y de seguridad",
        description="Servicios jurídicos; servicios de seguridad física para la protección de bienes materiales e individuos; servicios de citas, redes sociales personales; investigación genealógica.",
        keywords=["abogado", "jurídico", "notaría", "seguridad privada", "vigilancia", "patentes y marcas", "detective"],
        related_classes=[35, 36]
    )
}

def search_niza_classes(query: str) -> List[NizaClass]:
    """Busca clases Niza relevantes a partir de un texto o rubro comercial."""
    if not query:
        return []
    terms = [t.lower().strip() for t in query.split() if len(t.strip()) > 2]
    scored: List[tuple] = []
    
    for cls in NIZA_CLASSES.values():
        score = 0
        cls_keywords = [k.lower() for k in cls.keywords]
        cls_title = cls.title.lower()
        cls_desc = cls.description.lower()
        
        for term in terms:
            for kw in cls_keywords:
                if term == kw:
                    score += 5
                elif term in kw or kw in term:
                    score += 2
            if term in cls_title:
                score += 4
            if term in cls_desc:
                score += 1
                
        if score > 0:
            scored.append((score, cls))
            
    scored.sort(key=lambda x: x[0], reverse=True)
    return [cls for _, cls in scored]

def get_niza_class(class_number: int) -> Optional[NizaClass]:
    """Obtiene información detallada de una clase Niza específica."""
    return NIZA_CLASSES.get(class_number)
