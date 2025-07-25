import React, { useState } from 'react';
import { Search, Calendar, DollarSign, User, Package, Loader2, Eye } from 'lucide-react';
import { useCustomerSubscriptions } from '../hooks/useSupabaseData';
import { useCustomerUser } from '../hooks/useCustomerUser';
import StatusIcon from './common/StatusIcon';
import AppLogo from './common/AppLogo';
import CompanyLogo from './common/CompanyLogo';

const SubscriptionsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { subscriptions, loading, error, refetch } = useCustomerSubscriptions();
  const { customerUser } = useCustomerUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscriptions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading subscriptions: {error}</p>
      </div>
    );
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    // Only show subscriptions for the current customer
    if (customerUser && subscription.customer_id !== customerUser.customer_id) {
      return false;
    }
    
    const matchesSearch = subscription.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBillingColor = (billing: string) => {
    return billing === 'yearly' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Subscriptions</h1>
          <p className="text-gray-600 mt-2">View and manage your active subscriptions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trial</p>
              <p className="text-2xl font-bold text-blue-600">
                {subscriptions.filter(s => s.status === 'trial').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">
                {subscriptions.filter(s => s.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <User className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MRR</p>
              <p className="text-2xl font-bold text-purple-600">
                ${subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <AppLogo 
                          src={subscription.app_logo_url} 
                          appName={subscription.app_name} 
                          size="sm" 
                          className="mr-3"
                        />
                        <div className="text-sm font-medium text-gray-900">{subscription.app_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 ${
                          subscription.is_popular ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-blue-400 to-blue-500'
                        }`}>
                          <span className="text-xs font-bold">{subscription.plan_name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{subscription.plan_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CompanyLogo 
                        src={subscription.customer_logo_url} 
                        companyName={subscription.customer_company} 
                        size="sm" 
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.customer_company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIcon 
                      status={subscription.status} 
                      type="subscription" 
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getBillingColor(subscription.billing)}`}>
                      {subscription.billing}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {subscription.price === 0 ? 'Free' : `$${subscription.price}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{new Date(subscription.start_date).toLocaleDateString()}</div>
                      <div className="text-xs">to {new Date(subscription.end_date).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found for your account</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have any active subscriptions yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsManagement;