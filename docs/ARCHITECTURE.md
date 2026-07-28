# Doctors Vedika - Enterprise System Architecture

## Overview
Doctors Vedika is an enterprise-grade healthcare platform structured into a multi-tier modular architecture designed for scalability, zero-regression refactoring, high maintainability, and clean separation of concerns.

---

## 🏛️ System Tiers

```
                     ┌──────────────────────────────────────┐
                     │          React Native App            │
                     │             (frontend/)              │
                     └──────────────────┬───────────────────┘
                                        │ (REST API / Supabase Client)
                                        ▼
                     ┌──────────────────────────────────────┐
                     │         Node.js / Express API        │
                     │              (backend/)              │
                     └──────────────────┬───────────────────┘
                                        │ (gRPC / REST Microservices)
                                        ▼
                     ┌──────────────────────────────────────┐
                     │        Python AI Engine Core         │
                     │            (ai-services/)            │
                     └──────────────────────────────────────┘
```

### 1. Frontend (`frontend/`) - React Native (Expo)
- **`src/app/`**: Composition root containing navigation stacks (`RootNavigator`, `AuthNavigator`, `PatientNavigator`), app initialization providers, and setup routines.
- **`src/core/`**: Enterprise core infrastructure.
  - **`theme/`**: Universal design token system (`colors`, `typography`, `spacing`, `radius`, `elevation`, `gradients`).
  - **`assets/`**: Asset registry for logos, images, vector graphics.
  - **`components/`**: Reusable core UI components (`PrimaryButton`, `FormInput`, `DatePickerModal`, `Checkbox`).
- **`src/modules/`**: Feature-driven enterprise domain modules.
  - **`auth/`**: Login, Signup (Register), Role Selection, Check Email OTP.
  - **`common/`**: Onboarding, Shared UI workflows.
  - **`patient/`**: Patient Home, Appointments Tracker, Doctor Discovery, Doctor Profile & Booking, Profile Dashboard, Edit Profile, Address Management, Q&A (Ask Doctor), Notifications Inbox.
  - **`doctor/`**: Doctor Portal (Consultations, Patient Records, Prescriptions).
- **`src/contexts/`**: Global React Context providers (Auth, Theme).
- **`src/features/`**: Data access services & feature APIs (Appointments, Q&A, Patient Profile, Notifications, Doctor Discovery).

### 2. Backend (`backend/`) - Node.js / Express Gateway & Service Layer
Controller-Service-Repository architecture encapsulating Supabase queries, edge functions, and business logic:
- **`src/routes/`**: Express Router endpoints (`/api/v1/patients`, `/api/v1/doctors`, `/api/v1/appointments`, `/api/v1/qna`, `/api/v1/notifications`).
- **`src/controllers/`**: HTTP Request/Response handlers.
- **`src/services/`**: Business logic encapsulation, validation rules, double-booking prevention.
- **`src/repositories/`**: Database abstraction layer consuming Supabase Client.
- **`src/middleware/`**: Authentication verification, CORS, Helmet headers, Global Error Handler.
- **`src/database/supabase/`**: Supabase Client configuration and SQL migrations.

### 3. AI Services (`ai-services/`) - Python FastAPI Microservice
Encapsulates all medical AI engines:
- **`speech/`**: Voice recording and audio processing.
- **`transcription/`**: Medical speech-to-text transcription engine.
- **`summarizer/`**: Clinical note summarizer.
- **`soap/`**: Automated Subjective, Objective, Assessment, Plan (SOAP) note generation.
- **`diagnosis/`**: Diagnostic assistant and clinical decision support.
- **`ocr/`**: Optical Character Recognition for prescriptions & lab reports.
- **`translation/`**: Multilingual medical translation.
- **`prescription/`**: Prescription parser & dosage validator.
- **`chatbot/`**: Interactive patient medical assistant.
- **`embeddings/`**: Medical vector embeddings for semantic search.

### 4. Shared Resources (`shared/`)
Centralized TypeScript interfaces, enums, database schemas, and validation constants shared across frontend, backend, and edge services:
- **`types/database.ts`**: Enterprise Supabase schemas (`UsersRow`, `DoctorsRow`, `PatientsRow`, `AppointmentsRow`, `QuestionsRow`, `NotificationsRow`, `Database`).
- **`enums/`**: `UserRoleEnum`, `AppointmentStatusEnum`, `NotificationTypeEnum`.
- **`constants/`**: `APP_NAME`, `API_VERSION`, `HTTP_STATUS`.
- **`schemas/`**: `EMAIL_REGEX`, `PHONE_REGEX`.
- **`validators/`**: `isValidEmail`.

---

## 🔒 Backward Compatibility Bridges
To guarantee **ZERO functional regression** and preserve 100% backward compatibility for pre-existing import paths:
- Bridge re-export files are maintained in `src/(auth)/`, `src/(patient)/`, `src/theme/theme.ts`, `src/navigation/`, and `src/types/database.ts`.
- Navigation stacks continue to function seamlessly while routing to clean modular implementations.
