import VoiceMoodForm from '@/components/VoiceMoodForm';

export default function Home() {
  return (
    <main className="app-main" id="main-content">
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="page-wrapper">
        {/* Header */}
        <header className="page-header" role="banner">
          <div className="header-badge" aria-hidden="true">🔬</div>
          <h1 className="page-title">Voice Mood Recording for ML Research</h1>
          <p className="page-subtitle">آواز کی ریکارڈنگ — مزاج کی شناخت کے لیے</p>
          <div className="header-tags" aria-label="Study metadata">
            <span className="header-tag tag-blue">🔒 Anonymous</span>
            <span className="header-tag tag-cyan">🌐 Multilingual</span>
            <span className="header-tag tag-green">🤖 ML Research</span>
          </div>
        </header>

        {/* Info Banner */}
        <section className="info-banner" aria-labelledby="info-heading">
          <h2 id="info-heading" className="sr-only">About This Study</h2>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon" aria-hidden="true">🎯</span>
              <div>
                <strong>Purpose</strong>
                <p>Building a multilingual mood detection dataset for academic ML research</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon" aria-hidden="true">⏱️</span>
              <div>
                <strong>Duration</strong>
                <p>Record 3–5 second voice clips. Minimum 3, maximum 6 recordings</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon" aria-hidden="true">🔒</span>
              <div>
                <strong>Privacy</strong>
                <p>All data is anonymous. No personal information is collected</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon" aria-hidden="true">🌐</span>
              <div>
                <strong>Languages</strong>
                <p>English, Roman Urdu, Urdu Script supported</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dataset context */}
        <section className="dataset-section" aria-labelledby="dataset-heading">
          <details className="dataset-details">
            <summary id="dataset-heading" className="dataset-summary">
              📊 Dataset Information
            </summary>
            <div className="dataset-content">
              <h3>Features Collected</h3>
              <ul>
                <li>3–5 second voice clips (audio/webm)</li>
                <li>Pitch, frequency, and amplitude patterns</li>
                <li>Speaking rate and tempo</li>
                <li>Self-reported mood label</li>
                <li>Language and script metadata</li>
              </ul>
              <h3>Target Classes</h3>
              <p>Calm • Stressed • Happy • Sad • Angry • Excited</p>
              <h3>Recording Guidelines</h3>
              <ul>
                <li>Record in a quiet environment</li>
                <li>Speak naturally and clearly</li>
                <li>Minimize background noise</li>
                <li>Multiple recordings are encouraged for dataset reliability</li>
              </ul>
            </div>
          </details>
        </section>

        {/* The main form */}
        <VoiceMoodForm />

        {/* Footer */}
        <footer className="page-footer" role="contentinfo">
          <p>Academic Research Project &bull; Voice Mood Detection Dataset</p>
          <p className="footer-note">
            This data will be used strictly for non-commercial, academic machine learning research.
          </p>
        </footer>
      </div>
    </main>
  );
}
