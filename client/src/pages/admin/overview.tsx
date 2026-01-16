import { useStats } from "@/hooks/use-dashboard";
import { AdminLayout } from "@/components/layout-admin";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, ShoppingBag, DollarSign, AlertTriangle } from "lucide-react";

// Mock data for charts since API doesn't provide history yet
const chartData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 13 },
  { name: 'Wed', revenue: 2000, orders: 98 },
  { name: 'Thu', revenue: 2780, orders: 39 },
  { name: 'Fri', revenue: 1890, orders: 48 },
  { name: 'Sat', revenue: 2390, orders: 38 },
  { name: 'Sun', revenue: 3490, orders: 43 },
];

export default function OverviewPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) return <AdminLayout>Loading stats...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your business performance today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Revenue" 
            value={`$${stats?.totalRevenue.toLocaleString() || '0'}`} 
            icon={DollarSign}
            trend="+12.5% from yesterday"
            color="bg-green-500"
          />
          <StatCard 
            title="Appointments" 
            value={stats?.todayAppointments.toString() || '0'} 
            icon={Users}
            trend="4 pending confirmation"
            color="bg-blue-500"
          />
          <StatCard 
            title="Orders" 
            value={stats?.todayOrders.toString() || '0'} 
            icon={ShoppingBag}
            trend="Processing now"
            color="bg-purple-500"
          />
          <StatCard 
            title="Low Stock Alerts" 
            value={stats?.lowStockCount.toString() || '0'} 
            icon={AlertTriangle}
            trend="Requires attention"
            color="bg-orange-500"
            alert={stats?.lowStockCount > 0}
          />
        </div>

        {/* Chart Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold mb-6">Revenue Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold mb-6">Weekly Orders</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, alert }: any) {
  return (
    <div className={`bg-white rounded-2xl p-6 border ${alert ? 'border-orange-200 bg-orange-50' : 'border-gray-100'} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg shadow-black/5`}>
          <Icon className="w-6 h-6" />
        </div>
        {alert && <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${alert ? 'text-orange-600' : 'text-green-600'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
