import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import loginBg from '../login_bg.png';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const playSfx = (type: 'transform' | 'click') => {
    const sound = document.getElementById(`sfx-${type}`) as HTMLAudioElement;
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.4;
      sound.play().catch(() => {
        // Auto-play policy might block this without interaction
      });
    }
  };

  const validateEmail = (email: string) => {
    if (email === '99230040469') return true;
    if (email === '99220041803@gmail.com') return true;
    const regex = /@klu\.ac\.in$/;
    return regex.test(email);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    playSfx('click');

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      toast.error('Email must end with @klu.ac.in');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const signupEmail = trimmedEmail === '99230040469' ? '99230040469@klu.ac.in' : trimmedEmail;
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, password);

      // Set display name for admin recognition
      if (fullName) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(userCredential.user, { displayName: fullName });
      }

      toast.success('Account created successfully!');
      playSfx('transform');
      setEmail('');
      setFullName('');
      setPassword('');
      setConfirmPassword('');
      setIsSignup(false);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email is already registered');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playSfx('click');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const loginEmail = trimmedEmail === '99230040469' ? '99230040469@klu.ac.in' : trimmedEmail;
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      toast.success('Login successful!');
      playSfx('transform');

      if (userCredential.user.email === '99230040469@klu.ac.in' || userCredential.user.email === '99220041803@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/register');
      }
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        if (trimmedEmail === '99230040469') {
          toast.error('Admin account not found. Please switch to "Sign Up" to create it.');
        } else {
          toast.error('Invalid email or password');
        }
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Invalid password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Dark overlay to ensure text readability if needed, but keeping edges clear as requested */}
      {/* We can add a slight vignette if needed, but user asked for clear edges */}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="tf-card w-full max-w-md z-10 p-8 backdrop-blur-md bg-black/40 border border-white/10 shadow-2xl"
      >
        <div className="glitch-overlay"></div>
        <div className="frame-corner top-left"></div>
        <div className="frame-corner bottom-right"></div>

        <h2 className="cybertron-title text-3xl mb-8">
          {isSignup ? 'INITIATE PROTOCOL' : 'ACCESS TERMINAL'}
        </h2>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="relative z-10">
          {isSignup && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="FULL NAME / ID (Ex: Thaha 2023-CSE)"
                className="glow-input bg-black/50"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-6">
            <input
              type="text"
              placeholder="IDENTIFIER (@klu.ac.in)"
              className="glow-input bg-black/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="ACCESS CODE"
              className="glow-input bg-black/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignup && (
            <div className="mb-6">
              <input
                type="password"
                placeholder="CONFIRM CODE"
                className="glow-input bg-black/50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="glow-btn w-full mb-6"
            disabled={loading}
            onMouseDown={() => playSfx('click')}
          >
            {loading ? 'PROCESSING...' : isSignup ? 'REGISTER UNIT' : 'ENGAGE'}
          </button>
        </form>

        <div className="text-center mb-6 relative z-10">
          <button
            onClick={() => {
              playSfx('click');
              setIsSignup(!isSignup);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-cyan-300 hover:text-cyan-100 transition-colors font-orbitron text-sm tracking-wider"
          >
            {isSignup
              ? 'ALREADY REGISTERED? LOGIN'
              : "NEW UNIT? INITIALIZE"}
          </button>
        </div>

        <div className="border-t border-cyan-800/30 pt-6 relative z-10">
          <button
            type="button"
            onClick={async () => {
              playSfx('click');
              try {
                setLoading(true);
                const result = await signInWithPopup(auth, googleProvider);
                const email = result.user.email;

                if (!email?.endsWith('@klu.ac.in')) {
                  toast.error('Only KLU institutional emails (@klu.ac.in) are allowed');
                  await auth.signOut();
                  return;
                }

                toast.success('Login successful!');
                playSfx('transform');

                if (email === '99230040469@klu.ac.in' || email === '99220041803@gmail.com') {
                  navigate('/admin');
                } else {
                  navigate('/register');
                }
              } catch (error: any) {
                console.error('Google Sign-in Error:', error);
                if (error.code === 'auth/popup-closed-by-user') return;

                if (error.code === 'auth/unauthorized-domain') {
                  toast.error(`Domain unauthorized! Add "${window.location.hostname}" to Firebase Console > Auth > Settings > Authorized Domains`);
                } else if (error.code === 'auth/popup-blocked') {
                  toast.error('Popup blocked. Please allow popups for this site.');
                } else {
                  toast.error(`Google sign-in failed: ${error.message}`);
                }
              } finally {
                setLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-2 glow-btn"
            style={{ borderColor: '#4285F4', color: '#fff' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            GOOGLE ACCESS
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

