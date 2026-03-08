
import React, { useState } from 'react';
import { Screen } from './types';
import Layout from './components/Layout';
import HomeScreen from './components/screens/HomeScreen';
import OraculoScreen from './components/screens/OraculoScreen';
import ArquetipoScreen from './components/screens/ArquetipoScreen';
import SuenosScreen from './components/screens/SuenosScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0); // Scroll to top on navigation
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Oraculo:
        return <OraculoScreen />;
      case Screen.Arquetipo:
        return <ArquetipoScreen />;
      case Screen.Suenos:
        return <SuenosScreen />;
      case Screen.Home:
      default:
        return <HomeScreen navigateTo={navigateTo} />;
    }
  };
  
  return (
    <Layout 
        onNavigateHome={() => navigateTo(Screen.Home)}
        showHomeButton={currentScreen !== Screen.Home}
    >
      {renderScreen()}
    </Layout>
  );
};

export default App;
