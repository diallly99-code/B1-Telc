
import React, { useState, useCallback } from 'react';
import { ModuleType, UserProfile } from './types';
import { MODULES } from './constants';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ModuleView from './components/ModuleView';
import ProfileView from './components/ProfileView';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [view, setView] = useState<'home' | 'module' | 'profile'>('home');
  const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {
    scores: {
      [ModuleType.Leseverstehen]: [],
      [ModuleType.Hoerverstehen]: [],
      [ModuleType.Sprachbausteine]: [],
      [ModuleType.SchriftlicherAusdruck]: [],
      [ModuleType.MuendlicherAusdruck]: [],
      [ModuleType.Grammatik]: [],
    },
    overallAdvice: '',
  });

  const handleModuleSelect = useCallback((module: ModuleType) => {
    setActiveModule(module);
    setView('module');
  }, []);

  const handleNavigateHome = useCallback(() => {
    setActiveModule(null);
    setView('home');
  }, []);
  
  const handleNavigateToProfile = useCallback(() => {
    setView('profile');
    setActiveModule(null);
  }, []);

  const handleNavigateToPreviousModule = useCallback(() => {
    if (!activeModule) return;
    const currentIndex = MODULES.findIndex(m => m.id === activeModule);
    const prevIndex = (currentIndex - 1 + MODULES.length) % MODULES.length;
    setActiveModule(MODULES[prevIndex].id);
  }, [activeModule]);

  const handleNavigateToNextModule = useCallback(() => {
    if (!activeModule) return;
    const currentIndex = MODULES.findIndex(m => m.id === activeModule);
    const nextIndex = (currentIndex + 1) % MODULES.length;
    setActiveModule(MODULES[nextIndex].id);
  }, [activeModule]);

  const updateProfile = useCallback((newProfileData: Partial<UserProfile>) => {
    setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));
  }, [setProfile]);

  const addScore = useCallback((module: ModuleType, score: { correct: number; total: number }) => {
    setProfile(prevProfile => {
      const newScores = [...prevProfile.scores[module], { ...score, date: new Date().toISOString() }];
      return {
        ...prevProfile,
        scores: {
          ...prevProfile.scores,
          [module]: newScores,
        }
      };
    });
  }, [setProfile]);


  const renderContent = () => {
    switch (view) {
      case 'profile':
        return <ProfileView profile={profile} updateProfile={updateProfile} />;
      case 'module':
        if (activeModule) {
          const moduleInfo = MODULES.find(m => m.id === activeModule);
          return moduleInfo ? <ModuleView
            module={moduleInfo}
            addScore={addScore}
            onNavigateHome={handleNavigateHome}
            onNavigateToPrevious={handleNavigateToPreviousModule}
            onNavigateToNext={handleNavigateToNextModule}
          /> : <div>Module not found</div>;
        }
        return null;
      case 'home':
      default:
        return <Navigation onModuleSelect={handleModuleSelect} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header onHomeClick={handleNavigateHome} onProfileClick={handleNavigateToProfile} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;