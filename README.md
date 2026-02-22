# SplitEasy 💸

A Splitwise-inspired expense splitting app built with React, TypeScript, and Tailwind CSS. Track shared expenses, manage groups, and settle up with friends — fully mobile-ready.

---

## Features

- **Authentication** — Register and log in; session persists across reloads
- **Dashboard** — See your overall balance and recent expenses at a glance
- **Groups** — Create trip/group containers to organize shared expenses
- **Expenses** — Add expenses with category, location, and per-person splits
- **Balances** — Automatically computed who owes whom, simplified to minimal transactions
- **Settle Up** — Clear view of debts to resolve

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP | Axios |
| State | React Context + hooks |
| Testing | Vitest + React Testing Library |
| API | [rag-pipeline-91ct.vercel.app](https://rag-pipeline-91ct.vercel.app/docs) |

---

## Getting Started Locally

### Prerequisites

- Node.js 18+ and npm

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run coverage
```

---

## Deploying to Vercel

### Option A — Vercel CLI (fastest)

1. Install the Vercel CLI globally:

```bash
npm i -g vercel
```

2. From the project root, run:

```bash
vercel
```

3. Follow the prompts:
   - **Set up and deploy** → Yes
   - **Which scope** → your account
   - **Link to existing project?** → No
   - **Project name** → `spliteasy` (or anything you like)
   - **Directory** → `./` (current directory)
   - Vercel will auto-detect Vite and configure the build

4. For subsequent deploys:

```bash
vercel --prod
```

---

### Option B — GitHub + Vercel Dashboard

1. Push your code to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) → **Add New Project**

3. Import your GitHub repository

4. Vercel auto-detects Vite. Confirm the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click **Deploy**

Every push to `main` will trigger an automatic redeploy.

---

## Project Structure

```
src/
├── types/              # Shared TypeScript interfaces
├── services/           # API calls (authService, expenseService, tripService)
├── context/            # React Context (AuthContext, ExpenseContext)
├── utils/              # Balance computation helpers
├── components/
│   ├── shared/         # Header, BottomNav, Spinner, EmptyState
│   └── expenses/       # ExpenseCard
├── pages/              # Route-level page components
└── test/               # Vitest setup
```

---

## API

The app connects to a hosted REST API. All authenticated routes require the `X-API-Key` header, which is obtained on login and stored in `localStorage`.

| Endpoint | Description |
|---|---|
| `POST /api/users/register` | Create account |
| `POST /api/users/login` | Log in, returns `api_key` |
| `GET /api/expenses/` | List all expenses |
| `POST /api/expenses/` | Create expense |
| `PATCH /api/expenses/:id` | Update expense |
| `DELETE /api/expenses/:id` | Delete expense |
| `GET /api/trips/` | List groups |
| `POST /api/trips/` | Create group |
| `DELETE /api/trips/:id` | Delete group |

Full API docs: [https://rag-pipeline-91ct.vercel.app/docs](https://rag-pipeline-91ct.vercel.app/docs)
