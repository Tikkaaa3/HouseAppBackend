# Homed Backend

Backend for the **Homed**

Built with **Node.js + TypeScript + Express + Prisma + PostgreSQL**.

---

## Features

 **Authentication**
  - Signup with Argon2 password hashing
  - Login with JWT
  - Auth middleware & `/auth/me` route
   **House management**
  - Create, join, leave a house
  - Members list per house
   **Chores**
  - Create chores (daily/weekly/monthly)
  - Assign to house members
  - Mark chores as completed
   **Shopping Lists**
  - Shared shopping lists within a house
  - Add/remove/update items
   **Global Items**
  - Manage global items with category and unit
  - Categories: kitchen, cleaning, fridge, pantry, etc.
  - Units: pcs, g, kg, L, ml, etc.
   **Recipes**
  - Create, edit, delete recipes
  - Add ingredients from items
  - Suggest recipes based on available items
   **Profile**
  - Fetch user info (name, email, house)

---

## Tech Stack

- [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)  
- [Express](https://expressjs.com/)  
- [Prisma](https://www.prisma.io/) (PostgreSQL ORM)  
- [PostgreSQL](https://www.postgresql.org/) (via Docker)  
- [JWT](https://jwt.io/) for authentication  
- [Argon2](https://www.npmjs.com/package/argon2) for password hashing  

---

## Getting Started

### Requirements

- Node.js >= 18
- Docker (for PostgreSQL)

### Setup

```bash
# install dependencies
npm install

# start postgres in docker
docker run --name houseapp-db \
  -e POSTGRES_USER=houseapp \
  -e POSTGRES_PASSWORD=houseapp \
  -e POSTGRES_DB=houseapp_dev \
  -p 5432:5432 -d postgres:15

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

## API Overview

### Auth
-	POST /auth/signup → { user, token }
-	POST /auth/login → { user, token }
-	GET /auth/me (with Bearer token) → { user }

### Houses
-	POST /houses → Create a house
-	POST /houses/join → Join by code
-	POST /houses/leave → Leave house
-	GET /houses/members → List house members

### Items
-	GET /items → List global items
-	POST /items → Add item
-	PATCH /items/:id → Update item
-	DELETE /items/:id → Archive item

### Chores
-	GET /chores → List chores
-	POST /chores → Create chore
-	POST /chores/:id/archive → Mark as archived
-	PATCH /chores/:id/reassign → Assign chore to member

### Recipes
-	GET /recipes → List recipes
-	GET /recipes/:id → Get recipe detail
-	POST /recipes → Create recipe
-	PATCH /recipes/:id → Update recipe
-	DELETE /recipes/:id → Delete recipe
-	POST /recipes/:id/ingredients → Add ingredient
-	PATCH /recipes/:id/ingredients/:ingredientId → Update ingredient
-	DELETE /recipes/:id/ingredients/:ingredientId → Delete ingredient
-	POST /recipes/suggest → Suggest recipes based on items

### Shopping Lists
-	GET /shopping-lists → List shopping lists
-	POST /shopping-lists → Create list
-	PATCH /shopping-lists/:id → Update list
-	DELETE /shopping-lists/:id → Delete list
-	POST /shopping-lists/:id/items → Add item to list
- DELETE /shopping-lists/:id/items/:lineId → Remove item from list

  ## Project Structure
  src/
  
├─ modules/

│  ├─ auth/         # signup, login, auth middleware

│  ├─ houses/       # house create/join/leave

│  ├─ items/        # global items CRUD

│  ├─ chores/       # chores CRUD + complete + assign

│  ├─ recipes/      # recipes CRUD + suggest

│  └─ shopping/     # shopping lists

├─ middleware/      # auth checks

├─ prisma/          # schema + migrations

├─ app.ts           # express app

└─ server.ts        # server entry

## Contributing
	1.	Fork the repo
	2.	Create a branch: git checkout -b feature/my-feature
	3.	Commit changes: git commit -m "add my feature"
	4.	Push branch: git push origin feature/my-feature
	5.	Open a Pull Request

## License
[MIT License](./LICENSE) © 2025 Emre Tolga Kaptan
