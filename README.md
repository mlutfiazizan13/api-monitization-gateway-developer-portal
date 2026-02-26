# API Gateway — Developer Portal

A Next.js developer portal for the [API Monetization Gateway](../api-monetization-gateway) backend. Provides a full self-service interface for managing API keys, monitoring usage, and handling billing.

## Features

- **Authentication** — Register / login with JWT session management
- **Dashboard** — Usage stats, request volume chart, quota tracking
- **API Keys** — Create, rotate, and revoke keys with scope selection
- **Usage Analytics** — Time-series charts, latency tracking, per-endpoint breakdown
- **Billing** — Plan comparison, upgrade/downgrade, Stripe invoice history
- **Documentation** — Interactive API reference with copy-ready code examples

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Charts | Recharts |
| Forms | React Hook Form |
| Data Fetching | SWR |
| Icons | Lucide React |
| Date Utilities | date-fns |

## Project Structure

```
developer-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Auth guard + dashboard shell
│   │   ├── dashboard/page.tsx      # Overview
│   │   ├── dashboard/keys/         # API key management
│   │   ├── dashboard/usage/        # Usage analytics
│   │   ├── dashboard/billing/      # Plans & invoices
│   │   └── dashboard/docs/         # API documentation
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Root redirect
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── Header.tsx              # Top header bar
│   └── ui/
│       ├── StatCard.tsx            # Metric display card
│       └── QuotaBar.tsx            # Quota progress indicator
├── context/
│   └── AuthContext.tsx             # Auth state & actions
├── lib/
│   ├── api.ts                      # Typed API client
│   ├── auth.ts                     # Token helpers
│   └── types.ts                    # TypeScript interfaces
└── .env.local                      # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- The [api-monetization-gateway](../api-monetization-gateway) backend running

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

Copy `.env.local` and set the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

The backend defaults to port `8080`. Update this if your gateway runs on a different port.

### Building for Production

```bash
npm run build
npm start
```

## Backend API

This portal connects to the following backend endpoints:

| Group | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /me` |
| Keys | `GET /keys`, `POST /keys`, `DELETE /keys/{id}`, `POST /keys/{id}/rotate` |
| Usage | `GET /usage`, `GET /usage/timeline`, `GET /usage/endpoints` |
| Billing | `GET /billing/plan`, `POST /billing/upgrade`, `GET /billing/invoices`, `GET /billing/portal` |
| Gateway | `ANY /gateway/{path}` |

## Plans

| Plan | Price | Rate Limit | Monthly Quota |
|---|---|---|---|
| Free | $0 | 1 req/sec | 1,000 |
| Starter | $29/mo | 10 req/sec | 100,000 |
| Pro | $99/mo | 100 req/sec | 1,000,000 |

## API Key Usage

Once you have a key, pass it using any of these methods:

```bash
# Authorization header
curl https://your-gateway/gateway/endpoint \
  -H "Authorization: Bearer gw_your_key_here"

# Custom header
curl https://your-gateway/gateway/endpoint \
  -H "X-API-Key: gw_your_key_here"

# Query parameter
curl "https://your-gateway/gateway/endpoint?api_key=gw_your_key_here"
```

## Development Notes

- Authentication state is managed via `AuthContext` using `localStorage` for the JWT token
- All API calls go through `lib/api.ts` — update `NEXT_PUBLIC_API_URL` to point to your backend
- SWR handles data fetching with automatic revalidation; cache keys follow the pattern `['resource', ...params]`
- Charts use `recharts` with responsive containers — no SSR issues since all chart components are client-only
