// TestRender.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

// Minimal test component
const TestApp = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#4287f5',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold'
  }}>
    React Test - If you see this, React is working! 🎉
  </div>
);

// Direct DOM manipulation to ensure we can find the root
document.body.innerHTML = '<div id="test-root"></div>';

try {
  const root = createRoot(document.getElementById('test-root')!);
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
  console.log('Test component rendered successfully!');
} catch (error) {
  console.error('Error rendering test component:', error);
}
