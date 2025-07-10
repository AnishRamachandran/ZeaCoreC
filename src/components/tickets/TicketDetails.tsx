import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TicketIcon, 
  Building, 
  Calendar, 
  Clock, 
  Package, 
  User, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTicketDetails } from '../../hooks/useTickets';
import { useCustomers, useApps } from '../../hooks/useSupabaseData';
import { useUserProfiles } from '../../hooks/useUserManagement';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import StatusIcon from '../common/StatusIcon';

interface TicketDetailsProps {
  ticketId: string | null;
  onBack: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticketId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    customer_id: '',
    assigned_to: '',
    app_id: '',
    due_date: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  const { ticket, comments, loading, error, addComment, updateTicket, refetch } = useTicketDetails(ticketId);
  const { customers } = useCustomers();
  const { apps } = useApps();
  const { profiles } = useUserProfiles();
  const { showToast } = useToast();

  // Initialize edit form when ticket data is loaded
  React.useEffect(() => {
    if (ticket) {
      setEditData({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority,
        customer_id: ticket.customer_id || '',
        assigned_to: ticket.assigned_to || '',
        app_id: ticket.app_id || '',
        due_date: ticket.due_date || ''
      });
    }
  }, [ticket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading ticket details...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">Ticket Not Found</h3>
        <p className="text-charcoal-light">{error || 'The requested ticket could not be found'}</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <TicketIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    const success = await addComment(newComment.trim(), isInternalComment);
    setSubmittingComment(false);
    
    if (success) {
      setNewComment('');
      showToast('Comment added successfully!', 'success');
    } else {
      showToast('Failed to add comment', 'error');
    }
  };

  const handleSaveChanges = async () => {
    setSavingChanges(true);
    
    const success = await updateTicket({
      title: editData.title,
      description: editData.description || null,
      status: editData.status as 'open' | 'in_progress' | 'resolved' | 'closed',
      priority: editData.priority as 'low' | 'medium' | 'high' | 'urgent',
      customer_id: editData.customer_id || null,
      assigned_to: editData.assigned_to || null,
      app_id: editData.app_id || null,
      due_date: editData.due_date || null
    });
    
    setSavingChanges(false);
    
    if (success) {
      setIsEditing(false);
      showToast('Ticket updated successfully!', 'success');
    } else {
      showToast('Failed to update ticket', 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current ticket values
    setEditData({
      title: ticket.title,
      description: ticket.description || '',
      status: ticket.status,
      priority: ticket.priority,
      customer_id: ticket.customer_id || '',
      assigned_to: ticket.assigned_to || '',
      app_id: ticket.app_id || '',
      due_date: ticket.due_date || ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-xl transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleInputChange}
                className="text-4xl font-bold text-charcoal mb-2 w-full input-field"
                placeholder="Ticket title"
              />
            ) : (
              <h1 className="text-4xl font-bold text-charcoal mb-2">{ticket.title}</h1>
            )}
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                <span className="capitalize">{ticket.priority}</span>
              </div>
              <div className="text-charcoal-light">
                #{ticket.external_id || ticket.id.substring(0, 8)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Ticket
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
              >
                <XCircle className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={savingChanges}
                className="btn-primary flex items-center"
              >
                {savingChanges ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ticket Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Description</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                rows={6}
                className="input-field w-full"
                placeholder="Describe the ticket in detail..."
              />
            ) : (
              <p className="text-charcoal-light whitespace-pre-line">
                {ticket.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-6">Comments</h3>
            
            <div className="space-y-6 mb-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-xl ${
                      comment.is_internal 
                        ? 'bg-purple-50 border border-purple-200' 
                        : 'bg-light-gray'
                    }`}
                  >
                    <div className="flex items-start">
                      <Avatar
                        src={comment.user_avatar_url}
                        name={comment.user_name || ''}
                        size="md"
                        className="mr-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-charcoal">{comment.user_name}</span>
                            {comment.is_internal && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Internal
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-charcoal-light">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-charcoal-light whitespace-pre-line">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-charcoal mb-2">No Comments Yet</h4>
                  <p className="text-charcoal-light">Be the first to add a comment to this ticket.</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="border-t border-light-gray pt-6">
              <h4 className="font-medium text-charcoal mb-3">Add Comment</h4>
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Type your comment here..."
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="internal-comment"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="h-4 w-4 text-royal-blue focus:ring-sky-blue border-light-gray rounded"
                    />
                    <label htmlFor="internal-comment" className="ml-2 block text-sm text-charcoal">
                      {isInternalComment ? (
                        <EyeOff className="h-4 w-4 inline mr-1 text-purple-600" />
                      ) : (
                        <Eye className="h-4 w-4 inline mr-1 text-charcoal-light" />
                      )}
                      {isInternalComment ? 'Internal comment (not visible to customer)' : 'Public comment'}
                    </label>
                  </div>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="btn-primary flex items-center"
                  >
                    {submittingComment ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Ticket Details</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleInputChange}
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
                      value={editData.priority}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Customer
                    </label>
                    <select
                      name="customer_id"
                      value={editData.customer_id}
                      onChange={handleInputChange}
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
                      value={editData.assigned_to}
                      onChange={handleInputChange}
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
                      value={editData.app_id}
                      onChange={handleInputChange}
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
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={editData.due_date}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
                    <div className="text-charcoal-light">Status</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
                    <div className="text-charcoal-light">Priority</div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      <span className="capitalize">{ticket.priority}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
                    <div className="text-charcoal-light">Customer</div>
                    <div className="flex items-center text-charcoal">
                      <Building className="h-4 w-4 mr-1 text-charcoal-light" />
                      {ticket.customer_company || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
                    <div className="text-charcoal-light">Assigned To</div>
                    <div className="flex items-center text-charcoal">
                      {ticket.assignee_name ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1 text-green-600" />
                          {ticket.assignee_name}
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 mr-1 text-charcoal-light" />
                          Unassigned
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
                    <div className="text-charcoal-light">App</div>
                    <div className="flex items-center text-charcoal">
                      <Package className="h-4 w-4 mr-1 text-charcoal-light" />
                      {ticket.app_name || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
                    <div className="text-charcoal-light">Due Date</div>
                    <div className="flex items-center text-charcoal">
                      <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                      {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ticket Timeline */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-charcoal">Ticket Created</div>
                  <div className="text-xs text-charcoal-light">
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {comments.map((comment, index) => (
                <div key={comment.id} className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                    <div className={`h-3 w-3 ${comment.is_internal ? 'bg-purple-500' : 'bg-blue-500'} rounded-full`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-charcoal">
                      {comment.is_internal ? 'Internal Comment Added' : 'Comment Added'}
                    </div>
                    <div className="text-xs text-charcoal-light">
                      {new Date(comment.created_at).toLocaleString()} by {comment.user_name}
                    </div>
                  </div>
                </div>
              ))}
              
              {ticket.updated_at !== ticket.created_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                    <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-charcoal">Ticket Updated</div>
                    <div className="text-xs text-charcoal-light">
                      {new Date(ticket.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {!isEditing && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-charcoal mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {ticket.status === 'open' && (
                  <button 
                    onClick={() => updateTicket({ status: 'in_progress' })}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Start Working
                  </button>
                )}
                
                {ticket.status === 'in_progress' && (
                  <button 
                    onClick={() => updateTicket({ status: 'resolved' })}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </button>
                )}
                
                {ticket.status === 'resolved' && (
                  <button 
                    onClick={() => updateTicket({ status: 'closed' })}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Ticket
                  </button>
                )}
                
                {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                  <button 
                    onClick={() => updateTicket({ status: 'open' })}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Reopen Ticket
                  </button>
                )}
                
                {!ticket.assigned_to && (
                  <button 
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign to Me
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;