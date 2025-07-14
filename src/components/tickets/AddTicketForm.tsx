import React, { useState } from 'react';
import { X, TicketIcon, Building, Calendar, Loader2 } from 'lucide-react';
import { useCustomers, useApps } from '../../hooks/useSupabaseData';
import { useUserProfiles } from '../../hooks/useUserManagement';
import { useCreateTicket } from '../../hooks/useTickets';

interface AddTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedCustomerId?: string;
  preselectedAppId?: string;
}

const AddTicketForm: React.FC<AddTicketFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  preselectedCustomerId,
  preselectedAppId
}) => {
  const { customers } = useCustomers();
  const { apps } = useApps();
  const { profiles } = useUserProfiles();
  const { createTicket, loading, error, success } = useCreateTicket();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    customer_id: preselectedCustomerId || '',
    assigned_to: '',
    app_id: preselectedAppId || '',
    external_id: '',
    due_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      alert('Please enter a ticket title');
      return;
    }
    
    // Create ticket
    const ticket = await createTicket({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status as 'open' | 'in_progress' | 'resolved' | 'closed',
      priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
      customer_id: formData.customer_id || undefined,
      assigned_to: formData.assigned_to || undefined,
      app_id: formData.app_id || undefined,
      external_id: formData.external_id.trim() || undefined,
      due_date: formData.due_date || undefined
    });
    
    if (ticket) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        customer_id: preselectedCustomerId || '',
        assigned_to: '',
        app_id: preselectedAppId || '',
        external_id: '',
        due_date: ''
      });
      
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <TicketIcon className="h-4 w-4 inline mr-1" />
                  Ticket Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Enter a descriptive title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Describe the issue or request in detail"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Assignment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Customer
                </label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company} ({customer.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Assigned To
                </label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Unassigned</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.first_name} {profile.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  App
                </label>
                <select
                  name="app_id"
                  value={formData.app_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">No App</option>
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* External Reference */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">External Reference</h3>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                External ID (PixelDesk)
              </label>
              <input
                type="text"
                name="external_id"
                value={formData.external_id}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., PD-1234"
              />
              <p className="text-xs text-charcoal-light mt-1">
                Reference ID from external ticketing system
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm">Ticket created successfully!</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketForm;