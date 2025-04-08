# 🌟 FiliUp - Learn Filipino Culture Through Stories
![FiliUp Banner](https://i.imgur.com/ZQDl2cC.png)

## 📖 About FiliUp
FiliUp is an innovative educational platform designed to make learning Filipino culture and language engaging and accessible. Through interactive stories, quizzes, and cultural narratives, we bring the rich heritage of the Philippines to learners worldwide.

### ✨ Key Features
- 📚 Interactive Filipino Stories
- 🎯 Cultural Learning Quizzes
- 🏆 Achievement System
- 👥 Dual User Roles (Students & Teachers)
- 🎨 Modern, User-Friendly Interface
- 📱 Responsive Design

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java JDK 17 or higher
- MySQL
- Maven

### 🔧 Installation & Setup

#### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```
2. Configure your MySQL database:
```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/filiup_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```
3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```
The backend server will start on `http://localhost:8080`

#### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend/filiUp
```
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173`



### Backend Deployment
The backend can be deployed to any Java-compatible hosting service (e.g., AWS, DigitalOcean, etc.)

## 👨‍💻 Development Team
We are **BSIT - 3** students passionate about building innovative educational tools.

### Collaborators
* **Melena Rafaella Semilla** GitHub: @doraratt
* **Josh Kyle Cervantes** GitHub: @JaeNotFound
* **Mike Francis Alon** GitHub: @makieu
* **Mary Apple Ramos** GitHub: @Raveneko
* **CG M Fernandez** GitHub: @cg-del

## 🛠️ Built With
* **Frontend**:
   * React
   * Material-UI
   * React Router
   * Axios
* **Backend**:
   * Spring Boot
   * Spring Security
   * MySQL
   * Maven

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing
We welcome contributions! Please feel free to submit a Pull Request.

## 📞 Support
If you have any questions or need support, please email us at [cg.fernandez@cit.edu]

<div align="center">
  Made with ❤️ by the FiliUp Team
</div>
