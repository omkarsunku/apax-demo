# Demo APAX App

A minimal Web3 demo showcasing a portfolio vault with a modern frontend, backend API, and smart contracts.

## 🧱 Stack

- **Frontend**: Next.js
- **Backend**: Node.js + Express + ethers
- **Smart Contracts**: Solidity (Hardhat)

## 🔁 Architecture Flow

Frontend → Backend → Blockchain

- The frontend never talks directly to the blockchain
- The backend provides clean APIs and reads on-chain data
- The smart contract is the source of truth

---

## 📁 Project Structure

```text
/apax
├── /smart-contracts          # Hardhat and Smart Contracts
│   ├── /contracts
│   ├── /scripts
│   ├── /test
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env
│
├── /web                 # Web frontend (Next.js)
│   ├── /app
│   ├── /components
│   ├── /hooks
│   ├── /lib
│   ├── /public
│   ├── /src
│   ├── package.json
│   └── tsconfig.json
│
├── /shared                   # Shared resources (like ABIs)
│   ├── /abi
│   └── constants.ts
│
└── README.md                 # Project documentation

```

## Install Dependencies

From the **root of the repository**:

```bash
cd /web
npm install
```

## Run the Project

From the **root of the repository**:

```bash
cp web/src/config/config.env.example web/.env
```

Set at minimum `MONGO_URI` and `JWT_SECRET` in `web/.env`, then run:

```bash
cd web
npm run dev
```

For the local blockchain integration, start and deploy in two additional terminals:

```bash
cd smart-contracts
npm run node
```

```bash
cd smart-contracts
npm run deploy:local
```

Set `RPC_URL=http://127.0.0.1:8545` and the printed `CONTRACT_ADDRESS` in
`web/.env`, then restart `npm run dev`. Verify the backend connection at
`GET http://localhost:4000/api/blockchain/status`. The dashboard ticker reads
this endpoint and displays the live chain id, block, APXG address, and supply.

## Once running, open your browser and go to: http://localhost:3000 to view the app locally.

## Assessment implementation

Work completed on `assessment/omkar` across the frontend, API, and EVM contract.

### Authentication and holdings

- Email login calls `POST /user/login`, displays server/network errors, disables the form while loading, stores the returned JWT as `apax_token`, and routes to `/dashboard`.
- JWTs contain the user's id and email, use `JWT_SECRET`/`JWT_EXPIRE`, and are returned only in JSON. Protected APIs consistently expect `Authorization: Bearer <token>`.
- `GET /api/holdings` is authenticated and returns gold, silver, and platinum in a stable portfolio-oriented shape. `Holding` enforces one non-negative record per user and asset.
- Password hashes are removed from login responses. The API has explicit CORS configuration and centralized JSON errors.

For production, I would prefer an HttpOnly, Secure, SameSite cookie over local storage to reduce token theft via XSS; this implementation uses bearer tokens because the assessment explicitly asks the frontend to store the JWT. Next security steps are Helmet, login rate limiting, strict production CORS, request validation, secret rotation, refresh-token/session revocation, and audit logging.

### Moving the dashboard off mocks

I would first add typed `holdingsApi()` and `activityApi()` service functions and replace only `userHoldings`/`auditLogs` in the Zustand store with `{ data, status, error, fetchedAt }` slices plus `fetchDashboard()`. `DashboardView` would trigger one parallel fetch and existing presentational components would keep consuming normalized store values. `PortfolioOverview` gets skeleton cards while loading, zero-value/empty copy for a successful empty response, and an inline retry alert on error; activity gets the same three explicit states.

API DTOs should be defined at the network boundary and parsed with the existing Zod dependency. A small mapper converts DTO fields and ISO timestamps into the UI's `UserHolding` and `AuditLog` types. This prevents `any`, keeps wire-format changes localized, and avoids coupling Mongoose documents directly to React types. Prices and holdings should refresh on a modest polling interval or focus revalidation; activity can later move to SSE/WebSocket without rewriting the cards.

### Compliance-aware APX Gold

`APAXToken` is now an ERC-20 hybrid with separate admin, compliance, minter, burner, and pauser roles. It starts at zero supply; whitelisted minting is tied to an external vault deposit id, burning to a redemption id, all transfers require both parties to be approved, and emergency pause covers mint/burn/transfers. Tests cover authorized mint, authorized burn, blocked transfer, compliant transfer, role enforcement, and pause.

This hybrid is substantially smaller and easier to integrate than ERC-3643, while ERC-3643 is preferable if interoperable on-chain identity, claim topics, recovery, and jurisdiction modules are required. Highest-risk areas are compromised role keys, duplicate/off-chain deposit attestations, minting above audited reserves, allowlist races, redemption replay, privileged upgrades, oracle/indexer reorg handling, and decimal/unit mistakes. Production roles should be separated across multisigs/timelocks, deposit and redemption ids should be made single-use on-chain, reserve invariants monitored, and the contract independently audited.

The Next.js app can read `balanceOf` and `allowance` with ethers/wagmi against a configured chain and contract address. Confirmed on-chain events are the source of truth for token balances; MongoDB is a rebuildable, confirmation-aware read model enriched with vault and compliance metadata. Before burn, the backend must authenticate the owner, verify KYC and sanctions status, lock the redemption request and inventory, validate balance/fees/delivery details, prevent duplicate processing, then authorize the burner. Physical release happens only after the burn reaches the required confirmations.

### Week-one priority

1. Ship tested login, protected routing, secret/config validation, and baseline API hardening.
2. Seed and expose authenticated holdings/activity, then wire one dashboard view with explicit UI states and runtime DTO validation.
3. Define the deposit/redemption state machines and operational role custody before deploying tokens.
4. Test the contract's permissions, pause, replay resistance, and reserve accounting; deploy only to a testnet behind multisig roles.
5. Add an event indexer with confirmation/reorg handling and reconcile its read model against chain state.

Candidate: GitHub `omkarsunku`. Availability: 20–30 hours/week.
