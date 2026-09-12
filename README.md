# MarcaCheck PY 🇵🇾
### Sistema de Inteligencia Marcaria y Clearance Registral para Paraguay
**Integración oficial en tiempo real con DINAPI (Joaju/IPAS) • Inteligencia de Mercado Web con Tavily • Asesor Legal Interactivo con OpenAI (Ley N° 1294/98)**

---

## 🚀 Descripción General

**MarcaCheck PY** es una plataforma integral moderna diseñada para abogados de propiedad intelectual, agentes de marcas, emprendedores y empresas que necesitan investigar la disponibilidad y viabilidad de signos distintivos en la República del Paraguay.

A diferencia de las búsquedas simples, MarcaCheck PY realiza una investigación tridimensional:
1. **Cotejo Oficial en DINAPI:** Consulta el backend gubernamental del sistema Joaju / IPAS de la Dirección Nacional de Propiedad Intelectual (DINAPI), ejecutando cotejos fonéticos adaptados al español y guaraní, búsqueda por contención y coincidencia exacta.
2. **Inteligencia Web con Tavily:** Rastrea la presencia de la marca en internet, identificando marcas de hecho no registradas, comercio activo en Paraguay (`.py`, redes sociales, dominios locales) para prevenir oposiciones basadas en uso anterior o notoriedad.
3. **Asesor Legal Interactivo con OpenAI:** Un chat con un abogado digital especializado en el régimen marcario paraguayo (Ley 1294/98), que recibe en tiempo real todo el contexto de la investigación para responder dudas, sugerir estrategias de registro (marcas mixtas, delimitación de productos) y plazos de oposición.

---

## 🛠️ Arquitectura y Tecnologías

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend API:**
  - `/api/investigate`: Motor de clearance y cotejo en DINAPI + Tavily.
  - `/api/chat`: Asesor legal interactivo con OpenAI.
  - `/api/niza`: Clasificación Internacional de Niza (1 a 45) con búsqueda semántica.
- **Motores y Librerías:**
  - `src/lib/dinapi.ts`: Cliente HTTPS con agente tolerante a cadenas intermedias de certificados gubernamentales.
  - `src/lib/phonetics.ts`: Normalizador ortográfico, algoritmo fonético hispano-guaraní, distancias de Levenshtein y Jaro-Winkler.
  - `src/lib/niza.ts`: Base completa de las 45 clases Niza (productos 1-34 y servicios 35-45).
  - `src/lib/tavily.ts`: Rastreador de inteligencia web y notoriedad comercial.
  - `src/lib/clearance.ts`: Motor de dictamen de viabilidad, cálculo de riesgo (0-100%) y semáforo legal.
  - `src/lib/openai.ts`: Integración con OpenAI especializada en Ley 1294/98.

---

## 📋 Requisitos Previos

- Node.js 18+ (recomendado Node 20+)
- Clave de API de **Tavily** (obtén una gratuita en [tavily.com](https://tavily.com))
- Clave de API de **OpenAI** (para el Asesor Legal interactivo)

---

## ⚙️ Configuración

1. Clona el repositorio e ingresa al directorio:
```bash
git clone https://github.com/marcosferr/marcacheck-py.git
cd marcacheck-py
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea tu archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura tus credenciales en `.env`:
```env
# Clave de API de Tavily
TAVILY_API_KEY=tvly-...

# Clave de API de OpenAI (opcional aquí; también puedes ingresarla directamente en la UI)
OPENAI_API_KEY=sk-...

PORT=3000
DINAPI_TIMEOUT=15
```

---

## 🖥️ Ejecución

### Modo Desarrollo:
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Compilación y Producción:
```bash
npm run build
npm run start
```

---

## 🧪 Pruebas y Casos de Validación

La aplicación incluye soporte y pruebas sobre marcas reales verificadas:
- **`indicia`**: 0 antecedentes en DINAPI. Score de viabilidad alto (90%).
- **`tereredev`** (Clase 42): 0 antecedentes en DINAPI. Sin colisiones registradas, sugerencia de registro para software y servicios web.
- **`metrika`** (Clase 42): Detecta la marca concedida `MÉTRIKA E.A.S.` (Reg. 632524) y presencia activa de `Metrika Paraguay` en LinkedIn y web local. Dictamina alerta de riesgo por colisión registral y uso anterior.

---

## ⚖️ Marco Legal Aplicado

- **Ley N° 1294/98 de Marcas de Paraguay:**
  - **Art. 2 Inc. a):** Prohibición de registro de signos idénticos a otros ya registrados en la misma clase.
  - **Art. 2 Inc. b):** Prohibición de signos semejantes susceptibles de causar confusión fonética, gráfica o conceptual.
  - **Art. 16:** Plazo de 60 días hábiles para deducción de oposiciones tras la publicación en la Gaceta Oficial.
  - **Art. 27:** Caducidad por falta de uso ininterrumpido durante 5 años.
- **Clasificación de Niza (11ª/12ª Edición):** Cobertura exhaustiva de las 45 clases oficiales.

---

## 👤 Licencia
MIT License. Desarrollado para modernizar la práctica del derecho marcario y la protección de propiedad intelectual en Paraguay.
