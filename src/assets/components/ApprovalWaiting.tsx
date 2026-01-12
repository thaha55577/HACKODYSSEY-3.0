import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ApprovalWaiting = () => {
    const navigate = useNavigate();

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
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-2xl p-8 border border-cyan-500/30 text-center relative z-10"
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
                        📡
                    </motion.div>
                    <h2 className="text-3xl text-yellow-400 font-bold mb-4 tracking-widest" style={{ fontFamily: 'Orbitron' }}>
                        TRANSMISSION INTERCEPTED
                    </h2>
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-6"></div>
                </div>

                <div className="space-y-6 text-gray-300 font-mono mb-8">
                    <p className="text-xl text-cyan-400 animate-pulse">
                        WAITING FOR ADMIN CLEARANCE...
                    </p>
                    <p className="leading-relaxed">
                        Your registration request has been sent to the <span className="text-yellow-500">Cybertron Command Center</span>.
                        Once an admin grants you access, this terminal will automatically unlock.
                    </p>

                    <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20 text-sm">
                        <p className="text-cyan-300 mb-2 underline">Status Details:</p>
                        <ul className="text-left space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                                Protocol: Secure Verification
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                Node: Pending Authorization
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="glow-btn border-cyan-500 text-cyan-400 hover:bg-cyan-900/20"
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
