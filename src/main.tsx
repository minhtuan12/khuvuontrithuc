import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AccountRoot from './components/AccountRoot.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccountRoot />
  </StrictMode>,
);
