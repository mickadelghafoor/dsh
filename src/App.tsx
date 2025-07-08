import React, { useState } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import MovieCarousel from './components/MovieCarousel';
import MovieCategories from './components/MovieCategories';
import MovieSearch from './components/MovieSearch';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import About from './components/About';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
  };

  if (currentView === 'dashboard') {
    return <Dashboard onBack={navigateToLanding} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero onWatchNow={navigateToDashboard} />
      <Features />
      <MovieCarousel onWatchMovie={navigateToDashboard} />
      <MovieCategories onWatchMovie={navigateToDashboard} />
      <MovieSearch onWatchMovie={navigateToDashboard} />
      <HowItWorks />
      <FAQ />
      <About />
      <Footer />
    </div>
  );
}

export default App;