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

## Port & Base URL

| Setting  | Value                   |
|----------|-------------------------|
| Port     | `3000`                  |
| Base URL | `http://localhost:3000` |

All endpoints are relative to the base URL. For example:
```
GET http://localhost:3000/users
POST http://localhost:3000/departments
```

---

## API Base Path

The API base path is `/`. All resources are available directly under the root:

| Resource              | Path                    |
|-----------------------|-------------------------|
| Authentication        | `/login`                |
| Users                 | `/users`                |
| Universities          | `/universities`         |
| Departments           | `/departments`          |
| Admission Thresholds  | `/admission-thresholds` |
| Academic Scores       | `/academic-scores`      |
| User Watchlist        | `/watchlist`            |

---

## Assumptions

- **IDs** are numeric, auto-incremented integers starting from 1. Each model maintains its own counter. New records created via POST never collide with existing mock IDs within a single server session.
- **Data is in-memory only.** All data resets when the server restarts. MySQL will replace this in Assignment 3.
- **Login** is available via `POST /login` with email and password. Passwords are hashed with Node's built-in `crypto` (scrypt) plus a per-user random salt, and are never returned in any API response.
- **Authorization is simulated** via the `x-user-role` request header (`admin`, `editor`, or `user`). The legacy value `manager` is accepted as an alias for `editor`. The optional `x-user-id` header identifies the current user, enabling self-update on their own user record. Token-based sessions (JWT) will replace the header simulation in Assignment 3.
- **Self-update:** A user with `userRole: 'user'` can `PUT /users/:id` on their own record by sending `x-user-id` matching `:id`. Self-updates cannot change `userRole` — only admins can modify roles.
- **Email must be unique** across users and is required on user creation. Passwords are required (minimum 6 characters) and stored only as a salted hash.
- **`createDate` and `updateDate`** are set automatically by the server using `new Date().toISOString()`. They are never provided by the client.
- **`sekemStatus`** on watchlist entries is always calculated server-side based on the user's academic scores vs the department's latest admission threshold. Clients cannot set or override this value.
- **Academic scores are a separate resource.** Only users with `userRole: 'user'` can have academic scores. Admins and editors are platform operators, not students, so they have no scores. One scores entry per user is allowed.
- **Watchlist entries** are only allowed for users with `userRole: 'user'`. Admins and editors cannot have a watchlist.
- **Bagrut scores** require all 7 mandatory subjects (bibleStudies, literature, hebrewExpression, history, civics, mathematics, english) with minimum unit requirements per subject.
- **Psychometric scores** require all 3 fields (verbal, quantitative, english) as numbers between 50 and 150.
- **`sekemBonuses`** on admission thresholds are optional and default to an empty array if not provided.
- **Duplicate watchlist entries** are not allowed. A user cannot add the same department to their watchlist more than once.
- **The most recent threshold year** is used when calculating a user's Sekem eligibility on watchlist operations.
- **Eager recalculation:** When academic scores are created, updated, or deleted, all the user's existing watchlist entries automatically have their `sekemStatus` recalculated so the data is never stale.

---

## Project Structure

```
MyApp/
├── index.js                          # Express app entry point
├── package.json
├── middleware/
│   ├── logger.js                     # Logs every request globally
│   ├── authorize.js                  # Role-based access control
│   ├── authorizeSelfOrRoles.js       # Allows self-update or specified roles
│   └── validate/                     # Modular validation middleware
│       ├── common.js                 # Shared validators (validateId, failure, score helpers)
│       ├── validateLogin.js
│       ├── validateUser.js
│       ├── validateUniversity.js
│       ├── validateDepartment.js
│       ├── validateThreshold.js
│       ├── validateAcademicScores.js
│       └── validateWatchlist.js
├── utils/
│   ├── sekemCalculator.js            # Sekem score calculation and status derivation
│   └── passwordHasher.js             # scrypt-based password hashing
├── models/                           # In-memory mock data
│   ├── usersData.js
│   ├── universitiesData.js
│   ├── departmentsData.js
│   ├── admissionThresholdsData.js
│   ├── academicScoresData.js
│   └── userWatchlistData.js
├── controllers/                      # Business logic (CRUD)
│   ├── authController.js
│   ├── usersController.js
│   ├── universitiesController.js
│   ├── departmentsController.js
│   ├── admissionThresholdsController.js
│   ├── academicScoresController.js
│   └── userWatchlistController.js
├── routes/                           # Express Router definitions
│   ├── authRoute.js
│   ├── usersRoute.js
│   ├── universitiesRoute.js
│   ├── departmentsRoute.js
│   ├── admissionThresholdsRoute.js
│   ├── academicScoresRoute.js
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
Request → logger → authorize → validateId → validateBody → controller → response
```

