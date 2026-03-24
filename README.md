# maayataan

**Plataforma abierta de corpus lingüístico maya yucateco para IA.**

Más de 800,000 personas hablan maya yucateco, pero casi no existen datos digitales para que la inteligencia artificial sea accesible en nuestra lengua. Sin datos, no hay traductores, asistentes de voz, ni herramientas educativas. maayataan existe para cambiar eso.

Cada voz que se suma construye el corpus que hará posible la tecnología en maya.

## Qué es maayataan

maayataan es una plataforma open-source para recolectar, validar y estructurar datos lingüísticos en maya yucateco — texto, traducciones y audio — diseñados para entrenar y hacer fine-tuning de modelos de IA.

El nombre viene del maya: **maaya** (maya) + **t'aan** (lengua, voz, palabra), **Maayat'aan** es como conocemos la lengua Maya hablada en la Península de Yucatán.

## Cómo funciona

1. **T'aan** — Escribe o graba una frase en maya y su traducción al español.
2. **Ts'aak** — La comunidad valida que la contribución sea correcta.
3. **Séeb** — El corpus crece y queda abierto para que cualquiera lo use.

## Quién puede participar

- **Hablantes y lingüistas** — Contribuye frases, graba audio, valida traducciones. [Regístrate como hablante](https://maayataan.org/hablantes).
- **Desarrolladores, diseñadores e instituciones** — Contribuye con código, diseño, conexiones API, datos o recursos. [Súmate como aliado](https://maayataan.org/aliados).
- **Cualquier persona** — Las contribuciones anónimas siempre están abiertas. No necesitas cuenta para aportar.

## Stack

- **Frontend:** [Astro](https://astro.build) + [React](https://react.dev)
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com) (Static Assets)
- **Design system:** Fraunces + DM Sans + JetBrains Mono. Ver [DESIGN.md](./DESIGN.md).

## Desarrollo local

```bash
# Clonar
git clone https://github.com/nosoypoot/maayataan.git
cd maayataan

# Instalar
npm install

# Variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar
npm run dev
```

Necesitas una instancia de Supabase con las tablas configuradas. Consulta el schema en el código fuente (`src/lib/database.types.ts`).

## Estructura del proyecto

```
src/
├── components/       # React components (islands)
│   ├── ui/           # Button, FormField, Card
│   ├── ContributionForm.tsx
│   ├── Certificate.tsx
│   ├── CommunityBadge.tsx
│   ├── SpeakerForm.tsx
│   ├── AllyForm.tsx
│   ├── AdminReview.tsx
│   └── ...
├── layouts/          # Layout base (nav, footer, theme)
├── lib/              # Supabase client, types
├── pages/            # Rutas Astro
│   ├── index.astro         # Landing
│   ├── contribuir.astro    # Formulario de contribución
│   ├── corpus.astro        # Explorador del corpus
│   ├── sumate.astro        # Registro comunidad (bridge)
│   ├── hablantes.astro     # Registro hablantes
│   ├── aliados.astro       # Registro aliados
│   ├── admin.astro         # Panel de administración
│   └── ...
└── styles/           # CSS global + design tokens
```

## Contribuir

Las contribuciones son bienvenidas. Si quieres ayudar:

1. Revisa los [issues abiertos](https://github.com/nosoypoot/maayataan/issues).
2. Haz fork, crea una rama, y envía un PR.
3. Para cambios grandes, abre un issue primero para discutir la dirección.

Lee [TODOS.md](./TODOS.md) para ver el roadmap actual.

## Contexto

maayataan nace en Yucatán, México. El objetivo es que la comunidad maya-hablante sea dueña de sus datos lingüísticos y que estos datos impulsen tecnología accesible en su lengua.

## Licencia

MIT

---

# maayataan (English)

**Open-source Yucatec Maya linguistic corpus platform for AI.**

Over 800,000 people speak Yucatec Maya, but almost no digital data exists to make AI accessible in our language. No data means no translators, voice assistants, or educational tools. maayataan exists to change that.

Every voice that joins builds the corpus that will make technology possible in Maya.

## What is maayataan

maayataan is an open-source platform for collecting, validating, and structuring Yucatec Maya linguistic data — text, translations, and audio — designed for training and fine-tuning AI models.

The name comes from Maya: **maaya** (Maya) + **t'aan** (language, voice, word),  **Maayat'aan** is the name of the Maya language spoken in the Yucatán Peninsula.

## How it works

1. **T'aan** — Write or record a phrase in Maya with its Spanish translation.
2. **Ts'aak** — The community validates that the contribution is correct.
3. **Séeb** — The corpus grows and stays open for anyone to use.

## Who can participate

- **Speakers and linguists** — Contribute phrases, record audio, validate translations. [Register as a speaker](https://maayataan.org/hablantes).
- **Developers, designers, and institutions** — Contribute code, design, API integrations, data, or resources. [Join as an ally](https://maayataan.org/aliados).
- **Anyone** — Anonymous contributions are always open. No account needed to contribute.

## Tech stack

- **Frontend:** [Astro](https://astro.build) + [React](https://react.dev)
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com) (Static Assets)
- **Design system:** Fraunces + DM Sans + JetBrains Mono. See [DESIGN.md](./DESIGN.md).

## Local development

```bash
git clone https://github.com/nosoypoot/maayataan.git
cd maayataan
npm install
cp .env.example .env
# Add your Supabase credentials to .env
npm run dev
```

You need a Supabase instance with the tables configured. See the schema in `src/lib/database.types.ts`.

## Contributing

Contributions are welcome. To help:

1. Check the [open issues](https://github.com/nosoypoot/maayataan/issues).
2. Fork, create a branch, and submit a PR.
3. For large changes, open an issue first to discuss direction.

See [TODOS.md](./TODOS.md) for the current roadmap.

## Context

maayataan is born in Yucatan, Mexico. The goal is for the Maya-speaking community to own their linguistic data and for that data to power accessible technology in their language.

## License

MIT
