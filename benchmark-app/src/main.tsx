import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Basic global styles for the benchmark app
const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: #0a0a0a;
    color: #ffffff;
    overflow: hidden;
  }

  #root {
    height: 100vh;
    width: 100vw;
  }

  /* Custom scrollbar for dark theme */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  ::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Button hover effects */
  button:hover {
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }

  /* Select styling */
  select:focus {
    outline: 2px solid #00d4ff;
    outline-offset: 2px;
  }

  /* Performance grade colors */
  [data-grade="A"] {
    color: #00ff88 !important;
  }

  [data-grade="B"] {
    color: #88ff00 !important;
  }

  [data-grade="C"] {
    color: #ffaa00 !important;
  }

  [data-grade="D"] {
    color: #ff6600 !important;
  }

  [data-grade="F"] {
    color: #ff0000 !important;
  }

  /* Pulse animation for simulated nodes */
  @keyframes pulse {
    0%, 100% { 
      opacity: 0.4; 
      transform: scale(1);
    }
    50% { 
      opacity: 1; 
      transform: scale(1.5);
    }
  }
`;

// Inject global styles
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

// Error boundary for the benchmark app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Benchmark App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0a0a',
          color: '#ffffff',
          padding: '2rem'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            Benchmark App Error
          </h1>
          <p style={{ color: '#aaaaaa', marginBottom: '2rem', textAlign: 'center' }}>
            An error occurred while running the benchmark app. Please check the console for details.
          </p>
          {this.state.error && (
            <pre style={{
              background: '#1a1a1a',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #333',
              color: '#ff6b6b',
              fontSize: '0.8rem',
              overflow: 'auto',
              maxWidth: '80%'
            }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              background: '#00d4ff',
              color: '#000000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);