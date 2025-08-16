import React, { useState, useEffect } from 'react';
import { Users, MapPin, FlaskConical, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { StatTile } from '../../components/StatTile';
import { AdminService } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await AdminService.getStatistics();
        setStats(data);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-600 mt-1">System statistics and monitoring dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatTile
          title="Active Users"
          value={stats.activeUsers || 0}
          subtitle="registered users"
          icon={Users}
        />
        <StatTile
          title="Total Seats"
          value={stats.totalSeats || 0}
          subtitle="library seats"
          icon={MapPin}
        />
        <StatTile
          title="Equipment Units"
          value={stats.totalEquipment || 0}
          subtitle="lab equipment"
          icon={FlaskConical}
        />
        <StatTile
          title="Total Rooms"
          value={stats.totalRooms || 0}
          subtitle="bookable rooms"
          icon={MapPin}
        />
        <StatTile
          title="Today's Bookings"
          value={stats.todayBookings || 0}
          subtitle="active bookings"
          icon={Calendar}
        />
        <StatTile
          title="No-Shows Today"
          value={stats.todayNoShows || 0}
          subtitle="missed bookings"
          icon={AlertTriangle}
          iconColor="text-red-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bookings This Week</CardTitle>
            <CardDescription>Daily booking counts for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.thisWeekBookings?.map((count: number, index: number) => ({
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
                bookings: count,
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#6D28D9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penalties This Week</CardTitle>
            <CardDescription>Daily penalty counts for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.thisWeekPenalties?.map((count: number, index: number) => ({
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
                penalties: count,
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="penalties" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Utilization</CardTitle>
          <CardDescription>Hourly resource utilization percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.utilizationData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-green-900">Database</span>
              </div>
              <p className="text-sm text-green-800">Connected and operational</p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-semibold text-yellow-900">Supabase Integration</span>
              </div>
              <p className="text-sm text-yellow-800">Ready for connection</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-blue-900">Authentication</span>
              </div>
              <p className="text-sm text-blue-800">Ready for Supabase Auth</p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-semibold text-purple-900">Real-time Updates</span>
              </div>
              <p className="text-sm text-purple-800">Ready for implementation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}