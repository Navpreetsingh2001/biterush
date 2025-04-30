
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck, ClipboardList, Settings } from 'lucide-react'; // Example icons

const VendorDashboardPage: FC = () => {
  // In a real app, fetch vendor-specific data (e.g., orders for their food court, menu items)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-primary">
        <PackageCheck /> Vendor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incoming Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground">Awaiting preparation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
             <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div> {/* Replace with actual data */}
             <p className="text-xs text-muted-foreground">Manage your offerings</p>
          </CardContent>
        </Card>

        {/* Add more relevant cards for vendors */}

      </div>

      <div className="mt-8">
        {/* Placeholder for vendor-specific functionalities */}
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Food Court</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Vendor-specific features like managing menu items, viewing order history, and updating food court status would go here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
