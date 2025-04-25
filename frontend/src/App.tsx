import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// Pages
import HomePage from '@/pages/index';
import AuthPage from '@/pages/auth';
import HotelsPage from '@/pages/hotels';
import FlightsPage from '@/pages/flights';
import MapPage from '@/pages/map';
import DestinationPage from '@/pages/destination/[id]';
import DestinationsPage from '@/pages/destinations';
import PlannerPage from '@/pages/planner';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';
import SupportPage from '@/pages/support';
import ProfileSetup from '@/components/profile/ProfileSetup';
import RootLayout from '@/layouts/RootLayout';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destination/:id" element={<DestinationPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;