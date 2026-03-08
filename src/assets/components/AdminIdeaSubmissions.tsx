import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../firebase.ts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Idea {
    teamName: string;
    teamNumber: string;
    projectTitle: string;
    projectType: string;
    sdgs: string[];
    projectDescription: string;
    submittedAt: string;
    submittedBy: string;
}

const AdminIdeaSubmissions = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ideasRef = ref(db, 'ideas');
        const unsubscribe = onValue(ideasRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const ideaList = Object.values(data) as Idea[];
                setIdeas(ideaList);
            } else {
                setIdeas([]);
            }
        });
        return () => off(ideasRef, 'value', unsubscribe);
    }, []);

    const filteredIdeas = ideas.filter(idea =>
        idea.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadIdeaCSV = (idea: Idea) => {
        const headers = ['Field', 'Details'];
        const data = [
            ['Team ID', idea.teamNumber || 'N/A'],
            ['Team Name', idea.teamName],
            ['Project Title', idea.projectTitle],
            ['Project Type', idea.projectType],
            ['SDGs', idea.sdgs.join('; ')],
            ['Submitted By', idea.submittedBy],
            ['Submitted At', new Date(idea.submittedAt).toLocaleString()],
            ['Description', `"${idea.projectDescription.replace(/"/g, '""')}"`]
        ];

        const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${idea.teamName}_Idea_Blueprint.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAllIdeasCSV = () => {
        const headers = ['Team ID', 'Team Name', 'Project Title', 'Type', 'SDGs', 'Submitted By', 'Timestamp', 'Description'];
        const rows = ideas.map(idea => [
            idea.teamNumber || 'N/A',
            idea.teamName,
            idea.projectTitle,
            idea.projectType,
            idea.sdgs.join('; '),
            idea.submittedBy,
            new Date(idea.submittedAt).toLocaleString(),
            `"${idea.projectDescription.replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `All_Teams_Project_Ideas.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAllIdeasPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(18);
        doc.text('HACK ODYSSEY 3.0 - PROJECT IDEAS MASTER LIST', 14, 15);

        const tableData = ideas.map((idea, index) => [
            index + 1,
            idea.teamNumber || 'N/A',
            idea.teamName,
            idea.projectTitle,
            idea.projectType,
            idea.sdgs.join(', ')
        ]);

        autoTable(doc, {
            head: [['#', 'Team ID', 'Team Name', 'Project Title', 'Type', 'SDGs']],
            body: tableData,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 3 }
        });

        doc.save('All_Teams_Project_Ideas.pdf');
    };

    return (
        <div className="min-h-screen bg-transparent relative overflow-x-hidden">

            <div className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                    <div className="flex items-center gap-6">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate('/admin')}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all flex items-center justify-center text-slate-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </motion.button>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-5xl font-black odyssey-title tracking-tighter uppercase leading-none">BATTLE PLANS</h1>
                            <p className="text-slate-500 uppercase tracking-[0.5em] text-[10px] font-bold mt-2">Innovation Blueprint Repository</p>
                        </motion.div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                            <button
                                onClick={downloadAllIdeasCSV}
                                className="glow-btn bg-emerald-500/10 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-6 py-3 flex items-center gap-3 hover:bg-emerald-500/20 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                CSV ARCHIVE
                            </button>
                            <button
                                onClick={downloadAllIdeasPDF}
                                className="glow-btn bg-blue-500/10 border-blue-500/20 text-[9px] font-black uppercase tracking-widest px-6 py-3 flex items-center gap-3 hover:bg-blue-500/20 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                PDF SUMMARY
                            </button>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Scan blueprints..."
                                className="glow-input pl-12 h-12 text-xs font-semibold tracking-wide"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </motion.div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredIdeas.map((idea, idx) => (
                            <motion.div
                                key={idea.teamName}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                layout
                                onClick={() => setSelectedIdea(idea)}
                                className="glass-card p-8 border-white/5 cursor-pointer group hover:border-blue-500/30 transition-all relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="text-[9px] bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] border border-blue-500/10 transition-colors group-hover:bg-blue-500/20">{idea.projectType}</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadIdeaCSV(idea); }}
                                        className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-blue-500/20 text-slate-600 hover:text-blue-400 transition-all flex items-center justify-center group/dl"
                                    >
                                        <svg className="w-4 h-4 group-hover/dl:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </button>
                                </div>
                                <div className="mb-6 relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{idea.teamName}</h3>
                                        <span className="text-cyan-400 font-mono text-[10px] font-black border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-500/5 shadow-[0_0_10px_rgba(34,211,238,0.1)]">{idea.teamNumber || 'T_???'}</span>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Mission Title</p>
                                    <p className="text-slate-300 text-sm font-bold italic line-clamp-2 leading-relaxed">"{idea.projectTitle}"</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto border-t border-white/5 pt-6 relative z-10">
                                    {idea.sdgs?.slice(0, 2).map((sdg, sidx) => (
                                        <div key={sidx} className="text-[8px] font-black text-slate-500 border border-white/5 px-3 py-1 rounded-lg uppercase tracking-widest bg-white/[0.01]">
                                            SDG_{sdg.match(/\d+/)?.[0]}
                                        </div>
                                    ))}
                                    {idea.sdgs?.length > 2 && <div className="text-[8px] font-black text-slate-600 self-center">+{idea.sdgs.length - 2} MORE</div>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredIdeas.length === 0 && (
                    <div className="py-32 text-center">
                        <div className="cyber-spinner mx-auto mb-8 opacity-40" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-xs">No blueprints match current sector scan.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedIdea && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto p-12 border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative custom-scrollbar shadow-inner"
                        >
                            <button
                                onClick={() => setSelectedIdea(null)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center justify-center text-slate-500 group"
                            >
                                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="space-y-12">
                                <header>
                                    <div className="flex flex-wrap items-center gap-4 mb-8">
                                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 uppercase tracking-[0.3em] font-mono leading-none">{selectedIdea.projectType}</span>
                                        <div className="h-px w-8 bg-white/10" />
                                        <span className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-black bg-cyan-500/5 px-4 py-2 rounded-2xl border border-cyan-500/20 leading-none">SECTOR: {selectedIdea.teamNumber || 'N/A'}</span>
                                        <span className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/5 leading-none">FLEET: {selectedIdea.teamName}</span>
                                    </div>
                                    <h2 className="text-6xl font-black odyssey-title tracking-tighter leading-none mb-8 uppercase">{selectedIdea.projectTitle}</h2>
                                    <div className="flex items-center gap-4 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
                                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> TRANSFERRED_{new Date(selectedIdea.submittedAt).toLocaleString()}</span>
                                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> SOURCE_{selectedIdea.submittedBy}</span>
                                    </div>
                                </header>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] flex items-center gap-4">
                                        Sustainability Directives
                                        <span className="h-px flex-1 bg-blue-500/10" />
                                    </h4>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedIdea.sdgs?.map((sdg, i) => (
                                            <div key={i} className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:bg-white/[0.05] transition-all hover:border-white/10">{sdg}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.6em] flex items-center gap-4">
                                        Mission Schematic
                                        <span className="h-px flex-1 bg-emerald-500/10" />
                                    </h4>
                                    <div className="p-10 bg-white/[0.02] rounded-[40px] border border-white/5 text-slate-300 leading-[2] font-medium whitespace-pre-wrap text-base italic shadow-inner">
                                        {selectedIdea.projectDescription}
                                    </div>
                                </div>

                                <div className="flex justify-center pt-12 border-t border-white/5">
                                    <button
                                        onClick={() => downloadIdeaCSV(selectedIdea)}
                                        className="glow-btn px-16 py-6 text-sm flex items-center gap-4 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        <span className="font-black uppercase tracking-[0.4em]">Extract Full Blueprint</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminIdeaSubmissions; 
