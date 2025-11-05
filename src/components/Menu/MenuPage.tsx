import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, MapPin, Phone, Navigation, Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { getOrderingStatus } from '../../lib/utils';
import { Component as FloatingAuthModal } from '../ui/sign-in-flo';

// Menu Item Card Component
const MenuItemCard: React.FC<{ item: any; orderingStatus: any; onAddToCart: (item: any, event?: React.MouseEvent) => void; isSingleCard?: boolean }> = ({ item, orderingStatus, onAddToCart, isSingleCard = false }) => {
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200 h-full flex flex-col ${isSingleCard ? 'min-w-[400px]' : ''}`}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex-1 space-y-4">
          {/* Header - Name, Price, Image */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                {item.name}
              </h3>
              <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-1">
                £{item.price.toFixed(2)}
              </span>
            </div>

            {/* Image */}
            {item.image && (
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ml-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Description Section */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        {/* Bottom Section - Preparation Time and Order Button - Always at bottom */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span>{item.preparationTime} min</span>
          </div>

          <Button
            size="sm"
            onClick={(e) => onAddToCart(item, e)}
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
                Order
              </>
            )}
          </Button>
        </div>

        {!item.isAvailable && (
          <Badge variant="destructive" className="text-xs w-fit mt-2">
            Currently Unavailable
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

const MenuPage: React.FC = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { menuItems, loading, error, refreshMenu } = useMenuItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Steak');
  const [showAddOns, setShowAddOns] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: {item: any, quantity: number}}>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderingStatus, setOrderingStatus] = useState({ allowed: true, isPreOrder: false });
  const [selectedSauce, setSelectedSauce] = useState<string>('');
  const [businessHours, setBusinessHours] = useState({ openingTime: '09:00', closingTime: '22:00' });
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);
  const [animationStartPos, setAnimationStartPos] = useState<{ x: number; y: number } | null>(null);
  const [animationEndPos, setAnimationEndPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Function to get responsive grid class based on item count
  const getGridClass = (itemCount: number) => {
    if (itemCount === 1) return 'flex justify-center max-w-lg mx-auto';
    if (itemCount === 2) return 'grid gap-6 md:grid-cols-2';
    if (itemCount === 3) return 'grid gap-6 md:grid-cols-2 lg:grid-cols-3';
    return 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  useEffect(() => {
    const fetchOrderingStatus = async () => {
      try {
        const status = await getOrderingStatus();
        console.log('Fetched ordering status:', status);
        setOrderingStatus(status);
      } catch (error) {
        console.error('Error fetching ordering status:', error);
      }
    };

    const fetchBusinessHours = async () => {
      try {
        // Load business hours from localStorage or default
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setBusinessHours({
            openingTime: settings.business?.openingTime || '09:00',
            closingTime: settings.business?.closingTime || '22:00'
          });
        }
      } catch (error) {
        console.error('Error fetching business hours:', error);
      }
    };

    // Fetch immediately
    fetchOrderingStatus();
    fetchBusinessHours();

    // Poll every 5 seconds to check for admin status changes (reduced for testing)
    const interval = setInterval(fetchOrderingStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'Steak') {
      matchesCategory = item.category === 'Main Courses' && item.name !== 'Signature Fries';
    } else if (selectedCategory === 'Fries') {
      // For fries filter, show fries items
      matchesCategory = item.name === 'Signature Fries';
    } else if (selectedCategory === 'Kids') {
      matchesCategory = item.category === 'Kids';
    } else if (selectedCategory === 'Drinks') {
      matchesCategory = item.category === 'Drinks';
    } else if (selectedCategory === 'All') {
      matchesCategory = true;
    } else {
      matchesCategory = item.category === selectedCategory;
    }

    return matchesSearch && matchesCategory && item.isAvailable && item.name !== 'Custom Item';
  });

  const handleAddToCart = (item: any, event?: React.MouseEvent) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!orderingStatus.allowed) {
      toast.error('Ordering not available: The food truck is currently closed. Please check our hours.');
      return;
    }

    // Always trigger animation for cart additions
    const menuRect = menuRef.current?.getBoundingClientRect();

    if (menuRect) {
      if (event) {
        // Start from button position
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        setAnimationStartPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      } else {
        // Start from center of screen for dialogs
        setAnimationStartPos({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        });
      }

      // Get cart icon position - try multiple selectors
      let cartIcon = document.querySelector('[data-cart-icon]');
      if (!cartIcon) {
        cartIcon = document.querySelector('.lucide-shopping-cart')?.parentElement || document.querySelector('button:has(.lucide-shopping-cart)');
      }

      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        setAnimationEndPos({
          x: cartRect.left + cartRect.width / 2,
          y: cartRect.top + cartRect.height / 2
        });
      } else {
        // Last resort: fixed position in header area
        setAnimationEndPos({
          x: window.innerWidth - 80,
          y: 40
        });
      }

      setAnimatingItem(item.id);
      setTimeout(() => setAnimatingItem(null), 600);
    }

    // Handle different item types
    if (item.category === 'Main Courses') {
      // For main courses, show customization dialog
      setSelectedItem(item);
      setShowCustomizeDialog(true);
    } else {
      // For all other items (drinks, kids items), add directly to cart
      addItem(item);
      toast.success(orderingStatus.isPreOrder ? 'Pre-order added to cart' : 'Added to cart', {
        description: `${item.name} has been added to your cart.`,
        duration: 3000,
        action: {
          label: 'View Cart',
          onClick: () => {
            // Trigger cart opening - we'll need to pass this down or use a global state
            const cartButton = document.querySelector('[data-cart-icon]');
            if (cartButton) {
              (cartButton as HTMLElement).click();
            }
          },
        },
      });
    }
  };

  const handleConfirmCustomize = () => {
    let addOnsWithQuantities = [];
    let itemName = selectedItem.name;

    // Handle Kids Meal sauce selection
    if (selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal') {
      if (selectedSauce) {
        const selectedSauceItem = menuItems.find(item => item.id === selectedSauce);
        if (selectedSauceItem) {
          addOnsWithQuantities = [{
            ...selectedSauceItem,
            quantity: 1
          }];
          itemName = `${selectedItem.name} + ${selectedSauceItem.name}`;
        }
      }
    } else {
      // Handle regular add-ons for main courses
      addOnsWithQuantities = Object.values(selectedAddOns).map(({ item, quantity }) => ({
        ...item,
        quantity
      }));

      if (addOnsWithQuantities.length > 0) {
        itemName = selectedItem.name + ' + Add-ons';
      }
    }

    // Calculate total price with add-ons quantities
    const totalPrice = selectedItem.price + addOnsWithQuantities.reduce((sum, addOn) => sum + (addOn.price * addOn.quantity), 0);

    // Create customized item
    const customizedItem = {
      ...selectedItem,
      price: totalPrice,
      addOns: addOnsWithQuantities,
      name: itemName
    };

    // Trigger animation before adding to cart
    if (menuRef.current) {
      // Get cart icon position
      const cartIcon = document.querySelector('[data-cart-icon]');
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        setAnimationEndPos({
          x: cartRect.left + cartRect.width / 2 - menuRect.left,
          y: cartRect.top + cartRect.height / 2 - menuRect.top
        });

        // Start animation from center of screen (since dialog is modal)
        setAnimationStartPos({
          x: window.innerWidth / 2 - menuRect.left,
          y: window.innerHeight / 2 - menuRect.top
        });

        setAnimatingItem(customizedItem.id);
        setTimeout(() => setAnimatingItem(null), 800);
      }
    }

    addItem(customizedItem);
    toast.success(orderingStatus.isPreOrder ? 'Custom order added to cart' : 'Order added to cart', {
      description: `${customizedItem.name} has been added to your cart.`,
      duration: 3000,
      action: {
        label: 'View Cart',
        onClick: () => {
          // Trigger cart opening - we'll need to pass this down or use a global state
          const cartButton = document.querySelector('[data-cart-icon]');
          if (cartButton) {
            (cartButton as HTMLElement).click();
          }
        },
      },
    });

    // Reset state
    setShowCustomizeDialog(false);
    setSelectedItem(null);
    setSelectedAddOns({});
    setSelectedSauce('');
  };

  const updateAddOnQuantity = (addOn: any, newQuantity: number) => {
    setSelectedAddOns(prev => {
      const newSelected = { ...prev };
      if (newQuantity === 0) {
        delete newSelected[addOn.id];
      } else {
        newSelected[addOn.id] = {
          item: addOn,
          quantity: newQuantity
        };
      }
      return newSelected;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMenu();
    setIsRefreshing(false);
  };

  const noItemsFound = (() => {
    let hasItems = false;
    if (selectedCategory === 'Steak') {
      hasItems = filteredItems.some(item => item.category === 'Main Courses');
    } else if (selectedCategory === 'Fries') {
      hasItems = filteredItems.length > 0;
    } else if (selectedCategory === 'Kids') {
      hasItems = filteredItems.length > 0;
    } else if (selectedCategory === 'Drinks') {
      hasItems = filteredItems.length > 0;
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
            setSelectedCategory('Steak');
          }}
        >
          Clear Filters
        </Button>
      </div>
    );
  })();

  return (
    <div ref={menuRef} className="min-h-screen bg-background py-4 px-4 relative">
        {/* Flying Animation */}
        {animatingItem && animationStartPos && animationEndPos && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: animationStartPos.x,
              top: animationStartPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
              style={{
                animation: 'fly-to-cart 0.6s ease-out forwards',
                '--target-x': `${animationEndPos.x - animationStartPos.x}px`,
                '--target-y': `${animationEndPos.y - animationStartPos.y}px`,
              } as any}
            >
              <Plus className="w-3 h-3 text-black font-bold" />
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Menu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fresh steak and fries with premium add-ons
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-64">
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

            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {['All', 'Steak', 'Fries', 'Kids', 'Drinks'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedCategory === filter ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(filter)}
                  className="text-sm"
                >
                  {filter}
                </Button>
              ))}

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm ml-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    Refresh Menu
                  </>
                )}
              </Button>
            </div>
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
          <>
            {/* Menu Items Section */}
            {selectedCategory === 'All' && (
              <div className="space-y-12">
                {/* Main Menu Section */}
                {(() => {
                  const mainItems = filteredItems.filter(item => item.category === 'Main Courses');
                  return (
                    <div>
                      <div className={getGridClass(mainItems.length)}>
                        {mainItems.map((item) => (
                          <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={mainItems.length === 1} />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Kids Menu Section */}
                {(() => {
                  const kidsItems = filteredItems.filter(item => item.category === 'Kids');
                  return (
                    <div>
                      <div className={getGridClass(kidsItems.length)}>
                        {kidsItems.map((item) => (
                          <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={kidsItems.length === 1} />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Drinks Section */}
                {(() => {
                  const drinksItems = filteredItems.filter(item => item.category === 'Drinks');
                  return (
                    <div>
                      <div className={getGridClass(drinksItems.length)}>
                        {drinksItems.map((item) => (
                          <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={drinksItems.length === 1} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedCategory === 'Steak' && (
              <div className="mb-12">
                {(() => {
                  const steakItems = filteredItems.filter(item => item.category === 'Main Courses');
                  return (
                    <div className={getGridClass(steakItems.length)}>
                      {steakItems.map((item) => (
                        <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={steakItems.length === 1} />
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedCategory === 'Fries' && (
              <div className="mb-12">
                <div className={getGridClass(filteredItems.length)}>
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={filteredItems.length === 1} />
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'Kids' && (
              <div className="mb-12">
                <div className={getGridClass(filteredItems.length)}>
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={filteredItems.length === 1} />
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'Drinks' && (
              <div className="mb-12">
                <div className={getGridClass(filteredItems.length)}>
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} isSingleCard={filteredItems.length === 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Remove add-ons section from main menu display */}
            {showAddOns && (
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
            )}

            {noItemsFound}

            {/* Bottom Section - Operating Hours, FAQ, and Find Us */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
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

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2 text-yellow-600" />
                      FAQ
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <button
                        className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors text-foreground bg-transparent border-none"
                        onClick={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
                      >
                        <span className="font-medium">What type of steak do you serve?</span>
                        {expandedFAQ === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedFAQ === 1 && (
                        <p className="text-sm text-muted-foreground dark:text-gray-300 mt-2 leading-relaxed">
                          We serve premium quality beef steaks, including ribeye, sirloin, and tenderloin cuts.
                          All our steaks are sourced from local suppliers and cooked to your preferred doneness.
                        </p>
                      )}
                    </div>

                    <div className="border-b border-border pb-4">
                      <button
                        className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors text-foreground bg-transparent border-none"
                        onClick={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
                      >
                        <span className="font-medium">How does the ordering process work?</span>
                        {expandedFAQ === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedFAQ === 2 && (
                        <p className="text-sm text-muted-foreground dark:text-gray-300 mt-2 leading-relaxed">
                          Simply browse our menu, add items to your cart, and proceed to checkout.
                          You'll need to create an account or sign in to place an order. Orders can be placed
                          for immediate pickup or scheduled for later collection.
                        </p>
                      )}
                    </div>

                    <div className="border-b border-border pb-4">
                      <button
                        className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors text-foreground bg-transparent border-none"
                        onClick={() => setExpandedFAQ(expandedFAQ === 3 ? null : 3)}
                      >
                        <span className="font-medium">Do you accommodate dietary restrictions?</span>
                        {expandedFAQ === 3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedFAQ === 3 && (
                        <p className="text-sm text-muted-foreground dark:text-gray-300 mt-2 leading-relaxed">
                          We can accommodate most dietary needs. Please contact us directly for allergies,
                          gluten-free options, or other special requirements. Our team will work with you
                          to ensure a safe and enjoyable dining experience.
                        </p>
                      )}
                    </div>

                    <div>
                      <button
                        className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors text-foreground bg-transparent border-none"
                        onClick={() => setExpandedFAQ(expandedFAQ === 4 ? null : 4)}
                      >
                        <span className="font-medium">How long does it take to prepare my order?</span>
                        {expandedFAQ === 4 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedFAQ === 4 && (
                        <p className="text-sm text-muted-foreground dark:text-gray-300 mt-2 leading-relaxed">
                          Preparation time varies by item. Steaks typically take 10-15 minutes depending on your
                          preferred doneness. Fries and other sides are usually ready in 5-8 minutes. You'll receive
                          a notification when your order is ready for pickup.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
                      Find Us
                    </h3>

                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent flex items-center gap-1"
                      onClick={() => window.location.href = 'tel:01234567892'}
                    >
                      <Phone className="w-3 h-3" />
                      01234 567892
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Clock Tower, Kings Shade Walk</p>
                      <p className="text-muted-foreground">Epsom, England KT19 8EB</p>
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Clock Tower, Kings Shade Walk, Epsom, England KT19 8EB')}`, '_blank')}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>

                    {/* Small Map */}
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2488.0000000000005!2d-0.2674!3d51.3326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4875d9b8b8b8b8b8%3A0x4875d9b8b8b8b8b8!2sClock%20Tower%2C%20Kings%20Shade%20Walk%2C%20Epsom%20KT19%208EB%2C%20UK!5e0!3m2!1sen!2suk!4v1690000000000!5m2!1sen!2suk"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Location Map"
                      ></iframe>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Customize Order Dialog */}
        {showCustomizeDialog && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-6xl mx-4 bg-background rounded-lg shadow-lg border-2 border-border">
              <button
                onClick={() => setShowCustomizeDialog(false)}
                className="absolute -top-4 -right-4 z-[60] w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent text-xl"
              >
                ×
              </button>

              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-3">{selectedItem.name}</h2>
                  <p className="text-muted-foreground text-lg">{selectedItem.description}</p>
                  <p className="text-xl font-semibold text-yellow-600 mt-3">Base price: £{selectedItem.price.toFixed(2)}</p>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pl-6">
                  {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? (
                    /* Kids Meal Sauce Selection */
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold mb-6 text-foreground">Choose Your Sauce</h3>
                      <p className="text-muted-foreground mb-6">
                        Your Kids Meal includes a drink and one free sauce. Please choose your preferred sauce:
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {/* Check both Sauces and Add-ons categories for sauce items */}
                        {menuItems.filter(item =>
                          (item.category === 'Sauces' || item.category === 'Add-ons') &&
                          item.name.includes('Sauce')
                        ).map((sauce) => {
                          const isSelected = selectedSauce === sauce.id;
                          const isOtherSelected = selectedSauce !== '' && selectedSauce !== sauce.id;
                          return (
                            <div
                              key={sauce.id}
                              className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex-1 min-w-[300px] ${
                                isSelected
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : isOtherSelected
                                    ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
                                    : 'border-gray-300 hover:border-yellow-400 hover:bg-accent'
                              }`}
                              onClick={() => {
                                if (!isOtherSelected) {
                                  setSelectedSauce(sauce.id);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'border-yellow-500 bg-yellow-500'
                                      : 'border-gray-400'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-3 h-3 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-foreground text-lg">{sauce.name}</h5>
                                    <p className="text-muted-foreground mt-1">{sauce.description}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-yellow-600 text-lg">FREE</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {menuItems.filter(item =>
                        (item.category === 'Sauces' || item.category === 'Add-ons') &&
                        item.name.includes('Sauce')
                      ).length === 0 && (
                        <p className="text-muted-foreground">
                          No sauce options available
                        </p>
                      )}
                      {!selectedSauce && menuItems.filter(item =>
                        (item.category === 'Sauces' || item.category === 'Add-ons') &&
                        item.name.includes('Sauce')
                      ).length > 0 && (
                        <p className="text-red-500 mt-4 font-medium">
                          Please select a sauce to continue
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Main Course Add-ons */
                    <>
                      <h3 className="text-2xl font-semibold mb-6 text-foreground">Add Extras</h3>

                      {/* Meat Add-ons */}
                      <div className="mb-8">
                        <div className="flex flex-wrap gap-4">
                          {menuItems.filter(item =>
                            item.category === 'Add-ons' &&
                            (item.name.includes('Steak') || item.name.includes('Lamb') || item.name.includes('Ribs'))
                          ).map((addOn) => {
                            const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                            return (
                              <div key={addOn.id} className="flex items-center p-4 border-2 rounded-xl hover:bg-accent flex-1 min-w-[300px]">
                                <h5 className="font-semibold text-foreground text-lg text-center flex-1">{addOn.name}</h5>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="font-bold text-yellow-600 text-lg">£{addOn.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAddOnQuantity(addOn, quantity - 1)}
                                        className="w-10 h-10 p-0"
                                      >
                                        -
                                      </Button>
                                    )}
                                    {quantity > 0 && (
                                      <span className="w-10 text-center font-medium text-lg">{quantity}</span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={quantity > 0 ? 'default' : 'outline'}
                                      onClick={() => updateAddOnQuantity(addOn, quantity + 1)}
                                      className="w-10 h-10 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sauces */}
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold mb-4 text-foreground">Sauces</h4>
                        <div className="flex flex-wrap gap-4">
                          {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Sauce')).map((addOn) => {
                            const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                            return (
                              <div key={addOn.id} className="flex items-center p-4 border-2 rounded-xl hover:bg-accent flex-1 min-w-[300px]">
                                <h5 className="font-semibold text-foreground text-lg text-center flex-1">{addOn.name}</h5>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="font-bold text-yellow-600 text-lg">£{addOn.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAddOnQuantity(addOn, quantity - 1)}
                                        className="w-10 h-10 p-0"
                                      >
                                        -
                                      </Button>
                                    )}
                                    {quantity > 0 && (
                                      <span className="w-10 text-center font-medium text-lg">{quantity}</span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={quantity > 0 ? 'default' : 'outline'}
                                      onClick={() => updateAddOnQuantity(addOn, quantity + 1)}
                                      className="w-10 h-10 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Drinks */}
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold mb-4 text-foreground">Drinks</h4>
                        <div className="flex flex-wrap gap-4">
                          {menuItems.filter(item => item.category === 'Drinks').map((addOn) => {
                            const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                            return (
                              <div key={addOn.id} className="flex items-center p-4 border-2 rounded-xl hover:bg-accent flex-1 min-w-[300px]">
                                <h5 className="font-semibold text-foreground text-lg text-center flex-1">{addOn.name}</h5>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="font-bold text-yellow-600 text-lg">£{addOn.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAddOnQuantity(addOn, quantity - 1)}
                                        className="w-10 h-10 p-0"
                                      >
                                        -
                                      </Button>
                                    )}
                                    {quantity > 0 && (
                                      <span className="w-10 text-center font-medium text-lg">{quantity}</span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={quantity > 0 ? 'default' : 'outline'}
                                      onClick={() => updateAddOnQuantity(addOn, quantity + 1)}
                                      className="w-10 h-10 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-foreground">Total:</span>
                    <span className="text-xl font-bold text-yellow-600">
                      {(() => {
                        // For Kids Meal, show the fixed price as it includes drink and sauce
                        if (selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal') {
                          return `£${selectedItem.price.toFixed(2)} (includes drink & sauce)`;
                        }
                        // For other items, calculate based on add-ons
                        return `£${(selectedItem.price + Object.values(selectedAddOns).reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0)).toFixed(2)}`;
                      })()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomizeDialog(false);
                        setSelectedAddOns({});
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmCustomize}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                      disabled={selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' && !selectedSauce}
                    >
                      {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? 'Add Kids Meal' : 'Checkout'}
                    </Button>
                  </div>
                </div>
              </div>
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
  );
};

export default MenuPage;