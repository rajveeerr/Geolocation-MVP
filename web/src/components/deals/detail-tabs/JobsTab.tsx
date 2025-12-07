// web/src/components/deals/detail-tabs/JobsTab.tsx
import { Briefcase, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { Button } from '@/components/common/Button';

interface JobsTabProps {
  deal: DetailedDeal;
}

const BENEFITS = [
  { icon: DollarSign, label: 'Competitive Pay', description: 'Industry-leading wages and tips.' },
  { icon: Users, label: 'Great Culture', description: 'Supportive team environment.' },
  { icon: TrendingUp, label: 'Career Growth', description: 'Advancement opportunities.' },
  { icon: Clock, label: 'Work-Life Balance', description: 'Flexible scheduling options.' },
];

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Line Cook',
    department: 'Kitchen',
    type: 'Full-time',
    time: 'Evening shifts',
    salary: '$45,000 - $55,000/year',
    location: 'San Francisco, CA',
    description: "Join our talented kitchen team and help create exceptional dining experiences. We're looking for a passionate line cook with a strong work ethic and attention to detail.",
    requirements: [
      '2+ years experience in a professional kitchen',
      'Knowledge of modern cooking techniques',
      'Ability to work in a fast-paced environment',
      'Food safety certification preferred',
    ],
    perks: ['Health insurance', 'Staff meals', 'Career growth'],
  },
  {
    id: 2,
    title: 'Server',
    department: 'Front of House',
    type: 'Full-time',
    time: 'Evening shifts',
    salary: '$35,000 - $45,000/year',
    location: 'San Francisco, CA',
    description: 'Provide exceptional service to our guests in a fast-paced fine dining environment.',
    requirements: [
      'Excellent communication skills',
      'Professional appearance',
      'Ability to multitask',
      'Customer service experience preferred',
    ],
    perks: ['Flexible hours', 'Staff meals', 'Growth opportunities', 'Great for students'],
  },
  {
    id: 3,
    title: 'General Manager',
    department: 'Management',
    type: 'Full-time',
    time: 'Various shifts',
    salary: '$75,000 - $90,000/year',
    location: 'San Francisco, CA',
    description: "Lead our restaurant operations and team. We're looking for an experienced manager who can drive excellence and foster a positive work culture.",
    requirements: [
      '7+ years restaurant management experience',
      'Strong leadership and communication skills',
      'P&L management experience',
      'Fine dining experience preferred',
    ],
    perks: ['Competitive salary', 'Full benefits', 'Performance bonuses', 'Leadership role'],
  },
];

export const JobsTab = ({ deal }: JobsTabProps) => {
  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <Briefcase className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The jobs feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-lg text-neutral-600">
          Be part of an award-winning restaurant that values creativity, teamwork, and excellence. We offer competitive compensation, great benefits, and opportunities for growth.
        </p>
      </div>

      {/* Why Work Here */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Why Work at {deal.merchant.businessName}?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-50 pointer-events-none">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="bg-white rounded-xl p-6 border border-neutral-200">
                <Icon className="h-8 w-8 text-neutral-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">{benefit.label}</h3>
                <p className="text-sm text-neutral-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6 opacity-50 pointer-events-none">
        {MOCK_JOBS.map((job) => (
          <div key={job.id} className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <Briefcase className="h-6 w-6 text-neutral-600 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-sm font-medium">
                      {job.department}
                    </span>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-sm font-medium">
                      {job.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{job.time}</span>
                    </div>
                    <div>
                      <span className="font-semibold">{job.salary}</span>
                    </div>
                    <div>
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="primary" disabled className="opacity-50 cursor-not-allowed">
                Apply Now
              </Button>
            </div>
            <p className="text-neutral-700 mb-4">{job.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="space-y-1 text-sm text-neutral-600">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-neutral-400">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Perks & Benefits:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((perk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How to Apply */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 opacity-50 pointer-events-none">
        <h3 className="text-xl font-bold mb-4">How to Apply</h3>
        <p className="text-neutral-700 mb-4">
          Ready to join our team? Click "Apply Now" on any position that interests you. You'll need to provide:
        </p>
        <ul className="space-y-2 text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Current resume or CV</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Cover letter (optional but recommended)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Professional references</span>
          </li>
        </ul>
        <p className="text-sm text-neutral-600 mt-4">
          Questions? Email us at careers@{deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}.com
        </p>
      </div>
    </div>
  );
};

