# About FiliUp

FiliUp is a gamified e-learning platform designed to improve Filipino language comprehension among Grade 3 students at CIT-U. It combines interactive, culturally relevant content with adaptive learning strategies to engage students, support teachers, and involve parents in the learning process.

## Technology Stack

### Frontend
- **React**
- **React Router**
- **React Query (TanStack)**
- **React Hook Form**
- **Vite** 
- **Tailwind CSS**
- **TypeScript**
- **Radix UI**
- **Lucide React**
- **Axios**

### Backend
- **Spring Boot**
- **Spring Security**
- **JWT**
- **PostgreSQL**
- **Maven**
- **Java 21**

---

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Google Cloud (Cloud Run)

---

## Getting Started

### Prerequisites

* Node.js (v18+)
* npm (v9+)
* Java JDK 21
* PostgreSQL 15+ (or use Neon cloud database)
* Maven
* Git

Clone the project:

```bash
git clone https://github.com/cg-del/filiup.git
cd filiup
```

---

## Backend Setup

### Database Setup

1. **Using Local PostgreSQL**
   - Install PostgreSQL 15+
   - Create a database:
   ```sql
   CREATE DATABASE filiup_db;
   ```

### Environment Variables

Create a `.env` file in the `Backend` directory:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/filiup_db
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
PORT=8080
```

**Security Note**: Never commit your database credentials to version control. Use environment variables for sensitive data.

### Run Backend

```bash
cd Backend
mvn spring-boot:run
```

---

## Frontend Setup

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Noctive 36

| Developer | GitHub | Role |
|-----------|----------------|------|
| Mike Francis Alon | [@makieu](https://github.com/makieu) | Backend Developer & Documentation |
| Josh Kyle Cervantes | [@JaeNotFound](https://github.com/JaeNotFound) | Project Lead & Frontend Developer |
| Cg Fernandez | [@cg-del](https://github.com/cg-del) | Full Stack Developer |
| Mary Apple Ramos | [@Raveneko](https://github.com/Raveneko) | UI/UX Designer & Frontend Developer |
| Melena Rafaella Semilla | [@sadsonata](https://github.com/sadsonata) | QA Lead & Frontend Developer |