import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Project Atlas
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300">
          Fractional Real Estate Investment Powered by Blockchain and AI
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Fractional Ownership</h2>
            <p className="mb-4">Invest in premium real estate properties with as little as you want. Own a piece of high-value assets without the traditional barriers to entry.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">AI-Powered Analysis</h2>
            <p className="mb-4">Our proprietary Atlas AI evaluates properties on multiple factors, providing a comprehensive score to help you make informed investment decisions.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Blockchain Security</h2>
            <p className="mb-4">Your property ownership is secured as an NFT on the blockchain, providing transparent, immutable proof of your investment.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Passive Income</h2>
            <p className="mb-4">Earn monthly rental income proportional to your ownership stake, with all property management handled by our expert team.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button className="w-full md:w-auto px-8 py-6 text-lg">
              Login to Dashboard
            </Button>
          </Link>
          <Link href="/landing">
            <Button variant="outline" className="w-full md:w-auto px-8 py-6 text-lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
