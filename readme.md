# WebDB Projects API

This API provides endpoints to manage and retrieve project data for your web application. It is built with Express and Prisma, and exposes RESTful routes for interacting with projects, their owners, tags, and media.

## Base URL

```
/projects
```

## Endpoints

### 1. Get All Projects

**GET** `/projects`

- Returns a list of all projects, including their owner, tags, and media.
- Projects are ordered by creation date (newest first).

**Response Example:**

```json
[
  {
    "id": 1,
    "title": "Project Title",
    "summary": "Project summary",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-06-01T00:00:00.000Z",
    "owner": { ... },
    "tags": [{ "tag": { "name": "Tag1" } }],
    "media": [ ... ]
  }
]
```

---

### 2. Get Project by ID

**GET** `/projects/:id`

- Returns a single project by its ID, including owner, tags, and media.
- If the project is not found, returns 404.

**Response Example:**

```json
{
  "id": 1,
  "title": "Project Title",
  "summary": "Project summary",
  "owner": { ... },
  "tags": [{ "tag": { "name": "Tag1" } }],
  "media": [ ... ]
}
```

---

### 3. Create a New Project

**POST** `/projects`

- Creates a new project.
- Accepts JSON body with the following fields:


| Field     | Type     | Required | Description             |
| --------- | -------- | -------- | ----------------------- |
| title     | string   | Yes      | Project title           |
| summary   | string   | Yes      | Project summary         |
| startDate | string   | No       | Start date (ISO format) |
| endDate   | string   | No       | End date (ISO format)   |
| ownerId   | integer  | No       | Owner user ID           |
| tagNames  | string[] | No       | Array of tag names      |

**Request Example:**

```json
{
  "title": "New Project",
  "summary": "This is a new project.",
  "startDate": "2025-01-01",
  "endDate": "2025-06-01",
  "ownerId": 2,
  "tagNames": ["AI", "Web"]
}
```

**Response Example:**

```json
{
  "id": 2,
  "title": "New Project",
  "summary": "This is a new project.",
  "owner": { ... },
  "tags": [{ "tag": { "name": "AI" } }, { "tag": { "name": "Web" } }],
  "media": []
}
```

---

## Error Handling

- All endpoints return `500` status code with an error message if something goes wrong.
- `GET /projects/:id` returns `404` if the project is not found.

---

## Usage

1. Make sure your server is running.
2. Use tools like [Postman](https://www.postman.com/) or `curl` to interact with the API.
3. Send requests to the endpoints as described above.

---

## Related Routes

Other APIs may be available in the `src/routes` folder, such as `users.js` and `papers.js`.

---

**Contact:** For questions or issues,
