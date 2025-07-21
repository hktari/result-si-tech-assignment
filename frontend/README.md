## Getting Started

The frontend App is built with Next.js, Redux Toolkit, and Shadcn UI. It connects to a backend API that is already deployed on Railway.

See `docs/activity_journal_app_design.md` for more information regarding the app design.

Developed and tested using:

- Node.js v22.12.0

### Development

```bash
cp .env.example .env.local
npm run dev
```

### Production

```bash
cp .env.example .env.local
npm run build
npm run start
```

### Testing

```bash
1. make sure app is running on localhost:3000
2. npm run cypress:run
```
