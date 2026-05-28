# DeskFlow — Support Ticket Triage Board

## 1. Full Project Understanding
DeskFlow is a modern SLA-driven support ticket management system built on the MERN stack. Designed specifically for customer support teams, it offers a real-time Kanban board for triaging issues across four states (Open, In Progress, Resolved, Closed). Tickets enforce strict, forward-only status transitions (and one-step backward with penalty), integrating auto-tracked age limits designed around strict SLA targets (Urgent: 1h, High: 4h, Medium: 24h, Low: 72h). By dynamically calculating response times and resolving timestamps, the application ensures high accountability and visualizes bottlenecks for customer-facing teams.

## 2. Backend Architecture
Built with **Express.js** + **TypeScript** on top of **MongoDB**.
- **Controllers & Routes:** Modular resource logic (`/api/tickets`) for CRUD and Aggregation operations (`/api/tickets/stats`).
- **Data Models (Mongoose):** Contains strict enums for statuses and priorities.
- **Server-Side SLA:** Employs dynamic derivation functions (`utils/slaCalculator.ts`) that intercept model fetches before returning them to calculate the exact un-cached `ageMinutes` and `slaBreached` status based on the instantaneous server time vs. DB `createdAt` / `resolvedAt` values.
- **Strict Transition Validator:** Status updates intercept transitions and validate against a unified directed graph (`allowedTransitions`). Moving backward resets the `resolvedAt` timestamp.

## 3. Frontend Architecture
Built with **React 19**, **TypeScript**, and **Vite**.
- **Board Engine:** Employs `react-beautiful-dnd` to render a 4-column drag-and-drop Kanban view. The board manages local optimistic updates and rolls back smoothly on server validation failures.
- **Styling (`Tailwind CSS` & `lucide-react`):** Utility-driven atomic classes to build sleek glassmorphism-inspired UI strips and color-coded SLA alerts without requiring heavy, clunky component libraries.
- **Responsive Architecture:** Auto-scaling grid templates ensure the stats bar and board columns render cleanly from ultrawide desktops down to mobile views.

## 4. MongoDB Schema Explanation
The underlying database schema models a `Ticket`:
- **Core Info:** `subject`, `description`, `customerEmail` (Strictly validated string schemas).
- **Enums:** `priority` (urgent, high, medium, low) and `status` (open, in_progress, resolved, closed).
- **Time Tracking:** `createdAt` (defaults to ingestion moment) and `resolvedAt` (Nullable. Logged distinctly at the threshold boundary).
> Note: We do *not* store `ageMinutes` or `slaBreached` in MongoDB. Time changes continuously. Storing an evolving age in a DB causes massive background write overheads. These are dynamically calculated by Node.js.

## 5. SLA Logic Explanation
- A dictionary (`SLA_TARGETS`) binds priorities to max minutes.
- **When calculating Age:**
  - If Unresolved (`resolvedAt = null`): `currentTime - createdAt`
  - If Resolved (`resolvedAt` exists): `resolvedAt - createdAt` (The clock freezes at the resolution point!)
- **SLA Breached Boolean:** Triggered if `Age > SLA Target`. 

## 6. API Design Explanation
- **`GET /api/tickets`**: Supports concurrent query filtering (`?priority=high&breached=true`). Iterates the result set through the `slaCalculator` to hydrate virtual properties before yielding.
- **`POST /api/tickets`**: Validates the payload using `Joi` and auto-binds standard tracking parameters.
- **`PATCH /api/tickets/:id`**: Primary transition loop. Accepts a `status`, runs a directed-graph lookup to block illegal transitions (e.g. `open` -> `closed`), and dynamically sets `resolvedAt` if landing on the `resolved` stage.
- **`GET /api/tickets/stats`**: O(n) full-dataset pipeline simulating analytical aggregations to power the top StatsStrip.

