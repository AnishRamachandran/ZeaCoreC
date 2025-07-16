import React from 'react';
import { 
  TicketIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Calendar, 
  BarChart3, 
  PieChart, 
  UserMinus, 
  ArrowUpRight, 
  ArrowDownRight,
  Building,
  Package
} from 'lucide-react';
import { useTicketStats } from '../../hooks/useTickets';
import { useCustomers, useApps } from '../../hooks/useSupabaseData';
import { useCustomerUser } from '../../hooks/useCustomerUser';

interface TicketDashboardProps {
  onViewAllTickets?: () => void;
}

const TicketDashboard: React.FC<TicketDashboardProps> = ({ onViewAllTickets }) => {
  const { stats, loading: statsLoading } = useTicketStats();
  const { apps } = useApps();
  const { customers } = useCustomers();
  const { customerUser } = useCustomerUser();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading ticket dashboard...</span>
      </div>
    );
  }

  // Calculate percentages for the status chart
  const totalTickets = stats.total || 1; // Avoid division by zero
  const openPercentage = Math.round((stats.open / totalTickets) * 100);
  const inProgressPercentage = Math.round((stats.inProgress / totalTickets) * 100);
  const resolvedPercentage = Math.round((stats.resolved / totalTickets) * 100);
  const closedPercentage = Math.round((stats.closed / totalTickets) * 100);

  // Calculate percentages for the priority chart
  const urgentPercentage = Math.round((stats.urgent / totalTickets) * 100);
  const highPercentage = Math.round((stats.high / totalTickets) * 100);
  const mediumPercentage = Math.round((stats.medium / totalTickets) * 100);
  const lowPercentage = Math.round((stats.low / totalTickets) * 100);

  // Sample data for recent activity
  const recentActivity = [
    { id: 1, action: 'New ticket created', ticket: 'Login issue with ProjectFlow', time: '2 minutes ago', type: 'new' },
    { id: 2, action: 'Ticket status updated', ticket: 'Feature request: Export to PDF', time: '15 minutes ago', type: 'update' },
    { id: 3, action: 'Comment added', ticket: 'DataVault sync failing', time: '1 hour ago', type: 'comment' },
    { id: 4, action: 'Ticket assigned', ticket: 'Dashboard loading slowly', time: '3 hours ago', type: 'assign' },
    { id: 5, action: 'Ticket resolved', ticket: 'Add user permission issue', time: '5 hours ago', type: 'resolve' }
  ];

  // Sample data for top customers with tickets
  const topCustomersWithTickets = customers
    .slice(0, 5)
    .map((customer, index) => ({
      ...customer,
      ticketCount: 10 - index, // Mock data
      openTickets: 5 - Math.min(index, 4) // Mock data
    }));

  // Sample data for top apps with tickets
  const topAppsWithTickets = apps
    .slice(0, 5)
    .map((app, index) => ({
      ...app,
      ticketCount: 8 - index, // Mock data
      openTickets: 4 - Math.min(index, 3) // Mock data
    }));

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-royal-blue to-sky-blue rounded-3xl p-8 text-soft-white">
        <h1 className="text-4xl font-bold mb-3">Support Dashboard</h1>
        <p className="text-sky-blue-light text-lg">Overview of your support tickets and their current status.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-royal-blue to-sky-blue">
              <TicketIcon className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +15.3%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{stats.total}</p>
            <p className="text-charcoal-light font-medium">Total Tickets</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <AlertTriangle className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +8.2%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{stats.open}</p>
            <p className="text-charcoal-light font-medium">Open Tickets</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <CheckCircle className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +12.1%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{stats.resolved}</p>
            <p className="text-charcoal-light font-medium">Resolved Tickets</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600">
              <Clock className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              -2.1%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{stats.overdue}</p>
            <p className="text-charcoal-light font-medium">Overdue Tickets</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
              <PieChart className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Your Tickets Status</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-charcoal font-medium">Open</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.open}</div>
                  <div className="text-xs text-charcoal-light">{openPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${openPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-charcoal font-medium">In Progress</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.inProgress}</div>
                  <div className="text-xs text-charcoal-light">{inProgressPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${inProgressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-charcoal font-medium">Resolved</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.resolved}</div>
                  <div className="text-xs text-charcoal-light">{resolvedPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${resolvedPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-500 mr-3"></div>
                  <span className="text-charcoal font-medium">Closed</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.closed}</div>
                  <div className="text-xs text-charcoal-light">{closedPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-500"
                  style={{ width: `${closedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl mr-4">
              <AlertTriangle className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Ticket Priorities</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 mr-3"></div>
                  <span className="text-charcoal font-medium">Urgent</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.urgent}</div>
                  <div className="text-xs text-charcoal-light">{urgentPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-red-600"
                  style={{ width: `${urgentPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-3"></div>
                  <span className="text-charcoal font-medium">High</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.high}</div>
                  <div className="text-xs text-charcoal-light">{highPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: `${highPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-charcoal font-medium">Medium</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.medium}</div>
                  <div className="text-xs text-charcoal-light">{mediumPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${mediumPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-charcoal font-medium">Low</span>
                </div>
                <div className="text-right">
                  <div className="text-charcoal font-bold">{stats.low}</div>
                  <div className="text-xs text-charcoal-light">{lowPercentage}%</div>
                </div>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${lowPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <Calendar className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Ticket Deadlines</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-800">Overdue</h4>
                </div>
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.overdue} tickets
                </div>
              </div>
              <p className="text-sm text-red-700">
                {stats.overdue > 0 
                  ? `${stats.overdue} tickets have passed their due date and require immediate attention.` 
                  : 'No overdue tickets. Great job!'}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-800">Due Today</h4>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.dueToday} tickets
                </div>
              </div>
              <p className="text-sm text-yellow-700">
                {stats.dueToday > 0 
                  ? `${stats.dueToday} tickets are due today.` 
                  : 'No tickets due today.'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">Due Tomorrow</h4>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.dueTomorrow} tickets
                </div>
              </div>
              <p className="text-sm text-blue-700">
                {stats.dueTomorrow > 0 
                  ? `${stats.dueTomorrow} tickets are due tomorrow.` 
                  : 'No tickets due tomorrow.'}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <UserMinus className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-purple-800">Unassigned</h4>
                </div>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.unassigned} tickets
                </div>
              </div>
              <p className="text-sm text-purple-700">
                {stats.unassigned > 0 
                  ? `${stats.unassigned} tickets need to be assigned to team members.` 
                  : 'All tickets are assigned. Great job!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity - Keep this section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-bright-cyan to-sky-blue rounded-xl mr-4">
                <BarChart3 className="h-6 w-6 text-soft-white" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Recent Ticket Activity</h3>
            </div>
            {onViewAllTickets && (
              <button 
                onClick={onViewAllTickets}
                className="text-royal-blue hover:text-sky-blue text-sm font-medium"
              >
                View All
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-light-gray rounded-xl transition-colors">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  activity.type === 'new' ? 'bg-green-400' :
                  activity.type === 'update' ? 'bg-blue-400' :
                  activity.type === 'comment' ? 'bg-purple-400' :
                  activity.type === 'assign' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal font-medium">{activity.action}</p>
                  <p className="text-charcoal-light">{activity.ticket}</p>
                  <p className="text-xs text-charcoal-light mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Subscribed Apps */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
              <Package className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Your Subscribed Apps</h3>
          </div>
          
          <div className="space-y-4">
            {customerUser?.customer_id && (
              <div className="text-center py-4">
                <p className="text-charcoal-light">
                  View your subscribed apps in the Subscriptions tab
                </p>
                <button
                  onClick={() => onViewAllTickets && onViewAllTickets()}
                  className="btn-primary mt-4"
                >
                  View All Tickets
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDashboard;