import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import TrusteeView from './TrusteeView';
import reportWebVitals from './reportWebVitals';

// Simple URL-based routing:
//   ?trustee=true → opens the Trustee/Lawyer simulator
//   default       → opens the main Advisor app
const params = new URLSearchParams(window.location.search);
const isTrustee = params.get('trustee') === 'true';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isTrustee ? <TrusteeView /> : <App />}
  </React.StrictMode>
);

reportWebVitals();
