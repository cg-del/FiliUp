import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SectionDetailsPage } from "./components/SectionDetailsPage";
import TeacherLeaderboard from "./components/leaderboard/TeacherLeaderboard";
import StudentLeaderboardWrapper from "./components/leaderboard/StudentLeaderboardWrapper";
import { StudentProfile } from "./components/StudentProfile";
import { TeacherProfile } from "./components/TeacherProfile";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { ViewAllUsersPage } from "./components/ViewAllUsersPage";
import { TeacherDashboardWrapper } from "./components/TeacherDashboardWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Teacher routes wrapped with TeacherDashboardWrapper */}
              <Route path="/teacher/dashboard" element={<TeacherDashboardWrapper><TeacherDashboard /></TeacherDashboardWrapper>} />
              <Route path="/teacher/section/:sectionId" element={<TeacherDashboardWrapper><SectionDetailsPage /></TeacherDashboardWrapper>} />
              <Route path="/teacher/leaderboard/:sectionId" element={<TeacherDashboardWrapper><TeacherLeaderboard /></TeacherDashboardWrapper>} />
              <Route path="/teacher/leaderboard" element={<TeacherDashboardWrapper><TeacherLeaderboard /></TeacherDashboardWrapper>} />
              <Route path="/teacher/profile" element={<TeacherDashboardWrapper><TeacherProfile /></TeacherDashboardWrapper>} />
              {/* Admin routes */}
              <Route path="/admin/users" element={<ViewAllUsersPage />} />
              {/* Student routes */}
              <Route path="/student/leaderboard" element={<StudentLeaderboardWrapper />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/dashboard" element={<Index />} />
              <Route path="/student/lesson/:lessonId" element={<Index />} />
              <Route path="/student/activity/:activityId/:activityType" element={<Index />} />
              {/* Auth routes */}
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
