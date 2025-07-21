# Setup Development Environment

1. copy .env.example to .env
2. docker compose up (run postgres)
3. npx prisma migrate dev
4. npm run seed
5. npm run start:dev

# Testing

1. npm run test
2. npm run test:e2e

# Setting up production database

1. copy .env.example .env.production.local
2. fill in production environment variables
3. npm run setup-db
