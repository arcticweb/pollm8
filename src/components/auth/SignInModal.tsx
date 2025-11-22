import { useState } from 'react';
import { Mail, Lock, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TRANSLATIONS } from '../../config/language.config';

const t = TRANSLATIONS.en;

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || t.auth.invalidCredentials);
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

        <h3 className="font-bold text-3xl mb-2">{t.auth.signIn}</h3>
        <p className="text-base-content/60 mb-6">Welcome back! Please sign in to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">{t.auth.email}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">{t.auth.password}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <label className="label">
              <span className="label-text-alt"></span>
              <a href="#" className="label-text-alt link link-primary hover:link-hover">
                {t.auth.forgotPassword}
              </a>
            </label>
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
                t.auth.signIn
              )}
            </button>
          </div>
        </form>

        <div className="divider text-base-content/50">OR</div>

        <p className="text-center">
          {t.auth.dontHaveAccount}{' '}
          <button
            onClick={onSwitchToSignUp}
            className="link link-primary font-semibold hover:link-hover"
            type="button"
            disabled={loading}
          >
            {t.auth.signUp}
          </button>
        </p>
      </div>
    </div>
  );
}