## 7. Folder Structure
\`\`\`text
/
├── server/
│   ├── config/db.ts
│   ├── controllers/ticketController.ts
│   ├── models/Ticket.ts
│   ├── routes/ticketRoutes.ts
│   ├── utils/slaCalculator.ts
│   └── validators/ticketValidator.ts
├── src/
│   ├── api.ts
│   ├── components/
│   │   ├── CreateTicketModal.tsx
│   │   ├── StatsStrip.tsx
│   │   ├── TicketBoard.tsx
│   │   └── TicketCard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
├── server.ts
└── vite.config.ts
\`\`\`

## 11. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Go to **Database Access** and create a user (Username/Password).
3. Go to **Network Access** and whitelist `0.0.0.0/0` (Allow access from anywhere).
4. Go to **Databases -> Connect -> Drivers**.
5. Copy the connection string. Replace `<username>` and `<password>` (remove brackets).
6. In AI Studio, open **Settings -> Secrets** and paste the string into `MONGODB_URI`.

## 12. Postman Testing Guide
Create a new Workspace / Collection named **DeskFlow**.
**Create Ticket (POST)**
- Method: `POST /api/tickets`
- Body (JSON):
\`\`\`json
{
    "subject": "Website is completely down",
    "description": "Getting a 502 Bad Gateway",
    "customerEmail": "ceo@acmecorp.com",
    "priority": "urgent"
}
\`\`\`
**Get Tickets (GET)**
- Method: `GET /api/tickets?priority=urgent&breached=true`
**Update Status (PATCH)**
- Method: `PATCH /api/tickets/:id`
- Body (JSON):
\`\`\`json
{
    "status": "in_progress"
}
\`\`\`

## 13. GitHub Push Guide
\`\`\`bash
git init
git add .
git commit -m "Initial DeskFlow commit"
git branch -M main
git remote add origin https://github.com/yourusername/deskflow.git
git push -u origin main
\`\`\`

## 14. Render Deployment (Backend/Fullstack)
The MERN application is completely bundled via `esbuild`. 
1. Log in to Render.com -> **Web Service**.
2. Connect your GitHub repository.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Environment Variables:
   - `MONGODB_URI` = `<your-connection-string>`
   - `NODE_ENV` = `production`

*(Note: Since this app bundles Vite output and serves it via Express, you can run the entire "Fullstack" app on a single Render web service!)*

## 15. Netlify Deployment (Frontend Only Alternative)
If you wish to split the environments:
1. Ensure your backend is running elsewhere and exposing CORS.
2. In `src/api.ts`, change the `baseURL` to the Render backend URL.
3. Go to Netlify -> Import GitHub repo.
4. Build Command: `npm run build`
5. Publish Directory: `dist`

## 16. Common Mistakes to Avoid
- **CORS Issues:** Not installing the `cors` package in Express, leading to blocked API calls if the frontend and backend are split on different ports.
- **Mongoose Operations without Connection:** Attempting to run `Ticket.find()` before Mongoose fully connects will indefinitely hang or crash (500). Our code specifically validates `checkDB()` to degrade gracefully.
- **Leaked Environment Variables:** Committing API keys to Github instead of injecting them through `.env` or CI/CD pipelines.

## 17. Interview Questions
- *Why did you calculate SLA breaches dynamically instead of saving them to MongoDB?*
  **Answer:** Saving an ever-changing integer like `ageMinutes` requires continuous cron jobs constantly writing to the DB. Doing it dynamically at the request edge (like a virtual field) saves vast bandwidth/IO operations and remains perfectly accurate.
- *How did you handle the React 19 + react-beautiful-dnd compatibility issues?*
  **Answer:** React 19 removed the legacy support for `defaultProps`. Libraries relying on them throw invariant violations (`isDropDisabled must be a boolean`). I manually passed the expected explicit values (e.g., `isDropDisabled={false}`, `direction="vertical"`) to correct the strict type checking.

## 18. Resume Project Description
**DeskFlow (MERN Stack Triage Dashboard)**
*Built a full-stack real-time KanBan SLA ticketing system using React, Node.js, and MongoDB.*
- Designed a custom SLA time-derivation engine analyzing instantaneous priorities to flag breached support targets.
- Implemented robust Node.js directed-graph validation logic guarding against illegal DB status transitions.
- Assembled an optimistic-update UI using React-Beautiful-DND to reflect seamless drag-and-drop state.

## 19. Final Deployment Checklist
- [ ] Connect MongoDB Atlas URI
- [ ] Add `MONGODB_URI` to secrets
- [ ] `npm run build` finishes without errors
- [ ] Drag and drop respects transition rules
- [ ] SLA triggers correctly (Age Minutes is correctly processed)
- [ ] UI is fully responsive
