# 💸 Spendly — Smart Expense Tracking

> A modern, full-stack expense tracking web app to help you understand and manage your spending habits.

🔗 **Live Demo:** [spendly-ranjan.vercel.app](https://spendly-ranjan.vercel.app)

---

## 📌 About

**Spendly** is a smart personal finance tracker that lets you log, categorize, and visualize your expenses — all in a clean, responsive interface. Built with a modern React + TypeScript stack, it uses Supabase as the backend and deploys seamlessly on Vercel.

---

## ✨ Features

- 📊 **Interactive Charts** — Visualize spending trends using Recharts
- 🗂️ **Expense Categorization** — Organize expenses by category for better insights
- 📄 **PDF Export** — Download expense reports with jsPDF + AutoTable
- 🔐 **Authentication** — Secure user accounts powered by Supabase Auth
- 🗃️ **Database** — Real-time data storage with Supabase PostgreSQL
- 🎨 **Modern UI** — Accessible, themeable components via shadcn/ui + Radix UI
- 📱 **Responsive Design** — Mobile-first layout with Tailwind CSS
- 🌗 **Dark Mode** — Theme switching with next-themes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + tailwindcss-animate |
| UI Components | shadcn/ui (Radix UI) |
| Backend / DB | Supabase (Auth + PostgreSQL) |
| Data Fetching | TanStack React Query |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Routing | React Router DOM v6 |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) (recommended) or npm
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/codingwithranjan/spendly-ranjan.git
cd spendly-ranjan
```

### 2. Install dependencies

```bash
bun install
# or
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the local dev server |
| `bun run build` | Build for production |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run ESLint |
| `bun run test` | Run unit tests with Vitest |
| `bun run test:watch` | Run tests in watch mode |

---

## 🗂️ Project Structure

```
spendly-ranjan/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions & Supabase client
│   └── main.tsx        # App entry point
├── supabase/           # Supabase migrations & config
├── .env                # Environment variables (not committed)
├── vite.config.ts      # Vite configuration
└── tailwind.config.ts  # Tailwind CSS configuration
```

---

## 🧪 Testing

Unit tests are handled by **Vitest** and end-to-end tests by **Playwright**.

```bash
# Unit tests
bun run test

# E2E tests
bunx playwright test
```

---

## 🚢 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Fork this repository.
2. Import the project into [Vercel](https://vercel.com/).
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.
4. Deploy!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Ranjan** — [@codingwithranjan](https://github.com/codingwithranjan)

---

## 📄 License

This project is open source. Feel free to use and modify it as you see fit.
