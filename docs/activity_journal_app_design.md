**Activity Journal App Design Document**

**1. Project Overview**

- **Purpose:** Enable users to log daily activities, reflect on habits, and visualize progress over time.
- **Target Audience:** Knowledge workers, students, hobbyists, and anyone seeking to track and analyze their routines and goals.

**2. Core Features**

- **Activity Logging:** Quick entry of activities
- **Dashboard Summary**: Shows for today added entries. Visualized using Simple Bar Chart (`timePerTitle` metric)
- **Smart Activity Entry:** Suggestions for title based on existing entries
- **Insights & Charts:** visualize data over time\*\* \*\*&#x20;
- **Search & Filter:** Users can find a past entry using search that matches titles, descriptions. On click navigates to entry detail page

**3. User Personas**

- **Persona C — "Sam", Fitness Enthusiast:** Tracks workouts, sleep quality, and hydration habits.

**4. UX/UI Sketches & Flows**

4. **Login**: DEMO login with prefilled credentials 

1) **Home Dashboard:** Today’s summary at top, quick-add button floating. List of entries for today with the ability to quickly delete an entry OR edit duration
2) **Log Entry Modal:** Includes:

- **Title Input**: Text field with autosuggestions from recent entries
- **Duration Picker**:
  - Two dropdowns for hours (step: 1) and minutes (step: 15)
  - Hours: 0–12; Minutes: 0, 15, 30, 45
- **Date Selector**: Defaults to today; allows manual selection
- **Optional Notes**: Textarea for description
- **Save Button**: Validates inputs and closes modal on success 

3. **Insights Page:** Filter controls to search & filter above interactive charts.
   1. **Filter Bar (Sticky Header)** 
      - **Date Range Dropdown**
        - Options: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, This Year
      - **Interval Selector (if \`\`)**
        - Radio buttons: `Daily`, `Weekly`, `Monthly`
      - **Apply Button**
        - Triggers fetch to `/api/insights?...`
   2. **3. Chart Metadata**
      - Show:
        - `interval`
        - title
        - Total duration sum
      #### **4. Empty State / Error**
      - Show friendly message if:
        - No data returned
        - API error

**5. Data Model & API Endpoints**

```json
// Simplified ER model
{
  "User": { "id", "name", "email", "preferences" },
  "Activity": { "id", "userId", "title", "description", "duration": "number",  "timestamp": "datetime" }
}
```

- **POST /api/activities** — Create a new activity log.

- **PATCH /api/activities**\*\*/{id}\*\* —&#x20;

- **DELETE** **/api/activities/{id}**

-

## **GET /api/activities?search=** — Fetch by title, description

### Backend (e.g., Node.js + PostgreSQL)

1. **Parse search string**\
   Split by spaces into keywords:

```
const keywords = search.trim().split(/\s+/);

```

2. **Build SQL WHERE clause**\
   Use `ILIKE` with `%` wildcards for each keyword, combined with AND:

```
WHERE title ILIKE '%keyword1%' OR description ILIKE '%keyword1%'
AND title ILIKE '%keyword2%' OR description ILIKE '%keyword2%'
...

```

3. **Parameterized query example (using pg client):**

```
const conditions = keywords.map((_, i) => 
  `(title ILIKE $${i * 2 + 1} OR description ILIKE $${i * 2 + 2})`
).join(' AND ');

const values = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);

const query = `SELECT * FROM activities WHERE ${conditions} ORDER BY timestamp DESC LIMIT 100`;
const result = await db.query(query, values);

```

---

### Frontend

- **Debounced input** to avoid excessive queries.
- Send the trimmed search string as `search` param in API calls.
- Show live feedback or “no results” messages.

---

- **GET /api/insights?metric=** — Return aggregated data for charts. Metrics may include `timePerTitle` and \*\`timePerTitleStacked\` \*Endpoint accepts query params like `start`, `end`, and `search` (used by the Search & Filter system). The response supports time series aggregation (daily, weekly) for selected metrics. Example: `/api/insights?metric=timePerTitle&start=2025-07-01&end=2025-07-15&search=workout`.

- **timePerTitleStacked** visualizes aggregated activity duration across day, week, or month intervals, allowing users to compare time spent on different activities over time. This chart complements `timePerTitle` by offering a higher-level overview, enabling trend detection and behavioral analysis. It's ideal for users seeking a macro-level view of how their focus shifts across time periods.

**Response Model Example (timePerTitleStacked):**

**Daily Interval:**

```json
{
  "metric": "timePerTitleStacked",
  "date_range": {
    "from": "2025-07-01",
    "to": "2025-07-07"
  },
  "interval": "daily",
  "data": [
    { "date": "2025-07-01", "Reading": 60, "Running": 30 },
    { "date": "2025-07-02", "Reading": 45, "Running": 50 },
    { "date": "2025-07-03", "Reading": 30, "Running": 20 }
  ]
}
```

**Weekly Interval:**

```json
{
  "metric": "timePerTitleStacked",
  "date_range": {
    "from": "2025-07-01",
    "to": "2025-07-31"
  },
  "interval": "weekly",
  "data": [
    { "week": "2025-W27", "Reading": 120, "Running": 80 },
    { "week": "2025-W28", "Reading": 200, "Running": 100 }
  ]
}
```

**Monthly Interval:**

```json
{
  "metric": "timePerTitleStacked",
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-06-30"
  },
  "interval": "monthly",
  "data": [
    { "month": "2025-01", "Reading": 450, "Running": 200 },
    { "month": "2025-02", "Reading": 300, "Running": 180 },
    { "month": "2025-03", "Reading": 390, "Running": 160 }
  ]
}
```

**Response Model Example:**

```json
{
  "metric": "timePerTitle",
  "date_range": {
    "from": "2025-07-01",
    "to": "2025-07-07"
  },
  "data": [
    {
      "name": "Reading",
      "durationMinutes": 2390
    },
    {
      "name": "Running",
      "durationMinutes": 3490
    }
  ]
}
```

**Recharts Visualization Example (using Bar chart):**

```tsx
import React, { PureComponent } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

export default class Example extends PureComponent {


  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={data}>
          <Bar dataKey="uv" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

```

**6. Technology Stack**

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Node.js, NestJS (TypeScript), Prisma
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js with JWT sessions
- **Docker**
- **Hosting:** Vercel (frontend), DigitalOcean VPS (NestJS + Postgres)
- **Data Visualization:** Recharts

**7. High-Level Architecture**

- **Client (Next.js)** ↔️ **API Gateway (NestJS Controllers)** ↔️ **Service Layer** ↔️ **Postgres**
-
