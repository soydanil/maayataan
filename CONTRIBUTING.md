# Contribuir a maayataan

¡Gracias por querer contribuir! maayataan es un proyecto comunitario para preservar y digitalizar el maya yucateco. Cada contribución importa.

## Formas de contribuir

| Tipo | Cómo |
|---|---|
| 🐛 Reportar un bug | Abre un [issue](https://github.com/nosoypoot/maayataan/issues/new) con el prefijo `[bug]` |
| ✨ Proponer una feature | Abre un issue con el prefijo `[feature]` antes de escribir código |
| 🔤 Contribuir datos lingüísticos | Usa la plataforma en [maayataan.org](https://maayataan.org) |
| 💻 Contribuir código | Sigue el flujo de trabajo abajo |
| 🎨 Contribuir diseño | Lee `DESIGN.md` primero y abre un issue |
| 📖 Mejorar documentación | PR directo sin issue necesario |

---

## Flujo de trabajo para código

### 1. Setup local

```bash
git clone https://github.com/nosoypoot/maayataan.git
cd maayataan
npm install
cp .env.example .env
# Edita .env con tus credenciales de Supabase
npm run dev
```

Necesitas una cuenta en [Supabase](https://supabase.com) (gratuita) para el backend.

### 2. Crea una rama

```bash
git checkout -b tipo/descripcion-corta
```

Prefijos de rama:
- `feat/` — nueva funcionalidad
- `fix/` — corrección de bug
- `docs/` — documentación
- `refactor/` — refactor sin cambio de comportamiento
- `style/` — solo cambios visuales/CSS

Ejemplos: `feat/validacion-comunitaria`, `fix/audio-upload-error`

### 3. Haz tus cambios

- Lee `DESIGN.md` antes de tocar cualquier cosa visual — hay tokens de color, tipografía y espaciado definidos.
- Los componentes van en `src/components/`, las páginas en `src/pages/`.
- No hardcodees colores, fuentes ni tamaños — usa las variables CSS del design system.

### 4. Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción en imperativo

Ejemplos:
feat(corpus): add audio waveform preview
fix(auth): correct redirect after Google login
docs(readme): add Supabase schema setup section
```

### 5. Abre un Pull Request

- Título claro que describa el cambio
- Describe qué cambia y por qué
- Para cambios grandes: abre un issue primero y espera feedback antes de escribir código
- Si tu PR resuelve un issue: escribe `Closes #123` en la descripción

---

## Stack

- **Frontend:** Astro + React (islands)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Deployment:** Cloudflare Workers
- **Lenguaje:** TypeScript

---

## Principios del proyecto

- **Los datos son de la comunidad.** Todo decisión sobre el corpus debe considerar la soberanía lingüística de los hablantes mayas.
- **Accesibilidad primero.** Los contribuidores pueden ser hablantes sin email o dispositivos limitados.
- **Código abierto, siempre.** Licencia MIT. Nada del corpus ni del código se cierra.

---

## ¿Dudas?

Abre un issue con el prefijo `[pregunta]` o escríbenos. Todos los niveles de experiencia son bienvenidos.

---

# Contributing to maayataan *(English)*

Thank you for wanting to contribute! maayataan is a community project to preserve and digitize Yucatec Maya. Every contribution matters.

## Ways to contribute

| Type | How |
|---|---|
| 🐛 Report a bug | Open an [issue](https://github.com/nosoypoot/maayataan/issues/new) with prefix `[bug]` |
| ✨ Propose a feature | Open an issue with prefix `[feature]` before writing code |
| 🔤 Contribute linguistic data | Use the platform at [maayataan.org](https://maayataan.org) |
| 💻 Contribute code | Follow the workflow below |
| 🎨 Contribute design | Read `DESIGN.md` first and open an issue |
| 📖 Improve documentation | Direct PR, no issue needed |

---

## Code workflow

### 1. Local setup

```bash
git clone https://github.com/nosoypoot/maayataan.git
cd maayataan
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

You need a [Supabase](https://supabase.com) account (free) for the backend.

### 2. Create a branch

```bash
git checkout -b type/short-description
```

Branch prefixes:
- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation
- `refactor/` — refactor without behavior change
- `style/` — visual/CSS only changes

### 3. Make your changes

- Read `DESIGN.md` before touching anything visual — colors, typography, and spacing tokens are defined there.
- Components go in `src/components/`, pages in `src/pages/`.
- Don't hardcode colors, fonts, or sizes — use the CSS variables from the design system.

### 4. Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): imperative description

Examples:
feat(corpus): add audio waveform preview
fix(auth): correct redirect after Google login
docs(readme): add Supabase schema setup section
```

### 5. Open a Pull Request

- Clear title describing the change
- Describe what changes and why
- For large changes: open an issue first and wait for feedback before writing code
- If your PR resolves an issue: write `Closes #123` in the description

---

## Project principles

- **Data belongs to the community.** Every decision about the corpus must consider the linguistic sovereignty of Maya speakers.
- **Accessibility first.** Contributors may be speakers without email or with limited devices.
- **Open source, always.** MIT license. The corpus and code stay open.

---

## Questions?

Open an issue with prefix `[pregunta]` or `[question]`. All experience levels are welcome.
