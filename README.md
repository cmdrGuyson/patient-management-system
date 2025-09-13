# PMS - Patient Management System

A delightful patient management system built with Next.js and NestJS, featuring role-based access control, dockerized development environment, comprehensive test coverage and a beautiful responsive interface.

## 🏗️ Architecture Overview

This project is built as a **Turborepo monorepo** containing:

- **Frontend**: Next.js, React, TypeScript, and Tailwind CSS
- **Backend**: NestJS, TypeScript, PostgreSQL, and Prisma ORM
- **Shared**: Common packages for TypeScript configs, ESLint rules and other shared utilities

## 🚀 Tech Stack

### Frontend (`apps/web`)

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Components**: Shadcn UI
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Theming**: Next Themes for dark/light mode

### Backend (`apps/api`)

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: Class Validator with DTOs
- **Security**: bcrypt for password hashing and role guards

### Development & Build Tools

- **Monorepo**: Turborepo
- **Package Manager**: Yarn Workspaces
- **Testing**: Jest with Testing Library
- **Linting**: ESLint with custom configs
- **Formatting**: Prettier
- **Containerization**: Docker

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: >= 24.7.0
- **Yarn**: 1.22.22
- **Docker**: For database and containerized development

### 1. Clone and Install

```bash
git clone https://github.com/cmdrGuyson/patient-management-system.git
cd pms
yarn install
```

### 2. Setup Environment

Create environment files for both the API and web applications by copying the example files:

```bash
# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**Important Notes:**

- The `.env.example` data can be used for development purposes
- **Please replace all values for production use** for security reasons

### 3. Start Development Environment with Docker

#### First-time Setup (with database seeding)

For the first time setup, you'll want to seed the database with initial users and patients:

```bash
SEED=true docker compose up
```

This will:

- Create an admin user (`admin@email.com`) and regular user (`user@email.com`)
- Seed the database with sample patient data from `apps/api/data/patients.json`
- Both users have the default password: `ozN1$dslBR`

#### Regular Development

For subsequent development sessions (when you don't need to reseed):

```bash
docker compose up
```

## 📁 Project Structure

```
pms/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages
│   │   │   │   ├── (auth)/     # Authentication routes
│   │   │   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   │   └── layout.tsx  # Root layout
│   │   │   ├── components/     # React components
│   │   │   │   ├── features/   # Feature-specific components
│   │   │   │   ├── providers/  # Context providers
│   │   │   │   └── ui/         # Reusable UI components
│   │   │   ├── contexts/       # React contexts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utility functions and API client
│   │   │   └── types/          # TypeScript type definitions
│   │   └── public/             # Static assets
│   └── api/                    # NestJS backend API
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── patients/       # Patient management module
│       │   ├── users/          # User management module
│       │   ├── prisma/         # Database service
│       │   └── config/         # Configuration module
│       ├── prisma/             # Database schema and migrations
│       ├── data/               # Seed data (patients.json)
│       └── test/               # E2E tests
├── packages/                   # Shared packages
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # Shared ESLint configurations
│   └── typescript-config/      # Shared TypeScript configurations
├── docker-compose.yml          # Development environment
├── docker-compose.test.yml     # Testing environment
└── turbo.json                  # Turborepo configuration
```

## 🔐 Authentication & Authorization

### Backend Authentication

- **JWT-based authentication** with configurable expiration
- **Role-based access control** with two roles:
  - `ADMIN`: Full CRUD access to all resources
  - `USER`: Read-only access to patient data
- **Password hashing** using bcrypt with salt rounds
- **Protected routes** using JWT guards and role decorators

### Frontend Authorization

- **Context-based state management** for authentication
- **Permission-based UI rendering** using `Can` component
- **Automatic token validation** and refresh
- **Route protection** with automatic redirects

```typescript
PATIENT_LIST: "patient:list"; // View patient list
PATIENT_VIEW: "patient:view"; // View individual patient
PATIENT_CREATE: "patient:create"; // Create new patients (Admin only)
PATIENT_UPDATE: "patient:update"; // Update patients (Admin only)
PATIENT_DELETE: "patient:delete"; // Delete patients (Admin only)
```

## 🗄️ Database Schema

### Users Table

- `id`: Primary key
- `email`: Unique email address
- `password`: Hashed password
- `name`: User display name
- `role`: User role (ADMIN/USER)
- `createdAt`/`updatedAt`: Timestamps

### Patients Table

- `id`: Primary key
- `firstName`/`lastName`: Patient name
- `email`: Unique email address
- `phoneNumber`: Contact number
- `dob`: Date of birth
- `additionalInformation`: Medical notes
- `createdAt`/`updatedAt`: Timestamps

## 🧪 Test Coverage

### Backend Testing

- **Unit Tests**: Service and controller logic
- **E2E Tests**: Full API endpoint testing
- **Test Database**: Isolated PostgreSQL instance for testing

### Frontend Testing

- **Component Tests**: React component testing with Testing Library
- **Integration Tests**: User interaction flows

### Running Tests

```bash
# Run all unit and integration tests
yarn test

# Run E2E tests for backend against test database
yarn test:e2e
```

---

**Made with ❤️ by Gayanga Kuruppu**
