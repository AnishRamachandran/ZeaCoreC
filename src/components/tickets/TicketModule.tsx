import React, { useState } from 'react';
import TicketDashboard from './TicketDashboard';
import TicketList from './TicketList';
import TicketDetails from './TicketDetails';

const TicketModule: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'details'>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleViewAllTickets = () => {
    setActiveView('list');
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setActiveView('details');
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedTicketId(null);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedTicketId(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return <TicketList onTicketSelect={handleTicketSelect} />;
      case 'details':
        return <TicketDetails ticketId={selectedTicketId} onBack={handleBackToList} />;
      case 'dashboard':
      default:
        return <TicketDashboard onViewAllTickets={handleViewAllTickets} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      {activeView !== 'details' && (
        <div className="card p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-lg'
                  : 'text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === 'list'
                  ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-lg'
                  : 'text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10'
              }`}
            >
              All Tickets
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default TicketModule;