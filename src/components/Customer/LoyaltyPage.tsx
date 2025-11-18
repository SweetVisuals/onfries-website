import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerDetails, getCoupons, getCustomerCoupons, claimCoupon, Coupon, CustomerCoupon } from '../../lib/database';
import { useToast } from '../../hooks/use-toast';

const LoyaltyPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [claimedCoupons, setClaimedCoupons] = useState<CustomerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingCoupon, setClaimingCoupon] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [customerDetails, coupons, customerCoupons] = await Promise.all([
        getCustomerDetails(user.id),
        getCoupons(),
        getCustomerCoupons(user.id)
      ]);

      setLoyaltyPoints(customerDetails.loyaltyPoints);
      setAvailableCoupons(coupons);
      setClaimedCoupons(customerCoupons);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load loyalty data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCoupon = async (couponId: string) => {
    if (!user) return;

    try {
      setClaimingCoupon(couponId);
      const claimedCoupon = await claimCoupon(user.id, couponId);

      // Update local state
      setClaimedCoupons(prev => [...prev, claimedCoupon]);
      const coupon = availableCoupons.find(c => c.id === couponId);
      if (coupon) {
        setLoyaltyPoints(prev => prev - coupon.points_cost);
      }

      toast({
        title: 'Coupon Claimed!',
        description: `You have claimed "${coupon?.name}". It expires in ${coupon?.duration_hours} hours.`,
      });
    } catch (error: any) {
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim coupon',
        variant: 'destructive'
      });
    } finally {
      setClaimingCoupon(null);
    }
  };

  const getCouponTypeDescription = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'free_item':
        return `Free ${coupon.value}`;
      case 'percent_off':
        return `${coupon.value}% off order`;
      case 'bogo':
        return 'Buy one get one free';
      case 'min_order_discount':
        return `£${coupon.value} off orders over £${coupon.value}`;
      default:
        return 'Special offer';
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`;
    } else {
      return 'Expired';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg">Loading loyalty data...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Loyalty Points Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Loyalty Points</h2>
              <p className="text-muted-foreground">Earn 1 point for every £10 spent</p>
              <div className="text-3xl font-bold text-yellow-600 mt-2">
                {loyaltyPoints} points
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claimed Coupons */}
      {claimedCoupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Your Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {claimedCoupons.map((customerCoupon) => (
                <Card key={customerCoupon.id} className="border-2 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{customerCoupon.coupon?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getCouponTypeDescription(customerCoupon.coupon!)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            Expires in {getTimeRemaining(customerCoupon.expires_at)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">Ready to use</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Coupons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Available Coupons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableCoupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No coupons available at the moment</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableCoupons.map((coupon) => {
                const canAfford = loyaltyPoints >= coupon.points_cost;
                const isClaiming = claimingCoupon === coupon.id;

                return (
                  <Card key={coupon.id} className={`transition-all ${canAfford ? 'hover:shadow-md' : 'opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{coupon.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getCouponTypeDescription(coupon)}
                          </p>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">{coupon.points_cost}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            points
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Valid for {coupon.duration_hours} hours after claiming
                        </div>
                        <Button
                          onClick={() => handleClaimCoupon(coupon.id)}
                          disabled={!canAfford || isClaiming}
                          size="sm"
                          className="min-w-[80px]"
                        >
                          {isClaiming ? 'Claiming...' : 'Claim'}
                        </Button>
                      </div>

                      {!canAfford && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          Need {coupon.points_cost - loyaltyPoints} more points
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyPage;