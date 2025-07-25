import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCustomers, useApps, useSubscriptionPlans } from '../../hooks/useSupabaseData';

interface EditSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: any;
}

const EditSubscriptionForm: React.FC<EditSubscriptionFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  subscription
}) => {
  const { customers } = useCustomers();
  const { apps } = useApps();
  const { plans } = useSubscriptionPlans();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    app_id: '',
    plan_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    billing: 'monthly'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerSubscriptions, setCustomerSubscriptions] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState('');

  // Initialize form data when subscription prop changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        customer_id: subscription.customer_id || '',
        app_id: subscription.app_id || '',
        plan_id: subscription.plan_id || '',
        status: subscription.status || 'active',
        start_date: subscription.start_date || new Date().toISOString().split('T')[0],
        end_date: subscription.end_date || '',
        billing: subscription.billing || 'monthly'
      });
      setSelectedApp(subscription.app_id || '');
    }
  }, [subscription]);

  // Update customer subscriptions when customer changes
  useEffect(() => {
    if (formData.customer_id) {
      const filteredSubscriptions = plans.filter(
        plan => plan.app_id === formData.app_id
      );
      setCustomerSubscriptions(filteredSubscriptions);
    } else {
      setCustomerSubscriptions([]);
    }
  }, [formData.customer_id, formData.app_id, plans]);

  const calculateEndDate = (startDate: string, billing: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    if (billing === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!subscription) {
        throw new Error('No subscription selected');
      }

      const selectedPlan = plans.find(p => p.id === formData.plan_id);
      if (!selectedPlan) {
        throw new Error('Please select a valid plan');
      }

      const endDate = formData.end_date || calculateEndDate(formData.start_date, formData.billing);

      const { error } = await supabase
        .from('customer_subscriptions')
        .update({
          customer_id: formData.customer_id,
          app_id: formData.app_id,
          plan_id: formData.plan_id,
          status: formData.status,
          start_date: formData.start_date,
          end_date: endDate,
          price: selectedPlan.price,
          billing: selectedPlan.billing,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset plan when app changes
      if (name === 'app_id') {
        updated.plan_id = '';
        setSelectedApp(value);
      }
      
      // Auto-calculate end date when start date or billing changes
      if (name === 'start_date' || name === 'billing') {
        updated.end_date = calculateEndDate(
          name === 'start_date' ? value : updated.start_date,
          name === 'billing' ? value : updated.billing
        );
      }
      
      return updated;
    });
  };

  // Filter plans based on selected app
  const filteredPlans = plans.filter(p => p.app_id === formData.app_id);

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              disabled={true} // Disable changing customer
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.company}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Customer cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App
            </label>
            <select
              name="app_id"
              value={formData.app_id}
              onChange={handleChange}
              required
              disabled={true} // Disable changing app
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            >
              <option value="">Select an app</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">App cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Subscription Plan
            </label>
            <select
              name="plan_id"
              value={formData.plan_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a plan</option>
              {filteredPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}/{plan.billing}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated if left empty</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Update Subscription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionForm;