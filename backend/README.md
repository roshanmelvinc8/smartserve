SmartServe — Backend (Node.js + Express)

Minimal hackathon-ready backend for the College Office Token & Queue system.

Run:
1) cd backend && npm install
2) node server.js (or npm start)
3) Server runs on http://127.0.0.1:5000

Note: Currently using in-memory mock database. Install MongoDB locally to enable persistence.

Example test users (insert into `users` collection):
{
  "name": "Alice Admin",
  "email": "admin@college.edu",
  "password": "adminpass",
  "role": "admin"
}
{
  "name": "Bob Staff",
  "email": "staff@college.edu",
  "password": "staffpass",
  "role": "staff",
  "service": "Bonafide"
}
{
  "name": "Charlie Student",
  "email": "student@college.edu",
  "password": "studentpass",
  "role": "student"
}

Postman / example requests

1) Login (all roles)
POST http://127.0.0.1:5000/login
Body JSON: { "email": "student@college.edu", "password": "studentpass" }

2) Student - generate token
POST http://127.0.0.1:5000/student/generate-token
Headers: Authorization: Bearer <access_token>
Body JSON: { "service": "Bonafide" }

3) Student - my tokens
GET http://127.0.0.1:5000/student/my-tokens
Headers: Authorization: Bearer <access_token>

4) Staff - list service tokens
GET http://127.0.0.1:5000/staff/service-tokens
Headers: Authorization: Bearer <staff_token>

5) Staff - update status
PUT http://127.0.0.1:5000/staff/update-status
Headers: Authorization: Bearer <staff_token>
Body JSON: { "token_id": "<token_id>", "status": "In Progress" }

6) Staff - expire waiting tokens (manual)
PUT http://127.0.0.1:5000/staff/expire-tokens
Headers: Authorization: Bearer <staff_token>

7) Admin - all tokens
GET http://127.0.0.1:5000/admin/all-tokens
Headers: Authorization: Bearer <admin_token>

8) Admin - analytics (tokens today)
GET http://127.0.0.1:5000/admin/analytics
Headers: Authorization: Bearer <admin_token>

Notes
- No password hashing by design for this hackathon project.
- WhatsApp is simulated by console printouts when a token moves to "In Progress".
- JWT is required for all protected routes.
