import Footer from '../../components/Footer';
import Link from 'next/link';

export default function AboutUs() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#dc2626', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔥</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', letterSpacing: 0.3, lineHeight: 1.2 }}>CEBU CITY FIRE SYSTEM</div>
              <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>Always Ready • Always There</div>
            </div>
          </div>
          <Link href="/" style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderRadius: 20, padding: '36px 24px', marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>About Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0 }}>Cebu City Fire System — Serving with Pride</p>
        </div>

        {/* Mission, Vision, Core Values */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '🎯', title: 'Our Mission', text: 'We protect life, property, and the environment through an integrated system of prevention, response, and investigation, strengthening public safety and community resilience.' },
            { icon: '👁️', title: 'Our Vision', text: 'A modern and trusted fire and emergency service building safe and resilient communities.' },
            { icon: '⭐', title: 'Core Values', text: 'Tapat na Paglilingkud (Integrity), Galing sa Gawain (Competence), and Pusong Nag-aalab (Compassion).' },
          ].map(card => (
            <div key={card.title} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 15, marginBottom: 10 }}>{card.title}</div>
              <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.7 }}>{card.text}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>📜</div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 17, marginBottom: 12 }}>Our History</div>
          <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.7, maxWidth: 680, margin: '0 auto', textAlign: 'justify' }}>
            The Cebu City Fire System has been serving the community for decades, evolving from a small volunteer brigade to a professional fire service.
            Today, we operate multiple stations across Cebu, equipped with modern firefighting equipment and highly trained personnel ready to respond 24/7.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
