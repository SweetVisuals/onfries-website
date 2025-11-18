import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Filter, Edit3, Save, X, Plus, Minus, ChevronDown, ChevronUp, Check, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStockInventory, updateStockInventoryItem, StockInventoryItem, resetAllStockQuantities } from '../../lib/database';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const StockManagement: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stockItems, setStockItems] = useState<StockInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof StockInventoryItem } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Food');
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState<Record<string, Partial<StockInventoryItem>>>({});
  const [signatureDialog, setSignatureDialog] = useState<{ type: 'trailer' | 'lockup'; open: boolean }>({ type: 'trailer', open: false });
  const [signatureName, setSignatureName] = useState('');
  const [showSignatureTick, setShowSignatureTick] = useState<{ trailer: boolean; lockup: boolean }>({ trailer: false, lockup: false });
  const [signedNames, setSignedNames] = useState<{ trailer: string; lockup: string }>({ trailer: '', lockup: '' });
  const [lastSignedDate, setLastSignedDate] = useState<string>('');

  useEffect(() => {
    loadStockItems();
    loadSignatureData();
  }, []);

  const loadStockItems = async () => {
    try {
      setLoading(true);
      const items = await getStockInventory();
      setStockItems(items);
    } catch (error) {
      console.error('Error loading stock items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetStockQuantities = async () => {
    try {
      await resetAllStockQuantities();
      await loadStockItems(); // Reload the items to show updated quantities
      toast({
        title: 'Stock Reset',
        description: 'All stock quantities have been reset to 0',
      });
    } catch (error) {
      console.error('Error resetting stock quantities:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset stock quantities',
        variant: 'destructive'
      });
    }
  };


  const loadSignatureData = () => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('stockSignatureDate');
    const storedNames = localStorage.getItem('stockSignedNames');

    if (storedDate === today && storedNames) {
      const names = JSON.parse(storedNames);
      setSignedNames(names);
      setShowSignatureTick({ trailer: !!names.trailer, lockup: !!names.lockup });
    } else if (storedDate !== today) {
      // Reset signatures for new day
      setSignedNames({ trailer: '', lockup: '' });
      setShowSignatureTick({ trailer: false, lockup: false });
      localStorage.removeItem('stockSignedNames');
    }
    setLastSignedDate(storedDate || '');
  };

  const handleCellEdit = async (id: string, field: keyof StockInventoryItem, value: string | number) => {
    try {
      const updatedItem = await updateStockInventoryItem(id, { [field]: value });
      setStockItems(prev =>
        prev.map(item => item.id === id ? updatedItem : item)
      );
      setEditingCell(null);
      toast({
        title: 'Updated',
        description: `${field} updated successfully`,
      });
    } catch (error) {
      console.error('Error updating stock item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock item',
        variant: 'destructive'
      });
    }
  };

  const renderEditableCell = (item: StockInventoryItem, field: keyof StockInventoryItem, type: 'text' | 'number' = 'text') => {
    const isEditing = editingCell?.id === item.id && editingCell?.field === field;
    const value = item[field];

    if (isEditing) {
      const stringValue = type === 'number' ? String(value || 0) : String(value || '');
      return (
        <Input
          type={type}
          defaultValue={stringValue}
          onBlur={(e) => handleCellEdit(item.id, field, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellEdit(item.id, field, type === 'number' ? parseInt((e.target as HTMLInputElement).value) || 0 : (e.target as HTMLInputElement).value);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          autoFocus
          className="w-full"
        />
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-muted p-2 rounded min-h-[40px] flex items-center"
        onClick={() => setEditingCell({ id: item.id, field })}
      >
        {type === 'number' ? (value ?? 0) : (value || <span className="text-muted-foreground italic">Click to edit</span>)}
      </div>
    );
  };

  const order: Record<string, string[]> = {
    'Food': ['Steaks', 'Fries', 'Green Sauce', 'Red Sauce', 'Chip Seasoning', 'Ketchup', 'Mayo', 'Short Rib', 'Lamb'],
    'Drinks': ['Coke / Pepsi', 'Tango Mango', 'Sprite', 'Coke Zero'],
    'Essentials': ['Napkins', 'Deluxe Boxes', 'Single Boxes', 'Takeaway Bags', 'Sauce pots', 'Blue Roll', 'Cutlery', 'Cilit Bang', 'Hand Sanitizer'],
    'Ingredients': ['Cooking Oil']
  };

  const sortItemsInCategory = (items: StockInventoryItem[], category: string) => {
    const categoryOrder = order[category] || [];
    return items.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.stock_item);
      const bIndex = categoryOrder.indexOf(b.stock_item);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const filteredAndGroupedItems = useMemo(() => {
    const filtered = stockItems.filter(item =>
      item.stock_item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = filtered.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, StockInventoryItem[]>);

    Object.keys(grouped).forEach(category => {
      grouped[category] = sortItemsInCategory(grouped[category], category);
    });

    return grouped;
  }, [stockItems, searchQuery]);

  const categories = Object.keys(filteredAndGroupedItems);

  const handleSignature = (type: 'trailer' | 'lockup') => {
    if (!signatureName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return;
    }

    const newSignedNames = { ...signedNames, [type]: signatureName };
    setSignedNames(newSignedNames);
    setShowSignatureTick({ ...showSignatureTick, [type]: true });

    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('stockSignatureDate', today);
    localStorage.setItem('stockSignedNames', JSON.stringify(newSignedNames));

    // Show success animation
    setTimeout(() => {
      setShowSignatureTick({ ...showSignatureTick, [type]: false });
    }, 2000);

    setSignatureDialog({ type, open: false });
    setSignatureName('');

    toast({
      title: 'Signed',
      description: `${type === 'trailer' ? 'Trailer' : 'Lockup'} stock signed by ${signatureName}`,
    });
  };

  const needsDailySignature = () => {
    const today = new Date().toDateString();
    return lastSignedDate !== today || !signedNames.trailer;
  };

  const isLowStock = (item: StockInventoryItem) => {
    const totalStock = (item.trailer_quantity || 0) + (item.lockup_quantity || 0);
    return totalStock < 5;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stock Management</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleResetStockQuantities} variant="destructive" size="sm">
                Reset All to 0
              </Button>
              <Button onClick={loadStockItems} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading stock items...</div>
          ) : (
            <div className="space-y-8">
              {/* Desktop View - Reorganized into Trailer and Lockup Sections */}
              <div className="hidden md:block space-y-6">
                {/* Trailer Section */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2 pt-3 px-3 bg-muted border-b border-border">
                    <CardTitle className="text-sm font-semibold text-card-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>Trailer Stock</span>
                        <Badge variant="outline" className="text-xs bg-yellow-400 text-yellow-900">Qty</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {showSignatureTick.trailer && (
                          <div className="flex items-center gap-1 text-green-500 animate-pulse">
                            <Check className="h-4 w-4" />
                            <span className="text-xs">Signed</span>
                          </div>
                        )}
                        {signedNames.trailer && (
                          <span className="text-xs text-muted-foreground">{signedNames.trailer}</span>
                        )}
                        <Button
                          size="sm"
                          variant={needsDailySignature() ? "default" : "outline"}
                          onClick={() => setSignatureDialog({ type: 'trailer', open: true })}
                          className="h-6 px-2 text-xs"
                        >
                          <PenTool className="h-3 w-3 mr-1" />
                          Sign
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Accordion type="multiple" className="w-full bg-card">
                      {categories.map((category) => (
                        <AccordionItem key={category} value={category} className="border-border">
                          <AccordionTrigger className="py-3 px-2 text-xs font-medium text-card-foreground hover:bg-muted bg-card">
                            <span>{category}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 pb-2 bg-card">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-40">Stock Item</TableHead>
                                  <TableHead className="w-20">Trailer Qty</TableHead>
                                  <TableHead className="w-24">Signed Trailer</TableHead>
                                  <TableHead className="w-24">Supplier</TableHead>
                                  <TableHead className="w-32">Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredAndGroupedItems[category]?.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.stock_item}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'trailer_quantity', 'number')}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'signed_trailer')}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'supplier')}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'notes')}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Lockup Section */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2 pt-3 px-3 bg-muted border-b border-border">
                    <CardTitle className="text-sm font-semibold text-card-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>Lockup Stock</span>
                        <Badge variant="outline" className="text-xs bg-yellow-400 text-yellow-900">Qty</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {showSignatureTick.lockup && (
                          <div className="flex items-center gap-1 text-green-500 animate-pulse">
                            <Check className="h-4 w-4" />
                            <span className="text-xs">Signed</span>
                          </div>
                        )}
                        {signedNames.lockup && (
                          <span className="text-xs text-muted-foreground">{signedNames.lockup}</span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSignatureDialog({ type: 'lockup', open: true })}
                          className="h-6 px-2 text-xs"
                        >
                          <PenTool className="h-3 w-3 mr-1" />
                          Sign
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Accordion type="multiple" className="w-full bg-card">
                      {categories.map((category) => (
                        <AccordionItem key={category} value={category} className="border-border">
                          <AccordionTrigger className="py-3 px-2 text-xs font-medium text-card-foreground hover:bg-muted bg-card">
                            <span>{category}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 pb-2 bg-card">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-40">Stock Item</TableHead>
                                  <TableHead className="w-20">Lockup Qty</TableHead>
                                  <TableHead className="w-24">Signed Lockup</TableHead>
                                  <TableHead className="w-24">Supplier</TableHead>
                                  <TableHead className="w-32">Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredAndGroupedItems[category]?.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.stock_item}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'lockup_quantity', 'number')}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'signed_lockup')}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'supplier')}</TableCell>
                                    <TableCell>{renderEditableCell(item, 'notes')}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
              {/* Mobile Card View - Reorganized into Trailer and Lockup Sections */}
              <div className="block md:hidden space-y-4">
                    {/* Trailer Section */}
                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader className="pb-2 pt-3 px-3 bg-muted border-b border-border">
                        <CardTitle className="text-sm font-semibold text-card-foreground flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>Trailer Stock</span>
                            <Badge variant="outline" className="text-xs bg-yellow-400 text-yellow-900">Qty</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {showSignatureTick.trailer && (
                              <div className="flex items-center gap-1 text-green-500 animate-pulse">
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Signed</span>
                              </div>
                            )}
                            {signedNames.trailer && (
                              <span className="text-xs text-muted-foreground">{signedNames.trailer}</span>
                            )}
                            <Button
                              size="sm"
                              variant={needsDailySignature() ? "default" : "outline"}
                              onClick={() => setSignatureDialog({ type: 'trailer', open: true })}
                              className="h-6 px-2 text-xs"
                            >
                              <PenTool className="h-3 w-3 mr-1" />
                              Sign
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <Accordion type="multiple" className="w-full bg-card">
                          {categories.map((category) => (
                            <AccordionItem key={category} value={category} className="border-border">
                              <AccordionTrigger className="py-3 px-2 text-xs font-medium text-card-foreground hover:bg-muted bg-card">
                                <span>{category}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-2 pb-2 bg-card">
                                <div className="grid grid-cols-1 gap-1">
                                  {filteredAndGroupedItems[category]?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-1 px-2 bg-muted rounded text-xs">
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="font-medium truncate text-card-foreground">{item.stock_item}</span>
                                        {isLowStock(item) && (
                                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Trailer:</span>
                                        {renderEditableCell(item, 'trailer_quantity', 'number')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>

                    {/* Lockup Section */}
                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader className="pb-2 pt-3 px-3 bg-muted border-b border-border">
                        <CardTitle className="text-sm font-semibold text-card-foreground flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>Lockup Stock</span>
                            <Badge variant="outline" className="text-xs bg-yellow-400 text-yellow-900">Qty</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {showSignatureTick.lockup && (
                              <div className="flex items-center gap-1 text-green-500 animate-pulse">
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Signed</span>
                              </div>
                            )}
                            {signedNames.lockup && (
                              <span className="text-xs text-muted-foreground">{signedNames.lockup}</span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSignatureDialog({ type: 'lockup', open: true })}
                              className="h-6 px-2 text-xs"
                            >
                              <PenTool className="h-3 w-3 mr-1" />
                              Sign
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <Accordion type="multiple" className="w-full bg-card">
                          {categories.map((category) => (
                            <AccordionItem key={category} value={category} className="border-border">
                              <AccordionTrigger className="py-3 px-2 text-xs font-medium text-card-foreground hover:bg-muted bg-card">
                                <span>{category}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-2 pb-2 bg-card">
                                <div className="grid grid-cols-1 gap-1">
                                  {filteredAndGroupedItems[category]?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-1 px-2 bg-muted rounded text-xs">
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="font-medium truncate text-card-foreground">{item.stock_item}</span>
                                        {isLowStock(item) && (
                                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Lockup:</span>
                                        {renderEditableCell(item, 'lockup_quantity', 'number')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                </div>
          )}
        </CardContent>
      </Card>

      {/* Signature Dialog */}
      <Dialog open={signatureDialog.open} onOpenChange={(open) => setSignatureDialog({ ...signatureDialog, open })}>
        <DialogContent className="sm:max-w-md [&>button]:bg-transparent [&>button]:hover:bg-transparent [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
          <DialogHeader>
            <DialogTitle>Sign {signatureDialog.type === 'trailer' ? 'Trailer' : 'Lockup'} Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="signature-name" className="text-sm font-medium">
                Enter your name:
              </label>
              <Input
                id="signature-name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSignature(signatureDialog.type);
                  }
                }}
              />
            </div>
            {signatureDialog.type === 'trailer' && needsDailySignature() && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Daily signature required for trailer stock
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignatureDialog({ ...signatureDialog, open: false })}>
              Cancel
            </Button>
            <Button onClick={() => handleSignature(signatureDialog.type)}>
              Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;