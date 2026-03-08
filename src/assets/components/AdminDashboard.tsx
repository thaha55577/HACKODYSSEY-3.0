import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../firebase.ts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Member {
  name: string;
  regNo: string;
  year: string;
  dept: string;
  phone: string;
  collegeSelect?: string;
  collegeName?: string;
  residenceType?: 'Day Scholar' | 'Hosteller';
  hostelName?: string;
  roomNumber?: string;
  wardenName?: string;
  wardenPhone?: string;
}

interface Team {
  teamName: string;
  teamNumber: string;
  createdBy: string;
  members: Member[];
  timestamp?: string;
}

const DownloadManifestModal = ({ isOpen, onClose, teams }: { isOpen: boolean, onClose: () => void, teams: Team[] }) => {
  const exportCSV = (filterFn?: (m: Member) => boolean, fileName: string = 'HackOdyssey_Manifest') => {
    const headers = ['Team ID', 'Team Name', 'Student Name', 'Register ID', 'Year', 'Dept', 'Phone', 'College', 'Residence', 'Hostel', 'Room'];

    const rows = teams.flatMap(team =>
      team.members
        .filter(m => !filterFn || filterFn(m))
        .map(m => [
          team.teamNumber || 'N/A',
          team.teamName,
          m.name,
          m.regNo,
          m.year,
          m.dept,
          m.phone,
          m.collegeName || m.collegeSelect || 'N/A',
          m.residenceType || 'Day Scholar',
          m.hostelName || 'N/A',
          m.roomNumber || 'N/A'
        ])
    );

    if (rows.length === 0) {
      toast.info('No students found for this specific filter.');
      return;
    }

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="glass-card max-w-2xl w-full p-8 border-blue-500/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black odyssey-title tracking-tight">EXPORT MANIFEST</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  label: 'Full Manifest',
                  desc: 'All registered students',
                  fn: () => exportCSV(undefined, 'HackOdyssey_Full_Manifest'),
                  icon: '📋'
                },
                {
                  label: 'KLU Students',
                  desc: 'Only Kalasalingam University',
                  fn: () => exportCSV(m => m.collegeSelect === 'Kalasalingam University', 'KLU_Students_Manifest'),
                  icon: '🎓'
                },
                {
                  label: 'Other Colleges',
                  desc: 'Students from external nodes',
                  fn: () => exportCSV(m => m.collegeSelect === 'Other', 'Other_Colleges_Manifest'),
                  icon: '🌐'
                },
                {
                  label: 'KLU Hostellers',
                  desc: 'Residents in MH/LH blocks',
                  fn: () => exportCSV(m => m.collegeSelect === 'Kalasalingam University' && m.residenceType === 'Hosteller', 'KLU_Hostellers_Manifest'),
                  icon: '🏢'
                },
                {
                  label: 'KLU Day Scholars',
                  desc: 'Local commuters list',
                  fn: () => exportCSV(m => m.collegeSelect === 'Kalasalingam University' && m.residenceType === 'Day Scholar', 'KLU_DayScholars_Manifest'),
                  icon: '🏠'
                },
                {
                  label: 'PDF Summary',
                  desc: 'Print-ready master list',
                  fn: () => {
                    const doc = new jsPDF('l', 'mm', 'a4');
                    doc.text('HACK ODYSSEY 3.0 - MASTER STUDENT LIST', 14, 15);
                    const tableData = teams.flatMap((team, teamIndex) =>
                      team.members.map((member, memberIndex) => [
                        memberIndex === 0 ? teamIndex + 1 : '',
                        memberIndex === 0 ? team.teamName : '',
                        member.name,
                        member.regNo,
                        member.phone,
                        member.residenceType || 'Day Scholar'
                      ])
                    );
                    autoTable(doc, {
                      head: [['#', 'Team Name', 'Student', 'Register ID', 'Comms', 'Residence Type']],
                      body: tableData,
                      startY: 20,
                      theme: 'grid',
                      styles: { fontSize: 8 }
                    });
                    doc.save('HackOdyssey_Summary.pdf');
                    onClose();
                  },
                  icon: '📄'
                }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={opt.fn}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-left group"
                >
                  <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{opt.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm tracking-tight">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-600 text-center uppercase tracking-[0.2em]">Select the coordination data required for your mission</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    const ideasRef = ref(db, 'ideas');

    onValue(teamsRef, (teamsSnapshot) => {
      onValue(ideasRef, (ideasSnapshot) => {
        if (teamsSnapshot.exists()) {
          const teamsData = teamsSnapshot.val();
          const ideasData = ideasSnapshot.exists() ? ideasSnapshot.val() : {};

          const teamsList = Object.entries(teamsData).map(([name, details]: [string, any]) => ({
            teamName: name,
            ...details,
            ideaSubmitted: !!ideasData[name]
          }));
          setTeams(teamsList);
          setLoading(false);
        } else {
          setTeams([]);
          setLoading(false);
        }
      });
    });

    return () => {
      off(teamsRef);
      off(ideasRef);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredTeams = teams.filter(team =>
    team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.regNo.includes(searchTerm))
  );

  const totalStudents = teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
  const totalIdeas = teams.filter(t => (t as any).ideaSubmitted).length;

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">

      <DownloadManifestModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        teams={teams}
      />

      <div className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black odyssey-title tracking-tighter uppercase leading-none">MISSION CONTROL</h1>
            <p className="text-slate-500 uppercase tracking-[0.5em] text-[10px] font-bold mt-2">Fleet Management Terminal v3.0</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/admin/ideas')} className="glow-btn bg-emerald-500/10 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest py-3 px-6 hover:bg-emerald-500/20 transition-all">Analyze Blueprints</button>
            <button onClick={() => setIsDownloadModalOpen(true)} className="glow-btn bg-blue-500/10 border-blue-500/20 text-[10px] font-black uppercase tracking-widest py-3 px-6 hover:bg-blue-500/20 transition-all">Extract Manifest</button>
            <button onClick={handleLogout} className="glow-btn bg-rose-500/10 border-rose-500/20 text-[10px] font-black uppercase tracking-widest py-3 px-6 hover:bg-rose-500/20 transition-all">Emergency Exit</button>
          </motion.div>
        </header>

        {loading ? (
          <div className="py-32 text-center">
            <div className="cyber-spinner mx-auto mb-8" />
            <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-xs animate-pulse">Scanning Neural Network...</p>
          </div>
        ) : (
          <>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { label: 'Registered Teams', value: teams.length, icon: '🚀', color: 'blue' },
                { label: 'Active Operatives', value: totalStudents, icon: '👨‍🚀', color: 'emerald' },
                { label: 'Blueprints Synced', value: totalIdeas, icon: '💡', color: 'purple' },
                { label: 'Sector Density', value: `${teams.length}/80`, icon: '📊', color: 'cyan' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                      <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110">{stat.icon}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden border-white/5 backdrop-blur-3xl"
            >
              <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="relative max-w-2xl">
                  <input
                    type="text"
                    placeholder="Query fleet manifest (Team, Operative or Station ID)..."
                    className="glow-input pl-14 h-14 text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-10">Fleet Designation</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Protocol ID</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Mission Commander</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Crew Manifest</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-right pr-10">Mission Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredTeams.map((team: any) => (
                        <motion.tr
                          key={team.teamName}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                          onClick={() => navigate(`/admin/team/${team.teamName}`)}
                          className="group hover:bg-white/[0.03] transition-all cursor-pointer"
                        >
                          <td className="p-6 pl-10">
                            <p className="font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">{team.teamName}</p>
                            <p className="text-[10px] text-slate-600 font-mono mt-1 uppercase tracking-widest">{team.createdBy}</p>
                          </td>
                          <td className="p-6 text-center">
                            <span className="text-cyan-400 font-mono font-black border border-cyan-500/20 px-4 py-1.5 rounded-lg bg-cyan-500/5 text-[11px] shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                              {team.teamNumber || 'T_PENDING'}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[10px] group-hover:scale-110 transition-transform">{team.members?.[0]?.name?.[0] || '?'}</div>
                              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{team.members?.[0]?.name}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex -space-x-3">
                              {(team.members || []).slice(1).map((m: any, i: number) => (
                                <div key={i} className="w-9 h-9 rounded-2xl border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:border-blue-500/30 transition-colors" title={m.name}>
                                  {m.name?.[0] || '?'}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-6 pr-10 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                                Authenticated
                              </span>
                              {team.ideaSubmitted ? (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-purple-500/5 text-purple-400 border border-purple-500/20 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                                  Blueprint Synced
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-slate-800/50 text-slate-500 border border-white/5 uppercase tracking-[0.2em]">
                                  Blueprint Pending
                                </span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredTeams.length === 0 && (
                  <div className="py-24 text-center">
                    <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-xs">No operatives found in current sector</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};


export default AdminDashboard;
