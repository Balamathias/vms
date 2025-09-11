"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Vote, Trophy, CheckCircle, Sparkles, Star, Users, Award, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AwardsShowcase from '@/components/main/award-showcase';
import Navbar from '@/components/main/navbar';
import { Student, RecentWinner } from '@/@types/db';

interface HomeProps {
  user?: Student;
  winners?: RecentWinner[];
}

// Motion helpers for consistency
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
  transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

type IconType = React.ComponentType<{ className?: string }>;

interface ActionCardProps {
  icon: IconType;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  // Tailwind classes included as literals at call sites to avoid purge issues
  cardGradient: string; // e.g. "from-blue-500/20 to-purple-500/20"
  blobTopGradient: string; // e.g. "from-blue-400/20 to-purple-400/20"
  blobBottomGradient: string; // e.g. "from-cyan-400/20 to-blue-400/20"
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onClick,
  cardGradient,
  blobTopGradient,
  blobBottomGradient,
  delay = 0,
}) => (
  <motion.div
    className="group relative overflow-hidden backdrop-blur-xl bg-white/5 hover:bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    initial="hidden"
    animate="visible"
    custom={delay}
    variants={fadeInUp}
    whileHover={{ y: -6, scale: 1.01 }}
  >
    {/* Floating background elements */}
    <div className={`absolute top-3 right-3 w-12 h-12 bg-gradient-to-br ${blobTopGradient} rounded-full blur-xl group-hover:scale-110 transition-transform duration-500`}></div>
    <div className={`absolute bottom-3 left-3 w-8 h-8 bg-gradient-to-br ${blobBottomGradient} rounded-full blur-lg group-hover:scale-110 transition-transform duration-500 delay-100`}></div>

    <div className="relative z-10 flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${cardGradient} border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
      </div>

      <p className="text-white/70 mb-6 flex-grow text-sm sm:text-base leading-relaxed">{description}</p>

      <button
        onClick={onClick}
        className={`w-full group/btn flex items-center justify-center gap-2 py-3 px-4 backdrop-blur-sm bg-gradient-to-r ${cardGradient} hover:brightness-110 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 mt-auto hover:shadow-lg`}
        aria-label={buttonLabel}
      >
        <Icon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  </motion.div>
);

