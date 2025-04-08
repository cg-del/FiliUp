import { Route, Routes } from 'react-router-dom'
import './App.css'
import { UserProvider } from './context/UserContext'
import Home from './pages/Home/Home'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'

const App = () => {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </UserProvider>
  )
}

export default App