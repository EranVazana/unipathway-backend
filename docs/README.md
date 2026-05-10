# UniPathway Backend API

Assignment 2 — Node.js + Express, mock in-memory data.

**Students:** Eran Vazana (207778788), Omri Hershkovich (318760477)

---

## Setup & Run

```bash
npm install       # install dependencies
npm start         # start server on http://localhost:3000
npm test          # run automated tests (server must be running, requires Node 18+)
```

---

## Project Structure

```
MyApp/
├── index.js                          # Express app entry point
├── package.json
├── middleware/
│   ├── logger.js                     # Logs every request globally
│   ├── authorize.js                  # Role-based access control
│   └── validate.js                   # Input and cross-reference validation
├── utils/
│   └── sekemCalculator.js            # Sekem score calculation and status derivation
├── models/                           # In-memory mock data
│   ├── usersData.js
│   ├── universitiesData.js
│   ├── departmentsData.js
│   ├── admissionThresholdsData.js
│   └── userWatchlistData.js
├── controllers/                      # Business logic (CRUD)
│   ├── usersController.js
│   ├── universitiesController.js
│   ├── departmentsController.js
│   ├── admissionThresholdsController.js
│   └── userWatchlistController.js
├── routes/                           # Express Router definitions
│   ├── usersRoute.js
│   ├── universitiesRoute.js
│   ├── departmentsRoute.js
│   ├── admissionThresholdsRoute.js
│   └── userWatchlistRoute.js
└── docs/
    ├── README.md
    ├── UniPathway.postman_collection.json
    └── test.js                       # Automated test script
```

---

## Request Pipeline

Every request passes through this chain:

```
Request → logger → authorize → validate → controller → response
```

---

## Authorization

Protected routes require the `x-user-role` header:

```
x-user-role: admin      # GET, POST, PUT, DELETE
x-user-role: manager    # GET, POST, PUT
x-user-role: user       # GET only (watchlist: also POST, PUT, DELETE)
```

| Role    | GET | POST | PUT | DELETE |
|---------|-----|------|-----|--------|
| user    | ✅  | ❌   | ❌  | ❌     |
| manager | ✅  | ✅   | ✅  | ❌     |
| admin   | ✅  | ✅   | ✅  | ✅     |

> Note: Watchlist routes allow all 3 roles on POST, PUT, and DELETE since users must be able to manage their own watchlist.

---

## Response Format

**Success**
```json
{ "success": true, "data": { }, "error": null }
```

**Error**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": { }
  }
}
```

### HTTP Status Codes

| Code | When |
|------|------|
| 200  | Successful GET, PUT, DELETE |
| 201  | Successful POST |
| 400  | Validation error / missing fields / duplicate |
| 403  | Wrong or missing role |
| 404  | Resource not found |
| 500  | Unexpected server error |

---

## The Sekem System

UniPathway uses the Israeli **Sekem** scoring system to evaluate admission eligibility.

**Sekem types** (set per department threshold):

| Type | Used for | Psychometric formula |
|------|----------|----------------------|
| `quantitative` | CS, Engineering | 53% Quant + 27% Verbal + 20% English |
| `verbal` | Law, Psychology | 53% Verbal + 27% Quant + 20% English |
| `general` | Business, Social Sciences | 40% Verbal + 40% Quant + 20% English |

**Calculation:**
```
sekem = (bagrutWeightedAvg × bagrutWeight) + (psychoScore × psychometricWeight) + bonuses
```

Sekem calculation and status derivation are handled in `utils/sekemCalculator.js`.

---

## API Reference

### Users — `/users`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /users | any | — | List all users |
| GET | /users/:id | any | — | Get one user |
| POST | /users | admin, manager | — | Create user |
| PUT | /users/:id | admin, manager | — | Update user |
| DELETE | /users/:id | admin | — | Delete user |

**POST / PUT body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "userRole": "admin | manager | user",
  "psychometricScores": {
    "verbal": 120,
    "quantitative": 135,
    "english": 118
  },
  "bagrutScores": {
    "bibleStudies":     { "grade": 80, "units": 2 },
    "literature":       { "grade": 78, "units": 2 },
    "hebrewExpression": { "grade": 82, "units": 2 },
    "history":          { "grade": 75, "units": 2 },
    "civics":           { "grade": 79, "units": 2 },
    "mathematics":      { "grade": 88, "units": 4 },
    "english":          { "grade": 91, "units": 5 },
    "computerScience":  { "grade": 94, "units": 5 }
  }
}
```

