import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 680000 },
  { month: 'Apr', revenue: 750000 },
  { month: 'May', revenue: 820000 },
  { month: 'Jun', revenue: 860000 },
];

export const RevenueTrendChart = () => {
  return (
    <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Revenue Trend</CardTitle>
        <CardDescription className="text-[13px]">Monthly revenue growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888888' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888888' }} 
                dx={-10}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f5f5f5' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
