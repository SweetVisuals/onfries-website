import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, MapPin, Phone, Navigation } from 'lucide-react';
import { menuItems, menuCategories } from '../../data/menuData';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getOrderingStatus } from '../../lib/utils';

const MenuPage: React.FC = () => {
   const { addItem } = useCart();
   const { user } = useAuth();
   const { toast } = useToast();
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('All');
   const [showAddOns, setShowAddOns] = useState(false);
   const orderingStatus = getOrderingStatus();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const handleAddToCart = (item: any) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to login to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    if (!orderingStatus.allowed) {
      toast({
        title: 'Ordering not available',
        description: 'The food truck is currently closed. Please check our hours.',
        variant: 'destructive',
      });
      return;
    }

    addItem(item);
    toast({
      title: orderingStatus.isPreOrder ? 'Pre-order added to cart' : 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });

    // Show add-ons after adding main item
    if (item.category === 'Main Courses') {
      setShowAddOns(true);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Our Menu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our delicious selection of freshly prepared dishes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {menuCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Menu Items */}
          <div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.filter(item => item.category !== 'Add-ons' || showAddOns).map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[200px] flex flex-col">
                  <CardContent className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                        <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                      </div>

                      <p className="text-muted-foreground mb-4">{item.description}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.preparationTime} min
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.isAvailable || !orderingStatus.allowed}
                        variant={!orderingStatus.allowed ? 'secondary' : 'default'}
                      >
                        {!orderingStatus.allowed ? (
                          <Clock className="w-4 h-4 mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {!orderingStatus.allowed ? 'Closed' : orderingStatus.isPreOrder ? 'Pre-Order' : 'Add to Cart'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No items found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Location & Hours */}
          <div className="space-y-6">
            {/* Location Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  Find Us
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Clock Tower, Kings Shade Walk</p>
                    <p className="text-muted-foreground">Epsom, England KT19 8EB</p>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>01234 567892</span>
                  </div>

                  {/* Embedded Google Map */}
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2488.123456789012!2d-0.2674!3d51.3326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4875d9b8b8b8b8b8%3A0x1234567890abcdef!2sClock%20Tower%2C%20Kings%20Shade%20Walk%2C%20Epsom%2C%20England%20KT19%208EB!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="OnFries Location"
                    ></iframe>
                    {/* Map Pin Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full -translate-x-24 -translate-y-20 z-10">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-1 h-4 bg-red-500 mx-auto"></div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Operating Hours
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tuesday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Wednesday</span>
                    <span className="text-muted-foreground">12:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Thursday</span>
                    <span className="text-muted-foreground">12:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Friday</span>
                    <span className="text-muted-foreground">12:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span className="text-muted-foreground">12:00 - 18:00, 19:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">12:00 - 16:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;