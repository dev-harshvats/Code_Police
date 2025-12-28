import './globals.css';

export const metadata = {
  title: 'CodePolice',
  description: 'Competitive Programming Leaderboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Added global background and text colors here */}
      <body className="bg-[#09090b] text-[#fafafa] relative min-h-screen overflow-x-hidden font-sans selection:bg-orange-500/30 selection:text-orange-200">
        
        {/* --- AMBIENT BACKGROUND LAYERS --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}