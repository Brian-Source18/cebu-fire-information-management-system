'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Certificate() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user) {
      const token = localStorage.getItem('access_token');
      fetch('http://localhost:8000/api/quiz-results/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setResult(data.find((r: any) => r.passed) || null); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40 }}>🏆</div>
    </div>
  );
  if (!user) return null;

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '40px 28px', maxWidth: 440, width: '100%', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 20, marginBottom: 10 }}>No Certificate Yet</div>
          <div style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Take the Fire Safety Quiz and pass with 80% or higher to earn your certificate!</div>
          <a href="/quiz" style={{ display: 'block', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '12px', borderRadius: 12, textDecoration: 'none', fontSize: 14, marginBottom: 12 }}>Take Quiz Now</a>
          <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif', padding: '24px 16px' }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Actions */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Back to Home</a>
          <button onClick={() => window.print()} style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13 }}>🖨️ Print Certificate</button>
        </div>

        {/* Certificate */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '3px solid #fbbf24', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Certificate of Completion</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Fire Safety Training</div>
          </div>

          {/* Body */}
          <div style={{ padding: '40px 32px', textAlign: 'center', border: '2px solid #fde68a', margin: 16, borderRadius: 12 }}>
            <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>This certifies that</div>
            <div style={{ color: '#dc2626', fontWeight: 900, fontSize: 32, marginBottom: 8 }}>{user.username}</div>
            <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>has successfully completed the</div>
            <div style={{ color: '#1e293b', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Cebu City Fire Department</div>
            <div style={{ color: '#ea580c', fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Fire Safety Quiz</div>

            <div style={{ display: 'inline-block', backgroundColor: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14, padding: '12px 28px', marginBottom: 28 }}>
              <div style={{ color: '#dc2626', fontWeight: 800, fontSize: 22 }}>{result.score}/{result.total_questions}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Score ({result.percentage}%)</div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>
                Completed on {new Date(result.completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Certificate ID: CFDC-{result.id}-{new Date(result.completed_at).getFullYear()}</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🔥</div>
            <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>CEBU CITY FIRE DEPARTMENT</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Always Ready • Always There</div>
          </div>
        </div>
      </div>
    </div>
  );
}
