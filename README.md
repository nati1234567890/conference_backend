# Ethio Bridge Investment Conference 2026 — Registration Backend

Node.js + Express + MongoDB backend for conference registration, QR-based check-in, and admin management.

## Features

- Public conference info (updatable by admin)
- Registration form with validation, duplicate-email prevention
- QR code generation + email confirmation with embedded QR
- Admin dashboard: search, filter, manage, verify participants
- Export registrations to Excel and PDF
- QR scanning & entrance check-in with double-check-in prevention

## Setup

1. `npm install`
2. Copy `.env.example` → `.env` and fill in the values
3. `npm run seed`
4. `npm run dev`

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/conference` | – | Get conference info |
| PUT | `/api/conference` | 🔒 | Update conference info |
| POST | `/api/registrations` | – | Register a participant |
| POST | `/api/admin/login` | – | Admin login (returns JWT) |
| GET | `/api/admin/registrations` | 🔒 | List / search / filter |
| GET | `/api/admin/registrations/:id` | 🔒 | Get one participant |
| PATCH | `/api/admin/registrations/:id` | 🔒 | Update status / notes |
| DELETE | `/api/admin/registrations/:id` | 🔒 | Delete registration |
| GET | `/api/admin/stats` | 🔒 | Registration statistics |
| GET | `/api/admin/export/excel` | 🔒 | Download Excel |
| GET | `/api/admin/export/pdf` | 🔒 | Download PDF |
| POST | `/api/admin/registrations/:id/resend-email` | 🔒 | Resend confirmation email |
| GET | `/api/verify/:registrationId` | – | QR scan preview (JSON or HTML) |
| POST | `/api/verify/checkin` | – | Mark participant as checked in |

## Default Admin

After `npm run seed`, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.
**Change the password immediately after first login** (via Atlas → edit or add an endpoint later).

## Deployment

- Ensure `BASE_URL` in `.env` matches your production domain (used in QR payload)
- Set `CORS_ORIGIN` to your frontend's URL (comma-separate multiple)
- Restrict Atlas Network Access to your server's IP (not `0.0.0.0/0`)
- Use a real transactional email provider (SendGrid, Resend, Mailgun) for production