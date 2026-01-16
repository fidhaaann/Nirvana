import { useOrders, useUpdateOrder } from "@/hooks/use-dashboard";
import { AdminLayout } from "@/components/layout-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateMutation = useUpdateOrder();

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, status: status as any });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Orders</h2>
          <p className="text-muted-foreground">Track and manage customer orders.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {order.items.map((item: any, i: number) => (
                          <span key={i}>Product #{item.productId} x{item.quantity}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={order.status} 
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                          </SelectItem>
                          <SelectItem value="completed">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                          </SelectItem>
                          <SelectItem value="cancelled">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
