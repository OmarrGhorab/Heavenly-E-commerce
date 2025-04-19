import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');


  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex font-marcellus relative min-h-screen bg-gray-50 ">
  {/* Desktop Sidebar */}
  <div className="hidden xlg:flex flex-col border-r border-gray-200 bg-white shadow-xl xlg:basis-1/5 py-8 px-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-8 px-4 pt-14">
      Admin Dashboard
    </h2>
    <nav className="space-y-1">
      {[
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ].map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === item.name
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          onClick={() => handleTabClick(item.name)}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </Link>
      ))}
    </nav>
  </div>

  {/* Content Area */}
    <div className="flex-1 lg:basis-1/5">
      <div className="px-6 py-8 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="mt-2 border-b border-gray-200"></div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  </div>

  );
};

export default DashboardLayout;