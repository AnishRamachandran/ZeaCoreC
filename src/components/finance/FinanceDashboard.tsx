import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  RefreshCcw, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2 
} from 'lucide-react';
import { useFinancialSummary, useInvoices, usePaymentTransactions } from '../../hooks/useFinance';

const FinanceDashboard: React.FC = () => {
  const { summary, loading: summaryLoading } = useFinancialSummary();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { payments, loading: paymentsLoading } = usePaymentTransactions();

  const loading = summaryLoading || invoicesLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading finance dashboard...</span>
      </div>
    );
  }

  // Get recent invoices and payments
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
    .slice(0, 5);

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5);

  // Calculate due invoices
  const dueInvoices = invoices.filter(
    invoice => (invoice.status === 'sent' || invoice.status === 'overdue') && 
    new Date(invoice.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Get monthly recurring revenue
  const mrr = summary.monthlyRecurringRevenue + summary.yearlyRecurringRevenue;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-royal-blue to-sky-blue rounded-3xl p-8 text-soft-white">
        <h1 className="text-4xl font-bold mb-3">Finance Dashboard</h1>
        <p className="text-sky-blue-light text-lg">Financial overview and key metrics for your SaaS platform.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15.2%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${summary.totalRevenue.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Total Revenue</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-royal-blue to-sky-blue">
              <Receipt className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8.7%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${summary.outstandingAmount.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Outstanding</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
              <CreditCard className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.3%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${mrr.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Monthly Recurring</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
              <AlertTriangle className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <TrendingDown className="h-4 w-4 mr-1" />
              -2.1%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{summary.overdueInvoices}</p>
            <p className="text-charcoal-light font-medium">Overdue Invoices</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
              <BarChart3 className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Monthly Revenue</h3>
              <p className="text-charcoal-light">Revenue trends over the last 6 months</p>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between">
            {summary.revenueByMonth.map((data, index) => {
              const maxRevenue = Math.max(...summary.revenueByMonth.map(d => d.revenue), 1);
              const height = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-full flex justify-center mb-2">
                    <div
                      className="w-8 bg-gradient-to-t from-royal-blue to-sky-blue rounded-t-lg transition-all duration-500 hover:from-sky-blue hover:to-bright-cyan"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${data.month}: $${data.revenue.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-charcoal-light">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Product */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <PieChart className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Revenue by Product</h3>
          </div>

          <div className="space-y-4">
            {summary.revenueByApp.map((app, index) => {
              const totalRevenue = summary.revenueByApp.reduce((sum, a) => sum + a.revenue, 0);
              const percentage = totalRevenue > 0 ? (app.revenue / totalRevenue * 100).toFixed(1) : '0';
              
              const colors = [
                'bg-royal-blue',
                'bg-sky-blue',
                'bg-purple-500',
                'bg-green-500',
                'bg-orange-500'
              ];
              
              return (
                <div key={app.app_name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} mr-3`}></div>
                      <span className="text-charcoal font-medium">{app.app_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-charcoal font-bold">${app.revenue.toLocaleString()}</div>
                      <div className="text-xs text-charcoal-light">{percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-light-gray rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
                <Receipt className="h-6 w-6 text-soft-white" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Recent Invoices</h3>
            </div>
            <a href="#" className="text-royal-blue hover:text-sky-blue text-sm font-medium">
              View All
            </a>
          </div>
          
          <div className="space-y-4">
            {recentInvoices.map((invoice) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'paid':
                    return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case 'draft':
                    return <Receipt className="h-4 w-4 text-gray-600" />;
                  case 'sent':
                    return <Clock className="h-4 w-4 text-blue-600" />;
                  case 'overdue':
                    return <AlertTriangle className="h-4 w-4 text-red-600" />;
                  case 'cancelled':
                    return <XCircle className="h-4 w-4 text-gray-600" />;
                  default:
                    return <Receipt className="h-4 w-4 text-gray-600" />;
                }
              };
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'paid':
                    return 'bg-green-100 text-green-800';
                  case 'draft':
                    return 'bg-gray-100 text-gray-800';
                  case 'sent':
                    return 'bg-blue-100 text-blue-800';
                  case 'overdue':
                    return 'bg-red-100 text-red-800';
                  case 'cancelled':
                    return 'bg-gray-100 text-gray-800';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-royal-blue mr-3" />
                    <div>
                      <p className="font-medium text-charcoal">{invoice.invoice_number}</p>
                      <p className="text-sm text-charcoal-light">{invoice.customer_company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal">${invoice.total_amount.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
                <CreditCard className="h-6 w-6 text-soft-white" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Recent Payments</h3>
            </div>
            <a href="#" className="text-royal-blue hover:text-sky-blue text-sm font-medium">
              View All
            </a>
          </div>
          
          <div className="space-y-4">
            {recentPayments.map((payment) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'completed':
                    return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case 'pending':
                    return <Clock className="h-4 w-4 text-blue-600" />;
                  case 'failed':
                    return <XCircle className="h-4 w-4 text-red-600" />;
                  case 'refunded':
                    return <RefreshCcw className="h-4 w-4 text-orange-600" />;
                  default:
                    return <CreditCard className="h-4 w-4 text-gray-600" />;
                }
              };
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'completed':
                    return 'bg-green-100 text-green-800';
                  case 'pending':
                    return 'bg-blue-100 text-blue-800';
                  case 'failed':
                    return 'bg-red-100 text-red-800';
                  case 'refunded':
                    return 'bg-orange-100 text-orange-800';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-charcoal">
                        {payment.transaction_reference || payment.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-charcoal-light">{payment.customer_company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal">${payment.amount.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Due Invoices */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mr-4">
            <Calendar className="h-6 w-6 text-soft-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-charcoal">Upcoming Due Invoices</h3>
            <p className="text-charcoal-light">Invoices due in the next 7 days</p>
          </div>
        </div>
        
        {dueInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-gray">
              <thead className="bg-light-gray">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-soft-white divide-y divide-light-gray">
                {dueInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="h-4 w-4 text-royal-blue mr-2" />
                        <div className="text-sm font-medium text-charcoal">{invoice.invoice_number}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-charcoal">
                      {invoice.customer_company}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.status === 'overdue' ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        <span className="capitalize">{invoice.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-charcoal">
                      ${invoice.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-charcoal mb-2">No Upcoming Due Invoices</h4>
            <p className="text-charcoal-light">All invoices are either paid or not due soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;