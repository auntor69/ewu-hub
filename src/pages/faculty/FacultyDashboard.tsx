import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatTile } from '../../components/StatTile';
import { BookingCard } from '../../components/BookingCard';
import { BookingService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { Booking } from '../../lib/types';

export function FacultyDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        const bookingsData = await BookingService.listBookings(currentUser.id);
        setBookings(bookingsData);
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

  const thisWeekBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    const now = new Date();
    const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return bookingDate >= weekStart && bookingDate < weekEnd;
  });

  const avgDuration = thisWeekBookings.length > 0 
    ? Math.round(thisWeekBookings.reduce((total, b) => {
        const start = new Date(`2000-01-01T${b.start_time}:00`);
        const end = new Date(`2000-01-01T${b.end_time}:00`);
        return total + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0) / thisWeekBookings.length)
    : 0;

  const favoriteRooms = ['CLS-101', 'CLS-205', 'LAB-CS1']; // Mock data

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
        <h1 className="text-3xl font-bold text-slate-900">Faculty Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {currentUser?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile
          title="Classes This Week"
          value={thisWeekBookings.length}
          icon={Calendar}
        />
        <StatTile
          title="Avg Duration"
          value={`${avgDuration}m`}
          subtitle="per class"
          icon={Clock}
        />
        <StatTile
          title="Conflicts Prevented"
          value="0"
          subtitle="this month"
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <StatTile
          title="Favorite Rooms"
          value={favoriteRooms.length}
          subtitle="frequently used"
          icon={MapPin}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Book additional class time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/faculty/book">
              <Button className="w-full h-16 text-left justify-start" variant="outline">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Book Room</div>
                    <div className="text-sm text-slate-500">Reserve extra class time</div>
                  </div>
                </div>
              </Button>
            </Link>
            <Link to="/faculty/classes">
              <Button className="w-full h-16 text-left justify-start" variant="outline">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">My Classes</div>
                    <div className="text-sm text-slate-500">View all bookings</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>Your next 5 room bookings</CardDescription>
            </div>
            <Link to="/faculty/classes">
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
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming classes</h3>
                <p className="text-slate-500 mb-4">Book additional room time for extended sessions.</p>
                <Link to="/faculty/book">
                  <Button>Book Room</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips & Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Guidelines</CardTitle>
            <CardDescription>Important booking policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-1">Booking Duration</h4>
              <p className="text-sm text-purple-800">
                Faculty can book rooms for 45-75 minutes per session.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-1">Advance Booking</h4>
              <p className="text-sm text-blue-800">
                Faculty can book up to 7 days in advance.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-1">Attendance Tracking</h4>
              <p className="text-sm text-green-800">
                Use attendance codes to track student participation.
              </p>
            </div>

            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              <p className="font-medium mb-1">Popular time slots:</p>
              <p>• 10:15-11:30 AM (75 min)</p>
              <p>• 2:00-3:00 PM (60 min)</p>
              <p>• 3:15-4:15 PM (60 min)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}