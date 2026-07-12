# ResumeCraft AI

> AI-powered CV builder with 25 professionally designed templates, real-time live preview, drag-and-drop reordering, and one-click PDF export.

![ResumeCraft AI](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

---

## ✨ Features

- **25 CV Templates** — Classic, Modern, Minimal, Executive, Tech, Creative, Elegant, Bold, Corporate, Academic, Compact, Timeline, Infographic, Newspaper, Nordic, Retro, Stealth, Gradient, Brutalist, Sidebar Light, Two-Page, Portfolio, Monochrome, Atlas, Swiss
- **AI Writing Assistant** — Generate and improve professional summaries and job descriptions using LLM
- **Live Preview** — Real-time preview updates as you type
- **PDF Export** — High-quality PDF via browser print dialog (Save as PDF)
- **Drag & Drop Reordering** — Reorder entries within each section using @dnd-kit
- **6 CV Sections** — Personal Info, Work Experience, Education, Skills, Projects, Certifications
- **Multi-CV Dashboard** — Create, manage, and duplicate multiple CVs
- **Completion Tracker** — Visual indicator showing how many sections are filled
- **Authentication** — Secure JWT-based session authentication
- **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer               | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Frontend**        | React 19, TypeScript, Tailwind CSS v4, Vite       |
| **UI Components**   | shadcn/ui (Radix UI), Lucide Icons, Framer Motion |
| **State & Data**    | TanStack Query v5, React Hook Form, Zod           |
| **API**             | tRPC v11 (end-to-end typesafe), Express           |
| **Database**        | MySQL 8.4, Drizzle ORM                            |
| **Auth**            | JWT (jose), bcryptjs, HTTP-only cookies           |
| **Drag & Drop**     | @dnd-kit/core, @dnd-kit/sortable                  |
| **Testing**         | Vitest                                            |
| **Package Manager** | pnpm                                              |
| **Infrastructure**  | Docker, Docker Compose                            |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 10
- [Docker](https://www.docker.com/) & Docker Compose (for MySQL)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/josapratama/resumecraft-ai.git
cd resumecraft-ai
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL=mysql://cv_user:cv_password@localhost:3306/cv_builder

# Auth — generate a strong random secret
JWT_SECRET=your_random_secret_here

# AI (OpenAI-compatible API)
BUILT_IN_FORGE_API_URL=https://your-llm-endpoint/v1
BUILT_IN_FORGE_API_KEY=your_api_key_here
```

### 4. Start MySQL with Docker

```bash
docker-compose up -d
```

This starts:

- **MySQL 8.4** on port `3306`
- **phpMyAdmin** on port `8080` (optional, for visual DB management)

### 5. Run database migrations

```bash
pnpm db:push
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
resumecraft-ai/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── _core/
│   │   │   └── hooks/
│   │   │       └── useAuth.ts       # Auth hook
│   │   ├── components/
│   │   │   ├── CVEditor/
│   │   │   │   ├── templates/       # 25 CV template components
│   │   │   │   │   ├── _shared.tsx  # Shared template utilities
│   │   │   │   │   ├── ModernTemplate.tsx
│   │   │   │   │   ├── ClassicTemplate.tsx
│   │   │   │   │   └── ... (22 more)
│   │   │   │   ├── CVPreview.tsx    # Live preview component
│   │   │   │   ├── AIAssistant.tsx  # AI writing panel
│   │   │   │   ├── DraggableList.tsx
│   │   │   │   ├── PersonalInfoForm.tsx
│   │   │   │   ├── WorkExperienceForm.tsx
│   │   │   │   ├── EducationForm.tsx
│   │   │   │   ├── SkillsForm.tsx
│   │   │   │   ├── ProjectsForm.tsx
│   │   │   │   └── CertificationsForm.tsx
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Dashboard
│   │   │   ├── CVEditor.tsx         # Editor page
│   │   │   ├── Login.tsx
│   │   │   └── NotFound.tsx
│   │   ├── lib/
│   │   │   ├── pdfExport.ts         # PDF export logic
│   │   │   └── trpc.ts              # tRPC client
│   │   └── types/
│   │       └── cv.ts                # TypeScript types
│
├── server/                     # Backend (Express + tRPC)
│   ├── _core/                  # Framework core utilities
│   │   ├── auth.ts
│   │   ├── cookies.ts
│   │   ├── llm.ts              # LLM integration
│   │   └── trpc.ts
│   ├── cv.router.ts            # CV CRUD tRPC router
│   ├── cv.ai.router.ts         # AI assistant tRPC router
│   ├── db.ts                   # Database queries
│   ├── routers.ts              # Root router
│   └── *.test.ts               # Test files
│
├── shared/                     # Shared types and constants
│   ├── types.ts
│   └── const.ts
│
├── drizzle/                    # Database schema and migrations
│   ├── schema.ts
│   ├── relations.ts
│   └── *.sql                   # Migration files
│
├── docker/
│   └── mysql-init/
│       └── 01-grants.sql       # DB user setup
│
├── docker-compose.yml
├── drizzle.config.ts
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

---

## 🎨 CV Templates

Templates are organized into 4 categories:

| Category         | Templates                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| **Classic**      | Classic, Minimal, Executive, Academic, Compact, Monochrome             |
| **Professional** | Modern, Corporate, Tech, Nordic, Swiss, Two-Page                       |
| **Stylish**      | Elegant, Bold, Creative, Gradient, Sidebar Light, Atlas                |
| **Unique**       | Timeline, Infographic, Newspaper, Retro, Stealth, Brutalist, Portfolio |

---

## 🧪 Running Tests

```bash
pnpm test
```

Test coverage includes:

- Authentication (`auth.me`, `auth.logout`)
- Cookie security options
- tRPC procedure guards (protected routes)
- CV router (auth guards + input validation)

---

## 📦 Available Scripts

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Start development server (hot reload) |
| `pnpm build`   | Build for production                  |
| `pnpm start`   | Run production build                  |
| `pnpm test`    | Run test suite                        |
| `pnpm db:push` | Generate and run Drizzle migrations   |
| `pnpm check`   | TypeScript type check                 |
| `pnpm format`  | Format code with Prettier             |

---

## 🗃️ Database Schema

The database has 6 main tables:

```
users               — Account credentials
cvs                 — CV records (title, template, user)
personal_info       — Name, email, phone, location, summary
work_experiences    — Job history with dates and descriptions
educations          — Degree, field, school, graduation date
skills              — Skill name, category, proficiency level
projects            — Project name, description, tech stack, link
certifications      — Cert name, issuer, issue date, expiry
```

---

## 🔐 Authentication

- Session-based auth using **HTTP-only cookies**
- Passwords hashed with **bcryptjs**
- JWT tokens signed with **jose**
- Protected tRPC procedures return `UNAUTHORIZED` if not logged in

---

## 📄 PDF Export

PDF export uses the browser's native **print dialog**:

1. Click **Export PDF** in the editor
2. A new window opens with the clean CV layout
3. The print dialog opens automatically
4. Select **"Save as PDF"** as destination
5. Click **Save**

This approach produces **vector-quality output** (not rasterized) and correctly renders all Tailwind CSS styles.

---

## 🐳 Docker Setup

```yaml
# docker-compose.yml services:
mysql: # MySQL 8.4 on port 3306
phpmyadmin: # phpMyAdmin on port 8080 (optional)
```

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Stop and remove volumes (reset DB)
docker-compose down -v
```

---

## ⚙️ Environment Variables

| Variable                    | Required | Description                           |
| --------------------------- | -------- | ------------------------------------- |
| `DATABASE_URL`              | ✅       | MySQL connection string               |
| `JWT_SECRET`                | ✅       | Secret for JWT signing (min 32 chars) |
| `BUILT_IN_FORGE_API_URL`    | ⚠️       | LLM API base URL (OpenAI-compatible)  |
| `BUILT_IN_FORGE_API_KEY`    | ⚠️       | LLM API key                           |
| `VITE_APP_ID`               | ❌       | App identifier (optional)             |
| `VITE_ANALYTICS_ENDPOINT`   | ❌       | Analytics endpoint (optional)         |
| `VITE_ANALYTICS_WEBSITE_ID` | ❌       | Analytics website ID (optional)       |

> ⚠️ AI features require a valid LLM API key. Without it, AI assistant buttons will be disabled.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using conventional commits: `git commit -m "feat: add new template"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
chore:    Build/tooling changes
docs:     Documentation only
refactor: Code refactoring without feature change
test:     Adding or updating tests
style:    Formatting, missing semicolons, etc.
```

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ using React, tRPC, and Drizzle ORM</p>
