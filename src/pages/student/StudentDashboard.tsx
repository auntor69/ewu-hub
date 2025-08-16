import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, TrendingUp, BookOpen, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatTile } from '../../components/StatTile';
import { BookingCard } from '../../components/BookingCard';
import { BookingService, PenaltyService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { Booking, Penalty } from '../../lib/types';

export function StudentDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      try {
        const [bookingsData, penaltiesData] = await Promise.all([
          BookingService.listBookings(currentUser.id),
          PenaltyService.listPenalties(currentUser.id),
        ]);
        
        setBookings(bookingsData);
        setPenalties(penaltiesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const upcomingBookings = bookings
    .filter(b => ['confirmed', 'pending'].includes(b.status))
    .slice(0, 5);

  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today;
  });

  const thisWeekHours = bookings
    .filter(b => {
      const bookingDate = new Date(b.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return bookingDate >= weekAgo && bookingDate <= now;
    })
    .reduce((total, b) => {
      const start = new Date(`2000-01-01T${b.start_time}:00`);
      const end = new Date(`2000-01-01T${b.end_time}:00`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

  const pendingPenalties = penalties.filter(p => p.status === 'pending');
  const pendingAmount = pendingPenalties.reduce((sum, p) => sum + p.amount, 0);

  const noShowBookings = bookings.filter(b => b.status === 'no_show').length;
  const totalBookings = bookings.length;
  const noShowRate = totalBookings > 0 ? Math.round((noShowBookings / totalBookings) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {currentUser?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile
          title="Today's Bookings"
          value={todayBookings.length}
          icon={Calendar}
        />
        <StatTile
          title="This Week Hours"
          value={Math.round(thisWeekHours)}
          subtitle="hours booked"
          icon={Clock}
        />
        <StatTile
          title="Penalties Pending"
          value={`৳${pendingAmount}`}
          subtitle={`${pendingPenalties.length} penalties`}
          icon={AlertTriangle}
          iconColor="text-red-600"
        />
        <StatTile
          title="No-Show Rate"
          value={`${noShowRate}%`}
          subtitle="of total bookings"
          icon={TrendingUp}
          iconColor={noShowRate > 10 ? "text-red-600" : "text-green-600"}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Book your resources quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/student/library">
              <Button className="w-full h-16 text-left justify-start" variant="outline">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Book Library</div>
                    <div className="text-sm text-slate-500">Reserve seats for study</div>
                  </div>
                </div>
              </Button>
            </Link>
            <Link to="/student/lab">
              <Button className="w-full h-16 text-left justify-start" variant="outline">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Book Lab</div>
                    <div className="text-sm text-slate-500">Reserve equipment</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Your next 5 reservations</CardDescription>
            </div>
            <Link to="/student/bookings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming bookings</h3>
                <p className="text-slate-500 mb-4">Start by reserving a library seat or lab equipment.</p>
                <Link to="/student/library">
                  <Button>Book Library</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penalty Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Penalty Summary</CardTitle>
              <CardDescription>Outstanding penalties</CardDescription>
            </div>
            <Link to="/student/penalties">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingPenalties.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-900">Pending Penalties</span>
                    </div>
                    <span className="text-lg font-bold text-red-900">৳{pendingAmount}</span>
                  </div>
                  <p className="text-sm text-red-700">
                    {pendingPenalties.length} penalty{pendingPenalties.length !== 1 ? 'ies' : ''} need{pendingPenalties.length === 1 ? 's' : ''} attention
                  </p>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                  <p className="font-medium mb-1">Penalty rates:</p>
                  <p>• Library no-show: ৳100 per seat per hour</p>
                  <p>• Lab equipment no-show: ৳200 per hour</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">All Clear!</h3>
                <p className="text-sm text-slate-600">No outstanding penalties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}