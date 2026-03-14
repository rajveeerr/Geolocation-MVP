import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlayCircle, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const concurrentData = [
  { time: '10:00', visitors: 45000 },
  { time: '10:05', visitors: 58000 },
  { time: '10:10', visitors: 70000 },
  { time: '10:15', visitors: 92000 },
  { time: '10:20', visitors: 120000 },
  { time: '10:25', visitors: 145000 },
  { time: '10:30', visitors: 167738 },
];

export const AdminRealTimeAnalyticsPage = () => {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 mb-1 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-brand-primary-600" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            Real-Time Analytics Dashboard
          </h1>
          <p className="text-sm text-neutral-500">Live audience insights and engagement metrics powered by deep CRM</p>
        </div>
        <div className="flex gap-3">
          {isLive ? (
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 flex items-center gap-2" onClick={() => setIsLive(false)}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              LIVE
            </Button>
          ) : (
            <Button variant="outline" className="rounded-full px-6 flex items-center gap-2" onClick={() => setIsLive(true)}>
              <PlayCircle className="w-4 h-4" />
              Start
            </Button>
          )}
          <Button variant="outline" className="rounded-full px-6" onClick={() => setIsLive(false)}>
            Pause
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-brand-primary-500 bg-gradient-to-r from-brand-primary-500 to-purple-600 text-white shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="text-sm font-medium opacity-90 mb-2">Concurrent Visitors</div>
            <div className="text-5xl font-bold font-heading mb-2">167,738</div>
            <div className="text-sm font-medium flex items-center gap-1 opacity-90">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +12.5% vs last hour
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-neutral-500 mb-2">New Visitors</div>
                <div className="text-4xl font-bold font-heading text-neutral-900 mb-2">16,695</div>
                <div className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                  ↑ +8.2% today
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-neutral-500 mb-2">Avg Engaged Time</div>
                <div className="text-4xl font-bold font-heading text-neutral-900 mb-2">0:53</div>
                <div className="text-sm font-medium text-neutral-400">
                  Per visitor
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-yellow-500" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Concurrent Visitors - Last 30 Minutes
            </h3>
            <p className="text-sm text-neutral-500">Live traffic flow across the platform</p>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={concurrentData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVisitors)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden bg-white">
        <Tabs defaultValue="traffic">
          <div className="border-b border-neutral-200/60 px-2 overflow-x-auto">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-4">
              <TabsTrigger value="traffic" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 rounded-none px-4 font-medium text-neutral-500 data-[state=active]:text-neutral-900">Traffic Sources</TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 rounded-none px-4 font-medium text-neutral-500 data-[state=active]:text-neutral-900">Devices & Browsers</TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 rounded-none px-4 font-medium text-neutral-500 data-[state=active]:text-neutral-900">Search Performance</TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 rounded-none px-4 font-medium text-neutral-500 data-[state=active]:text-neutral-900">Social Rankings</TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 rounded-none px-4 font-medium text-neutral-500 data-[state=active]:text-neutral-900">Top Content</TabsTrigger>
              <TabsTrigger value="audience" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 rounded-none px-4 font-medium text-neutral-500 data-[state=active]:text-neutral-900">Audience Insights</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="traffic" className="p-6 m-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">Traffic Sources</h3>
                <p className="text-sm text-neutral-500 mb-6">Where visitors are coming from</p>
                
                <div className="space-y-6">
                  {[
                    { name: 'Search', pct: 39, color: 'bg-cyan-400', count: '65,340', trend: 'up' },
                    { name: 'Internal', pct: 23, color: 'bg-yellow-400', count: '38,540', trend: 'up' },
                    { name: 'Social', pct: 21, color: 'bg-pink-400', count: '35,180', trend: 'down' },
                    { name: 'Links', pct: 11, color: 'bg-blue-500', count: '18,420', trend: 'up' },
                    { name: 'Direct', pct: 5, color: 'bg-orange-500', count: '8,370', trend: 'up' },
                  ].map((source, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${source.color}`}></span>
                          <span className="font-semibold text-neutral-800">{source.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">{source.pct}%</span>
                          {source.trend === 'up' ? (
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-emerald-500" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-red-500" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 mb-1">
                        <div className={`${source.color} h-2 rounded-full`} style={{ width: `${source.pct}%` }}></div>
                      </div>
                      <div className="text-sm text-neutral-500">{source.count} visitors</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">Referrer Traffic</h3>
                <p className="text-sm text-neutral-500 mb-6">Detailed referral sources</p>
                
                <div className="space-y-4">
                  {[
                    { name: 'Email, apps, IM', color: 'bg-blue-600', count: '31,729' },
                    { name: 'Push Alerts', color: 'bg-pink-400', count: '26,767' },
                    { name: 'Google Search', color: 'bg-cyan-500', count: '19,655' },
                    { name: 'Deep links, push alerts', color: 'bg-cyan-500', count: '2,772' },
                    { name: 'Google Discover', color: 'bg-yellow-500', count: '2,749' },
                    { name: 'Google News', color: 'bg-yellow-500', count: '1,827' },
                    { name: 'Gmail', color: 'bg-red-500', count: '1,814' },
                    { name: 'Bing', color: 'bg-blue-500', count: '976' },
                  ].map((ref, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${ref.color}`}></span>
                        <span className="text-[15px] text-neutral-700 font-medium">{ref.name}</span>
                      </div>
                      <span className="text-[15px] font-semibold text-neutral-800">{ref.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};