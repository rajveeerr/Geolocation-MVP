import { Logo } from '../common/Logo';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const socialLinks = [
  {
    href: '#',
    icon: <Facebook className="h-5 w-5" />,
  },
  {
    href: '#',
    icon: <Twitter className="h-5 w-5" />,
  },
  {
    href: '#',
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    href: '#',
    icon: <Linkedin className="h-5 w-5" />,
  },
];

export const SimpleFooter = () => {
  return (
    <footer className="bg-[#222222] font-sans text-neutral-400">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <Logo />
          </div>
          <p className="mb-6 max-w-md text-center">
            Your real-time guide to the best deals and hidden gems in your city.
          </p>
          <div className="mb-6 text-center">
            <p>+1 (234) 567-890</p>
            <p>hello@Yohop.app</p>
            <p>123 Spark Avenue, New York</p>
          </div>
          <div className="flex justify-center gap-5">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-700">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} Yohop. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
