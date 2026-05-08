import React from 'react';
import Layout from './components/Layout';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleAuthProvider>
        <Layout />
      </GoogleAuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
