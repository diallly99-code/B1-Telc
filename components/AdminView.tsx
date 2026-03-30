import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminView: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [universalCode, setUniversalCode] = useState<any>(null);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [isSettingUniversal, setIsSettingUniversal] = useState(false);

  const fetchCodes = async () => {
    try {
      const q = query(collection(db, 'accessCodes'));
      const snapshot = await getDocs(q);
      const codesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by creation date descending
      codesList.sort((a: any, b: any) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setCodes(codesList);
      
      const activeUniversal = codesList.find(c => c.isUniversal && c.isActive);
      setUniversalCode(activeUniversal || null);
    } catch (error) {
      console.error("Error fetching codes", error);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = async () => {
    setIsLoading(true);
    try {
      const code = `TELC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await setDoc(doc(db, 'accessCodes', code), {
        isActive: true,
        isUniversal: false,
        createdAt: new Date().toISOString(),
      });
      setNewCode(code);
      await fetchCodes();
    } catch (error) {
      console.error("Error generating code", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetUniversalCode = async () => {
    if (!customCodeInput.trim()) return;
    let formattedCode = customCodeInput.trim().toUpperCase();
    if (!formattedCode.startsWith('TELC-')) {
      formattedCode = `TELC-${formattedCode}`;
    }

    setIsSettingUniversal(true);
    try {
      // Deactivate existing universal codes
      const existingUniversals = codes.filter(c => c.isUniversal && c.isActive);
      for (const uc of existingUniversals) {
        await updateDoc(doc(db, 'accessCodes', uc.id), { isActive: false });
      }

      // Create new universal code
      await setDoc(doc(db, 'accessCodes', formattedCode), {
        isActive: true,
        isUniversal: true,
        createdAt: new Date().toISOString(),
      });

      setCustomCodeInput('');
      await fetchCodes();
    } catch (error) {
      console.error("Error setting universal code", error);
    } finally {
      setIsSettingUniversal(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
        <i className="fa-solid fa-shield-halved text-emerald-500 mr-3"></i>
        Administration des codes d'accès
      </h2>

      {/* Section Code Universel */}
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
          <i className="fa-solid fa-globe mr-3"></i> Code d'accès Universel (Multi-utilisateurs)
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-6">
          Ce code peut être utilisé par un nombre illimité d'élèves. Si vous le changez, l'ancien code ne fonctionnera plus pour les nouveaux utilisateurs.
        </p>

        {universalCode ? (
          <div className="mb-6 p-4 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-sm block mb-1">Code universel actuel :</span>
              <span className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400">{universalCode.id}</span>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(universalCode.id)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2"
              title="Copier le code"
            >
              <i className="fa-regular fa-copy text-xl"></i>
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm">
            Aucun code universel n'est actuellement défini.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={customCodeInput}
            onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
            placeholder="Ex: TELC-PROMO-2026"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none uppercase"
          />
          <button 
            onClick={handleSetUniversalCode}
            disabled={isSettingUniversal || !customCodeInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSettingUniversal ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
            <span>Définir ce code</span>
          </button>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
        <i className="fa-solid fa-ticket mr-3 text-emerald-500"></i> Codes à usage unique
      </h3>
      <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button 
          onClick={generateCode} 
          disabled={isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plus"></i>}
          <span>Générer un nouveau code</span>
        </button>
        
        {newCode && (
          <div className="mt-4 p-4 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-emerald-800 dark:text-emerald-300 text-sm block mb-1">Nouveau code généré avec succès :</span>
              <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">{newCode}</span>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(newCode)}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 p-2"
              title="Copier le code"
            >
              <i className="fa-regular fa-copy text-xl"></i>
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4 font-semibold">Code d'accès</th>
              <th className="py-3 px-4 font-semibold">Statut</th>
              <th className="py-3 px-4 font-semibold">Date de création</th>
              <th className="py-3 px-4 font-semibold">Utilisé par (UID)</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400 italic">
                  Aucun code généré pour le moment.
                </td>
              </tr>
            ) : (
              codes.map(c => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">{c.id}</td>
                  <td className="py-3 px-4">
                    {c.isActive ? (
                      c.isUniversal ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Universel
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Actif
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        Inactif / Utilisé
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {c.isUniversal ? 'Multiples' : (c.usedBy || '-')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminView;
