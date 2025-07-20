import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0072c3 0%, #38bef7 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          EA PolicyFrame App - Simple Test Page
        </h1>
      </header>
      
      <main style={{ flexGrow: 1, padding: '40px 20px' }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Basic React Test
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '24px' }}>
            This is a simple React component without any external dependencies.
          </p>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              React Status
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              ✅ React is working if you can see this message!
            </p>
          </div>
          
          <button style={{
            backgroundColor: '#0072c3',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onClick={() => alert('Button clicked!')}>
            Test Button
          </button>
        </div>
      </main>
      
      <footer style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        &copy; {new Date().getFullYear()} EA PolicyFrame App
      </footer>
    </div>
  );
};

export default TestPage;