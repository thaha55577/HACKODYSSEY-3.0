import { useState, useEffect } from 'react';
import { ref as dbRef, set, get } from 'firebase/database';
import { db, auth } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SDG_LIST = [
    "ZERO HUNGER & SUSTAINABLE AGRICULTURE (SDG 2)",
    "GOOD HEALTH & WELL-BEING INNOVATION (SDG 3)",
    "QUALITY EDUCATION & LIFELONG LEARNING (SDG 4)",
    "CLEAN WATER & SANITATION (SDG 6)",
    "SUSTAINABLE CITIES & COMMUNITIES (SDG 11)",
    "CLIMATE ACTION & ENVIRONMENTAL MONITORING (SDG 13)"
];

const IdeaSubmission = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamNumber, setTeamNumber] = useState('');
    const [projectType, setProjectType] = useState('');
    const [selectedSDGs, setSelectedSDGs] = useState<string[]>([]);
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
        const fetchTeamInfo = async () => {
            if (!auth.currentUser) return;
            const userEmail = auth.currentUser.email;
            const teamsRef = dbRef(db, 'teams');
            const snapshot = await get(teamsRef);
            if (snapshot.exists()) {
                const teams = snapshot.val();
                const userTeam = Object.entries(teams).find(([_, details]: [string, any]) => details.createdBy === userEmail);
                if (userTeam) {
                    const details = userTeam[1] as any;
                    setTeamName(userTeam[0]);
                    setTeamNumber(details.teamNumber || '');

                    // Determine if team is internal (leader's college)
                    const isInternalStudent = details.members?.[0]?.collegeSelect === 'Kalasalingam University';
                    setIsInternal(isInternalStudent);

                    // Check if idea already submitted
                    const ideaRef = dbRef(db, `ideas/${userTeam[0]}`);
                    const ideaSnap = await get(ideaRef);
                    if (ideaSnap.exists()) {
                        setHasSubmitted(true);
                        const data = ideaSnap.val();
                        setProjectType(data.projectType);
                        setSelectedSDGs(data.sdgs || []);
                        setProjectTitle(data.projectTitle);
                        setProjectDescription(data.projectDescription);
                    }
                } else {
                    toast.error("Finish registration protocol first.");
                    navigate('/register');
                }
            }
        };
        fetchTeamInfo();
    }, [navigate]);

    const toggleSDG = (sdg: string) => {
        setSelectedSDGs(prev =>
            prev.includes(sdg) ? prev.filter(s => s !== sdg) : [...prev, sdg]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectType) { toast.error("Select Project Type"); return; }

        // Validation mapping: If internal AND software, no title/desc or SDG needed. Otherwise, needed.
        const requiresDetails = !(isInternal && projectType === 'SOFTWARE');

        if (requiresDetails && selectedSDGs.length === 0) {
            toast.error("Select at least one SDG");
            return;
        }

        if (requiresDetails) {
            if (!projectTitle.trim()) { toast.error("Enter Project Title"); return; }
            if (!projectDescription.trim()) { toast.error("Enter Project Description"); return; }
        }

        setLoading(true);
        try {
            const payload = {
                projectType,
                sdgs: selectedSDGs,
                projectTitle: requiresDetails ? projectTitle : 'At Hackathon',
                projectDescription: requiresDetails ? projectDescription : 'Problem statement will be provided at the hackathon',
                submittedAt: new Date().toISOString(),
                teamName,
                teamNumber,
                submittedBy: auth.currentUser?.email
            };

            await set(dbRef(db, `ideas/${teamName}`), payload);
            toast.success("Project Blueprint Uploaded!");
            setHasSubmitted(true);
        } catch (error: any) {
            toast.error("Upload Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (hasSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 relative overflow-hidden">
                <div className="grid-bg opacity-30" />
                <div className="nebula-bg opacity-40" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="glass-card max-w-2xl w-full p-16 text-center border-blue-500/10 backdrop-blur-3xl"
                >
                    <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-5xl font-black odyssey-title mb-6 leading-tight uppercase tracking-tighter">PROPOSAL SUBMITTED</h2>
                    <p className="text-slate-500 mb-12 text-lg leading-relaxed font-medium">Your project proposal has been successfully submitted to the event organizers.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="glow-btn px-16 py-5 text-sm uppercase tracking-[0.2em]"
                    >
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent relative overflow-x-hidden">

            <div className="relative z-10 py-24 px-6 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        Part 02: Project Proposal
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black odyssey-title mb-6 tracking-tighter leading-none uppercase">Project Details</h1>
                    <p className="text-slate-300 uppercase tracking-[0.6em] text-xs font-bold font-mono">Team ID: {teamNumber || 'SYNCING...'} • {teamName || 'AUTH_ACTIVE'}</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-20">
                    {/* Project Type */}
                    <section
                        className="glass-card p-12 border-blue-500/5 relative group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-xl font-black text-blue-400 border border-blue-500/10">01</div>
                            <h3 className="text-3xl font-black text-white tracking-tight uppercase">Project Category</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['SOFTWARE', 'HARDWARE', 'BOTH SOFTWARE AND HARDWARE'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setProjectType(type)}
                                    className={`py-8 px-6 rounded-3xl border transition-all duration-500 font-black text-[11px] tracking-[0.25em] leading-loose flex flex-col items-center justify-center text-center gap-4 ${projectType === type ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-[1.05]' : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/30 hover:text-white hover:bg-white/[0.08]'}`}
                                >
                                    <div className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${projectType === type ? 'bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,1)] scale-110' : 'bg-white/10'}`} />
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Conditional Sections based on Project Type */}
                    {isInternal && projectType === 'SOFTWARE' && (
                        <section
                            className="glass-card p-12 border-blue-500/10 relative group text-center"
                        >
                            <div className="flex flex-col items-center gap-8">
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-500/20">ℹ️</div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-relaxed">
                                    problem statements will be provided at the HACKATHON.<br />
                                    <span className="text-blue-400 text-sm mt-4 block">You can select your project path from the provided list at the venue.</span>
                                </h3>
                            </div>
                        </section>
                    )}

                    {(!isInternal || projectType !== 'SOFTWARE') && projectType && (
                        <>
                            {/* SDG Selection */}
                            <section
                                className="glass-card p-12 border-purple-500/5 relative group"
                            >
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-xl font-black text-purple-400 border border-purple-500/10">02</div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight uppercase">Sustainability Goals</h3>
                                        <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-1">Select the SDGs your project addresses</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {SDG_LIST.map((sdg, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleSDG(sdg)}
                                            className={`p-6 rounded-[24px] border transition-all duration-300 text-[10px] font-black text-left tracking-widest flex items-center gap-6 group/btn ${selectedSDGs.includes(sdg) ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.25)]' : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${selectedSDGs.includes(sdg) ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-white/10 group-hover/btn:border-white/20'}`}>
                                                {selectedSDGs.includes(sdg) && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className="uppercase leading-relaxed">{sdg}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Project Details */}
                            <section
                                className="glass-card p-12 border-emerald-500/5 relative group"
                            >
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl font-black text-emerald-400 border border-emerald-500/10">03</div>
                                    <h3 className="text-3xl font-black text-white tracking-tight uppercase">Project Information</h3>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.4em] ml-1">Project Title</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Name of Project"
                                            className="glow-input text-lg font-black tracking-tight"
                                            value={projectTitle}
                                            onChange={e => setProjectTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.4em] ml-1">Project Description</label>
                                        <textarea
                                            placeholder="Enter a detailed description of your project..."
                                            className="glow-input min-h-[300px] py-8 resize-y text-white font-medium leading-relaxed"
                                            value={projectDescription}
                                            onChange={e => setProjectDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Hardware Note */}
                            {projectType !== 'SOFTWARE' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 rounded-[32px] bg-amber-500/5 border border-amber-500/20 text-center"
                                >
                                    <p className="text-amber-400 text-xs font-black uppercase tracking-[0.4em] mb-2 shadow-amber-500/20">
                                        ⚠️ MISSION REQUIREMENT
                                    </p>
                                    <p className="text-white text-sm font-bold uppercase tracking-widest leading-relaxed">
                                        BRING YOUR OWN COMPONENTS FOR HARDWARE
                                    </p>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Submit */}
                    <div
                        className="flex flex-col items-center gap-10 pt-10 pb-20"
                    >
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] animate-pulse italic">Preparing submission sequence</p>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover="hover"
                            whileTap="tap"
                            className="relative px-24 py-8 rounded-2xl bg-white/5 border-2 border-blue-500/20 text-white font-black tracking-[0.4em] text-xl uppercase transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <motion.div
                                variants={{
                                    hover: { scale: 20, opacity: 1 },
                                    tap: { scale: 18 }
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full -z-0 transition-opacity duration-300"
                                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                            />
                            <div className="relative z-10 flex items-center gap-7">
                                <span>{loading ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}</span>
                                {!loading && (
                                    <motion.svg
                                        variants={{ hover: { x: 5 } }}
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </motion.svg>
                                )}
                            </div>
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IdeaSubmission; 
