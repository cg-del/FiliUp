import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { PrivateRoute } from './components/PrivateRoute'
import { UserProvider } from './context/UserContext'
import ClassLessons from './pages/ClassLessons/ClassLessons'
import Home from './pages/Home/Home'
import StudentDashboard from './pages/Home/Home'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import TeacherHome from './pages/TeacherHome/TeacherHome'

const App = () => {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route 
          path="/home" 
          element={<PrivateRoute component={StudentDashboard} requireTeacher={false} />} 
        />
        <Route 
          path="/teacher" 
          element={<PrivateRoute component={TeacherHome} requireTeacher={true} />} 
        />
        <Route 
          path="/teacher/class/:classId/lessons" 
          element={<PrivateRoute component={ClassLessons} requireTeacher={true} />} 
        />
      </Routes>
    </UserProvider>
  )
}

export default App