import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminService } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  User,
  FileText,
  Calendar
} from 'lucide-react';

interface AdminReport {
  reportId: string;
  reportType: string;
  reportedBy: {
    userId: string;
    userName: string;
  };
  reportedUser?: {
    userId: string;
    userName: string;
  };
  reportedContent?: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface ReportFilters {
  type: string;
  status: string;
  search: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<AdminReport | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'default';
      case 'resolved': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'default';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'inappropriate_content': return 'destructive';
      case 'spam': return 'secondary';
      case 'harassment': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Reports Management
                    </h1>
                    <p className="text-gray-600 text-sm">Review and manage system reports</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={fetchReports} variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </header>

            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  System Reports 📊
                </h1>
                <p className="text-gray-600">Monitor and resolve user reports and system issues.</p>
              </div>

              {/* Filters and Search */}
              <Card className="mb-6 bg-white shadow-sm border border-teal-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-teal-800">
                    <Filter className="w-5 h-5 mr-2 text-teal-600" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Search reports..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({ type: 'all', status: 'all', search: '' })}
                        className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Table */}
              <Card className="bg-white shadow-sm border border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-teal-800">
                    <span className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-teal-600" />
                      Reports ({reports.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reported User/Content</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className="text-center py-8">
                              Loading reports...
                            </TableCell>
                          </TableRow>
                        ))
                      ) : reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report.reportId}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{report.reportedBy.userName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getTypeBadgeVariant(report.reportType)}>
                                {report.reportType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.reportedUser ? (
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span>{report.reportedUser.userName}</span>
                                </div>
                              ) : report.reportedContent ? (
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span>{truncateContent(report.reportedContent)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span title={report.reason}>
                                {truncateContent(report.reason, 30)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(report.status)}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(report.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingReport(report);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* View Report Dialog */}
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Report Details</DialogTitle>
                    <DialogDescription>
                      Detailed information about this report
                    </DialogDescription>
                  </DialogHeader>
                  {viewingReport && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Report ID</Label>
                          <p className="font-mono text-sm">{viewingReport.reportId}</p>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <div className="mt-1">
                            <Badge variant={getTypeBadgeVariant(viewingReport.reportType)}>
                              {viewingReport.reportType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Reported By</Label>
                          <p>{viewingReport.reportedBy.userName}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <div className="mt-1">
                            <Badge variant={getStatusBadgeVariant(viewingReport.status)}>
                              {viewingReport.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {viewingReport.reportedUser && (
                        <div>
                          <Label>Reported User</Label>
                          <p>{viewingReport.reportedUser.userName}</p>
                        </div>
                      )}
                      {viewingReport.reportedContent && (
                        <div>
                          <Label>Reported Content</Label>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                            <p className="whitespace-pre-wrap">{viewingReport.reportedContent}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label>Reason</Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                          <p className="whitespace-pre-wrap">{viewingReport.reason}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Date Reported</Label>
                        <p>{formatDate(viewingReport.createdAt)}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 