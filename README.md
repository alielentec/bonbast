# Iran Rates

Live free-market rates for currencies, gold, and crypto in Iranian Toman.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **Tailwind CSS v4**
- **flagpack** + **@web3icons/react** + **lucide-react** for iconography
- **html-to-image** for share-card PNG generation

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Production build

```bash
npm run build
npm start
```

## Deploy

This project is built to deploy to Vercel with zero configuration. Push to
GitHub and import the repo at <https://vercel.com/new>.

## Status

Currently rendering mock data. Live data wiring is the next step — pending
decision between bonbast's paid API and parsing the public homepage.
