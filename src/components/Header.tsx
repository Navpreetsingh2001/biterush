import Link from 'next/link';
import { Utensils } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Utensils className="h-6 w-6" />
          <span>Campus Grub</span>
        </Link>
        {/* Add navigation links here if needed */}
        {/* <nav>
          <Link href="/about" className="hover:underline">About</Link>
        </nav> */}
      </div>
    </header>
  );
};

export default Header;
