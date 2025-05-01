
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck, ClipboardList, Settings, Store, MessageSquare, ListPlus } from 'lucide-react'; // Added Store, MessageSquare, ListPlus
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const VendorDashboardPage: FC = () => {
  // In a real app, fetch vendor-specific data (e.g., orders for their food court, menu items)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-primary">
        <Store /> Vendor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Managing Store/Food Court Info */}
        <Card>
           <CardHeader>
             <CardTitle className="text-base font-medium flex items-center gap-2"> <Settings className="h-4 w-4" /> Store Management</CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Update store details, opening hours, block location, etc.</p>
              {/* Link to a future store management page */}
              <Link href="/vendor/store" passHref>
                 <Button variant="outline" size="sm">Manage Store Info</Button>
              </Link>
           </CardContent>
         </Card>

          {/* Card for Managing Menu */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base font-medium flex items-center gap-2"> <ListPlus className="h-4 w-4" /> Menu Management</CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Add, edit, or remove menu items for your store.</p>
              {/* Link to a future menu management page */}
              <Link href="/vendor/menu" passHref>
                 <Button variant="outline" size="sm">Manage Menu</Button>
              </Link>
           </CardContent>
         </Card>

        {/* Card for Viewing Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incoming Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground mb-4">Awaiting preparation.</p>
             {/* Link to a future order viewing page */}
             <Link href="/vendor/orders" passHref>
                 <Button variant="outline" size="sm">View Orders</Button>
              </Link>
          </CardContent>
        </Card>

        {/* Card for Viewing Feedback */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base font-medium flex items-center gap-2"> <MessageSquare className="h-4 w-4" /> User Feedback</CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground mb-4">View feedback submitted by users for your store.</p>
              {/* Link to a future feedback viewing page */}
              <Link href="/vendor/feedback" passHref>
                 <Button variant="outline" size="sm">View Feedback</Button>
              </Link>
           </CardContent>
         </Card>

      </div>

      <div className="mt-8">
        {/* Placeholder for additional vendor-specific functionalities */}
        <Card>
            <CardHeader>
                <CardTitle>Performance Overview (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Charts and stats related to sales, popular items, peak hours etc. could be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
