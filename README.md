# 🏥 FHIR Server

This is a Node.js-based FHIR server built using [`@bluehalo/node-fhir-server-core`](https://github.com/bluehalo/node-fhir-server-core), designed for healthcare data interoperability. It includes PostgreSQL integration and is fully Docker-compatible for easy setup and deployment.

---

## 📦 Installation

### 1. Clone the Repository

```
git clone https://github.com/ayyrinn/fhir-server.git
cd fhir-server
```

### 2. Install Dependencies

Run the following to install all packages listed in `package.json`:

```
yarn install
```

> You can also use `npm install` if you prefer npm.

---

## ▶️ Running the Server

### 🔧 Option 1: Local Development (without Docker)

Make sure you have a PostgreSQL database running and `.env` configured, then start the server with:

```
yarn start
```

For development with automatic restarts:

```
yarn dev
```

---

### 🐳 Option 2: Using Docker

Run the server and database together using Docker Compose:

```
docker-compose up --build
```

This will:
- Spin up the FHIR server on http://localhost:3000
- Start a PostgreSQL instance with the necessary credentials

---

## ⚙️ Environment Variables

If you're running the server without Docker, create a `.env` file in the root directory with the following:

```
POSTGRES_USER=fhir_user
POSTGRES_PASSWORD=fhir_pass
POSTGRES_DB=fhir_db
```

These variables are already defined in the Docker Compose file for Docker users.

---

## 🧪 Available Endpoints

All FHIR endpoints are accessible under the `/4_0_0` version path.

### 📍 Capability Statement

```
GET /4_0_0/metadata
```

Returns the server’s supported operations and structure.

---

### 🔍 Search Resource

```
GET /4_0_0/[profile_name]
```

Example:
```
GET /4_0_0/Patient
GET /4_0_0/Observation
```

---

### 🔍 Get Resource by ID

```
GET /4_0_0/[profile_name]/:id
```

Example:
```
GET /4_0_0/Patient/123
```

---

### ➕ Create Resource

```
POST /4_0_0/[profile_name]
```

Example:
```
POST /4_0_0/Patient
Content-Type: application/json

{
  "resourceType": "Patient",
  "name": [{ "use": "official", "family": "Doe", "given": ["John"] }],
  "gender": "male",
  "birthDate": "1980-01-01"
}
```

---

### ✏️ Update Resource

```
PUT /4_0_0/[profile_name]/:id
```

Example:
```
PUT /4_0_0/Patient/123
```

---

### ❌ Delete Resource

```
DELETE /4_0_0/[profile_name]/:id
```

Example:
```
DELETE /4_0_0/Patient/123
```

---

## Available FHIR Profiles

- Patient
- DiagnosticReport
- ServiceRequest
- ImagingStudy
- Practitioner
- Location
- Procedure
- Observation
