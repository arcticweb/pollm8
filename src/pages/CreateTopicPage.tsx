import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { topicService } from '../services/topicService';
import { TRANSLATIONS } from '../config/language.config';
import type { Database } from '../types/database.types';

const t = TRANSLATIONS.en;

type VoteTypeConfig = Database['public']['Tables']['vote_type_configs']['Row'];
type Topic = Database['public']['Tables']['topics']['Row'];

interface CreateTopicPageProps {
  onNavigate: (page: string, topicId?: string) => void;
}

export function CreateTopicPage({ onNavigate }: CreateTopicPageProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [voteTypes, setVoteTypes] = useState<VoteTypeConfig[]>([]);
  const [selectedVoteType, setSelectedVoteType] = useState('');
  const [voteConfig, setVoteConfig] = useState<any>({});
  const [requireVerification, setRequireVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similarTopics, setSimilarTopics] = useState<Topic[]>([]);
  const [checkingSimilar, setCheckingSimilar] = useState(false);

  useEffect(() => {
    loadVoteTypes();
  }, []);

  useEffect(() => {
    if (title.length > 3) {
      checkSimilarTopics();
    } else {
      setSimilarTopics([]);
    }
  }, [title]);

  const loadVoteTypes = async () => {
    try {
      const types = await topicService.getVoteTypes();
      setVoteTypes(types);
      if (types.length > 0) {
        setSelectedVoteType(types[0].id);
        setVoteConfig(types[0].default_config);
      }
    } catch (error) {
      console.error('Error loading vote types:', error);
    }
  };

  const checkSimilarTopics = async () => {
    setCheckingSimilar(true);
    try {
      const similar = await topicService.findSimilarTopics(title);
      setSimilarTopics(similar);
    } catch (error) {
      console.error('Error checking similar topics:', error);
    } finally {
      setCheckingSimilar(false);
    }
  };

  const handleVoteTypeChange = (typeId: string) => {
    setSelectedVoteType(typeId);
    const type = voteTypes.find(t => t.id === typeId);
    if (type) {
      setVoteConfig(type.default_config);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const topic = await topicService.createTopic({
        title,
        description,
        vote_type_id: selectedVoteType,
        vote_config: voteConfig,
        require_verification: requireVerification,
        created_by: profile!.id,
      });

      onNavigate('topic', topic.id);
    } catch (err: any) {
      setError(err.message || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = voteTypes.find(t => t.id === selectedVoteType);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t.topics.createTopic}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  {t.topics.topicTitle}
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full text-lg"
                placeholder="e.g., What's your favorite programming language?"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  {t.topics.topicDescription}
                </span>
                <span className="label-text-alt">{t.profile.optional}</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered h-32"
                placeholder="Add more context or details..."
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  {t.topics.voteType}
                </span>
              </label>
              <select
                value={selectedVoteType}
                onChange={(e) => handleVoteTypeChange(e.target.value)}
                className="select select-bordered w-full"
                disabled={loading}
              >
                {voteTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name}
                  </option>
                ))}
              </select>
              {selectedType?.description && (
                <label className="label">
                  <span className="label-text-alt">{selectedType.description}</span>
                </label>
              )}
            </div>

            {selectedType?.name === 'multiple_choice' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Options</span>
                </label>
                <textarea
                  value={(voteConfig.options || []).join('\n')}
                  onChange={(e) =>
                    setVoteConfig({
                      ...voteConfig,
                      options: e.target.value.split('\n').filter(o => o.trim()),
                    })
                  }
                  className="textarea textarea-bordered h-32"
                  placeholder="Enter each option on a new line"
                  disabled={loading}
                />
              </div>
            )}

            {selectedType?.name === 'rating' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Min Value</span>
                  </label>
                  <input
                    type="number"
                    value={voteConfig.min_value || 1}
                    onChange={(e) =>
                      setVoteConfig({ ...voteConfig, min_value: parseInt(e.target.value) })
                    }
                    className="input input-bordered"
                    disabled={loading}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Value</span>
                  </label>
                  <input
                    type="number"
                    value={voteConfig.max_value || 5}
                    onChange={(e) =>
                      setVoteConfig({ ...voteConfig, max_value: parseInt(e.target.value) })
                    }
                    className="input input-bordered"
                    disabled={loading}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Step</span>
                  </label>
                  <input
                    type="number"
                    value={voteConfig.step || 1}
                    onChange={(e) =>
                      setVoteConfig({ ...voteConfig, step: parseInt(e.target.value) })
                    }
                    className="input input-bordered"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={requireVerification}
                  onChange={(e) => setRequireVerification(e.target.checked)}
                  className="checkbox checkbox-primary"
                  disabled={loading}
                />
                <div>
                  <span className="label-text font-semibold">
                    {t.topics.requireVerification}
                  </span>
                  <p className="text-sm text-base-content/60">
                    Only allow verified users to vote
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onNavigate('topics')}
                className="btn btn-ghost"
                disabled={loading}
              >
                {t.common.cancel}
              </button>
              <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                {loading ? t.common.loading : t.common.create}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          {checkingSimilar ? (
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Checking for similar topics...</h3>
                <span className="loading loading-spinner"></span>
              </div>
            </div>
          ) : similarTopics.length > 0 ? (
            <div className="card bg-warning/10 border-2 border-warning">
              <div className="card-body">
                <h3 className="card-title text-lg text-warning">
                  {t.topics.similarTopics}
                </h3>
                <p className="text-sm mb-4">
                  Consider linking to an existing topic instead:
                </p>
                <div className="space-y-2">
                  {similarTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => onNavigate('topic', topic.id)}
                      className="btn btn-sm btn-outline w-full justify-start text-left"
                      type="button"
                    >
                      <span className="truncate">{topic.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}