import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Gift, Plus, Edit, Trash2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, Coupon } from '../../lib/database';
import { menuItems } from '../../data/menuData';

const CouponManagement: React.FC = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'free_item' as Coupon['type'],
    value: '',
    points_cost: 0,
    duration_hours: 24,
    max_per_account: 1,
    is_active: true
  });
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'free_item',
      value: '',
      points_cost: 0,
      duration_hours: 24,
      max_per_account: 1,
      is_active: true
    });
    setSelectedMenuItems([]);
    setMinOrderAmount('');
    setDiscountAmount('');
    setDiscountType('fixed');
    setEditingCoupon(null);
  };

  const prepareCouponValue = () => {
    switch (formData.type) {
      case 'free_item':
      case 'bogo':
        return JSON.stringify(selectedMenuItems);
      case 'percent_off':
        return formData.value;
      case 'min_order_discount':
        return JSON.stringify({
          minOrder: parseFloat(minOrderAmount) || 0,
          discount: parseFloat(discountAmount) || 0,
          discountType: discountType
        });
      default:
        return formData.value;
    }
  };

  const parseCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'free_item':
      case 'bogo':
        try {
          const items = JSON.parse(coupon.value);
          setSelectedMenuItems(Array.isArray(items) ? items : []);
        } catch {
          setSelectedMenuItems([]);
        }
        break;
      case 'percent_off':
        setFormData(prev => ({ ...prev, value: coupon.value }));
        break;
      case 'min_order_discount':
        try {
          const data = JSON.parse(coupon.value);
          setMinOrderAmount(data.minOrder?.toString() || '');
          setDiscountAmount(data.discount?.toString() || '');
          setDiscountType(data.discountType || 'fixed');
        } catch {
          setMinOrderAmount('');
          setDiscountAmount('');
          setDiscountType('fixed');
        }
        break;
      default:
        setFormData(prev => ({ ...prev, value: coupon.value }));
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const couponData = {
        ...formData,
        value: prepareCouponValue()
      };
      await createCoupon(couponData);
      toast({
        title: 'Success',
        description: 'Coupon created successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to create coupon',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    try {
      const couponData = {
        ...formData,
        value: prepareCouponValue()
      };
      await updateCoupon(editingCoupon.id, couponData);
      toast({
        title: 'Success',
        description: 'Coupon updated successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to update coupon',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deleteCoupon(couponId);
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive'
      });
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      points_cost: coupon.points_cost,
      duration_hours: coupon.duration_hours,
      max_per_account: coupon.max_per_account,
      is_active: coupon.is_active
    });
    parseCouponValue(coupon);
    setIsCreateDialogOpen(true);
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      toast({
        title: 'Success',
        description: `Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}`,
      });
      loadCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update coupon status',
        variant: 'destructive'
      });
    }
  };

  const getCouponTypeDescription = (type: Coupon['type']) => {
    switch (type) {
      case 'free_item':
        return 'Free Item';
      case 'percent_off':
        return 'Percentage Off';
      case 'bogo':
        return 'Buy One Get One';
      case 'min_order_discount':
        return 'Minimum Order Discount';
      default:
        return type;
    }
  };

  const getCouponValueDescription = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'free_item':
      case 'bogo':
        try {
          const items = JSON.parse(coupon.value);
          if (Array.isArray(items) && items.length > 0) {
            const itemNames = items.map(id => menuItems.find(item => item.id === id)?.name).filter(Boolean);
            return itemNames.length > 0 ? itemNames.join(', ') : 'Selected items';
          }
        } catch {}
        return 'Free item(s)';
      case 'percent_off':
        return `${coupon.value}% off order`;
      case 'min_order_discount':
        try {
          const data = JSON.parse(coupon.value);
          const discountText = data.discountType === 'percent' ? `${data.discount}%` : `£${data.discount}`;
          return `${discountText} off orders over £${data.minOrder}`;
        } catch {}
        return `Discount on orders over £${coupon.value}`;
      default:
        return coupon.value;
    }
  };

  const handleMenuItemToggle = (itemId: string) => {
    setSelectedMenuItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getSelectedMenuItemNames = () => {
    return selectedMenuItems
      .map(id => menuItems.find(item => item.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const isFormValid = () => {
    // Basic validation for all coupon types
    if (!formData.name.trim()) return false;
    if (formData.points_cost <= 0) return false;

    // Type-specific validation
    switch (formData.type) {
      case 'free_item':
      case 'bogo':
        return selectedMenuItems.length > 0;
      case 'percent_off':
        const percent = parseFloat(formData.value);
        return !isNaN(percent) && percent > 0 && percent <= 100;
      case 'min_order_discount':
        const minOrder = parseFloat(minOrderAmount);
        const discount = parseFloat(discountAmount);
        return !isNaN(minOrder) && minOrder > 0 && !isNaN(discount) && discount > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <p className="text-muted-foreground">Create and manage loyalty coupons for customers</p>
        </div>
        <div className="mt-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Free Fries"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the coupon"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Coupon['type']) => {
                      setFormData(prev => ({ ...prev, type: value, value: '' }));
                      setSelectedMenuItems([]);
                      setMinOrderAmount('');
                      setDiscountAmount('');
                      setDiscountType('fixed');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_item">Free Item</SelectItem>
                      <SelectItem value="percent_off">Percentage Off</SelectItem>
                      <SelectItem value="bogo">Buy One Get One</SelectItem>
                      <SelectItem value="min_order_discount">Minimum Order Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Value Fields */}
                {(formData.type === 'free_item' || formData.type === 'bogo') && (
                  <div>
                    <Label>Menu Items</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedMenuItems.length > 0
                            ? `${selectedMenuItems.length} item${selectedMenuItems.length > 1 ? 's' : ''} selected`
                            : 'Select menu items'
                          }
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          {menuItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={item.id}
                                checked={selectedMenuItems.includes(item.id)}
                                onCheckedChange={() => handleMenuItemToggle(item.id)}
                              />
                              <Label htmlFor={item.id} className="text-sm">
                                {item.name} - £{item.price.toFixed(2)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {selectedMenuItems.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {getSelectedMenuItemNames()}
                      </p>
                    )}
                  </div>
                )}

                {formData.type === 'percent_off' && (
                  <div>
                    <Label htmlFor="percentage">Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g., 10"
                    />
                  </div>
                )}

                {formData.type === 'min_order_discount' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="min_order">Minimum Order Amount (£)</Label>
                      <Input
                        id="min_order"
                        type="number"
                        min="0"
                        step="0.01"
                        value={minOrderAmount}
                        onChange={(e) => setMinOrderAmount(e.target.value)}
                        placeholder="e.g., 20.00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="discount_amount">Discount Amount</Label>
                        <Input
                          id="discount_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          placeholder={discountType === 'fixed' ? '£5.00' : '10'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount_type">Discount Type</Label>
                        <Select value={discountType} onValueChange={(value: 'fixed' | 'percent') => setDiscountType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                            <SelectItem value="percent">Percentage (%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points_cost">Points Cost</Label>
                    <Input
                      id="points_cost"
                      type="number"
                      value={formData.points_cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, points_cost: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_hours">Duration (Hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 24 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="max_per_account">Max Per Account</Label>
                  <Input
                    id="max_per_account"
                    type="number"
                    value={formData.max_per_account}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_per_account: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
                    disabled={!isFormValid()}
                  >
                    {editingCoupon ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No coupons created yet</p>
              <p className="text-sm">Create your first coupon to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.name}</TableCell>
                    <TableCell>{getCouponTypeDescription(coupon.type)}</TableCell>
                    <TableCell>{getCouponValueDescription(coupon)}</TableCell>
                    <TableCell>{coupon.points_cost}</TableCell>
                    <TableCell>{coupon.duration_hours}h</TableCell>
                    <TableCell>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCoupon(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon)}
                        >
                          {coupon.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponManagement;