
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useBusiness } from "@/hooks/use-business";
import { useInventory } from "@/hooks/use-inventory";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ShoppingCart, Trash2, Plus, Minus, Package, DollarSign, Building } from "lucide-react";
import type { Item, Recipe } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EditableQuantity } from "@/components/inventory/editable-quantity";
import { SaleCompletionDialog } from "@/components/sales/sale-completion-dialog";

type CartItem = Item & { saleQuantity: number };

export default function SalesPage() {
  const { activeBranch } = useBusiness();
  const { items, categories, recipes, processSale, isLoading } = useInventory(activeBranch?.id);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  
  const salesCategoryIds = useMemo(() => {
    return categories.filter(c => c.showInSales).map(c => c.id);
  }, [categories]);

  const getProductStock = (productId: string, currentCart: CartItem[], allRecipes: Recipe[], allItems: Item[]): number => {
    const recipe = allRecipes.find(r => r.productId === productId);
    
    // Create a temporary, mutable copy of component quantities
    const availableComponents: Record<string, number> = {};
    allItems.filter(i => i.itemType === 'Component').forEach(item => {
        availableComponents[item.id] = item.quantity;
    });

    // Subtract components already reserved by items in the cart
    for (const cartItem of currentCart) {
        const cartItemRecipe = allRecipes.find(r => r.productId === cartItem.id);
        if (cartItemRecipe) {
            for (const component of cartItemRecipe.components) {
                if (availableComponents[component.itemId] !== undefined) {
                    availableComponents[component.itemId] -= component.quantity * cartItem.saleQuantity;
                }
            }
        }
    }
    
    // Now, calculate how many of this specific product can be made with the remaining components
    if (!recipe) {
      const item = allItems.find(i => i.id === productId);
      return item?.itemType === 'Component' ? availableComponents[productId] || 0 : 0;
    }
    
    if (!recipe.components || recipe.components.length === 0) {
      return 0;
    }

    const possibleQuantities = recipe.components.map(component => {
      const availableQuantity = availableComponents[component.itemId] || 0;
      if (component.quantity === 0) return Infinity; // Avoid division by zero
      return Math.floor(availableQuantity / component.quantity);
    });

    return Math.min(...possibleQuantities);
  };
  
  const sellableItems = useMemo(() => {
    if (!items || !recipes) return [];
    
    return items
      .filter(item => item.itemType === 'Product' && salesCategoryIds.includes(item.categoryId))
      .map(item => ({
        ...item,
        // The effective quantity is now dynamically calculated based on the cart
        quantity: getProductStock(item.id, cart, recipes, items),
      }));
  }, [items, recipes, cart, salesCategoryIds]);

  const filteredItems = useMemo(() => {
    return (sellableItems || [])
      .filter((item) => {
        if (searchTerm) {
          return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sellableItems, searchTerm]);

  const addToCart = (item: Item) => {
    setCart((currentCart = []) => {
      const existingItem = currentCart.find((cartItem) => cartItem.id === item.id);
      const stock = getProductStock(item.id, currentCart, recipes, items);

      if (stock <= 0) {
        toast({ variant: 'destructive', title: 'Out of stock' });
        return currentCart;
      }
      
      if (existingItem) {
        // If item is already in cart, increase its quantity by 1, if stock allows
        const newQuantity = Math.min(existingItem.saleQuantity + 1, stock + existingItem.saleQuantity);
        return currentCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, saleQuantity: newQuantity } : cartItem
        );
      } else {
        // Add new item to cart with quantity 1
        return [...currentCart, { ...item, saleQuantity: 1 }];
      }
    });
  };
  
  const updateCartQuantity = (itemId: string, change: number) => {
    setCart((currentCart = []) => {
      const existingItem = currentCart.find((cartItem) => cartItem.id === itemId);
      if (!existingItem) return currentCart;

      const newQuantity = existingItem.saleQuantity + change;
      
      return setCartQuantity(itemId, newQuantity, currentCart);
    });
  };

  const setCartQuantity = (itemId: string, newQuantity: number, currentCart: CartItem[]) => {
      const existingItem = currentCart.find((cartItem) => cartItem.id === itemId);
      if (!existingItem) return currentCart;
      
      if (newQuantity <= 0) {
          // Remove item if quantity becomes 0 or less
          return currentCart.filter((cartItem) => cartItem.id !== itemId);
      }
      
      // Calculate stock considering the item is already in the cart
      const cartWithoutItem = currentCart.filter(i => i.id !== itemId);
      const stock = getProductStock(itemId, cartWithoutItem, recipes, items);

      // Clamp quantity to available stock
      const clampedQuantity = Math.min(newQuantity, stock);
      
      return currentCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, saleQuantity: clampedQuantity } : cartItem
      );
  };

  const removeFromCart = (itemId: string) => {
    setCart((currentCart = []) => currentCart.filter((item) => item.id !== itemId));
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const cartSubtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) => total + item.value * item.saleQuantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    const total = cartSubtotal - discount;
    return Math.max(0, total);
  }, [cartSubtotal, discount]);

  const handleOpenSaleDialog = () => {
    if (!cart || cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Add items to the cart to complete a sale.",
      });
      return;
    }
    setIsSaleDialogOpen(true);
  };

  const handleConfirmSale = (paymentMethod: string) => {
    processSale({
      items: cart,
      discount: discount,
      total: cartTotal,
      paymentMethod: paymentMethod,
    });
    
    toast({
      title: "Sale Completed!",
      description: `Sold ${cart.reduce((sum, i) => sum + i.saleQuantity, 0)} items for a total of ${formatCurrency(cartTotal)}.`,
    });

    setCart([]);
    setDiscount(0);
    setIsSaleDialogOpen(false);
  };


  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {!activeBranch ? (
           <Card>
            <CardHeader className="flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Branch Selected</CardTitle>
              <CardDescription>
                Please select a branch from the dashboard to start a sale.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header id="sales-header">
              <h1 className="text-3xl font-bold tracking-tight">Sales for {activeBranch.name}</h1>
              <p className="text-muted-foreground">Select products from inventory to complete a sale.</p>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column: Item Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Products</CardTitle>
                    <div className="relative flex-1 pt-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                      <p>Loading items...</p>
                    ) : (
                      <div className="w-full overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Can Make</TableHead>
                              <TableHead className="text-right hidden sm:table-cell">Price</TableHead>
                              <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.length > 0 ? filteredItems.map((item) => (
                              <TableRow key={item.id} className={item.quantity === 0 ? "opacity-50" : ""}>
                                <TableCell className="font-medium">
                                  {item.name}
                                  <div className="sm:hidden text-muted-foreground">{formatCurrency(item.value)}</div>
                                </TableCell>
                                <TableCell className="text-right">{item.quantity} {item.unitType}</TableCell>
                                <TableCell className="text-right hidden sm:table-cell">{formatCurrency(item.value)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                    disabled={item.quantity === 0}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )) : (
                               <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                  No products found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Cart */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4 lg:top-20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      Current Sale
                    </CardTitle>
                    <CardDescription>
                      Items added to the current sale. Component quantities will be deducted upon completion.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!cart || cart.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        Your cart is empty.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.value)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <EditableQuantity
                                    initialValue={item.saleQuantity}
                                    onSave={(newVal) => setCartQuantity(item.id, newVal, cart)}
                                    max={getProductStock(item.id, cart.filter(i => i.id !== item.id), recipes, items)}
                                    className="w-12"
                                />
                              <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  disabled={item.saleQuantity >= getProductStock(item.id, cart.filter(i => i.id !== item.id), recipes, items)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {cart && cart.length > 0 && (
                    <CardFooter className="flex-col items-stretch space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(cartSubtotal)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-muted-foreground">Discount</span>
                               <Input 
                                   type="number" 
                                   value={discount} 
                                   onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                                   className="w-24 h-8 text-right"
                                   placeholder="0.00"
                                />
                           </div>
                           <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(cartTotal)}</span>
                           </div>
                        </div>
                      <Button size="lg" className="w-full" onClick={handleOpenSaleDialog}>
                        Complete Sale
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
            <SaleCompletionDialog
                isOpen={isSaleDialogOpen}
                onOpenChange={setIsSaleDialogOpen}
                onConfirm={handleConfirmSale}
                subtotal={cartSubtotal}
                discount={discount}
                total={cartTotal}
            />
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
