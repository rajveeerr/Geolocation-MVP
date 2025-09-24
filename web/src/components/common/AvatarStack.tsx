// web/src/components/common/AvatarStack.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// We'll use placeholder images for now. In a real app, these would come from user data.
const placeholderAvatars = [
  'https://github.com/shadcn.png',
  'https://github.com/vercel.png',
  'https://github.com/react.png',
  'https://github.com/vitejs.png',
  'https://github.com/tailwindcss.png',
];

interface AvatarStackProps {
  count: number;
  users?: { avatarUrl?: string | null }[];
  textClassName?: string;
}

export const AvatarStack = ({ count, users, textClassName }: AvatarStackProps) => {
  const toRender = users && users.length > 0 ? users : placeholderAvatars.map((src) => ({ avatarUrl: src }));

  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {toRender.map((user, index) => (
          <Avatar key={index} className="h-8 w-8 border-2 border-white">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className={textClassName ?? 'ml-3 text-sm font-semibold text-neutral-700'}>
        {count} people tapped in
      </span>
    </div>
  );
};
