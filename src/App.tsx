import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';
import { TopicsPage } from './pages/TopicsPage';
import { CreateTopicPage } from './pages/CreateTopicPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { SignUpModal } from './components/auth/SignUpModal';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleNavigate = (page: string, topicId?: string) => {
    setCurrentPage(page);
    if (topicId) {
      setCurrentTopicId(topicId);
    }
    window.scrollTo(0, 0);
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {user || currentPage === 'landing' ? (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      ) : null}

      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} onShowSignUp={handleShowSignUp} />
      )}

      {currentPage === 'topics' && user && <TopicsPage onNavigate={handleNavigate} />}

      {currentPage === 'create-topic' && user && (
        <CreateTopicPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'topic' && currentTopicId && (
        <TopicDetailPage topicId={currentTopicId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'my-topics' && user && (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">My Topics</h1>
          <TopicsPage onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'profile' && user && (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h1 className="text-4xl font-bold mb-4">Profile</h1>
              <p className="text-lg">Profile management coming soon!</p>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'settings' && user && (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h1 className="text-4xl font-bold mb-4">Settings</h1>
              <p className="text-lg">Settings coming soon!</p>
            </div>
          </div>
        </div>
      )}

      {!user && currentPage !== 'landing' && currentPage !== 'topic' && (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Sign In Required</h1>
          <p className="text-lg mb-8">Please sign in to access this page</p>
          <button onClick={() => handleNavigate('landing')} className="btn btn-primary">
            Go to Home
          </button>
        </div>
      )}

      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => setShowSignUp(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;