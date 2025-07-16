import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import AuthWrapper from './components/AuthWrapper';
import Sidebar from './components/Sidebar';
import CustomerDashboard from './components/CustomerDashboard';
import SubscriptionsManagement from './components/SubscriptionsManagement';
import FeatureControl from './components/FeatureControl';
import UserProfile from './components/UserProfile';
import TicketModule from './components/tickets/TicketModule';
import InvoicesManagement from './components/finance/InvoicesManagement';
import InvoiceDetails from './components/finance/InvoiceDetails';
import { useCustomerUser } from './hooks/useCustomerUser';

function App() {
  const [activeTab, setActiveTab] = useState('customer-dashboard');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { customerUser, loading: customerUserLoading } = useCustomerUser();

  const renderContent = () => {
    switch (activeTab) {
      case 'customer-dashboard':
        return customerUser ? (
          <CustomerDashboard 
            customerId={customerUser.customer_id} 
            onBack={() => {}} // No back action in customer portal
          />
        ) : null;
      case 'subscriptions':
        return <SubscriptionsManagement />;
      case 'feature-control':
        return <FeatureControl />;
      case 'invoices':
        return <InvoicesManagement onInvoiceSelect={(invoiceId) => {
          setSelectedInvoiceId(invoiceId);
          setActiveTab('invoice-details');
        }} />;
      case 'invoice-details':
        return <InvoiceDetails 
          invoiceId={selectedInvoiceId} 
          onBack={() => {
            setActiveTab('invoices');
            setSelectedInvoiceId(null);
          }}
        />;
      case 'tickets':
        return <TicketModule />;
      case 'profile':
        return <UserProfile onBack={() => setActiveTab('dashboard')} />;
      default:
        return customerUser ? <CustomerDashboard customerId={customerUser.customer_id} onBack={() => {}} /> : null;
    }
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  return (
    <ToastProvider>
      <AuthWrapper onProfileClick={handleProfileClick}>
        {customerUserLoading ? (
          <div className="flex items-center justify-center h-screen bg-light-gray">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue mx-auto mb-4"></div>
              <p className="text-charcoal">Loading your customer portal...</p>
            </div>
          </div>
        ) : (
          <div className="flex h-screen bg-light-gray">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="flex-1 overflow-auto">
              <div className="p-8 min-h-full">
                {renderContent()}
              </div>
            </main>
          </div>
        )}
      </AuthWrapper>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;