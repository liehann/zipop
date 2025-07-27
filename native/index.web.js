import React from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { name as appName } from './app.json';

// Wrapper component with SafeAreaProvider
const AppWithSafeArea = () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
);

// Register the app
AppRegistry.registerComponent(appName, () => AppWithSafeArea);

// Run the app
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
}); 