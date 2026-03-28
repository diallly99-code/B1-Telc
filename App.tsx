
import React, { useState, useCallback, useEffect } from 'react';
import { ModuleType, UserProfile } from './types';
import { MODULES } from './constants';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ModuleView from './components/ModuleView';
import ProfileView from './components/ProfileView';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [view, setView] = useState<'home' | 'module' | 'profile'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    uid: '',
    email: '',
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthReady && user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create initial profile
          const initialProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            scores: {
              [ModuleType.Leseverstehen]: [],
              [ModuleType.Hoerverstehen]: [],
              [ModuleType.Sprachbausteine]: [],
              [ModuleType.SchriftlicherAusdruck]: [],
              [ModuleType.MuendlicherAusdruck]: [],
              [ModuleType.Grammatik]: [],
            },
            overallAdvice: '',
          };
          setDoc(userRef, initialProfile).catch(err => {
            console.error("Firestore Error: ", JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
              operationType: 'create',
              path: `users/${user.uid}`,
              authInfo: { userId: user.uid }
            }));
          });
          setProfile(initialProfile);
        }
      }, (err) => {
        console.error("Firestore Error: ", JSON.stringify({
          error: err instanceof Error ? err.message : String(err),
          operationType: 'get',
          path: `users/${user.uid}`,
          authInfo: { userId: user.uid }
        }));
      });
      return () => unsubscribe();
    }
  }, [user, isAuthReady]);

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
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, newProfileData).catch(err => {
      console.error("Firestore Error: ", JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        operationType: 'update',
        path: `users/${user.uid}`,
        authInfo: { userId: user.uid }
      }));
    });
  }, [user]);

  const addScore = useCallback((module: ModuleType, score: { correct: number; total: number }) => {
    if (!user) return;
    const currentScores = profile.scores?.[module] || [];
    const newScores = [...currentScores, { ...score, date: new Date().toISOString() }];
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, {
      [`scores.${module}`]: newScores
    }).catch(err => {
      console.error("Firestore Error: ", JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        operationType: 'update',
        path: `users/${user.uid}`,
        authInfo: { userId: user.uid }
      }));
    });
  }, [user, profile.scores]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
            Préparation telc Deutsch B1
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Connectez-vous pour sauvegarder votre progression et accéder aux exercices personnalisés.
          </p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <i className="fa-brands fa-google"></i>
            <span>Se connecter avec Google</span>
          </button>
        </div>
      </div>
    );
  }

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
      <Header onHomeClick={handleNavigateHome} onProfileClick={handleNavigateToProfile} onLogoutClick={logOut} user={user} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;