# Master Of Digital

Single-seller storefront for **masterofdigital.com**. The catalog is your Digiseller
shop: every category and item in the shop section of your seller dashboard (your own
items and partner items you added as an affiliate) is synced automatically. Payment,
delivery, the buyer's email login and chat with the seller all happen on Digiseller.

## How it works

| Piece | What it does |
| --- | --- |
| Sync (`src/lib/catalog/sync.ts`) | Every `SYNC_INTERVAL_MINUTES` pulls the shop's category tree and all items in both EN/USD and RU/RUB, then fetches each item's info to read its seller ID. Items added in Digiseller appear; removed ones disappear. If any category fails to load, the previous catalog is kept rather than hiding items. |
| Own vs partner | Item seller ID == `DIGISELLER_SELLER_ID` → **own**: Buy goes straight to Digiseller checkout. Anything else → **partner**: Buy adds your affiliate ID (`ai=`) so the commission is credited. |
| Buy button | `/{locale}/buy/{id}` re-checks the item is still in the shop, then redirects to Digiseller checkout. |
| Storage | `data/catalog.json` (last good snapshot) and `data/last-sync.json` (last sync report). No database needed for ≤200 items. |
| Languages | `/en` (English, USD) and `/ru` (Russian, RUB). `/` picks by browser language. |

## Local development

```bash
npm install
DIGISELLER_MOCK=1 DIGISELLER_SELLER_ID=1000001 npm run dev   # sample data
npm test            # unit tests
npm run lint && npm run typecheck
```

With a real seller ID and network access to `api.digiseller.ru`, drop `DIGISELLER_MOCK`.

## Deploy (any VPS with Docker)

1. Point the DNS `A` records for `masterofdigital.com` and `www` at the server.
2. `cp .env.example .env` and fill it in.
3. `docker compose up -d --build`

Caddy provisions HTTPS automatically. Check status at `/api/health`.
Force a sync after changing the Digiseller shop:

```bash
curl -X POST -H "Authorization: Bearer $SYNC_SECRET" https://masterofdigital.com/api/sync
```
