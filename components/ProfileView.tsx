import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { MODULES } from '../constants';
import { getOverallAdvice } from '../services/geminiService';
import Spinner from './Spinner';

interface ProfileViewProps {
  profile: UserProfile;
  updateProfile: (newProfileData: Partial<UserProfile>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, updateProfile }) => {
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const calculateAverage = (scores: UserProfile['scores'][keyof UserProfile['scores']]) => {
    if (scores.length === 0) return 0;
    const totalPercentage = scores.reduce((acc, score) => acc + (score.correct / score.total) * 100, 0);
    return Math.round(totalPercentage / scores.length);
  };
  
  const handleGenerateAdvice = async () => {
      setIsLoadingAdvice(true);
      try {
          const advice = await getOverallAdvice(profile.scores);
          updateProfile({ overallAdvice: advice });
      } catch (error) {
          console.error("Failed to get advice", error);
          updateProfile({ overallAdvice: "Erreur lors de la génération des conseils. Veuillez réessayer." });
      } finally {
          setIsLoadingAdvice(false);
      }
  };

  useEffect(() => {
    // Generate advice on initial load if none exists
    if (!profile.overallAdvice && Object.values(profile.scores).some(s => (s as any[]).length > 0)) {
        handleGenerateAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-200">Mon Profil & Progression</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Scores Moyens par Compétence</h3>
          <div className="space-y-4">
            {MODULES.map(module => {
              const average = calculateAverage(profile.scores[module.id]);
              return (
                <div key={module.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{module.title}</span>
                    <span className={`font-bold text-${module.color}-500`}>{average}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                    <div
                      className={`bg-${module.color}-500 h-4 rounded-full`}
                      style={{ width: `${average}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold mb-4">Conseils Personnalisés</h3>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg min-h-[150px] whitespace-pre-wrap font-mono text-sm">
                {isLoadingAdvice ? <div className="flex justify-center items-center h-full"><Spinner /></div> : profile.overallAdvice || "Aucun conseil disponible. Faites quelques exercices pour commencer !"}
            </div>
            <button
                onClick={handleGenerateAdvice}
                disabled={isLoadingAdvice}
                className="mt-4 w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:bg-slate-400"
            >
                {isLoadingAdvice ? 'Analyse en cours...' : 'Actualiser les conseils'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;