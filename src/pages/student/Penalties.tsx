import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { PenaltyService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { Penalty } from '../../lib/types';
import { formatDateTime } from '../../lib/utils';

export function Penalties() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadPenalties = async () => {
      if (!currentUser) return;
      
      try {
        const data = await PenaltyService.listPenalties(currentUser.id);
        setPenalties(data);
      } catch (error) {
        toast({
          title: 'Failed to load penalties',
          description: error instanceof Error ? error.message : 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPenalties();
  }, [currentUser]);

  const pendingPenalties = penalties.filter(p => p.status === 'pending');
  const totalPending = pendingPenalties.reduce((sum, p) => sum + p.amount, 0);

  const columns: Column<Penalty>[] = [
    {
      key: 'created_at',
      header: 'Date',
      render: (penalty) => formatDateTime(penalty.created_at),
      sortable: true,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (penalty) => (
        <div className="max-w-xs">
          <div className="truncate">{penalty.reason}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (penalty) => (
        <span className="font-medium">৳{penalty.amount}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (penalty) => <StatusBadge status={penalty.status} />,
    },
  ];

  const renderActions = (penalty: Penalty) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setSelectedPenalty(penalty)}
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="h-32 bg-slate-200 rounded-2xl mb-6"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Penalties</h1>
        <p className="text-slate-600">View your penalty history and outstanding amounts</p>
      </div>

      {/* Penalty Policy Banner */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Penalty Policy</h3>
              <p className="text-sm text-yellow-800">
                Penalties discourage no-shows and free up resources for others. 
                Library no-shows: ৳100 per seat per hour. Lab equipment no-shows: ৳200 per hour.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Penalties</p>
                <p className="text-2xl font-bold text-slate-900">{penalties.length}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Amount</p>
                <p className="text-2xl font-bold text-red-600">৳{totalPending}</p>
                <p className="text-xs text-slate-500">{pendingPenalties.length} penalties</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {penalties.filter(p => ['paid', 'waived'].includes(p.status)).length}
                </p>
                <p className="text-xs text-slate-500">paid or waived</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Penalties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Penalty History</CardTitle>
          <CardDescription>All penalties associated with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={penalties}
            columns={columns}
            actions={renderActions}
            emptyState={
              <EmptyState
                icon={AlertTriangle}
                title="No penalties"
                description="You have a clean record! Keep attending your bookings to avoid penalties."
              />
            }
          />
        </CardContent>
      </Card>

      {/* Penalty Details Modal */}
      <Dialog open={!!selectedPenalty} onOpenChange={() => setSelectedPenalty(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Penalty Details</DialogTitle>
            <DialogDescription>
              Complete information about this penalty
            </DialogDescription>
          </DialogHeader>
          
          {selectedPenalty && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-900">Penalty Amount</span>
                  <span className="text-xl font-bold text-red-900">৳{selectedPenalty.amount}</span>
                </div>
                <StatusBadge status={selectedPenalty.status} />
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-slate-600 mb-1">Date Issued</div>
                  <div className="font-medium">{formatDateTime(selectedPenalty.created_at)}</div>
                </div>
                
                <div>
                  <div className="text-slate-600 mb-1">Reason</div>
                  <div className="font-medium">{selectedPenalty.reason}</div>
                </div>

                <div>
                  <div className="text-slate-600 mb-1">Booking ID</div>
                  <div className="font-mono text-xs bg-slate-100 rounded px-2 py-1">
                    {selectedPenalty.booking_id}
                  </div>
                </div>
              </div>

              {selectedPenalty.status === 'pending' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Action Required:</strong> Please contact the administration office to resolve this penalty.
                  </p>
                </div>
              )}

              {selectedPenalty.status === 'waived' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    This penalty has been waived by the administration.
                  </p>
                </div>
              )}

              {selectedPenalty.status === 'paid' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This penalty has been paid and resolved.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}