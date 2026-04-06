'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const QUESTIONS = [
  { q: "What should you do if your clothes catch fire?", options: ["Run", "Stop, Drop, and Roll", "Jump in water", "Remove clothes"], answer: 1 },
  { q: "How often should you test smoke detectors?", options: ["Weekly", "Monthly", "Yearly", "Never"], answer: 1 },
  { q: "What is the emergency number for fire in Cebu?", options: ["911", "160", "117", "143"], answer: 1 },
  { q: "What should you do first when you discover a fire?", options: ["Fight the fire", "Alert others and evacuate", "Call family", "Take valuables"], answer: 1 },
  { q: "How low should you stay when escaping a fire?", options: ["Stand tall", "Crawl low under smoke", "Walk normally", "Jump"], answer: 1 },
  { q: "What should you NEVER use on a grease fire?", options: ["Fire extinguisher", "Baking soda", "Water", "Lid"], answer: 2 },
  { q: "How many escape routes should every home have?", options: ["One", "Two", "Three", "Four"], answer: 1 },
  { q: "What does PASS stand for in fire extinguisher use?", options: ["Pull, Aim, Squeeze, Sweep", "Push, Alert, Stop, Save", "Panic, Alert, Stop, Stand", "Pull, Alert, Squeeze, Stop"], answer: 0 },
  { q: "Where should you meet after evacuating?", options: ["Inside the house", "At a designated meeting point", "Anywhere safe", "In the car"], answer: 1 },
  { q: "Should you go back inside a burning building?", options: ["Yes, for pets", "Yes, for valuables", "Never", "Only if safe"], answer: 2 },
];

export default function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const finalScore = newAnswers.reduce((acc, ans, idx) => acc + (ans === QUESTIONS[idx].answer ? 1 : 0), 0);
      setScore(finalScore);
      setShowResult(true);
      const token = localStorage.getItem('access_token');
      fetch('https://firebackend-tsi7.onrender.com/api/quiz-results/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore, total_questions: QUESTIONS.length }),
      });
    }
  };

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40 }}>🎓</div>
    </div>
  );

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const percentage = Math.round((score / QUESTIONS.length) * 100);
  const passed = percentage >= 80;

  if (showResult) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '36px 28px', maxWidth: 480, width: '100%', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{passed ? '🎉' : '📚'}</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#1e293b', marginBottom: 8 }}>{passed ? 'Congratulations!' : 'Keep Learning!'}</div>
          <div style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>Your Score: <strong style={{ color: passed ? '#16a34a' : '#dc2626' }}>{score}/{QUESTIONS.length} ({percentage}%)</strong></div>

          {passed ? (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>✅ You Passed!</div>
              <div style={{ color: '#475569', fontSize: 13 }}>You've earned your Fire Safety Certificate!</div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
              <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Need 80% to pass</div>
              <div style={{ color: '#475569', fontSize: 13 }}>Review fire safety tips and try again!</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {passed && (
              <a href="/certificate" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '12px', borderRadius: 12, textDecoration: 'none', fontSize: 14 }}>🏆 View Certificate</a>
            )}
            <a href="/" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600, padding: '12px', borderRadius: 12, textDecoration: 'none', fontSize: 14 }}>← Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Back to Home</a>
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Question {currentQ + 1} of {QUESTIONS.length}</div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '28px 24px', maxWidth: 560, width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, backgroundColor: '#fef2f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎓</div>
          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 17 }}>Fire Safety Quiz</div>
        </div>

        {/* Progress */}
        <div style={{ backgroundColor: '#f1f5f9', borderRadius: 99, height: 8, marginBottom: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(to right, #dc2626, #ea580c)', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 24 }}>{Math.round(progress)}% complete</div>

        {/* Question */}
        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, marginBottom: 18, lineHeight: 1.5 }}>{QUESTIONS[currentQ].q}</div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {QUESTIONS[currentQ].options.map((option, idx) => (
            <button key={idx} onClick={() => handleAnswer(idx)}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b', fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}>
              <span style={{ color: '#dc2626', fontWeight: 800, marginRight: 10 }}>{String.fromCharCode(65 + idx)}.</span>{option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
