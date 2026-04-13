/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/Home';
import VisitorScan from './pages/VisitorScan';
import QueueDisplay from './pages/QueueDisplay';
import QRManager from './pages/QRManager';
import QRDesigner from './pages/QRDesigner';
import Members from './pages/Members';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Doors from './pages/Doors';
import JoinDoor from './pages/JoinDoor';
import Emergency from './pages/Emergency';
import AddDoor from './pages/AddDoor';
import DoorSettings from './pages/DoorSettings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home, DoorOpen, QrCode, User, LogIn } from 'lucide-react';
import { cn } from './lib/utils';

function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#121212] p-8 rounded-3xl border border-gray-800 text-center shadow-xl">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
          <DoorOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Darwaza</h1>
        <p className="text-gray-400 mb-8">Smart Doorbell & QR Management</p>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-800 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center p-2">
        <Link to="/" className={cn("flex flex-col items-center p-2 rounded-xl min-w-[64px]", path === '/' ? "text-orange-500" : "text-gray-500 hover:text-gray-300")}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/doors" className={cn("flex flex-col items-center p-2 rounded-xl min-w-[64px]", path.startsWith('/doors') ? "text-orange-500" : "text-gray-500 hover:text-gray-300")}>
          <DoorOpen className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Doors</span>
        </Link>
        <Link to="/qrs" className={cn("flex flex-col items-center p-2 rounded-xl min-w-[64px]", path === '/qrs' ? "text-orange-500" : "text-gray-500 hover:text-gray-300")}>
          <QrCode className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">QR</span>
        </Link>
        <Link to="/profile" className={cn("flex flex-col items-center p-2 rounded-xl min-w-[64px]", path === '/profile' ? "text-orange-500" : "text-gray-500 hover:text-gray-300")}>
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-[#0a0a0a] relative min-h-screen shadow-2xl border-x border-gray-800/50">
        {/* Main Content */}
        <main className="h-full overflow-y-auto pb-20 scrollbar-hide">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Visitor Routes */}
          <Route path="/scan/:slug" element={<VisitorScan />} />
          <Route path="/queue-display/:slug" element={<QueueDisplay />} />

          {/* Authenticated Manager Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/qrs" element={<Layout><QRManager /></Layout>} />
          <Route path="/qrs/:slug/design" element={<QRDesigner />} />
          <Route path="/doors" element={<Layout><Doors /></Layout>} />
          <Route path="/doors/join" element={<Layout><JoinDoor /></Layout>} />
          <Route path="/doors/emergency" element={<Layout><Emergency /></Layout>} />
          <Route path="/doors/add" element={<Layout><AddDoor /></Layout>} />
          <Route path="/doors/:id/settings" element={<Layout><DoorSettings /></Layout>} />
          <Route path="/members" element={<Layout><Members /></Layout>} />
          <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