- **logger** runs globally for every request
- **authorize** runs on protected routes
- **validateId** runs on any route with `/:id`
- **validateBody** runs on POST and PUT routes (e.g. `validateUser`, `validateAcademicScores`)
- **controller** receives clean, validated input and returns the response

---

## Authorization

Three roles exist with distinct purposes:

- **admin** — full system control (the operator)
- **editor** — curates academic content (universities, departments, thresholds). Cannot touch user data or student data
- **user** — regular student. Manages their own scores and watchlist. Cannot modify platform data

The `x-user-role` header is required on all protected routes.

### Permission Matrix

| Resource | Method | admin | editor | user |
|---|---|:---:|:---:|:---:|
| **Users** | GET | ✅ | ✅ | ✅ |
| | POST | ✅ | ❌ | ❌ |
| | PUT | ✅ | ❌ | ✅ (self only) |
| | DELETE | ✅ | ❌ | ❌ |
| **Universities** | GET | ✅ | ✅ | ✅ |
| | POST | ✅ | ✅ | ❌ |
| | PUT | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Departments** | GET | ✅ | ✅ | ✅ |
| | POST | ✅ | ✅ | ❌ |
| | PUT | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Admission Thresholds** | GET | ✅ | ✅ | ✅ |
| | POST | ✅ | ✅ | ❌ |
| | PUT | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Academic Scores** | GET | ✅ | ❌ | ✅ |
| | POST | ✅ | ❌ | ✅ |
| | PUT | ✅ | ❌ | ✅ |
| | DELETE | ✅ | ❌ | ✅ |
| **Watchlist** | GET | ✅ | ❌ | ✅ |
| | POST | ✅ | ❌ | ✅ |
| | PUT | ✅ | ❌ | ✅ |
| | DELETE | ✅ | ❌ | ✅ |

> Editors are **completely blocked** from Academic Scores and Watchlist — these contain private student data that has nothing to do with content curation.

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

Every error response includes a populated `details` object with useful debugging info: the field that failed, the value received, the resource that wasn't found, or the required role.

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

UniPathway uses the Israeli **Sekem** scoring system to evaluate admission eligibility. All Sekem calculation logic lives in `utils/sekemCalculator.js`.

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

---

## API Reference

### Authentication — `/login`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /login | public | Authenticate with email and password |

**POST body:**
```json
{
  "email": "dana@unipathway.com",
  "password": "dana1234"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Login successful.",
    "user": {
      "userId": 5,
      "firstName": "Dana",
      "lastName": "Cohen",
      "email": "dana@unipathway.com",
      "userRole": "user",
      "createDate": "2024-03-05T14:20:00.000Z",
      "updateDate": "2024-03-05T14:20:00.000Z"
    }
  },
  "error": null
}
```

> The returned user object never includes `passwordHash` or `passwordSalt`.

**Error response (401 — wrong email or password):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password.",
    "details": {}
  }
}
```

> The same generic message is returned whether the email is unknown or the password is wrong, to avoid revealing which emails are registered.

---

### Users — `/users`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /users | any | — | List all users |
| GET | /users/:id | any | — | Get one user |
| POST | /users | admin | — | Create user |
| PUT | /users/:id | admin, self | — | Update user (users can self-update via `x-user-id` matching `:id`) |
| DELETE | /users/:id | admin | — | Delete user |

**POST / PUT body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "userRole": "admin | editor | user",
  "email": "user@example.com",
  "password": "string (min 6 chars)"
}
```

