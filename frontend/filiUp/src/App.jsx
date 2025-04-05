import { Route, Routes } from 'react-router-dom'
import './App.css'
import { UserProvider } from './context/UserContext'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </UserProvider>
  )
}

export default App