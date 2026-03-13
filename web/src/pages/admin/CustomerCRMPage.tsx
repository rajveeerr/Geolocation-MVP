import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CustomerCRMPage = () => {
  const customers = [
    {
      initials: 'SJ', bg: 'bg-purple-500', name: 'Sarah Johnson', status: 'Married', email: 'sarah.j@email.com', phone: '(555) 987-6543',
      occupation: 'Marketing Director', vip: 'Platinum', spend: '$5200', visits: 120, referrals: 15, lastVisit: '3/18/2024'
    },
    {
      initials: 'LA', bg: 'bg-blue-400', name: 'Lisa Anderson', status: 'Married', email: 'lisa.anderson@email.com', phone: '(555) 321-0987',
      occupation: 'Doctor', vip: 'Gold', spend: '$3100', visits: 67, referrals: 12, lastVisit: '3/17/2024'
    },
    {
      initials: 'JS', bg: 'bg-indigo-500', name: 'John Smith', status: 'Married', email: 'john.smith@email.com', phone: '(555) 123-4567',
      occupation: 'Software Engineer', vip: 'Gold', spend: '$2450', visits: 45, referrals: 8, lastVisit: '3/15/2024'
    },
    {
      initials: 'MD', bg: 'bg-purple-400', name: 'Mike Davis', status: 'Single', email: 'mike.davis@email.com', phone: '(555) 456-7890',
      occupation: 'Real Estate Agent', vip: 'Silver', spend: '$1850', visits: 32, referrals: 5, lastVisit: '3/10/2024'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex bg-white rounded-full p-1 border border-neutral-200/60 shadow-sm w-fit mb-8">
        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto text-sm font-medium bg-neutral-100 text-neutral-900 border border-neutral-200/60 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-2" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Customer Database
        </Button>
        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto text-sm font-medium text-neutral-500 hover:text-neutral-900">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-2" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Wall of Support
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-2">Total Customers</p>
                <h3 className="text-2xl font-bold font-heading">4</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-500" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/60 shadow-sm border-brand-primary-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-2">VIP Members</p>
                <h3 className="text-2xl font-bold font-heading">4</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-yellow-500" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-2">Total Revenue</p>
                <h3 className="text-2xl font-bold font-heading">$12600</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-500" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-2">Avg Spend</p>
                <h3 className="text-2xl font-bold font-heading">$3150</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-purple-500" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-neutral-200/60 flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input className="pl-9 bg-neutral-50 border-neutral-200/60 rounded-xl" placeholder="Search by name, email, or phone..." />
          </div>
          <div className="flex gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-neutral-50 border-neutral-200/60 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="total_spend">
              <SelectTrigger className="w-[140px] bg-neutral-50 border-neutral-200/60 rounded-xl">
                <SelectValue placeholder="Total Spend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_spend">Total Spend</SelectItem>
                <SelectItem value="visits">Visits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-base font-bold font-heading text-neutral-900 mb-4">Customer Database</h3>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-neutral-200/60 text-neutral-500">
                  <th className="pb-3 font-medium px-4">Customer</th>
                  <th className="pb-3 font-medium px-4">Contact</th>
                  <th className="pb-3 font-medium px-4">Occupation</th>
                  <th className="pb-3 font-medium px-4">VIP Status</th>
                  <th className="pb-3 font-medium px-4">Total Spend</th>
                  <th className="pb-3 font-medium px-4">Visits</th>
                  <th className="pb-3 font-medium px-4">Referrals</th>
                  <th className="pb-3 font-medium px-4">Last Visit</th>
                  <th className="pb-3 font-medium px-4"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${c.bg}`}>
                          {c.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{c.name}</div>
                          <div className="text-neutral-500 text-xs">{c.status}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-neutral-600">
                      <div className="flex items-center gap-1.5 mb-1"><svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{c.email}</div>
                      <div className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{c.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {c.occupation}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold
                        ${c.vip === 'Platinum' ? 'bg-purple-100 text-purple-600' :
                          c.vip === 'Gold' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-neutral-100 text-neutral-600'}
                      `}>
                        {c.vip}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-emerald-600">{c.spend}</td>
                    <td className="py-4 px-4 text-neutral-800 font-medium">{c.visits}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        {c.referrals}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-neutral-600">{c.lastVisit}</td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" className="text-sm font-medium text-neutral-700 p-0 h-auto hover:bg-transparent">
                        View <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
