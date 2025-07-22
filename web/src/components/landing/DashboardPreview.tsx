import { Monitor, FileText, Quote, BarChart3, Users, Circle, type LucideIcon } from 'lucide-react';

const ChartPlaceholder = () => (
  <div className="mt-6 h-48 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 400 200" className="absolute inset-0">
      <path d="M0 160 Q 50 140, 100 150 T 200 130 T 300 120 T 400 100" stroke="#60A5FA" fill="none" strokeWidth="2" />
      <path d="M0 170 Q 50 150, 100 160 T 200 140 T 300 130 T 400 110" stroke="#34D399" fill="none" strokeWidth="2" />
      <path d="M0 150 Q 50 130, 100 140 T 200 120 T 300 110 T 400 90" stroke="#F59E0B" fill="none" strokeWidth="2" />
      <path d="M0 140 Q 50 120, 100 130 T 200 110 T 300 100 T 400 80" stroke="#EF4444" fill="none" strokeWidth="2" />
    </svg>
  </div>
);

const SidebarItem = ({ icon: Icon, label, isActive = false }: { 
  icon: LucideIcon; 
  label: string; 
  isActive?: boolean; 
}) => (
  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
    isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'
  }`}>
    <Icon className="w-4 h-4" />
    <span className="hidden lg:inline">{label}</span>
  </div>
);

const MetricCard = ({ title, value, subtitle, color }: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) => (
  <div className="text-center">
    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{title}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-400">{subtitle}</div>
  </div>
);

const ModelRow = ({ name, value, color }: {
  name: string;
  value: string;
  color: string;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Circle className={`w-2 h-2 fill-current ${color}`} />
      <span className="text-sm text-gray-700">{name}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export const DashboardPreview = () => {
  return (
    <div className="relative mx-4 sm:mx-auto -mt-8 sm:-mt-16 mb-12 sm:mb-20 w-full max-w-6xl bg-white shadow-2xl overflow-hidden rounded-t-xl">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-6 lg:mb-8">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">p</span>
            </div>
            <span className="font-semibold text-gray-900">promptwatch</span>
          </div>
          
          <div className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-x-visible">
            <SidebarItem icon={Monitor} label="Monitors" isActive />
            <SidebarItem icon={FileText} label="Prompts" />
            <SidebarItem icon={Quote} label="Citations" />
            <SidebarItem icon={BarChart3} label="Analytics" />
            <SidebarItem icon={Users} label="Team members" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Miro AI Traffic Analytics</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Circle className="w-2 h-2 fill-green-500" />
                  <span>89 active visitors</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">Monitor traffic from LLM models</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <MetricCard title="Views" value="1.2M" subtitle="" color="text-gray-900" />
              <MetricCard title="Bounce" value="32%" subtitle="" color="text-gray-900" />
              <MetricCard title="Conv" value="4.8%" subtitle="" color="text-gray-900" />
              <MetricCard title="Duration" value="3m 42s" subtitle="" color="text-gray-900" />
            </div>
          </div>

          {/* AI Models Section */}
          <div className="mb-6">
            <div className="space-y-1">
              <ModelRow name="Claude" value="1,289" color="text-orange-500" />
              <ModelRow name="Gemini" value="95" color="text-blue-500" />
              <ModelRow name="ChatGPT" value="972" color="text-green-500" />
              <ModelRow name="Perplexity" value="1,187" color="text-purple-500" />
            </div>
          </div>

          <ChartPlaceholder />

          {/* Bottom Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Queries</div>
              <div className="text-2xl font-bold text-blue-600">24,731</div>
              <div className="text-xs text-gray-400">+18% from last month</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Website Visitors</div>
              <div className="text-2xl font-bold text-gray-900">298,842</div>
              <div className="text-xs text-gray-400">+12% from last month</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg. Time on Site</div>
              <div className="text-2xl font-bold text-green-600">56.8s</div>
              <div className="text-xs text-gray-400">+8.9% from last month</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Top LLM</div>
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Circle className="w-3 h-3 fill-current text-gray-400" />
                ChatGPT
              </div>
              <div className="text-xs text-gray-400">58% market share</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};