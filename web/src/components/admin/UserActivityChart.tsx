import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', users: 4000 },
  { time: '04:00', users: 3000 },
  { time: '08:00', users: 8000 },
  { time: '12:00', users: 15000 },
  { time: '16:00', users: 12000 },
  { time: '20:00', users: 19000 },
  { time: '23:59', users: 9000 },
];

export const UserActivityChart = () => {
  return (
    <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">User Activity (24h)</CardTitle>
        <CardDescription className="text-[13px]">Active users throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis 
                dataKey="time" 
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
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
