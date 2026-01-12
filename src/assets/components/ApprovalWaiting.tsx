import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const ApprovalWaiting = () => {
    const navigate = useNavigate();
    const { permissionStatus } = useAuth();
    const isRejected = permissionStatus === 'rejected';

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('System Logged Out');
            navigate('/login');
        } catch (error) {
            toast.error('Shutdown failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-transparent to-transparent"></div>
                {isRejected && (
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/50 via-transparent to-transparent"></div>
                )}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card w-full max-w-2xl p-8 border ${isRejected ? 'border-red-500/50' : 'border-cyan-500/30'} text-center relative z-10`}
            >
                <div className="mb-8">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4"
                    >
                        {isRejected ? '🚫' : '📡'}
                    </motion.div>
                    <h2 className={`text-3xl ${isRejected ? 'text-red-500' : 'text-yellow-400'} font-bold mb-4 tracking-widest`} style={{ fontFamily: 'Orbitron' }}>
                        {isRejected ? 'ACCESS DENIED' : 'TRANSMISSION INTERCEPTED'}
                    </h2>
                    <div className={`h-1 w-full bg-gradient-to-r from-transparent ${isRejected ? 'via-red-500' : 'via-cyan-500'} to-transparent mb-6`}></div>
                </div>

                <div className="space-y-6 text-gray-300 font-mono mb-8">
                    <p className={`text-xl ${isRejected ? 'text-red-400' : 'text-cyan-400'} animate-pulse uppercase`}>
                        {isRejected ? 'AUTHORIZATION REVOKED' : 'WAITING FOR ADMIN CLEARANCE...'}
                    </p>
                    <p className="leading-relaxed">
                        {isRejected
                            ? 'Your access to the registration protocol has been declined by the Cybertron Command Center. Please contact the administrator for further details.'
                            : 'Your registration request has been sent to the Cybertron Command Center. Once an admin grants you access, this terminal will automatically unlock.'
                        }
                    </p>

                    <div className={`p-4 ${isRejected ? 'bg-red-900/20 border-red-500/20' : 'bg-cyan-900/20 border-cyan-500/20'} rounded-lg border text-sm`}>
                        <p className={`${isRejected ? 'text-red-300' : 'text-cyan-300'} mb-2 underline`}>Status Details:</p>
                        <ul className="text-left space-y-2">
                            <li className="flex items-center gap-2">
                                <span className={`w-2 h-2 ${isRejected ? 'bg-red-500' : 'bg-yellow-400'} rounded-full animate-ping`}></span>
                                Protocol: {isRejected ? 'Security Lockdown' : 'Secure Verification'}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`w-2 h-2 ${isRejected ? 'bg-red-400' : 'bg-cyan-400'} rounded-full`}></span>
                                Node: {isRejected ? 'Rejected' : 'Pending Authorization'}
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className={`glow-btn ${isRejected ? 'border-red-500 text-red-400 hover:bg-red-900/20' : 'border-cyan-500 text-cyan-400 hover:bg-cyan-900/20'}`}
                    >
                        REFRESH LINK
                    </button>
                    <button
                        onClick={handleLogout}
                        className="glow-btn border-red-500 text-red-400 hover:bg-red-900/20"
                    >
                        ABORT MISSION
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">
                        System ID: {auth.currentUser?.uid.slice(0, 8)} | User: {auth.currentUser?.email}
                    </p>
                </div>
            </motion.div>

            {/* Decorative scanline */}
            <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
        </div>
    );
};

export default ApprovalWaiting;
