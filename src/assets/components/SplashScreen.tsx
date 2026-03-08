import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import acmLogo from '../acm-logo.png';
import acmWLogo from '../acm-w-logo.png';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0: Logo Slide, 1: Presents + Shine, 2: Odyssey Zoom

  useEffect(() => {
    // Stage 0 (Logos Slide In): Begins immediately

    // Stage 1 (Presents + Shine reveal): Slower transition
    const timer1 = setTimeout(() => setStage(1), 2200);

    // Stage 2 (Hack Odyssey Zoom): Longer build-up
    const timer2 = setTimeout(() => setStage(2), 6500);

    // Final Navigation: Slower exit
    const timer3 = setTimeout(() => navigate('/login'), 11500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-transparent z-[100] flex items-center justify-center overflow-hidden font-orbitron">

      <AnimatePresence>
        {stage < 2 && (
          <motion.div
            key="logos-presents"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.8, filter: 'blur(40px)' }}
            transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
            className="flex flex-col items-center gap-16"
          >
            {/* Logos Section */}
            <div className="flex items-center justify-center gap-12 md:gap-40 px-6 w-full max-w-5xl">
              {/* ACM Logo (Left Side) */}
              <motion.div
                initial={{ x: "-150vw", opacity: 0, rotate: -45, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                <div className="absolute -inset-8 bg-blue-600/20 blur-[60px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                <img src={acmLogo} alt="ACM Logo" className="w-28 h-28 md:w-56 md:h-56 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(37,99,235,0.4)]" />
              </motion.div>

              {/* ACM-W Logo (Right Side) */}
              <motion.div
                initial={{ x: "150vw", opacity: 0, rotate: 45, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                <div className="absolute -inset-8 bg-pink-600/20 blur-[60px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                <img src={acmWLogo} alt="ACM-W Logo" className="w-28 h-28 md:w-56 md:h-56 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(219,39,119,0.4)]" />
              </motion.div>
            </div>

            {/* Subtitle / Presents Text */}
            <AnimatePresence>
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.5, ease: "backOut" }}
                  className="flex flex-col items-center gap-6"
                >
                  <motion.h3
                    animate={{ textShadow: ["0 0 10px rgba(255,255,255,0.2)", "0 0 25px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0.2)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-white font-black text-xl md:text-3xl tracking-[0.6em] uppercase text-center drop-shadow-lg"
                  >
                    ACM <span className="text-slate-600 font-medium tracking-normal">&</span> ACM-W <span className="text-cyan-400">PRESENTS</span>
                  </motion.h3>

                  {/* Shine Line Wrapper */}
                  <div className="relative w-80 md:w-[36rem] h-[3px] bg-white/5 rounded-full overflow-hidden shadow-2xl">
                    <motion.div
                      initial={{ left: "-150%" }}
                      animate={{ left: "150%" }}
                      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
                      className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STAGE 2: HACK ODYSSEY ZOOM (HYPERSPACE) */}
        {stage === 2 && (
          <motion.div
            key="odyssey-title"
            className="fixed inset-0 flex flex-col items-center justify-center z-[110] px-4"
          >
            <div className="relative flex flex-col items-center w-full">
              <motion.h1
                initial={{ scale: 0.1, opacity: 0, letterSpacing: "3em" }}
                animate={{
                  scale: [0.1, 1, 1.05, 2],
                  opacity: [0, 1, 1, 0],
                  letterSpacing: ["3em", "0.1em", "0.1em", "0.5em"],
                  filter: ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"]
                }}
                transition={{
                  duration: 5,
                  ease: [0.65, 0, 0.35, 1],
                  times: [0, 0.4, 0.8, 1]
                }}
                className="text-xl sm:text-2xl md:text-4xl lg:text-7xl font-black odyssey-title uppercase leading-none text-center transform perspective-1000 mb-8 whitespace-nowrap px-4"
              >
                HACK ODYSSEY - 3.0
              </motion.h1>

              {/* Shine Line for Main Title */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  width: ["0%", "100%", "100%", "110%"],
                  scale: [1, 1, 1.1, 1.5]
                }}
                transition={{
                  duration: 5,
                  ease: [0.65, 0, 0.35, 1],
                  times: [0, 0.4, 0.8, 1]
                }}
                className="relative h-1 md:h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.6)]"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-white/50 blur-sm"
                />
              </motion.div>
            </div>

            {/* Hyperspace tunnel rings - Slower expansion */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 30, opacity: 0 }}
                transition={{ duration: 4, delay: i * 0.8, ease: "easeOut" }}
                className="absolute w-96 h-96 border-2 border-cyan-500/10 rounded-full blur-[3px]"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)]" />

      {/* Scanning Line Effect */}
      <motion.div
        animate={{
          top: ['-100%', '200%'],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none z-20"
      />
    </div>
  );
};

export default SplashScreen;
