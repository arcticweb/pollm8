import { useState } from 'react';
import { Vote, Settings, User, LogOut, Menu, Shield } from 'lucide-react';
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
            <label tabIndex={0} className="btn btn-ghost btn-circle hover:bg-base-200 transition-colors">
              <Settings className="w-5 h-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-3 shadow-xl bg-base-100 border border-base-300 rounded-box w-64 max-h-96 overflow-y-auto"
            >
              <li className="menu-title px-3 py-2">
                <span className="text-sm font-bold uppercase tracking-wide text-base-content/60">{t.settings.theme}</span>
              </li>
              <div className="divider my-1"></div>
              <div className="grid grid-cols-2 gap-2 p-2">
                {availableThemes.map((themeName) => (
                  <li key={themeName} className="w-full">
                    <button
                      onClick={() => setTheme(themeName)}
                      className={`justify-center capitalize font-medium transition-all ${
                        theme === themeName
                          ? 'bg-primary text-primary-content hover:bg-primary/90'
                          : 'hover:bg-base-200'
                      }`}
                    >
                      {themeName}
                    </button>
                  </li>
                ))}
              </div>
            </ul>
          </div>

          {user ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-primary transition-all">
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
                className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-300"
              >
                <li className="menu-title">
                  <span className="text-lg font-bold">{profile?.username}</span>
                </li>
                <li>
                  <button onClick={() => onNavigate('profile')} className="hover:bg-primary hover:text-primary-content transition-colors">
                    <User className="w-4 h-4" />
                    {t.profile.profile}
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('settings')} className="hover:bg-primary hover:text-primary-content transition-colors">
                    <Settings className="w-4 h-4" />
                    {t.settings.settings}
                  </button>
                </li>
                {profile?.is_admin && (
                  <li>
                    <button onClick={() => onNavigate('admin')} className="hover:bg-warning hover:text-warning-content transition-colors">
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={handleSignOut} className="hover:bg-error hover:text-error-content transition-colors">
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
                className="btn btn-outline btn-sm hover:btn-primary hover:scale-105 transition-all"
              >
                {t.auth.signIn}
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className="btn btn-primary btn-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
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