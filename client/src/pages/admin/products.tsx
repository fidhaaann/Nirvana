import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-dashboard";
import { AdminLayout } from "@/components/layout-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast({ title: "Product deleted" }),
        onError: () => toast({ title: "Failed to delete product", variant: "destructive" })
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900">Products</h2>
            <p className="text-muted-foreground">Manage your inventory and offerings.</p>
          </div>
          <ProductDialog mode="create" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading inventory...</TableCell>
                </TableRow>
              ) : filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products found.</TableCell>
                </TableRow>
              ) : (
                filteredProducts?.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span className={`inline-flex w-2 h-2 rounded-full mr-2 ${product.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {product.active ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <ProductDialog mode="edit" product={product} />
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}

function ProductDialog({ mode, product }: { mode: "create" | "edit", product?: Product }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || "",
      active: product.active
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "",
      active: true
    }
  });

  const onSubmit = (data: any) => {
    // Force numbers
    const payload = { ...data, price: Number(data.price), stock: Number(data.stock) };
    
    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast({ title: "Product created" });
        }
      });
    } else if (product) {
      updateMutation.mutate({ id: product.id, ...payload }, {
        onSuccess: () => {
          setOpen(false);
          toast({ title: "Product updated" });
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="w-4 h-4 text-gray-500" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Product" : "Edit Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Product Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Services, Goods" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Short description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : "Save Product"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
