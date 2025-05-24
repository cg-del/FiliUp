import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute'
import { UserProvider } from './context/UserContext'
import About from './pages/About/About'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ClassManagement from './pages/Admin/ClassManagement'
import CommonStories from './pages/Admin/CommonStories'
import QuestionBank from './pages/Admin/QuestionBank'
import StoryBank from './pages/Admin/StoryBank'
import UserManagement from './pages/Admin/UserManagement'
import ClassLessons from './pages/ClassLessons/ClassLessons'
import ClassGenres from './pages/Home/ClassGenres'
import ClassStories from './pages/Home/ClassStories'
import { default as Home, default as StudentDashboard } from './pages/Home/Home'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import TeacherHome from './pages/TeacherHome/TeacherHome'

const App = () => {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-200">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/about" element={<About />} />
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
        <Route 
          path="/admin/class/:classId/lessons" 
          element={<PrivateRoute component={ClassLessons} requireAdmin={true} />} 
        />
        <Route 
          path="/class/:classId/genres" 
          element={<PrivateRoute component={ClassGenres} requireTeacher={false} />} 
        />
        <Route 
          path="/class/:classId/genre/:genre/stories" 
          element={<PrivateRoute component={ClassStories} requireTeacher={false} />} 
        />
        <Route 
          path="/admin" 
          element={<PrivateRoute component={AdminDashboard} requireAdmin={true} />} 
        />
        <Route 
          path="/admin/common-stories" 
          element={<PrivateRoute component={CommonStories} requireAdmin={true} />} 
        />
        <Route 
          path="/admin/story-bank" 
          element={<PrivateRoute component={StoryBank} requireAdmin={true} />} 
        />
        <Route 
          path="/admin/question-bank" 
          element={<PrivateRoute component={QuestionBank} requireAdmin={true} />} 
        />
        <Route 
          path="/admin/users" 
          element={<PrivateRoute component={UserManagement} requireAdmin={true} />} 
        />
        <Route 
          path="/admin/classes" 
          element={<PrivateRoute component={ClassManagement} requireAdmin={true} />} 
        />
      </Routes>
      </div>
    </UserProvider>
  )
}

export default App