# HouseAppBackend

Backend for a house management app (shopping, chores, recipes, expenses).  
Built with **Node.js + TypeScript + Express + Prisma + PostgreSQL**.

## Features so far

- Express server with `/health`
- PostgreSQL in Docker
- Prisma schema with `User` and `House` models
- Authentication:
  - Signup with Argon2 password hashing
  - Login with password verification + JWT
  - Protected `/auth/me` route with middleware

## Getting started

### Requirements

- Node.js >= 18
- Docker (for Postgres)

### Setup

```bash
# install dependencies
npm install

# start postgres in docker
docker run --name houseapp-db   -e POSTGRES_USER=houseapp   -e POSTGRES_PASSWORD=houseapp   -e POSTGRES_DB=houseapp_dev   -p 5432:5432   -d postgres:15

# create .env
echo "
DATABASE_URL=postgresql://houseapp:houseapp@localhost:5432/houseapp_dev?schema=public
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=7d
" > .env

# run prisma migration
npx prisma migrate dev --name init

# start dev server
npm run dev
```

### API

- `GET /health` → `{ ok: true }`
- `POST /auth/signup` → `{ user, token }`
- `POST /auth/login` → `{ user, token }`
- `GET /auth/me` (with `Authorization: Bearer <token>`) → `{ user }`

## Next steps

- Houses: create / join / leave
- Shopping lists
- Chores
- Recipes
- Expenses

