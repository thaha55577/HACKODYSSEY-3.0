import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../AuthContext';
import acmLogo from '../acm-logo.png';
import acmWLogo from '../acm-w-logo.png';

const RulesPopup = ({ onAccept }: { onAccept: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="glass-card max-w-3xl w-full p-8 md:p-12 border-blue-500/20 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
          >
            Encryption Verified
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black odyssey-title mb-4 tracking-tighter">MISSION DIRECTIVES</h2>
          <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">Standard Operating Procedures for Hack Odyssey 3.0</p>
        </div>

        <div className="space-y-8 mb-12">
          {[
            {
              step: "01",
              title: "LEADERSHIP PROTOCOL",
              color: "from-blue-500 to-cyan-400",
              text: "Operational security dictates that only the designated Team Leader (Commander) should initialize the registration sequence. Multiple entries per fleet will lead to protocol conflicts."
            },
            {
              step: "02",
              title: "TELEMETRY ACCURACY",
              color: "from-purple-500 to-pink-500",
              text: "Ensure every operative's data is verified for error-free transmission. Correct Register IDs and contact coordinates are critical for successful orbital synchronization."
            },
            {
              step: "03",
              title: "INNOVATION UPLOAD",
              color: "from-emerald-500 to-teal-400",
              text: "Deployment is incomplete without your digital blueprint. All teams must upload their finalized project innovation ideas through the Mission Portal immediately after registration."
            }
          ].map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (i * 0.15) }}
              className="flex gap-6 group items-start"
            >
              <div className={`text-3xl md:text-4xl font-black bg-gradient-to-br ${rule.color} bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500`}>
                {rule.step}
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{rule.title}</h4>
                <p className="text-slate-400 leading-relaxed text-xs md:text-sm font-medium">{rule.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAccept}
          className="glow-btn w-full py-6 text-lg uppercase font-black tracking-[0.3em] relative group overflow-hidden"
        >
          <span className="relative z-10">Confirm</span>
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const { setMockUser } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      toast.error('Invalid ID. Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Security Key must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

      if (fullName) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(userCredential.user, { displayName: fullName });
      }

      toast.success('Operative Registered! Please log in.');
      setIsSignup(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This explorer is already registered. Try logging in.');
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      toast.error('Credentials required');
      return;
    }

    // Hardcoded Admin Check
    if (trimmedEmail === 'acmkare26' && password === 'ACM2026') {
      setLoading(true);
      try {
        const mockAdminUser = {
          email: 'ACMKARE26@admin.com',
          displayName: 'Protocol Commander',
          uid: 'admin-acmkare26'
        };
        setMockUser(mockAdminUser);
        toast.success('Welcome Protocol Commander');
        navigate('/admin');
        return;
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      toast.success(`Welcome Operative, ${userCredential.user.displayName || 'Explorer'}`);

      const isAdmin = userCredential.user.email === '99230040469@klu.ac.in' ||
        userCredential.user.email === '99220041803@gmail.com' ||
        userCredential.user.email === 'shaikthaha2005@gmail.com' ||
        userCredential.user.email === 'ACMKARE26@admin.com';

      if (isAdmin) {
        navigate('/admin');
      } else {
        setShowRules(true);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        toast.error('Access Denied. Check your ID or Password.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect Security Key.');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-transparent">

      <AnimatePresence>
        {showRules && (
          <RulesPopup onAccept={() => navigate('/register')} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="glass-card w-full max-w-lg p-12 relative overflow-hidden backdrop-blur-3xl border-white/5"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="text-center mb-12">
          {/* Logos Section */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-blue-600/20 blur-[30px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
              <img src={acmLogo} alt="ACM Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            </motion.div>

            <div className="h-12 w-px bg-white/10" />

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-pink-600/20 blur-[30px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
              <img src={acmWLogo} alt="ACM-W Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(219,39,119,0.4)]" />
            </motion.div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black odyssey-title tracking-tighter mb-3 leading-tight uppercase whitespace-nowrap">
            HACK ODYSSEY - 3.0
          </h2>
          <p className="text-slate-300 font-bold uppercase tracking-[0.4em] text-[10px]">
            {isSignup ? 'Initialize New Neural Link' : 'Secure Authorization Protocol'}
          </p>
        </div>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
          <AnimatePresence mode="wait">
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  className="glow-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="text"
            placeholder={isSignup ? "Email Address" : "Operative ID / Email"}
            className="glow-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Security Key"
            className="glow-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Security Key"
              className="glow-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="glow-btn w-full py-5 text-sm uppercase tracking-[0.2em]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="cyber-loader w-12" />
                  <span className="text-[10px]">Authorizing...</span>
                </div>
              ) : isSignup ? 'Create Account' : 'Engage Portal'}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center space-y-8">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-white/70 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest border-b border-transparent hover:border-white/20 pb-1"
          >
            {isSignup ? 'Already have a link? Sign In' : 'Need new credentials? Register'}
          </button>

          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/5" />
            <span className="relative z-10 bg-[#020617] px-6 text-[9px] text-slate-600 uppercase tracking-[0.3em] font-black">
              Neural Cloud Connect
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                const result = await signInWithPopup(auth, googleProvider);
                const isAdmin = result.user.email === '99230040469@klu.ac.in' ||
                  result.user.email === '99220041803@gmail.com' ||
                  result.user.email === 'shaikthaha2005@gmail.com' ||
                  result.user.email === 'ACMKARE26@admin.com';

                if (isAdmin) {
                  navigate('/admin');
                } else {
                  setShowRules(true);
                }
              } catch (error: any) {
                console.error("Google Auth error:", error);
                if (error.code === 'auth/popup-closed-by-user') {
                  toast.error('Portal connection closed.');
                } else {
                  toast.error(error.message || 'Cloud Connection Failed');
                }
              } finally {
                setLoading(false);
              }
            }}
            className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 flex items-center justify-center gap-4 group transition-all"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-bold text-xs uppercase tracking-widest text-slate-300 group-hover:text-white">Synchronize Google</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

