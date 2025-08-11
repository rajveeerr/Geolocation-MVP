import { Gift, Users, Zap } from 'lucide-react';

interface FeatureCardProps {
  icon: 'gift' | 'users' | 'zap';
  title: string;
}

const IconComponent = ({ icon }: { icon: 'gift' | 'users' | 'zap' }) => {
  switch (icon) {
    case 'gift':
      return <Gift className="text-neutral-text-primary h-6 w-6" />;
    case 'users':
      return <Users className="text-neutral-text-primary h-6 w-6" />;
    case 'zap':
      return <Zap className="text-neutral-text-primary h-6 w-6" />;
    default:
      return null;
  }
};

export const FeatureCard = ({ icon, title }: FeatureCardProps) => {
  return (
    <div className="flex h-full flex-col justify-between p-4 sm:p-6">
      <IconComponent icon={icon} />
      <h3 className="text-neutral-text-primary text-sm font-semibold sm:text-base">
        {title}
      </h3>
    </div>
  );
};
