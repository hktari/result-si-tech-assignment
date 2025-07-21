# Activity Journal Application

A full-stack web application for tracking and analyzing personal activities. The application allows users to record their daily activities, view insights, and track progress over time.

## Project Overview

The Activity Journal application consists of:

- **Frontend**: Next.js 15 application with Redux Toolkit and RTK Query
- **Backend**: NestJS API with Prisma ORM and PostgreSQL database

## Features

- **Dashboard**: View quick stats, today's summary chart, and recent activities
- **Activity Management**: Create, edit, and delete activities with duration tracking
- **Insights**: Analyze activity patterns with interactive charts
- **Search/Filter**: Find activities by title, date range, and other criteria
- **Authentication**: Secure user authentication system

## Tech Stack

### Frontend

- Next.js 15 with App Router
- TypeScript
- Redux Toolkit with RTK Query
- Tailwind CSS with shadcn-ui components
- Recharts for data visualization
- Cypress for E2E testing

### Backend

- NestJS framework
- TypeScript
- Prisma ORM
- PostgreSQL database
- Jest for testing
- Swagger for API documentation

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Access the application at http://localhost:3000

### Prerequisites

- Node.js v22.12.0 or higher
- Docker and Docker Compose (for local database)
- Git

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL database:

   ```bash
   docker compose up -d
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Seed the database:

   ```bash
   npm run seed
   ```

   This creates seed data with:

   - 3 months of historical activity data
   - 4 activity categories: Reading, Coding, Exercise, Learning
   - 1-4 activities per day with realistic time ranges
   - Demo user: demo@example.com / demo123

7. Start the development server:

   ```bash
   npm run start:dev
   ```

8. Access the API documentation at http://localhost:3001/api/docs

## Testing

### Backend Tests

Run unit tests:

```bash
cd backend
npm run test
```

Run end-to-end tests:

```bash
cd backend
npm run test:e2e
```

### Frontend Tests

Run Cypress tests:

```bash
cd frontend
# Make sure app is running on localhost:3000
npm run cypress:run
```

## Production Setup

### Backend

1. Copy production environment variables:

   ```bash
   cd backend
   cp .env.example .env.production.local
   ```

2. Configure production environment variables

3. Setup the production database:

   ```bash
   npm run setup-db
   ```

4. Build and start the application:
   ```bash
   npm run build
   npm run start:prod
   ```

### Frontend

1. Copy production environment variables:

   ```bash
   cd frontend
   cp .env.example .env.production.local
   ```

2. Build and start the application:
   ```bash
   npm run build
   npm run start
   ```

## Project Structure

```
activity-journal/
├── backend/               # NestJS API
│   ├── prisma/            # Database schema and migrations
│   ├── src/               # Source code
│   │   ├── activities/    # Activities module
│   │   ├── auth/          # Authentication module
│   │   ├── insights/      # Insights module
│   │   └── main.ts        # Application entry point
│   └── test/              # Test files
├── frontend/              # Next.js application
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   ├── redux/             # Redux store and slices
│   └── cypress/           # E2E tests
└── README.md              # This file
```

## Key Implementation Details

- **Type Safety**: Strong typing throughout with auto-generated API types
- **API Caching**: Separate cache tags for activities and filtered activities
- **Authentication**: JWT-based authentication with automatic token refresh
- **Testing**: Comprehensive test coverage with mocked API responses
- **State Management**: Redux Toolkit with RTK Query for API state
- **Data Visualization**: Interactive charts for activity insights

## License

[MIT](LICENSE)
