import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FlaskConical, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">EWU Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Book seats, labs, and rooms.{' '}
            <span className="text-purple-600">Zero hassle.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            EWU Hub streamlines campus resource booking for students, faculty, and staff. 
            Reserve library seats, lab equipment, and classrooms with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth?role=student">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore UI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Library Seats</CardTitle>
              <CardDescription>
                Reserve individual or group study spaces with interactive seat selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Interactive seat maps</li>
                <li>• Group booking (up to 6 people)</li>
                <li>• Real-time availability</li>
                <li>• QR code check-in</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Lab Equipment</CardTitle>
              <CardDescription>
                Book specialized equipment for hands-on learning and research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Oscilloscopes & generators</li>
                <li>• Power supplies & meters</li>
                <li>• One-hour booking slots</li>
                <li>• Equipment status tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Extra Classes</CardTitle>
              <CardDescription>
                Faculty can reserve additional classroom time for extended sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• 45-75 minute sessions</li>
                <li>• Room capacity matching</li>
                <li>• Conflict prevention</li>
                <li>• Attendance tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">EWU Hub</span>
            </div>
            <p className="text-sm text-slate-500 mt-4 md:mt-0">
              Demo UI — no real data yet. Connect Supabase to go live.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}