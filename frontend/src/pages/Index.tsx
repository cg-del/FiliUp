import { useAuth } from "@/contexts/AuthContext";
import { LandingPage } from "@/components/LandingPage";
import { LoginForm } from "@/components/LoginForm";
import { StudentDashboard } from "@/components/StudentDashboard";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { RegistrationCodeDialog } from "@/components/RegistrationCodeDialog";
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

// Define the activity type for proper typing
type ActivityType = 'multiple-choice' | 'drag-drop' | 'matching-pairs' | 'story-comprehension' | null;

const Index = () => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const { lessonId, activityId, activityType } = useParams();
  const location = useLocation();

  // If user is not authenticated, show landing page or login
  if (!user) {
    if (showLogin) {
      return <LoginForm />;
    }
    return (
      <div>
        <LandingPage />
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-full shadow-primary hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
          >
            Mag-login
          </button>
        </div>
      </div>
    );
  }

  // Check if student needs to enter registration code
  if (user.role === 'student' && user.isNewStudent) {
    return (
      <>
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
          <div className="text-center text-white space-y-6">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-3xl font-bold">Welcome to FiliUp!</h1>
            <p className="text-white/80 max-w-md mx-auto">
              Before you can start learning, please enter the registration code provided by your teacher.
            </p>
          </div>
        </div>
        <RegistrationCodeDialog 
          open={true} 
          onOpenChange={() => {}} // Prevent closing
        />
      </>
    );
  }

  // Use route parameters for student dashboard
  
  // Route based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return (
        <StudentDashboard 
          initialLessonId={lessonId} 
          initialActivityId={activityId}
          initialActivityType={activityType as ActivityType}
          path={location.pathname}
        />
      );
    default:
      return (
        <StudentDashboard 
          initialLessonId={lessonId} 
          initialActivityId={activityId}
          initialActivityType={activityType as ActivityType}
          path={location.pathname}
        />
      );
  }
};

export default Index;
