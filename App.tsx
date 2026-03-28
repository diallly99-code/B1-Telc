
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
        <div className="max-w-5xl w-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-8 lg:p-12 flex flex-col items-center">
          
          {/* Top: Title & Subtitle */}
          <div className="text-center mb-12 w-full max-w-3xl">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-800 dark:text-white mb-6 leading-tight">
              Prépare ton examen <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">telc Deutsch B1</span> efficacement
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Maîtrise toutes les compétences de l’examen avec des exercices interactifs et des explications claires.
            </p>
          </div>

          {/* Middle: Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-12">
            {/* Leseverstehen */}
            <div className="bg-blue-500 rounded-xl p-6 text-white flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <i className="fa-solid fa-book-open text-4xl mb-4"></i>
              <h3 className="font-bold text-lg mb-2">Leseverstehen</h3>
              <p className="text-xs opacity-90 leading-relaxed">La compréhension de la lecture a trois parties qui sont: Leseverstehen Teil 1, Leseverstehen Teil 2 et Leseverstehen Teil 3.</p>
            </div>
            
            {/* Hörverstehen */}
            <div className="bg-green-500 rounded-xl p-6 text-white flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <i className="fa-solid fa-microphone text-4xl mb-4"></i>
              <h3 className="font-bold text-lg mb-2">Hörverstehen</h3>
              <p className="text-xs opacity-90 leading-relaxed">Compréhension orale. Écoutez des audios et démontrez votre compréhension.</p>
            </div>

            {/* Sprachbausteine */}
            <div className="bg-purple-500 rounded-xl p-6 text-white flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <i className="fa-solid fa-puzzle-piece text-4xl mb-4"></i>
              <h3 className="font-bold text-lg mb-2">Sprachbausteine</h3>
              <p className="text-xs opacity-90 leading-relaxed">Éléments linguistiques. Montrez votre maîtrise de la grammaire et du vocabulaire.</p>
            </div>

            {/* Schriftlicher Ausdruck */}
            <div className="bg-orange-500 rounded-xl p-6 text-white flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <i className="fa-solid fa-pen text-4xl mb-4"></i>
              <h3 className="font-bold text-lg mb-2">Schriftlicher Ausdruck</h3>
              <p className="text-xs opacity-90 leading-relaxed">Expression écrite. Rédigez un texte formel ou informel sur un sujet donné.</p>
            </div>

            {/* Mündlicher Ausdruck */}
            <div className="bg-red-500 rounded-xl p-6 text-white flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <i className="fa-solid fa-microphone text-4xl mb-4"></i>
              <h3 className="font-bold text-lg mb-2">Mündlicher Ausdruck</h3>
              <p className="text-xs opacity-90 leading-relaxed">Expression orale. Simulez les différentes parties de l'examen oral.</p>
            </div>

            {/* Grammatik A2 */}
            <div className="bg-yellow-400 rounded-xl p-6 text-slate-900 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <i className="fa-solid fa-clipboard-list text-4xl mb-4"></i>
              <h3 className="font-bold text-lg mb-2">Grammatik A2</h3>
              <p className="text-xs opacity-90 leading-relaxed">Selbsttest A2 – Grammaire et compréhension grammaticale. Révisez les bases avant d'attaquer le B1.</p>
            </div>
          </div>

          {/* Bottom: Login Section */}
          <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-700/50 p-8 rounded-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
            <button 
              onClick={signInWithGoogle}
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
              <span className="text-lg">Se connecter avec Google</span>
            </button>
            
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 text-sm text-slate-500 dark:text-slate-400 mt-6">
              <div className="flex items-center space-x-1.5">
                <i className="fa-solid fa-unlock-keyhole text-emerald-500"></i>
                <span>Teste l’application dès maintenant</span>
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div className="flex items-center space-x-1.5 mt-2 sm:mt-0">
                <i className="fa-solid fa-cloud-arrow-up text-blue-500"></i>
                <span>Sauvegarde automatique</span>
              </div>
            </div>
          </div>

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