# SmartServe - College Office Digital Token & Queue Management System

A minimal, hackathon-ready full-stack application for managing student tokens and service queues in college offices.

## 🚀 Features

- **Student Portal**: Request tokens for services (Bonafide, Transfer, Fee)
- **Staff Dashboard**: Manage and update token status in real-time
- **Admin Panel**: View analytics and all tokens across services
- **JWT Authentication**: Secure role-based access control
- **Real-time Updates**: Track token progress (Waiting → In Progress → Completed → Expired)
- **WhatsApp Simulation**: Console notifications when tokens move to "In Progress"
- **Separate Queue Numbering**: B-1, B-2 (Bonafide), T-1, T-2 (Transfer), F-1, F-2 (Fee)

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (vanilla)
- Bootstrap 5.3 (for styling)
- LocalStorage (JWT token management)

**Backend:**
- Node.js + Express.js
- JWT (JSON Web Tokens)
- In-memory mock database (ready for MongoDB integration)
- CORS enabled

## 📋 Project Structure

```
Hackthon/
├── login.html                 # Login page
├── login.css                  # Login styles
├── login.js                   # Login logic
├── next.html                  # Service selection page
├── token.html                 # Token display page
├── staff.html                 # Staff dashboard
├── admin.html                 # Admin panel
├── script.js                  # Shared frontend utilities & API helpers
├── style.css                  # Global styles
├── .gitignore                 # Git ignore rules
└── backend/
    ├── server.js              # Express app + mock DB
    ├── package.json           # Node dependencies
    ├── .env                   # Environment variables (sample)
    ├── README.md              # Backend-specific docs
    ├── routes/
    │   ├── auth.js            # Login endpoint
    │   ├── student.js         # Student token endpoints
    │   ├── staff.js           # Staff management endpoints
    │   └── admin.js           # Admin analytics endpoints
    └── utils/
        ├── roleRequired.js    # JWT + role validation
        ├── tokenGenerator.js  # Token numbering logic
        └── whatsapp.js        # WhatsApp simulation
```

## 🔐 Demo Credentials

```
Student:
  Email: student@college.edu
  Password: studentpass

Staff (Bonafide service):
  Email: staff@college.edu
  Password: staffpass

Admin:
  Email: admin@college.edu
  Password: adminpass
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/smartserve.git
cd smartserve
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
npm start
# or
node server.js
```

Server runs on `http://127.0.0.1:5000`

### 4. Open in Browser
```
http://127.0.0.1:5000/
```

## 📚 API Endpoints

### Authentication
- `POST /login` - User login (returns JWT token)

### Student Routes
- `POST /student/generate-token` - Generate new token for a service
- `GET /student/my-tokens` - View all student's tokens

### Staff Routes
- `GET /staff/service-tokens` - View all tokens for staff's assigned service
- `PUT /staff/update-status` - Update token status (Waiting → In Progress → Completed)
- `PUT /staff/expire-tokens` - Manually expire all waiting tokens

### Admin Routes
- `GET /admin/all-tokens` - View all tokens system-wide
- `GET /admin/analytics` - Get daily token statistics

## 🔄 Token Status Flow

```
Waiting → In Progress → Completed
       ↓
    Cancelled
    
Expired (manual via staff)
```

## 🛡️ Security

- **JWT Authentication**: All protected endpoints require valid JWT token
- **Role-Based Access Control**: Separate access for admin, staff, student
- **No Password Hashing**: By design for hackathon simplicity
- **CORS Enabled**: Frontend-backend communication

## 💾 Database

Currently uses **in-memory mock database** for quick development/testing.

To integrate **MongoDB**:
1. Install MongoDB locally
2. Replace mock DB in `backend/server.js` with MongoDB driver
3. Update the `MockDatabase` class with actual MongoDB operations

## 🤝 Contributing

This is a hackathon project. Feel free to fork, modify, and enhance!

## 📝 License

MIT License - Free to use for educational/hackathon purposes

## 📞 Support

For issues or questions, create a GitHub issue or reach out to the team.

---

**Built with ❤️ for the Hackathon**
