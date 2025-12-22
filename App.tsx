
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Search, 
  Bell,
  FileBarChart2
} from 'lucide-react';
import ItemManagement from './components/ItemManagement';
import StatAnalysis from './components/StatAnalysis';
import { SidebarItem } from './types';

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('stat-analysis');

  const sidebarItems: SidebarItem[] = [
    { 
      id: 'stat-analysis', 
      label: '统计分析报告', 
      icon: <FileBarChart2 size={20} />,
    },
    { 
      id: 'four-lists', 
      label: '政务服务事项管理', 
      icon: <LayoutDashboard size={20} />,
    },
    { 
      id: 'performance', 
      label: '效能评价', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      id: 'funds', 
      label: '资金登记管理', 
      icon: <Wallet size={20} /> 
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5]">
      {/* Sidebar */}
      <aside className="w-[80px] md:w-[100px] bg-[#001529] flex flex-col items-center py-4 text-white shrink-0">
        <div className="mb-8 p-2">
          <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
             <span className="font-bold text-xl">D</span>
          </div>
        </div>
        <nav className="flex flex-col gap-6 w-full px-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex flex-col items-center gap-1 py-3 px-1 rounded transition-colors relative ${
                activeMenu === item.id ? 'bg-[#1890ff] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-[10px] text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-bold text-blue-600">政务信息系统项目管理平台</h1>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <Search size={20} />
            </button>
            <div className="relative">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">6</span>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" 
                alt="user avatar" 
                className="w-8 h-8 rounded-full border border-gray-200"
              />
              <span className="text-gray-700 text-sm font-medium">管理员</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeMenu === 'four-lists' && <ItemManagement />}
          {activeMenu === 'stat-analysis' && <StatAnalysis />}
        </div>
      </main>
    </div>
  );
};

export default App;
