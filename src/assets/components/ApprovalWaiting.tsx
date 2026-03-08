import { motion } from 'framer-motion';
import { auth } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const ApprovalWaiting = () => {
    const navigate = useNavigate();
    const { permissionStatus, logout } = useAuth();
    const isRejected = permissionStatus === 'rejected';

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('System Logged Out');
            navigate('/login');
        } catch (error) {
            toast.error('Shutdown failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-transparent relative overflow-hidden">

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className={`glass-card w-full max-w-2xl p-16 border-blue-500/10 backdrop-blur-3xl text-center relative z-10 overflow-hidden`}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl opacity-50" />

                <div className="relative z-10">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                    >
                        <span className="text-5xl">{isRejected ? '🚫' : '📡'}</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-black odyssey-title tracking-tighter uppercase leading-none mb-4">
                        {isRejected ? 'ACCESS_DENIED' : 'VERIFYING_CLEARANCE'}
                    </h2>
                    <p className="text-slate-500 uppercase tracking-[0.5em] text-[10px] font-black mb-12 italic animate-pulse">
                        {isRejected ? 'Protocol: Security Lockdown' : 'Mission Status: Transmission Intercepted'}
                    </p>

                    <div className="space-y-8 text-slate-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
                        <p className="text-lg">
                            {isRejected
                                ? 'Your access to the registration protocol has been declined by the Cybertron Command Center. Please contact the administrator for further details.'
                                : 'Your registration request has been sent to the Cybertron Command Center. Once an admin grants you access, this terminal will automatically unlock.'
                            }
                        </p>

                        <div className={`p-8 ${isRejected ? 'bg-rose-500/5 border-rose-500/20' : 'bg-cyan-500/5 border-cyan-500/20'} rounded-3xl border shadow-inner text-sm`}>
                            <p className={`${isRejected ? 'text-rose-400' : 'text-cyan-400'} font-black uppercase tracking-[0.3em] mb-4 text-[10px]`}>Protocol Diagnostics:</p>
                            <ul className="text-left space-y-4">
                                <li className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
                                    <span className={`w-2.5 h-2.5 ${isRejected ? 'bg-rose-500 outline-rose-500/30' : 'bg-yellow-400 outline-yellow-400/30'} rounded-full animate-pulse outline outline-4`}></span>
                                    Status: {isRejected ? 'Secure_Locked' : 'Verification_Pending'}
                                </li>
                                <li className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
                                    <span className={`w-2.5 h-2.5 ${isRejected ? 'bg-rose-400' : 'bg-cyan-400'} rounded-full`}></span>
                                    Node: {isRejected ? 'Terminal_Rejected' : 'Awaiting_Signal'}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => window.location.reload()}
                            className={`glow-btn px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] relative group overflow-hidden ${isRejected ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'}`}
                        >
                            <span className="relative z-10">RETRY_LINK</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="glow-btn bg-rose-500/10 border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5 hover:bg-rose-500/20"
                        >
                            ABORT_MISSION
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 opacity-50">
                        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest font-black leading-loose">
                            Operative_UID: {auth.currentUser?.uid.slice(0, 12)} <br />
                            Auth_Channel: {auth.currentUser?.email}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ApprovalWaiting;
