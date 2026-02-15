import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Fixed/Static depending on implementation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header - Sticky Top */}
        <Header />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;