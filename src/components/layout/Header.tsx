import { useState } from 'react';
import { Vote, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TRANSLATIONS } from '../../config/language.config';
import { SignInModal } from '../auth/SignInModal';
import { SignUpModal } from '../auth/SignUpModal';

const t = TRANSLATIONS.en;

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  return (
    <>
      <header className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="navbar-start">
          <button
            onClick={() => onNavigate('landing')}
            className="btn btn-ghost text-xl font-bold"
          >
            <Vote className="w-6 h-6 mr-2" />
            {t.common.appName}
          </button>
        </div>

        <div className="navbar-center hidden lg:flex">
          {user && (
            <ul className="menu menu-horizontal px-1">
              <li>
                <button
                  onClick={() => onNavigate('topics')}
                  className={currentPage === 'topics' ? 'active' : ''}
                >
                  {t.topics.topics}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create-topic')}
                  className={currentPage === 'create-topic' ? 'active' : ''}
                >
                  {t.topics.createTopic}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-topics')}
                  className={currentPage === 'my-topics' ? 'active' : ''}
                >
                  {t.topics.myTopics}
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="navbar-end gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <Settings className="w-5 h-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
            >
              <li className="menu-title">
                <span>{t.settings.theme}</span>
              </li>
              {availableThemes.map((themeName) => (
                <li key={themeName}>
                  <button
                    onClick={() => setTheme(themeName)}
                    className={theme === themeName ? 'active' : ''}
                  >
                    {themeName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {user ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li className="menu-title">
                  <span>{profile?.username}</span>
                </li>
                <li>
                  <button onClick={() => onNavigate('profile')}>
                    <User className="w-4 h-4" />
                    {t.profile.profile}
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('settings')}>
                    <Settings className="w-4 h-4" />
                    {t.settings.settings}
                  </button>
                </li>
                <li>
                  <button onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    {t.auth.signOut}
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowSignIn(true)}
                className="btn btn-ghost btn-sm"
              >
                {t.auth.signIn}
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className="btn btn-primary btn-sm"
              >
                {t.auth.signUp}
              </button>
            </>
          )}

          {user && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="btn btn-ghost btn-circle lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {showMobileMenu && user && (
        <div className="lg:hidden bg-base-200 shadow-lg">
          <ul className="menu menu-vertical px-1">
            <li>
              <button
                onClick={() => {
                  onNavigate('topics');
                  setShowMobileMenu(false);
                }}
              >
                {t.topics.topics}
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onNavigate('create-topic');
                  setShowMobileMenu(false);
                }}
              >
                {t.topics.createTopic}
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onNavigate('my-topics');
                  setShowMobileMenu(false);
                }}
              >
                {t.topics.myTopics}
              </button>
            </li>
          </ul>
        </div>
      )}

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />

      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
    </>
  );
}