import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../firebase.ts';
import { motion } from 'framer-motion';

const TeamDetail = () => {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) return;
    const teamRef = ref(db, `teams/${teamName}`);
    const handle = (snap: any) => {
      setTeam(snap.val());
      setLoading(false);
    };
    onValue(teamRef, handle);
    return () => off(teamRef, 'value', handle);
  }, [teamName]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-5xl mx-auto py-16 px-6">
        <button onClick={() => navigate(-1)} className="glow-btn bg-slate-900/50 border-white/10 mb-12 text-[10px] font-black uppercase tracking-[0.3em] py-3 px-8 flex items-center gap-3 group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          Back to Command
        </button>

        {loading ? (
          <div className="glass-card p-24 text-center border-blue-500/10 backdrop-blur-3xl">
            <div className="cyber-spinner mx-auto mb-8" />
            <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-xs animate-pulse">Scanning Neural Archives...</p>
          </div>
        ) : !team ? (
          <div className="glass-card p-24 text-center border-rose-500/20 backdrop-blur-3xl">
            <h2 className="text-3xl text-rose-400 font-black uppercase tracking-tighter mb-4">ENCRYPTED DATA NOT FOUND</h2>
            <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">The requested team coordinates do not exist in the fleet database.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <header className="glass-card p-12 border-blue-500/10 backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl opacity-50" />
              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
                  Fleet Designation
                </div>
                <h1 className="text-6xl md:text-7xl font-black odyssey-title tracking-tighter uppercase leading-none mb-6">{teamName}</h1>
                <div className="flex flex-wrap items-center gap-6 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> SYNCED_{new Date(team.timestamp).toLocaleString()}</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> ID_{team.teamNumber || 'PENDING'}</span>
                </div>
              </div>
            </header>

            <div className="glass-card p-12 border-white/5 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-xl font-black text-blue-400 border border-blue-500/10">01</div>
                  <h3 className="text-3xl font-black text-white tracking-tight uppercase">Crew Manifest</h3>
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{team.members?.length} Operatives Detected</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(team.members || []).map((m: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 bg-white/[0.02] rounded-[32px] border border-white/5 group hover:border-blue-500/30 transition-all shadow-inner relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className={`text-[9px] px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] border transition-colors ${idx === 0 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-800/10 text-slate-500 border-white/5 group-hover:text-slate-300'}`}>
                        {idx === 0 ? 'Mission Commander' : `Fleet Operative 0${idx}`}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-2 leading-tight">{m.name}</div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                        <span className="text-cyan-400/80">{m.regNo}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-emerald-400/80 lowercase">{m.email}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>Year {m.year}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>{m.dept}</span>
                      </div>
                      <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-8">{m.collegeName}</div>

                      <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-2">Residence</p>
                          <p className="text-[11px] text-white font-bold">{m.residenceType || 'Day Scholar'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-2">Communications</p>
                          <p className="text-[11px] text-white font-bold">{m.phone}</p>
                        </div>
                        {m.residenceType === 'Hosteller' && (
                          <>
                            <div className="col-span-2 space-y-4">
                              <div className="grid grid-cols-2 gap-8">
                                <div>
                                  <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Sector (Hostel)</p>
                                  <p className="text-[11px] text-slate-300 font-bold">{m.hostelName}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Station (Room)</p>
                                  <p className="text-[11px] text-slate-300 font-bold">{m.roomNumber}</p>
                                </div>
                              </div>
                              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Guardian (Warden)</p>
                                <p className="text-[11px] text-slate-300 font-bold">{m.wardenName} <span className="text-slate-500 ml-2 font-mono">({m.wardenPhone})</span></p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeamDetail;
