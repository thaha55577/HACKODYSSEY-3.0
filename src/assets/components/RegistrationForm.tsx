import { useState, useEffect, useMemo } from 'react';
import { ref as dbRef, set, get } from 'firebase/database';
import { db } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import { useNavigate } from 'react-router-dom';

interface Member {
  name: string;
  regNo: string;
  year: string;
  dept: string;
  phone: string;
  email: string; // Added email field
  collegeSelect: string;
  collegeName: string;
  residenceType?: 'Day Scholar' | 'Hosteller';
  hostelName?: string;
  roomNumber?: string;
  wardenName?: string;
  wardenPhone?: string;
}

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [hasSubmittedIdea, setHasSubmittedIdea] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamLeaderName, setTeamLeaderName] = useState('');
  const [registeredTeamName, setRegisteredTeamName] = useState('');
  const [teamSize, setTeamSize] = useState<4 | 5>(4);

  const initialMember: Member = {
    name: '',
    regNo: '',
    year: '',
    dept: '',
    phone: '',
    email: '', // Added email field
    collegeSelect: 'Kalasalingam University',
    collegeName: 'Kalasalingam University',
    residenceType: 'Day Scholar'
  };

  const [leader, setLeader] = useState<Member>({ ...initialMember });
  const [member1, setMember1] = useState<Member>({ ...initialMember });
  const [member2, setMember2] = useState<Member>({ ...initialMember });
  const [member3, setMember3] = useState<Member>({ ...initialMember });
  const [member4, setMember4] = useState<Member>({ ...initialMember });

  useEffect(() => {
    const checkRegistration = async () => {
      if (!auth.currentUser) {
        setCheckingRegistration(false);
        return;
      }

      const userEmail = auth.currentUser.email;
      const teamsRef = dbRef(db, 'teams');

      try {
        const snapshot = await get(teamsRef);
        let foundTeam = null;

        if (snapshot.exists()) {
          const allTeams = snapshot.val();
          for (const [name, details] of Object.entries(allTeams) as any[]) {
            // Check if user is the creator (leader)
            if (details.createdBy === userEmail) {
              setHasRegistered(true);
              setRegisteredTeamName(name);
              foundTeam = name;
              break;
            }

            // Check if user is a member
            if (details.members && Array.isArray(details.members)) {
              const memberIndex = details.members.findIndex((m: any) => m.email === userEmail);
              if (memberIndex !== -1) {
                setHasRegistered(true);
                setIsTeamMember(true);
                setRegisteredTeamName(name);
                setTeamLeaderName(details.members[0].name); // First member is the leader
                foundTeam = name;
                break;
              }
            }
          }
        }

        if (foundTeam) {
          const ideasSnapshot = await get(dbRef(db, `ideas/${foundTeam}`));
          if (ideasSnapshot.exists()) {
            setHasSubmittedIdea(true);
          }
        }
      } catch (error) {
        console.error("Error checking registration:", error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistration();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleMemberChange = (setter: React.Dispatch<React.SetStateAction<Member>>, field: keyof Member, value: string) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Full Validation
    if (!teamName.trim()) { toast.error('Enter Team Name'); return; }
    if (!agreedToRules) { toast.error('Accept the Mission Rules'); return; }

    const members = [leader, member1, member2, member3];
    if (teamSize === 5) members.push(member4);

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const role = i === 0 ? 'Commander' : `Student 0${i}`;
      if (!m.name || !m.regNo || !m.phone || !m.year || !m.email) {
        toast.error(`Fill all required fields for ${role}`);
        return;
      }
      if (m.collegeSelect === 'Other' && !m.collegeName) {
        toast.error(`Enter College Name for ${role}`);
        return;
      }
      if (m.collegeSelect === 'Kalasalingam University' && m.residenceType === 'Hosteller') {
        if (!m.hostelName || !m.roomNumber || !m.wardenName || !m.wardenPhone) {
          toast.error(`Fill all hostel details for ${role}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const teamsRef = dbRef(db, 'teams');
      const snapshot = await get(teamsRef);
      const allTeams = snapshot.exists() ? snapshot.val() : {};

      // Check for duplicate Team Name
      if (allTeams[teamName]) {
        toast.error('Team Name already exists! Please choose another team name.');
        setLoading(false);
        return;
      }

      // Check for duplicate emails
      const enteredEmails = members.map(m => m.email.toLowerCase());
      const existingEmails: Set<string> = new Set();

      for (const team of Object.values(allTeams) as any[]) {
        if (team.members && Array.isArray(team.members)) {
          team.members.forEach((m: any) => {
            if (m.email) existingEmails.add(m.email.toLowerCase());
          });
        }
      }

      for (const email of enteredEmails) {
        if (existingEmails.has(email)) {
          toast.error(`Email ${email} is already registered with another team.`);
          setLoading(false);
          return;
        }
      }

      // Automate team number generation
      const teamCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      const generatedTeamNumber = `T${(teamCount + 1).toString().padStart(3, '0')}`;

      const payload = {
        createdBy: auth.currentUser?.email,
        teamNumber: generatedTeamNumber,
        members: members,
        timestamp: new Date().toISOString(),
      };

      await set(dbRef(db, 'teams/' + teamName), payload);

      // Notify n8n webhook via GET request with list-formatted data
      try {
        const webhookUrl = new URL('https://thaha0502.app.n8n.cloud/webhook/189f18ce-4a43-440f-b9d1-eee85e49bba7');
        webhookUrl.searchParams.append('teamName', teamName);
        webhookUrl.searchParams.append('teamNumber', generatedTeamNumber);
        webhookUrl.searchParams.append('leaderEmail', auth.currentUser?.email || '');
        webhookUrl.searchParams.append('nameList', members.map(m => m.name).join(', '));
        webhookUrl.searchParams.append('regNoList', members.map(m => m.regNo).join(', '));
        webhookUrl.searchParams.append('yearList', members.map(m => m.year).join(', '));
        webhookUrl.searchParams.append('emailList', members.map(m => m.email).join(', '));

        await fetch(webhookUrl.toString(), {
          method: 'GET',
          mode: 'no-cors'
        });
      } catch (webhookError) {
        console.warn('webhook notification failed:', webhookError);
      }

      toast.success('Registration Successfully Initialized!');
      setHasRegistered(true);
      setRegisteredTeamName(teamName);
    } catch (error: any) {
      toast.error('Mission Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRegistration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-6">
        <div className="grid-bg opacity-20" />
        <div className="cyber-loader mb-8" />
        <div className="text-cyan-400 font-mono text-sm tracking-[0.5em] animate-pulse">SYNCHRONIZING_FLEET_DATA</div>
      </div>
    );
  }

  if (hasRegistered) {
    if (hasSubmittedIdea) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 relative overflow-hidden">
          <div className="grid-bg opacity-30" />
          <div className="nebula-bg opacity-40" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="glass-card max-w-2xl w-full p-16 text-center border-blue-500/10 backdrop-blur-3xl"
          >
            <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-blue-500/20">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-5xl font-black odyssey-title mb-6 leading-tight uppercase tracking-tighter">REGISTRATION COMPLETE</h2>
            <p className="text-slate-500 mb-4 text-lg leading-relaxed font-medium">Your team registration and project details have been successfully submitted.</p>
            {isTeamMember && (
              <p className="text-blue-400 mb-8 text-sm font-black uppercase tracking-[0.2em]">
                You are registered in team <span className="text-white">"{registeredTeamName}"</span> led by <span className="text-white">{teamLeaderName}</span>
              </p>
            )}
            <p className="text-slate-500 mb-12 text-lg leading-relaxed font-medium">Thank you for registering for Hack Odyssey 3.0.</p>

            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.3em] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">All the best for Hack Odyssey 3.0</div>
              <button
                onClick={handleLogout}
                className="w-full py-4 px-8 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/[0.08] hover:text-white transition-all"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 relative overflow-hidden">
        <div className="grid-bg opacity-30" />
        <div className="nebula-bg opacity-40" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="glass-card max-w-2xl w-full p-16 text-center border-emerald-500/10 backdrop-blur-3xl"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-5xl font-black odyssey-title mb-6 leading-tight uppercase tracking-tighter">TEAM REGISTERED</h2>
          <p className="text-slate-500 mb-4 text-lg leading-relaxed font-medium">Your team information has been saved. Please proceed to submit your project proposal.</p>
          {isTeamMember && (
            <p className="text-emerald-400 mb-8 text-sm font-black uppercase tracking-[0.2em]">
              You are already registered in team <span className="text-white">"{registeredTeamName}"</span> led by <span className="text-white">{teamLeaderName}</span>
            </p>
          )}

          <div className="flex flex-col gap-6 max-w-sm mx-auto">
            <button
              onClick={() => navigate('/submit-idea')}
              className="glow-btn flex items-center justify-center py-6 text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]"
            >
              Submit Project Proposal
            </button>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.4em] pt-4"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentMembers = useMemo(() => {
    const members = [leader, member1, member2, member3];
    if (teamSize === 5) members.push(member4);
    return members;
  }, [leader, member1, member2, member3, member4, teamSize]);

  const setters = [setLeader, setMember1, setMember2, setMember3, setMember4];

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">

      <div className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Registration Form
          </div>
          <h1 className="text-5xl md:text-6xl font-black odyssey-title mb-6 tracking-tighter leading-none">HACK ODYSSEY 3.0</h1>
          <p className="text-slate-300 uppercase tracking-[0.6em] text-xs font-bold">Team Registration</p>
        </motion.div>

        <form onSubmit={handleFinalSubmit} className="space-y-20">
          {/* Section 1: Team Alpha */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12 border-blue-500/5 relative group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-blue-500/10 transition-colors" />

            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-3xl border border-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">🚀</div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Team Information</h3>
                  <p className="text-slate-400 text-sm font-medium">Register your team for Hack Odyssey 3.0</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-white uppercase tracking-[0.3em] ml-1">Team Name</label>
                  <input type="text" placeholder="Enter Full Team Name" className="glow-input" value={teamName} onChange={e => setTeamName(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-white uppercase tracking-[0.3em] ml-1">Crew Capacity</label>
                  <div className="grid grid-cols-2 gap-5">
                    {[4, 5].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size as 4 | 5)}
                        className={`py-4 rounded-2xl border transition-all font-black tracking-widest text-xs ${teamSize === size ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[1.02]' : 'bg-white/[0.05] border-white/10 text-white/70 hover:border-white/20 hover:text-white'}`}
                      >
                        {size} MEMBERS
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-900/40 rounded-[32px] border border-white/5 space-y-8 backdrop-blur-md">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Instructions</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 font-bold list-none">
                  {[
                    'Verify all Student IDs before submission',
                    `Ensure all ${teamSize} members are listed`,
                    'Join the Official WhatsApp Group',
                    'Double-check all contact details'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 group cursor-default">
                      <span className="w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-400 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <span className="group-hover:text-slate-300 transition-colors uppercase tracking-widest">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-8 border-t border-white/5">
                  <label className="flex items-center gap-5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={agreedToRules}
                        onChange={e => setAgreedToRules(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${agreedToRules ? 'bg-blue-500 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-transparent border-white/10 group-hover:border-white/20'}`}>
                        {agreedToRules && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">I agree to the terms and conditions of the event</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Student Manifest */}
          <div className="space-y-16">
            <div className="text-center relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>
              <h3 className="relative z-10 inline-block bg-[#010409] px-10 text-3xl font-black text-blue-400 italic tracking-tighter uppercase">Team Members</h3>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {currentMembers.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`glass-card p-12 relative overflow-hidden group ${idx === 0 ? 'border-purple-500/20' : 'border-white/5'}`}
                >
                  <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-5 -translate-y-32 translate-x-32 ${idx === 0 ? 'bg-purple-500' : 'bg-blue-500'} group-hover:opacity-10 transition-opacity`} />

                  {idx === 0 && <div className="absolute top-0 right-0 px-8 py-3 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-bl-[32px] border-b border-l border-purple-500/20 backdrop-blur-md text-center">Team Leader</div>}

                  <div className="space-y-12">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border ${idx === 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'bg-white/5 text-slate-500 border-white/5'}`}>0{idx + 1}</div>
                      <h4 className="text-2xl font-black tracking-tight uppercase">{idx === 0 ? 'Leader' : `Member 0${idx}`} Details</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input type="text" placeholder="Enter Name" className="glow-input" value={m.name} onChange={e => handleMemberChange(setters[idx], 'name', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Registration Number</label>
                        <input type="text" placeholder="Register Number" className="glow-input" value={m.regNo} onChange={e => handleMemberChange(setters[idx], 'regNo', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Academic Year</label>
                        <select className="glow-input" value={m.year} onChange={e => handleMemberChange(setters[idx], 'year', e.target.value)}>
                          <option value="">SELECT YEAR</option>
                          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <input type="email" placeholder="Enter Email" className="glow-input" value={m.email} onChange={e => handleMemberChange(setters[idx], 'email', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                        <input type="text" placeholder="Enter Phone Number" className="glow-input" value={m.phone} onChange={e => handleMemberChange(setters[idx], 'phone', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Department</label>
                        <input type="text" placeholder="Enter Department" className="glow-input" value={m.dept} onChange={e => handleMemberChange(setters[idx], 'dept', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Institution Type</label>
                        <select
                          className="glow-input"
                          value={m.collegeSelect}
                          onChange={e => {
                            const val = e.target.value;
                            const setter = setters[idx];
                            setter(prev => ({
                              ...prev,
                              collegeSelect: val,
                              collegeName: val === 'Kalasalingam University' ? 'Kalasalingam University' : ''
                            }));
                          }}
                        >
                          <option value="Kalasalingam University">Kalasalingam University Student</option>
                          <option value="Other">Other College Student</option>
                        </select>
                      </div>

                      {m.collegeSelect === 'Other' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 lg:col-span-3">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Full Institution Name</label>
                          <input type="text" placeholder="Enter College Name" className="glow-input bg-white/[0.04] border-blue-500/20" value={m.collegeName} onChange={e => handleMemberChange(setters[idx], 'collegeName', e.target.value)} />
                        </motion.div>
                      )}

                      {m.collegeSelect === 'Kalasalingam University' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3 space-y-12 pt-4">
                          <div className="space-y-6">
                            <label className="text-[12px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-3">
                              <span className="w-10 h-px bg-white/20" />
                              Residential Details
                              <span className="w-10 h-px bg-white/20" />
                            </label>
                            <div className="grid grid-cols-2 gap-8">
                              {['Day Scholar', 'Hosteller'].map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => handleMemberChange(setters[idx], 'residenceType', type as any)}
                                  className={`py-5 rounded-[20px] border transition-all font-black text-[11px] tracking-[0.3em] ${m.residenceType === type ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-white/[0.05] border-white/10 text-white hover:border-white/20'}`}
                                >
                                  {type.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>

                          {m.residenceType === 'Hosteller' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-10 bg-white/[0.02] rounded-[32px] border border-white/5 transition-all"
                            >
                              <div className="space-y-3">
                                <label className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Hostel Name</label>
                                <select className="glow-input" value={m.hostelName} onChange={e => handleMemberChange(setters[idx], 'hostelName', e.target.value)}>
                                  <option value="">SELECT BLOCK</option>
                                  {['MH-1', 'MH-2', 'MH-3', 'PG', 'MH-6', 'LH-2', 'LH-3', 'LH-4'].map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Room Number</label>
                                <input type="text" placeholder="Enter Room No" className="glow-input" value={m.roomNumber} onChange={e => handleMemberChange(setters[idx], 'roomNumber', e.target.value)} />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Warden Name</label>
                                <input type="text" placeholder="Enter Name" className="glow-input" value={m.wardenName} onChange={e => handleMemberChange(setters[idx], 'wardenName', e.target.value)} />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Warden Phone</label>
                                <input type="text" placeholder="Enter Contact" className="glow-input" value={m.wardenPhone} onChange={e => handleMemberChange(setters[idx], 'wardenPhone', e.target.value)} />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final Launch Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-10 pt-20 pb-12"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <span className="w-12 h-px bg-emerald-500/20" />
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em]">Ready for Submission</p>
                <span className="w-12 h-px bg-emerald-500/20" />
              </div>
              <p className="text-[10px] text-slate-500 max-w-lg mx-auto uppercase tracking-[0.15em] leading-loose font-bold italic">
                By submitting this form, you confirm that all provided data is accurate and follows the Hack Odyssey guidelines for participation.
              </p>
            </div>

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
              <div className="relative z-10 flex items-center gap-6">
                <span>{loading ? 'SUBMITTING...' : 'SUBMIT REGISTRATION'}</span>
                {!loading && (
                  <motion.svg
                    variants={{ hover: { x: 5 } }}
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                )}
              </div>
            </motion.button>
            <div className="cyber-loader w-64 opacity-30" />
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
