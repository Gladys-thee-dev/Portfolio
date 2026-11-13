import '@fontsource-variable/inter';
import 'bootstrap/dist/css/bootstrap.min.css';
import './generated/icons.css'; // subset of Bootstrap Icons, see scripts/build-icons.mjs
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
