import React from 'react';
import RootNavigator from "./RootNavigator"; 
import AuthProvider from './auth/AuthProvider';


export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}