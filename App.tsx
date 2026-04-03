
import React, { useState, useCallback, useEffect } from 'react';
import { ModuleType, UserProfile } from './types';
import { MODULES } from './constants';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ModuleView from './components/ModuleView';
import ProfileView from './components/ProfileView';
import AccessView from './components/AccessView';
import AdminView from './components/AdminView';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [view, setView] = useState<'home' | 'module' | 'profile' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
    hasAccess: false,
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
            hasAccess: false,
          };
          setDoc(userRef, initialProfile).catch(err => console.error(err));
          setProfile(initialProfile);
        }
        setIsProfileReady(true);
      }, (err) => {
        console.error("Firestore Error: ", err);
      });
      return () => unsubscribe();
    } else if (isAuthReady && !user) {
      setIsProfileReady(false);
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

  const handleNavigateToAdmin = useCallback(() => {
    setView('admin');
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
    updateDoc(userRef, newProfileData).catch(err => console.error(err));
  }, [user]);

  const addScore = useCallback((module: ModuleType, score: { correct: number; total: number }) => {
    if (!user) return;
    const currentScores = profile.scores?.[module] || [];
    const newScores = [...currentScores, { ...score, date: new Date().toISOString() }];
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, {
      [`scores.${module}`]: newScores
    }).catch(err => console.error(err));
  }, [user, profile.scores]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isAuthReady || (user && !isProfileReady)) {
    return <div className="min-h-screen flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-500"></i></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center py-12 bg-emerald-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
        <div className="max-w-6xl w-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-8 lg:p-12 flex flex-col items-center">
          
          <div className="text-center mb-12 w-full max-w-4xl">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-6">
              <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-800 dark:text-white leading-tight m-0">
                Prépare ton examen <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">telc Deutsch B1</span> efficacement
              </h1>
              <a 
                href="https://youtu.be/a2Nwux9ENpA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 px-6 rounded-2xl transition-transform hover:scale-105 shadow-lg shadow-red-500/30 shrink-0"
                title="Vidéo de présentation"
              >
                <i className="fa-brands fa-youtube text-2xl"></i> Vidéo
              </a>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Maîtrise toutes les compétences de l’examen avec des exercices interactifs et des explications claires.
            </p>
          </div>

          <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-700/50 p-8 rounded-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <i className="fa-solid fa-spinner fa-spin text-emerald-500 text-xl"></i>
              ) : (
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
              )}
              <span className="text-lg">{isLoggingIn ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
            </button>
            
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 text-sm text-slate-500 dark:text-slate-400 mt-6">
              <div className="flex items-center space-x-1.5 mt-2 sm:mt-0">
                <i className="fa-solid fa-cloud-arrow-up text-blue-500"></i>
                <span>Sauvegarde automatique</span>
              </div>
            </div>
          </div>

          {/* Modules Preview Grid */}
          <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Leseverstehen */}
            <div className="bg-[#3b82f6] text-white rounded-xl p-8 shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
              <i className="fa-solid fa-book-open text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">Leseverstehen</h3>
              <p className="text-sm opacity-90 leading-relaxed">La compréhension de la lecture a trois parties qui sont: Leseverstehen Teil 1, Leseverstehen Teil 2 et Leseverstehen Teil 3.</p>
            </div>
            
            {/* Hörverstehen */}
            <div className="bg-[#22c55e] text-white rounded-xl p-8 shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
              <i className="fa-solid fa-microphone text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">Hörverstehen</h3>
              <p className="text-sm opacity-90 leading-relaxed">Compréhension orale. Écoutez des audios et démontrez votre compréhension.</p>
            </div>

            {/* Sprachbausteine */}
            <div className="bg-[#a855f7] text-white rounded-xl p-8 shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
              <i className="fa-solid fa-puzzle-piece text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">Sprachbausteine</h3>
              <p className="text-sm opacity-90 leading-relaxed">Éléments linguistiques. Montrez votre maîtrise de la grammaire et du vocabulaire.</p>
            </div>

            {/* Schriftlicher Ausdruck */}
            <div className="bg-[#f97316] text-white rounded-xl p-8 shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
              <i className="fa-solid fa-pen text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">Schriftlicher Ausdruck</h3>
              <p className="text-sm opacity-90 leading-relaxed">Expression écrite. Rédigez un texte formel ou informel sur un sujet donné.</p>
            </div>

            {/* Mündlicher Ausdruck */}
            <div className="bg-[#ef4444] text-white rounded-xl p-8 shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
              <i className="fa-solid fa-microphone-lines text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">Mündlicher Ausdruck</h3>
              <p className="text-sm opacity-90 leading-relaxed">Expression orale. Simulez les différentes parties de l'examen oral.</p>
            </div>

            {/* Grammatik A2 */}
            <div className="bg-[#eab308] text-slate-900 rounded-xl p-8 shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
              <i className="fa-solid fa-clipboard-list text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">Grammatik A2</h3>
              <p className="text-sm opacity-90 leading-relaxed">Selbsttest A2 – Grammaire et compréhension grammaticale. Révisez les bases avant d'attaquer le B1.</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (!profile.hasAccess) {
    return <AccessView profile={profile} onLogout={logOut} />;
  }

  const isAdmin = user?.email === 'diallly99@gmail.com' || profile.role === 'admin';

  const renderContent = () => {
    switch (view) {
      case 'admin':
        return isAdmin ? <AdminView /> : <Navigation onModuleSelect={handleModuleSelect} />;
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
      <Header 
        onHomeClick={handleNavigateHome} 
        onProfileClick={handleNavigateToProfile} 
        onLogoutClick={logOut}
        onAdminClick={handleNavigateToAdmin}
        isAdmin={isAdmin}
        user={user}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;