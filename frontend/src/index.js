import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import './global-fixes.css'; // Add our global fixes
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './AuthContext';
import { ParallaxProvider } from 'react-scroll-parallax';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ParallaxProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ParallaxProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
