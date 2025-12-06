
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Main } from './Main';
import { AuthGuard } from './components/auth';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthGuard>
      <Main />
    </AuthGuard>
  </React.StrictMode>
);
