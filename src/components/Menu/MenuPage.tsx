import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, MapPin, Phone, Navigation, Loader2 } from 'lucide-react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getOrderingStatus } from '../../lib/utils';
import { Component as FloatingAuthModal } from '../ui/sign-in-flo';

const MenuPage: React.FC = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { menuItems, loading, error } = useMenuItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddOns, setShowAddOns] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const orderingStatus = getOrderingStatus();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory === 'Steak') {
      matchesCategory = item.category === 'Main Courses';
    } else if (selectedCategory === 'Fries') {
      // Show fries items for the Fries filter
      matchesCategory = item.name.includes('Fries') && !item.name.includes('Loaded');
    } else if (selectedCategory === 'Drinks') {
      matchesCategory = item.category === 'Add-ons' && item.name.includes('Drink');
    } else if (selectedCategory !== 'All') {
      matchesCategory = item.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory && item.isAvailable && item.category !== 'Add-ons';
  });

  const handleAddToCart = (item: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
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

  const handleAddAddOn = (addOn: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!orderingStatus.allowed) return;
    
    addItem(addOn);
    toast({
      title: 'Add-on added',
      description: `${addOn.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Menu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our delicious selection of freshly prepared dishes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-start mb-6">
          {/* Left side - Search */}
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Right side - Category Filters */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Steak', 'Fries', 'Drinks'].map((filter) => (
              <Button
                key={filter}
                variant={selectedCategory === filter ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(filter)}
                className="text-sm"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
            <p className="text-xl text-muted-foreground">Loading menu items...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-destructive mb-4">Error loading menu items</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Menu Items */}
        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Menu Items */}
            <div className="lg:col-span-2">
              {/* Dynamic sections based on filter */}
              
              {/* Steak Section */}
              {(selectedCategory === 'All' || selectedCategory === 'Steak') && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Steak
                  </h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {filteredItems.filter(item => item.category === 'Main Courses').map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col h-full">
                            <div className="mb-3">
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                                {item.name}
                              </h3>
                              <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-2">
                                £{item.price.toFixed(2)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                              {item.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{item.preparationTime} min</span>
                              </div>
                              
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(item)}
                                disabled={!item.isAvailable || !orderingStatus.allowed}
                                variant={!orderingStatus.allowed ? 'secondary' : 'default'}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4"
                              >
                                {!orderingStatus.allowed ? (
                                  <>
                                    <Clock className="w-4 h-4 mr-1" />
                                    Closed
                                  </>
                                ) : orderingStatus.isPreOrder ? (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Pre-Order
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {!item.isAvailable && (
                              <div className="mt-2">
                                <Badge variant="destructive" className="text-xs">
                                  Currently Unavailable
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Fries Section */}
              {(selectedCategory === 'All' || selectedCategory === 'Fries') && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Fries
                  </h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Since all steak items come with fries, show them as add-ons or sides */}
                    <Card className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full text-center">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              Classic Fries
                            </h3>
                            <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-2">
                              £3.50
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                            Crispy golden fries served with all steak orders
                          </p>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Extra
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full text-center">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              Sweet Potato Fries
                            </h3>
                            <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-2">
                              £4.00
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                            Sweet and crispy alternative to classic fries
                          </p>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Extra
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full text-center">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              Loaded Fries
                            </h3>
                            <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-2">
                              £5.50
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                            Fries topped with cheese, bacon, and green sauce
                          </p>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Extra
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Drinks Section */}
              {(selectedCategory === 'All' || selectedCategory === 'Drinks') && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Drinks
                  </h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Drink')).map((drink) => (
                      <Card key={drink.id} className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col h-full text-center">
                            <div className="mb-3">
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                                {drink.name}
                              </h3>
                              <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-2">
                                £{drink.price.toFixed(2)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                              {drink.description}
                            </p>
                            
                            <Button
                              size="sm"
                              onClick={() => handleAddAddOn(drink)}
                              disabled={!drink.isAvailable || !orderingStatus.allowed}
                              variant="outline"
                              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Section - Only show when showAddOns is true */}
              {showAddOns && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Add Some Extras
                  </h3>
                  
                  {/* Meat Add-ons */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4 text-center text-foreground">Meat Add-ons</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {menuItems.filter(item => item.category === 'Add-ons' && (item.name.includes('Lamb') || item.name.includes('Ribs'))).map((addOn) => (
                        <Card key={addOn.id} className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h5 className="font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                                {addOn.name}
                              </h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                {addOn.description}
                              </p>
                              <span className="text-lg font-bold text-yellow-600">
                                £{addOn.price.toFixed(2)}
                              </span>
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddAddOn(addOn)}
                                  disabled={!addOn.isAvailable || !orderingStatus.allowed}
                                  variant="outline"
                                  className="text-black border-yellow-400 hover:bg-yellow-50 w-full"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Sauces */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4 text-center text-foreground">Sauces</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Sauce')).map((addOn) => (
                        <Card key={addOn.id} className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h5 className="font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                                {addOn.name}
                              </h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                {addOn.description}
                              </p>
                              <span className="text-lg font-bold text-yellow-600">
                                £{addOn.price.toFixed(2)}
                              </span>
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddAddOn(addOn)}
                                  disabled={!addOn.isAvailable || !orderingStatus.allowed}
                                  variant="outline"
                                  className="text-black border-yellow-400 hover:bg-yellow-50 w-full"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Drinks */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4 text-center text-foreground">Drinks</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Drink')).map((addOn) => (
                        <Card key={addOn.id} className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h5 className="font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                                {addOn.name}
                              </h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                {addOn.description}
                              </p>
                              <span className="text-lg font-bold text-yellow-600">
                                £{addOn.price.toFixed(2)}
                              </span>
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddAddOn(addOn)}
                                  disabled={!addOn.isAvailable || !orderingStatus.allowed}
                                  variant="outline"
                                  className="text-black border-yellow-400 hover:bg-yellow-50 w-full"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddOns(false)}
                      className="mr-4"
                    >
                      Skip Add-ons
                    </Button>
                    <Button
                      onClick={() => setShowAddOns(false)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      Continue to Cart
                    </Button>
                  </div>
                </div>
              )}

              {(() => {
                // Determine if we should show "no items" message based on current filter
                let hasItems = false;
                if (selectedCategory === 'Steak') {
                  hasItems = filteredItems.some(item => item.category === 'Main Courses');
                } else if (selectedCategory === 'Fries') {
                  hasItems = menuItems.some(item => item.name.includes('Fries') && !item.name.includes('Loaded'));
                } else if (selectedCategory === 'Drinks') {
                  hasItems = menuItems.some(item => item.category === 'Add-ons' && item.name.includes('Drink'));
                } else if (selectedCategory === 'All') {
                  hasItems = filteredItems.length > 0;
                }
                
                return !hasItems && (
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
                );
              })()}
            </div>

            {/* Right Column - Location & Hours */}
            <div className="space-y-6">
              {/* Operating Hours Card */}
              <Card className="mt-10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
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

              {/* Location Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
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
            </div>
          </div>
        )}

        {/* Floating Auth Modal */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute -top-4 -right-4 z-[60] w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent text-xl"
              >
                ×
              </button>
              <div className="max-h-[90vh] overflow-y-auto">
                <FloatingAuthModal onClose={() => setIsAuthModalOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;