import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Firebase anonymous user login is no longer needed for this version of the app.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