> `psychometricScores` and `bagrutScores` are optional. Scores range: 50–150 for psychometric, 0–100 per subject for bagrut.

---

### Universities — `/universities`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /universities | any | ?location= | List universities |
| GET | /universities/:id | any | — | Get one university |
| POST | /universities | admin, manager | — | Create university |
| PUT | /universities/:id | admin, manager | — | Update university |
| DELETE | /universities/:id | admin | — | Delete university |

**POST / PUT body:**
```json
{
  "name": "string",
  "location": "string",
  "logoUrl": "string",
  "websiteUrl": "string"
}
```

> `logoUrl` and `websiteUrl` are optional.

---

### Departments — `/departments`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /departments | any | ?major= ?universityId= | List departments |
| GET | /departments/:id | any | — | Get one department |
| POST | /departments | admin, manager | — | Create department |
| PUT | /departments/:id | admin, manager | — | Update department |
| DELETE | /departments/:id | admin | — | Delete department |

**POST / PUT body:**
```json
{
  "universityId": 1,
  "majorName": "string",
  "degreeType": "B.Sc | B.A | LL.B",
  "faculty": "string"
}
```

> Admission requirements (Sekem type, weights, thresholds) are stored separately in `/admission-thresholds`.

---

### Admission Thresholds — `/admission-thresholds`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /admission-thresholds | any | ?departmentId= ?year= | List thresholds |
| GET | /admission-thresholds/:id | any | — | Get one threshold |
| POST | /admission-thresholds | admin, manager | — | Create threshold |
| PUT | /admission-thresholds/:id | admin, manager | — | Update threshold |
| DELETE | /admission-thresholds/:id | admin | — | Delete threshold |

**POST / PUT body:**
```json
{
  "departmentId": 1,
  "year": 2024,
  "sekemType": "quantitative | verbal | general",
  "sekemWeights": {
    "bagrutWeight": 0.40,
    "psychometricWeight": 0.60
  },
  "sekemBonuses": [
    { "condition": "5-unit Math", "points": 7 },
    { "condition": "Periphery resident", "points": 5 }
  ],
  "minSekem": 155
}
```

> `bagrutWeight` + `psychometricWeight` must sum to 1. `sekemBonuses` is optional.

---

### User Watchlist — `/watchlist`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /watchlist | any | ?userId= ?departmentId= ?status= ?sekemStatus= | List entries |
| GET | /watchlist/:id | any | — | Get one entry |
| POST | /watchlist | any | — | Add to watchlist |
| PUT | /watchlist/:id | any | — | Update intent status |
| DELETE | /watchlist/:id | any | — | Remove from watchlist |

**POST body:**
```json
{
  "userId": 1,
  "departmentId": 3,
  "status": "Interested"
}
```

> `status` is optional and defaults to `Interested` if not provided.

**PUT body:**
```json
{
  "status": "Applied"
}
```

**Watchlist fields:**

| Field | Set by | Values |
|-------|--------|--------|
| `status` | Client | `Interested`, `Applied` |
| `sekemStatus` | Server only | `passed-required-acceptance-score`, `below-required-acceptance-score`, `no-data` |

> `sekemStatus` is always calculated server-side from the user's scores vs the department's latest admission threshold. It cannot be set or overridden by the client.

**POST success response:**
```json
{
  "success": true,
  "data": {
    "watchlistId": 10,
    "status": "Interested",
    "sekemStatus": "passed-required-acceptance-score",
    "sekemInfo": {
      "userSekem": 161.4,
      "minSekem": 155,
      "year": 2024,
      "meetsThreshold": true
    }
  },
  "error": null
}
```

---