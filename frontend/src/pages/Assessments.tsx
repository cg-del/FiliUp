
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';

const Assessments = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Assessments
                    </h1>
                    <p className="text-gray-600 text-sm">Create and manage quizzes and tests</p>
                  </div>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-teal-100">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Assessments Page</h2>
                <p className="text-gray-500">Assessment management functionality coming soon...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Assessments;
