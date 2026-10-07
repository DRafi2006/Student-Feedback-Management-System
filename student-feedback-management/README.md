# 🎓 College Student Feedback & Faculty Evaluation System

An academic evaluation and institutional quality improvement portal designed for engineering & degree colleges.

---

## 🌟 Key Features

- 🆔 **College Roll Number Authentication & Registration**:
  - Support for real college roll numbers (e.g. `N24H01A0338`, `N24H01B0338`, `N24H01A0501`).
  - **Self-Registration**: New students can register directly with their Roll No, Name, Department, Semester, and Password.
  - **Quick Sign In**: Existing students sign in with their registered Roll Number.
- 📝 **4-Factor Faculty Evaluation Matrix**:
  - **Overall Course Rating** (1–5 ⭐)
  - **Teaching Quality & Pedagogy** (1–5 ⭐)
  - **Faculty Interaction & Communication** (1–5 ⭐)
  - **Course Understanding & Depth** (1–5 ⭐)
  - Qualitative comments & constructive recommendations.
- 📊 **Institutional Quality Analytics**:
  - Total student evaluations count.
  - Institutional average rating out of 5.0.
  - Distinct courses evaluated and unique participating students count.
  - Criteria score breakdowns for Teaching, Interaction, and Syllabus Understanding.
  - Subject-wise performance metrics and 1-to-5 star distribution charts.
- 📑 **Evaluation Records Table & Reporting**:
  - Real-time search across Roll Number, Student Name, Faculty, and Course.
  - Filters by Academic Department and Star Rating level.
  - **CSV Export** for official academic committee audits.

---

## 🔑 Default Accounts & Credentials

### 👨‍🎓 Sample Student Roll Numbers
| College Roll No | Password | Student Name | Department | Semester |
|---|---|---|---|---|
| `N24H01A0338` | `student123` | Rahul Sharma | Mechanical Engineering | Semester 4 |
| `N24H01B0338` | `student123` | Priya Reddy | Computer Science & Engineering | Semester 6 |
| `N24H01A0501` | `student123` | Ananya Verma | Electronics & Communication | Semester 6 |
| `N24H01A0102` | `student123` | Karthik Kumar | Information Technology | Semester 4 |

> 💡 **New Student?** Click the **"+ Register New Student"** tab on the login page to add any custom Roll Number (e.g., `N24H01A0399` or any branch ID).

### 🛡️ Admin Account
| Username | Password | Role & Permissions |
|---|---|---|
| `admin` | `admin123` | Full Academic Dashboard, Departmental Analytics & Student Submissions |

---

## 🚀 How to Run Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm run seed      # Populates college roll numbers & initial evaluations
npm start         # Runs on http://localhost:5000
```

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev       # Runs on http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/students/register` | Register new student with College Roll No | Public |
| `POST` | `/api/students/login` | Authenticate student by Roll No & return JWT | Public |
| `GET` | `/api/students/profile` | Retrieve student details | Student (JWT) |
| `POST` | `/api/admin/login` | Authenticate administrator & return JWT | Public |
| `GET` | `/api/admin/dashboard` | Computed institutional evaluation statistics | Admin (JWT) |
| `POST` | `/api/feedback` | Record new course & faculty evaluation | Student / Public |
| `GET` | `/api/feedback` | Retrieve & filter all feedback records | Admin (JWT) |
| `DELETE` | `/api/feedback/:id` | Delete an evaluation record | Admin (JWT) |
| `GET` | `/api/health` | System health & uptime check | Public |
