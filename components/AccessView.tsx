import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

interface AccessViewProps {
  profile: UserProfile;
  onLogout: () => void;
}

const AccessView: React.FC<AccessViewProps> = ({ profile, onLogout }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'buy'>('login');

  const handleVerifyCode = async () => {
    const finalCode = code.trim().toUpperCase();
    if (!finalCode) {
      setError('Veuillez entrer un code.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const codeRef = doc(db, 'accessCodes', finalCode);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        const codeData = codeSnap.data();
        if (codeData.isActive) {
          // Mark code as used ONLY if it's not a universal code
          if (!codeData.isUniversal) {
            await updateDoc(codeRef, {
              isActive: false,
              usedBy: profile.uid,
              usedAt: new Date().toISOString()
            });
          }

          // Grant access to user
          const userRef = doc(db, 'users', profile.uid);
          await updateDoc(userRef, {
            hasAccess: true
          });
          
          // The onSnapshot in App.tsx will automatically update the UI
        } else {
          setError('Ce code a déjà été utilisé ou est inactif.');
        }
      } else {
        setError('Code invalide.');
      }
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la vérification du code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'buy') {
    return (
      <div className="min-h-screen bg-[#f4f7fe] font-sans pb-12">
        {/* Header */}
        <div className="bg-[#4f46e5] text-white py-6 text-center shadow-md">
          <h1 className="text-lg md:text-xl font-bold flex items-center justify-center gap-2">
            <i className="fa-solid fa-graduation-cap"></i> Allemand à la Maison — Acheter un code d'accès
          </h1>
        </div>

        <div className="max-w-md mx-auto mt-8 px-4 space-y-6">
          {/* Card 1: Accès complet */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <i className="fa-solid fa-box-open text-[#d97706]"></i> Votre accès complet
            </h2>
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
              <span className="text-slate-500">Prix normal</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#16a34a]">29,99€ / mois</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Ou bien 100€ à vie</div>
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <i className="fa-solid fa-check text-green-500 bg-green-100 rounded-full p-1 text-xs"></i> 
                <span>Accès complet (mensuel ou à vie)</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <i className="fa-solid fa-check text-green-500 bg-green-100 rounded-full p-1 text-xs"></i> 
                <span>Version Web</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <i className="fa-solid fa-check text-green-500 bg-green-100 rounded-full p-1 text-xs"></i> 
                <span>Mode en ligne (avec Internet)</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <i className="fa-solid fa-check text-green-500 bg-green-100 rounded-full p-1 text-xs"></i> 
                <span>Correction IA selon les critères TELC</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Comment acheter */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Comment acheter ?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Déposez 29,99€ ou 100€</h3>
                  <p className="text-xs text-slate-500 mt-1">Au numéro Orange Money :</p>
                  <p className="font-bold text-slate-800 mt-1 text-base">00224627426386</p>
                  <p className="text-xs text-slate-500">(Amadou Djarougha Diallo)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Prenez une capture d'écran du dépôt</h3>
                  <p className="text-xs text-slate-500 mt-1">La preuve de paiement est obligatoire</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Envoyez la capture par email ou WhatsApp</h3>
                  <p className="text-xs text-slate-500 mt-1">Joignez votre adresse email — votre code arrive rapidement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a href="mailto:a1.alamaison224@gmail.com" className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
              <i className="fa-solid fa-envelope"></i> Envoyer ma commande par email
            </a>
            <a href="https://wa.me/4915908156920" target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
              <i className="fa-brands fa-whatsapp text-xl"></i> Envoyer par WhatsApp
            </a>
            <div className="w-full bg-[#eff6ff] text-[#2563eb] font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-blue-200">
              <i className="fa-regular fa-envelope"></i> a1.alamaison224@gmail.com
            </div>
            <button onClick={() => setMode('login')} className="w-full bg-white text-[#4f46e5] hover:bg-slate-50 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm border border-slate-200 mt-4">
              <i className="fa-solid fa-arrow-left"></i> Retour à la page de connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col items-center relative">
        {/* Icon */}
        <div className="w-16 h-16 bg-[#4f46e5] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-500/30">
          <i className="fa-solid fa-key text-2xl transform -rotate-45"></i>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Allemand à la Maison</h1>
        <p className="text-slate-500 text-sm mb-8 text-center">Connectez-vous avec votre code d'accès</p>

        <div className="w-full mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Code d'accès</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="TELC-XXXX-XXXX" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center font-mono focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all uppercase" 
            />
            <i className="fa-solid fa-key absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300"></i>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">Format: TELC-XXXX-XXXX</p>
        </div>

        {error && (
          <div className="w-full text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        <button 
          onClick={handleVerifyCode}
          disabled={isLoading || !code.trim()}
          className="w-full bg-[#a5b4fc] hover:bg-[#818cf8] text-white font-bold py-3.5 rounded-xl transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-regular fa-circle-check"></i>}
          <span>Se connecter</span>
        </button>

        <div className="flex items-center w-full mb-8">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-4 text-xs text-slate-400 uppercase font-medium tracking-wider">ou</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <div className="w-full text-center">
          <p className="text-sm text-slate-600 mb-4 font-medium">Vous n'avez pas de code d'accès ?</p>
          
          <button 
            onClick={() => setMode('buy')} 
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors mb-3 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
          >
            <i className="fa-solid fa-cart-shopping"></i> Acheter un code d'accès
          </button>
          
          <a 
            href="mailto:a1.alamaison224@gmail.com" 
            className="w-full bg-[#eff6ff] text-[#2563eb] hover:bg-blue-100 font-bold py-3.5 rounded-xl transition-colors mb-3 flex items-center justify-center gap-2 border border-blue-200"
          >
            <i className="fa-regular fa-envelope"></i> a1.alamaison224@gmail.com
          </a>
          
          <a 
            href="https://wa.me/4915908156920" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-[#22c55e] hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-500/20"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
          <button onClick={onLogout} className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto">
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Se déconnecter ({profile.email})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessView;
