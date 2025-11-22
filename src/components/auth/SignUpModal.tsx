import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TRANSLATIONS } from '../../config/language.config';

const t = TRANSLATIONS.en;

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.auth.passwordsMustMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, username);
      onClose();
    } catch (err: any) {
      setError(err.message || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-3xl mb-2">{t.auth.signUp}</h3>
        <p className="text-base-content/60 mb-6">Create your account to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">{t.profile.username}</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/40">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered w-full pl-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="johndoe"
                required
                disabled={loading}
                style={{ borderWidth: '2px' }}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">{t.auth.email}</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/40">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="you@example.com"
                required
                disabled={loading}
                style={{ borderWidth: '2px' }}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">{t.auth.password}</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/40">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="••••••••"
                required
                disabled={loading}
                style={{ borderWidth: '2px' }}
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-base-content/60">At least 6 characters</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">{t.auth.confirmPassword}</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/40">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full pl-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="••••••••"
                required
                disabled={loading}
                style={{ borderWidth: '2px' }}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {t.common.loading}
                </>
              ) : (
                t.auth.signUp
              )}
            </button>
          </div>
        </form>

        <div className="divider text-base-content/50">OR</div>

        <p className="text-center">
          {t.auth.alreadyHaveAccount}{' '}
          <button
            onClick={onSwitchToSignIn}
            className="link link-primary font-semibold hover:link-hover"
            type="button"
            disabled={loading}
          >
            {t.auth.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}