import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Shield,
  FileText,
  DollarSign,
  Receipt,
  TicketIcon
} from 'lucide-react';
import { useCustomerUser } from '../hooks/useCustomerUser';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { customerUser } = useCustomerUser();

  const menuItems = [
    { id: 'customer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: DollarSign,
      submenu: [
        { id: 'invoices', label: 'Invoices', icon: Receipt },
      ]
    },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'feature-control', label: 'Feature Control', icon: Shield },
  ];

  // System status - you can modify these values based on actual system monitoring
  const systemUptime = 99.9;
  const systemIssues = []; // Add issues here if any exist, e.g., ['Database slow', 'API rate limited']

  return (
    <div className="bg-charcoal text-soft-white w-72 min-h-screen p-6 shadow-2xl flex flex-col">
      {/* Removed the logo section completely */}
      
      <nav className="space-y-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isParentActive = activeTab === item.id || (hasSubmenu && item.submenu.some(sub => sub.id === activeTab));
          
          return (
            <div key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-5 py-4 rounded-xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-lg transform scale-105'
                    : isParentActive
                    ? 'bg-charcoal-light text-soft-white'
                    : 'text-gray-300 hover:bg-charcoal-light hover:text-soft-white hover:transform hover:scale-102'
                }`}
              >
                <Icon className={`mr-4 h-5 w-5 transition-colors ${
                  activeTab === item.id ? 'text-soft-white' : 'text-sky-blue group-hover:text-bright-cyan'
                }`} />
                <span className="font-medium">{item.label}</span>
              </button>
              
              {/* Submenu */}
              {hasSubmenu && isParentActive && (
                <div className="ml-6 mt-2 space-y-2">
                  {item.submenu.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onTabChange(subItem.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-sm ${
                          activeTab === subItem.id
                            ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-md'
                            : 'text-gray-400 hover:bg-charcoal-light hover:text-soft-white'
                        }`}
                      >
                        <SubIcon className={`mr-3 h-4 w-4 transition-colors ${
                          activeTab === subItem.id ? 'text-soft-white' : 'text-sky-blue'
                        }`} />
                        <span className="font-medium">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* System Uptime */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-royal-blue-dark to-royal-blue rounded-xl p-4 border border-sky-blue border-opacity-30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-soft-white">
              <Users className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Customer Portal</span>
            </div>
          </div>
          
          <div className="text-xs text-sky-blue-light mt-2">
            {customerUser?.customer?.company || 'Loading...'}
          </div>
        </div>
      </div>

      {/* Powered by Zealogics Footer */}
      <div className="mt-6 pt-4 border-t border-charcoal-light">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Customer Portal v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;