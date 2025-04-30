
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Utensils, Package } from 'lucide-react'; // Example icons

const AdminDashboardPage: FC = () => {
  // In a real app, fetch data here (e.g., total users, orders, menus)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-primary">
        <LayoutDashboard /> Admin Dashboard
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
            <p className="text-xs text-muted-foreground">+10 since last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground">Currently being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div> {/* Replace with actual data */}
            <p className="text-xs text-muted-foreground">Across all food courts</p>
          </CardContent>
        </Card>

        {/* Add more cards or sections as needed */}
        {/* E.g., Manage Menus, Manage Food Courts, View Recent Orders, User Management */}

      </div>

      <div className="mt-8">
        {/* Placeholder for more complex components like tables or charts */}
        <Card>
            <CardHeader>
                <CardTitle>Placeholder Section</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Future admin functionalities (e.g., order management, menu editing) would go here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
