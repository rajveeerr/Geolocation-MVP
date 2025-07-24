import { Gift, Users, Zap } from 'lucide-react';

interface FeatureCardProps {
  icon: 'gift' | 'users' | 'zap';
  title: string;
}

const IconComponent = ({ icon }: { icon: 'gift' | 'users' | 'zap' }) => {
  switch (icon) {
    case 'gift':
      return <Gift className="h-6 w-6 text-neutral-text-primary" />;
    case 'users':
      return <Users className="h-6 w-6 text-neutral-text-primary" />;
    case 'zap':
      return <Zap className="h-6 w-6 text-neutral-text-primary" />;
    default:
      return null;
  }
};

export const FeatureCard = ({ icon, title }: FeatureCardProps) => {
  return (
    <div className="flex h-full flex-col justify-between p-6">
      <IconComponent icon={icon} />
      <h3 className="font-semibold text-neutral-text-primary">{title}</h3>
    </div>
  );
};