> User records contain identity and login credentials. Academic scores live in `/academic-scores`. The `email` must be unique. The `password` is hashed before storage and never returned. `userRole` accepts `manager` as an alias for `editor`.

**Example error response (missing fields):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: firstName, lastName, userRole.",
    "details": { "required": ["firstName", "lastName", "userRole"] }
  }
}
```

---

### Universities — `/universities`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /universities | any | ?location= | List universities |
| GET | /universities/:id | any | — | Get one university |
| POST | /universities | admin, editor | — | Create university |
| PUT | /universities/:id | admin, editor | — | Update university |
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

**Example error response (not found):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "University with id 999 not found.",
    "details": { "resource": "university", "id": 999 }
  }
}
```

---

### Departments — `/departments`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /departments | any | ?major= ?universityId= | List departments |
| GET | /departments/:id | any | — | Get one department |
| POST | /departments | admin, editor | — | Create department |
| PUT | /departments/:id | admin, editor | — | Update department |
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

**Example error response (forbidden):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": { "yourRole": "user", "requiredRoles": ["admin", "editor"] }
  }
}
```

---

### Admission Thresholds — `/admission-thresholds`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /admission-thresholds | any | ?departmentId= ?year= | List thresholds |
| GET | /admission-thresholds/:id | any | — | Get one threshold |
| POST | /admission-thresholds | admin, editor | — | Create threshold |
| PUT | /admission-thresholds/:id | admin, editor | — | Update threshold |
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

**Example error response (invalid sekemWeights):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "sekemWeights.bagrutWeight and sekemWeights.psychometricWeight must be numbers that sum to 1.",
    "details": {}
  }
}
```

---

### Academic Scores — `/academic-scores`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /academic-scores | admin, user | ?userId= | List academic scores |
| GET | /academic-scores/:id | admin, user | — | Get one academic scores entry |
| POST | /academic-scores | admin, user | — | Create scores for a user |
| PUT | /academic-scores/:id | admin, user | — | Update scores |
| DELETE | /academic-scores/:id | admin, user | — | Delete scores |

**POST body:**
```json
{
  "userId": 5,
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

> Only users with `userRole: 'user'` can have academic scores. Attempting to create scores for an admin or editor returns 400. Each user is allowed at most one scores entry.

**PUT body:** Same as POST without `userId` (the user link cannot be changed).

**POST / PUT success response** includes the number of watchlist entries that were recalculated as a side effect:
```json
{
  "success": true,
  "data": {
    "academicScoresId": 4,
    "watchlistEntriesRecalculated": 3
  },
  "error": null
}
```

**Example error response (scores for admin user):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Only users with role \"user\" can have academic scores. User 1 has role \"admin\".",
    "details": { "field": "userId", "userRole": "admin" }
  }
}
```

---

### User Watchlist — `/watchlist`

| Method | Path | Role | Query Params | Description |
|--------|------|------|-------------|-------------|
| GET | /watchlist | admin, user | ?userId= ?departmentId= ?status= ?sekemStatus= | List entries |
| GET | /watchlist/:id | admin, user | — | Get one entry |
| POST | /watchlist | admin, user | — | Add to watchlist |
| PUT | /watchlist/:id | admin, user | — | Update intent status |
| DELETE | /watchlist/:id | admin, user | — | Remove from watchlist |

**POST body:**
```json
{
  "userId": 5,
  "departmentId": 3,
  "status": "Interested"
}
```

> `status` is optional and defaults to `Interested` if not provided. Only users with `userRole: 'user'` can have a watchlist.

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

> `sekemStatus` is always calculated server-side from the user's scores vs the department's latest admission threshold. It cannot be set or overridden by the client. Sending sekem status values as `status` returns a 400 VALIDATION_ERROR.

**Example success response (POST):**
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

**Example error response (duplicate entry):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "This department is already in the user's watchlist.",
    "details": { "watchlistId": 1 }
  }
}
```

---

## Notes

- IDs are auto-incremented integers. Data resets on server restart (in-memory only).
- The automated test script (`docs/test.js`) requires Node.js 18+ for built-in `fetch`.
- Last updated: 20.5.26