const Home = ({ user, winners }: HomeProps) => {
  const router = useRouter();

  const handleVoteClick = (href?: string) => {
    if (user) router.push(href || '/positions');
    else router.push('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserLevel = (level: number) => {
    const levels: Record<number, string> = {
      100: 'First Year',
      200: 'Second Year',
      300: 'Third Year',
      400: 'Fourth Year',
      500: 'Final Year',
    };
    return levels[level] || `${level} Level`;
  };

  return (
    <>
      <header>
        <Navbar user={user} />
      </header>

      <main className="min-h-screen bg-gradient-to-br px-3 sm:px-6 md:px-10 flex flex-col items-center py-14 sm:py-20">
        {/* Personalized Welcome Section */}
        {user ? (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="w-full max-w-5xl mb-8 sm:mb-12"
            aria-label="Welcome"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-xl delay-1000" />
              </div>
              <div className="relative z-10 p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                      <span className="text-white/70 text-sm sm:text-base">{getGreeting()},</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{user.full_name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-white/70 text-xs sm:text-sm">
                      <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>{user.matric_number}</span></div>
                      <div className="flex items-center gap-1"><Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>{getUserLevel(user.level)}</span></div>
                      <div className="hidden md:flex items-center gap-1"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="capitalize">{user.gender}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 backdrop-blur-sm shrink-0">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={`${user.full_name} profile photo`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-white/80 mt-4 text-sm sm:text-base">
                  Ready to make your voice heard? Your vote helps recognize outstanding achievements. ✨
                </p>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-8 sm:mb-12 px-2 w-full max-w-3xl"
            aria-label="Welcome"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white/90 mb-4">
              Welcome to Ahmadu Bello University's
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 text-transparent bg-clip-text">Graduate Awards Platform</span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base mx-auto">
              Join thousands of students and graduands in celebrating excellence and recognizing outstanding achievements.
            </p>
          </motion.section>
        )}

        {/* Action Cards */}
        <section className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <ActionCard
              icon={Vote}
              title="Cast Your Vote"
              description={
                user
                  ? `Hello ${user.full_name.split(' ')[0]}! Ready to vote for the most outstanding students and graduands? Your voice makes a difference! 🗳️`
                  : 'Join the voting process and help recognize exceptional students and graduands who have made their mark at ABU.'
              }
              buttonLabel={user ? 'Start Voting Now' : 'Login to Vote'}
              onClick={() => handleVoteClick('/positions')}
              cardGradient="from-blue-500/20 to-purple-500/20"
              blobTopGradient="from-blue-400/20 to-purple-400/20"
              blobBottomGradient="from-cyan-400/20 to-blue-400/20"
              delay={0}
            />

            <ActionCard
              icon={Trophy}
              title="Hall of Fame"
              description="Discover the incredible achievements of past award recipients and get inspired by their success stories! 🏆"
              buttonLabel="Explore Winners"
              onClick={() => handleVoteClick('/results')}
              cardGradient="from-yellow-500/20 to-orange-500/20"
              blobTopGradient="from-yellow-400/20 to-orange-400/20"
              blobBottomGradient="from-amber-400/20 to-yellow-400/20"
              delay={0.1}
            />

            <ActionCard
              icon={CheckCircle}
              title={user ? `Ready ${user.full_name.split(' ')[0]}?` : 'Get Started Today'}
              description={
                user
                  ? 'Your participation celebrates excellence and recognizes the achievements of your fellow students and graduands! 🌟'
                  : 'Join the community and be part of celebrating academic excellence at Ahmadu Bello University.'
              }
              buttonLabel={user ? 'Cast Your Vote' : 'Join Now'}
              onClick={() => handleVoteClick(user ? '/positions' : '/login')}
              cardGradient="from-green-500/20 to-emerald-500/20"
              blobTopGradient="from-green-400/20 to-emerald-400/20"
              blobBottomGradient="from-teal-400/20 to-green-400/20"
              delay={0.2}
            />
          </div>
        </section>

        {/* Stats Section for logged-in users */}
        {user && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={3}
            className="w-full max-w-5xl mt-10 sm:mt-14"
            aria-label="Your stats"
          >
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              {[
                { icon: Calendar, label: 'Member Since', value: new Date(user.date_joined).getFullYear() },
                { icon: Award, label: 'Your Level', value: getUserLevel(user.level) },
                { icon: Users, label: 'Community', value: 'ABU Graduate' },
                { icon: Clock, label: 'Status', value: user.status },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 text-center"
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 mx-auto mb-1 sm:mb-2" />
                  <dt className="text-xs sm:text-sm text-white/60 mb-1">{stat.label}</dt>
                  <dd className="text-sm sm:text-base font-semibold text-white">{String(stat.value)}</dd>
                </motion.div>
              ))}
            </dl>
          </motion.section>
        )}

        {/* Winners Showcase */}
        {winners?.length ? (
          <section className="w-full mt-10 sm:mt-14">
            <AwardsShowcase winners={winners} />
          </section>
        ) : null}
      </main>

      <footer className="w-full mt-10 mb-6 flex items-center justify-center">
        <a
          href="https://matiecodes-folio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-white/60 hover:text-white/80 transition-colors inline-flex items-center gap-1 group underline"
        >
          <span className="opacity-80 group-hover:opacity-100 transition-opacity">Built with</span>
          <span className="text-pink-400 animate-pulse group-hover:scale-110 transition-transform">💖</span>
          <span className="opacity-80 group-hover:opacity-100 transition-opacity">by</span>
          <span className="font-semibold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Mathias</span>
        </a>
      </footer>
    </>
  );
};

export default Home;