import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Search,
  Mail,
  Star,
  Crown,
  TrendingUp,
  Filter,
  Download,
  MessageSquare,
  Calendar,
  Trophy,
  UserCheck,
  UserX,
  Plus
} from 'lucide-react';
import { getCustomersWithStats } from '../../lib/database';

interface CustomerOverviewProps {
  onNavigate: (page: string) => void;
}

interface CustomerWithStats {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  loyaltyPoints: number;
  status: string;
  preferredItems?: string[];
  averageOrderValue?: number;
  customerSegment?: 'new' | 'regular' | 'vip' | 'inactive';
}

interface CustomerNote {
  customerId: string;
  note: string;
  timestamp: string;
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBulkEmailDialogOpen, setIsBulkEmailDialogOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await getCustomersWithStats();
      // Add computed fields
      const enrichedCustomers = customersData.map(customer => ({
        ...customer,
        averageOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0,
        preferredItems: generatePreferredItems(customer),
        customerSegment: getCustomerSegment(customer.totalOrders, customer.totalSpent, customer.lastOrderDate)
      }));
      setCustomers(enrichedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreferredItems = (customer: CustomerWithStats): string[] => {
    // Mock preferred items based on customer data
    const items = ['Ribeye Steak', 'French Fries', 'Caesar Salad'];
    return items.slice(0, Math.min(2, Math.max(1, customer.totalOrders / 5)));
  };

  const getCustomerSegment = (orders: number, spent: number, lastOrder: string): CustomerWithStats['customerSegment'] => {
    const daysSinceLastOrder = lastOrder ? Math.floor((Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceLastOrder > 90) return 'inactive';
    if (orders >= 10 && spent >= 200) return 'vip';
    if (orders >= 3) return 'regular';
    return 'new';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = filterSegment === 'all' || customer.customerSegment === filterSegment;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageOrderValue = totalCustomers > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) : 0;
  const repeatCustomers = customers.filter(customer => customer.totalOrders > 1).length;
  
  const segmentStats = {
    vip: customers.filter(c => c.customerSegment === 'vip').length,
    regular: customers.filter(c => c.customerSegment === 'regular').length,
    new: customers.filter(c => c.customerSegment === 'new').length,
    inactive: customers.filter(c => c.customerSegment === 'inactive').length
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    setSelectedCustomers(
      selectedCustomers.length === filteredCustomers.length
        ? []
        : filteredCustomers.map(c => c.id)
    );
  };

  const exportCustomerData = () => {
    const csvContent = [
      ['Name', 'Email', 'Total Orders', 'Total Spent', 'Loyalty Points', 'Last Order', 'Segment'].join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.totalOrders,
        customer.totalSpent.toFixed(2),
        customer.loyaltyPoints,
        customer.lastOrderDate || 'Never',
        customer.customerSegment || 'unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCustomerStatus = async (customerId: string, newStatus: string) => {
    try {
      // Mock API call
      setCustomers(prev => prev.map(customer =>
        customer.id === customerId ? { ...customer, status: newStatus } : customer
      ));
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const addCustomerNote = (customerId: string, note: string) => {
    const newNote: CustomerNote = {
      customerId,
      note,
      timestamp: new Date().toISOString()
    };
    setCustomerNotes(prev => [...prev, newNote]);
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'regular': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'regular': return <UserCheck className="w-4 h-4" />;
      case 'new': return <Plus className="w-4 h-4" />;
      case 'inactive': return <UserX className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6">
      {/* Enhanced Customer Statistics */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{averageOrderValue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Per order value
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              VIP Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{segmentStats.vip}</div>
            <p className="text-sm text-muted-foreground mt-1">
              High-value customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segmentation */}
      <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{segmentStats.vip}</div>
              <div className="text-sm text-yellow-600">VIP Customers</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{segmentStats.regular}</div>
              <div className="text-sm text-blue-600">Regular Customers</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{segmentStats.new}</div>
              <div className="text-sm text-green-600">New Customers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <UserX className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">{segmentStats.inactive}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Customer Management */}
      <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl">Customer Management</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportCustomerData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Dialog open={isBulkEmailDialogOpen} onOpenChange={setIsBulkEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={selectedCustomers.length === 0}>
                    <Mail className="w-4 h-4 mr-2" />
                    Bulk Email ({selectedCustomers.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Bulk Email</DialogTitle>
                  </DialogHeader>
                  <BulkEmailForm
                    selectedCustomers={selectedCustomers}
                    onClose={() => setIsBulkEmailDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button onClick={loadCustomers} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterSegment} onValueChange={setFilterSegment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={selectAllCustomers}
                variant="outline"
                size="sm"
              >
                {selectedCustomers.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Customer List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading customers...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCustomers.map((customer) => {
            return (
              <Card key={customer.id} className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleCustomerSelection(customer.id)}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                        />
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                          <span className="font-semibold text-xl text-orange-600 dark:text-orange-300">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-xl truncate">{customer.name}</h3>
                            <Badge className={getSegmentColor(customer.customerSegment || 'new')}>
                              {getSegmentIcon(customer.customerSegment || 'new')}
                              <span className="ml-1 capitalize">{customer.customerSegment || 'new'}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 text-sm">
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">{customer.totalOrders}</div>
                          <div className="text-muted-foreground">Total Orders</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">£{customer.totalSpent.toFixed(2)}</div>
                          <div className="text-muted-foreground">Total Spent</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {customer.loyaltyPoints}
                          </div>
                          <div className="text-muted-foreground">Loyalty Points</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">
                            £{customer.averageOrderValue?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-muted-foreground">Avg. Order Value</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">
                            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                          </div>
                          <div className="text-muted-foreground">Last Order</div>
                        </div>
                      </div>

                      {customer.preferredItems && customer.preferredItems.length > 0 && (
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-sm mb-2">Preferred Items:</div>
                          <div className="flex flex-wrap gap-1">
                            {customer.preferredItems.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => addCustomerNote(customer.id, 'Sample note')}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Note
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate(`customer-detail:${customer.id}`)}
                        >
                          View Orders
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Active:</label>
                        <Switch
                          checked={customer.status === 'active'}
                          onCheckedChange={(checked) => toggleCustomerStatus(customer.id, checked ? 'active' : 'inactive')}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredCustomers.length === 0 && !loading && (
        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <Users className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-medium mb-3">No customers found</h3>
            <p className="text-muted-foreground text-lg">No customers match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const BulkEmailForm: React.FC<{
  selectedCustomers: string[];
  onClose: () => void;
}> = ({ selectedCustomers, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // Mock email sending
    console.log('Sending bulk email to', selectedCustomers.length, 'customers');
    console.log('Subject:', subject);
    console.log('Message:', message);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
      </div>
      <div>
        <label className="text-sm font-medium">Message</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message..." rows={6} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSend} disabled={!subject || !message}>
          Send to {selectedCustomers.length} customers
        </Button>
      </div>
    </div>
  );
};

export default CustomerOverview;