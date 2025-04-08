import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { PrivateRoute } from './components/PrivateRoute'
import { UserProvider } from './context/UserContext'
import Home from './pages/Home/Home'
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
          element={<PrivateRoute component={Home} requireTeacher={false} />} 
        />
        <Route 
          path="/teacher" 
          element={<PrivateRoute component={TeacherHome} requireTeacher={true} />} 
        />
      </Routes>
    </UserProvider>
  )
}

export default App