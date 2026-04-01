import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// CRITICAL: We use the Dashboard Stats hook, not the student's personal purchase hook
import { useGetDashboardStatsQuery } from "@/features/api/purchaseApi"; 
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // This hook hits the /dashboard route we added to the backend
  const { data, isLoading, isError } = useGetDashboardStatsQuery();
  
  if (isLoading) return <h1 className="p-10 text-center font-semibold">Calculating Stats...</h1>;
  if (isError) return <h1 className="p-10 text-center text-red-500">Error loading dashboard data.</h1>;
  
  // Destructuring the response from getDashboardData controller
  const { totalSales, totalRevenue, courseData } = data || {
    totalSales: 0,
    totalRevenue: 0,
    courseData: []
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {/* Total Sales Card */}
        <Card className="shadow-md border-t-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">{totalSales}</p>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card className="shadow-md border-t-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-green-600">₹{totalRevenue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Graph */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Revenue Analysis by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={courseData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-40} 
                  textAnchor="end" 
                  interval={0} 
                  height={80}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, "Total Revenue"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;