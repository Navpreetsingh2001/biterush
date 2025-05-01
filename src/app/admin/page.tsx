
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Utensils, Package, UserCog, Store, ShieldAlert } from 'lucide-react'; // Added UserCog, Store, ShieldAlert
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AdminDashboardPage: FC = () => {
  // In a real app, fetch data here (e.g., total users, vendors, orders)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-primary">
        <UserCog /> Super Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground">+5 registered today</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground">+2 pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">560</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground">View across all vendors</p>
          </CardContent>
        </Card>

        {/* Add cards for managing users and vendors */}
         <Card className="md:col-span-1 lg:col-span-1">
           <CardHeader>
             <CardTitle className="text-base font-medium flex items-center gap-2"> <Users className="h-4 w-4" /> User Management</CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground mb-4">View, edit, or manage user accounts.</p>
              {/* Link to a future user management page */}
              <Link href="/admin/users" passHref>
                 <Button variant="outline" size="sm">Manage Users</Button>
              </Link>
           </CardContent>
         </Card>

         <Card className="md:col-span-1 lg:col-span-1">
           <CardHeader>
             <CardTitle className="text-base font-medium flex items-center gap-2"> <Store className="h-4 w-4" /> Vendor Management</CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Approve, view, or manage vendor accounts and stores.</p>
              {/* Link to a future vendor management page */}
              <Link href="/admin/vendors" passHref>
                 <Button variant="outline" size="sm">Manage Vendors</Button>
              </Link>
           </CardContent>
         </Card>

          <Card className="md:col-span-1 lg:col-span-1">
           <CardHeader>
             <CardTitle className="text-base font-medium flex items-center gap-2"> <ShieldAlert className="h-4 w-4" /> System Settings</CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Configure application settings (placeholder).</p>
              {/* Link to a future settings page */}
              <Link href="/admin/settings" passHref>
                 <Button variant="outline" size="sm" disabled>Configure</Button>
              </Link>
           </CardContent>
         </Card>


      </div>

      <div className="mt-8">
        {/* Placeholder for more complex components like tables or charts */}
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Recent activities like new registrations, vendor approvals, high-value orders etc. would be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
