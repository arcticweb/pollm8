import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { topicService } from '../services/topicService';
import { voteService } from '../services/voteService';
import { TRANSLATIONS } from '../config/language.config';
import { Clock, TrendingUp, Eye, CheckCircle } from 'lucide-react';
import type { Database } from '../types/database.types';

const t = TRANSLATIONS.en;

type Topic = Database['public']['Tables']['topics']['Row'];
type Vote = Database['public']['Tables']['votes']['Row'];
type VoteResultsCache = Database['public']['Tables']['vote_results_cache']['Row'];

interface TopicDetailPageProps {
  topicId: string;
  onNavigate: (page: string) => void;
}

export function TopicDetailPage({ topicId, onNavigate }: TopicDetailPageProps) {
  const { profile } = useAuth();
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [results, setResults] = useState<VoteResultsCache | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const loadTopic = async () => {
    setLoading(true);
    try {
      const [topicData, voteData, resultsData] = await Promise.all([
        topicService.getTopic(topicId),
        profile ? voteService.getVote(topicId, profile.id) : Promise.resolve(null),
        voteService.getResults(topicId),
      ]);

      setTopic(topicData);
      setUserVote(voteData);
      setResults(resultsData);

      await topicService.incrementViewCount(topicId);
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteData: any) => {
    if (!profile) return;

    setSubmitting(true);
    try {
      await voteService.castVote(
        topicId,
        profile.id,
        voteData,
        profile.is_verified,
        profile.verification_level
      );

      await loadTopic();
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
        <button onClick={() => onNavigate('topics')} className="btn btn-primary">
          Back to Topics
        </button>
      </div>
    );
  }

  const voteType = topic.vote_type as any;
  const voteConfig = topic.vote_config as any;
  const currentResults = showVerifiedOnly ? results?.verified_votes : results?.all_votes;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button onClick={() => onNavigate('topics')} className="btn btn-ghost btn-sm mb-4">
        ← {t.common.back}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>

              {topic.description && (
                <p className="text-lg text-base-content/70 mb-4">{topic.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(topic.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {topic.vote_count} {t.topics.votes.toLowerCase()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {topic.view_count} {t.topics.views.toLowerCase()}
                </span>
              </div>

              {topic.creator && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-300">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                      {topic.creator.avatar_url ? (
                        <img src={topic.creator.avatar_url} alt={topic.creator.username} />
                      ) : (
                        <span>{topic.creator.username[0]}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {topic.creator.username}
                      {topic.creator.is_verified && (
                        <span className="ml-1 text-primary">✓</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {profile ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                  {userVote ? t.voting.yourVote : t.voting.vote}
                </h2>

                <VoteForm
                  voteType={voteType}
                  voteConfig={voteConfig}
                  existingVote={userVote}
                  onSubmit={handleVote}
                  submitting={submitting}
                />

                {userVote && (
                  <div className="alert alert-success mt-4">
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.voting.voted}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <p className="text-lg mb-4">Sign in to vote on this topic</p>
                <button className="btn btn-primary">Sign In</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl sticky top-20">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">{t.voting.results}</h2>

              {results && results.vote_count_all > 0 ? (
                <>
                  <div className="form-control mb-4">
                    <label className="label cursor-pointer">
                      <span className="label-text">{t.voting.verifiedOnly}</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={showVerifiedOnly}
                        onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                      />
                    </label>
                  </div>

                  <div className="stats stats-vertical shadow mb-4">
                    <div className="stat">
                      <div className="stat-title">{t.voting.totalVotes}</div>
                      <div className="stat-value text-2xl">
                        {showVerifiedOnly
                          ? results.vote_count_verified
                          : results.vote_count_all}
                      </div>
                    </div>
                  </div>

                  <ResultsDisplay
                    voteType={voteType}
                    results={currentResults}
                    voteConfig={voteConfig}
                  />
                </>
              ) : (
                <p className="text-center text-base-content/60">No votes yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoteForm({ voteType, voteConfig, existingVote, onSubmit, submitting }: any) {
  const [voteData, setVoteData] = useState<any>(
    existingVote?.vote_data || {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(voteData);
  };

  if (voteType.name === 'yes_no') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setVoteData({ answer: 'yes' })}
            className={`btn flex-1 ${voteData.answer === 'yes' ? 'btn-primary' : 'btn-outline'}`}
            disabled={submitting}
          >
            {t.common.yes}
          </button>
          <button
            type="button"
            onClick={() => setVoteData({ answer: 'no' })}
            className={`btn flex-1 ${voteData.answer === 'no' ? 'btn-primary' : 'btn-outline'}`}
            disabled={submitting}
          >
            {t.common.no}
          </button>
        </div>
        {voteData.answer && (
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={submitting}>
            {submitting ? t.common.loading : t.voting.vote}
          </button>
        )}
      </form>
    );
  }

  if (voteType.name === 'multiple_choice') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          {voteConfig.options?.map((option: string, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => setVoteData({ choice: option })}
              className={`btn btn-outline w-full justify-start ${
                voteData.choice === option ? 'btn-primary' : ''
              }`}
              disabled={submitting}
            >
              {option}
            </button>
          ))}
        </div>
        {voteData.choice && (
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={submitting}>
            {submitting ? t.common.loading : t.voting.vote}
          </button>
        )}
      </form>
    );
  }

  if (voteType.name === 'rating') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from(
            { length: (voteConfig.max_value - voteConfig.min_value) / voteConfig.step + 1 },
            (_, i) => voteConfig.min_value + i * voteConfig.step
          ).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setVoteData({ rating: value })}
              className={`btn btn-circle ${
                voteData.rating === value ? 'btn-primary' : 'btn-outline'
              }`}
              disabled={submitting}
            >
              {value}
            </button>
          ))}
        </div>
        {voteData.rating && (
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? t.common.loading : t.voting.vote}
          </button>
        )}
      </form>
    );
  }

  if (voteType.name === 'open_ended') {
    return (
      <form onSubmit={handleSubmit}>
        <textarea
          value={voteData.response || ''}
          onChange={(e) => setVoteData({ response: e.target.value })}
          className="textarea textarea-bordered w-full h-32"
          placeholder="Share your thoughts..."
          maxLength={voteConfig.max_length}
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn btn-primary w-full mt-4"
          disabled={submitting || !voteData.response}
        >
          {submitting ? t.common.loading : t.voting.vote}
        </button>
      </form>
    );
  }

  return null;
}

function ResultsDisplay({ voteType, results, voteConfig }: any) {
  if (!results || typeof results !== 'object') {
    return <p className="text-center text-base-content/60">No results available</p>;
  }

  if (voteType.name === 'yes_no') {
    const total = (results.yes || 0) + (results.no || 0);
    const yesPercent = total > 0 ? ((results.yes || 0) / total) * 100 : 0;
    const noPercent = total > 0 ? ((results.no || 0) / total) * 100 : 0;

    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>{t.common.yes}</span>
            <span>{yesPercent.toFixed(1)}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={yesPercent}
            max="100"
          ></progress>
          <span className="text-xs text-base-content/60">{results.yes || 0} votes</span>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>{t.common.no}</span>
            <span>{noPercent.toFixed(1)}%</span>
          </div>
          <progress
            className="progress progress-secondary w-full"
            value={noPercent}
            max="100"
          ></progress>
          <span className="text-xs text-base-content/60">{results.no || 0} votes</span>
        </div>
      </div>
    );
  }

  if (voteType.name === 'multiple_choice') {
    const entries = Object.entries(results);
    const total = entries.reduce((sum, [, count]) => sum + (count as number), 0);

    return (
      <div className="space-y-4">
        {entries.map(([choice, count]: [string, any]) => {
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={choice}>
              <div className="flex justify-between mb-1">
                <span className="truncate flex-1">{choice}</span>
                <span>{percent.toFixed(1)}%</span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={percent}
                max="100"
              ></progress>
              <span className="text-xs text-base-content/60">{count} votes</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (voteType.name === 'rating' && results.average) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{results.average.toFixed(1)}</div>
          <div className="text-sm text-base-content/60">Average Rating</div>
        </div>
        <div className="space-y-2">
          {Object.entries(results.distribution || {}).map(([rating, count]: [string, any]) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="w-8">{rating}</span>
              <progress
                className="progress progress-primary flex-1"
                value={count}
                max={results.count}
              ></progress>
              <span className="w-12 text-right text-sm">{count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (voteType.name === 'open_ended' && results.responses) {
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.responses.slice(0, 10).map((response: string, index: number) => (
          <div key={index} className="p-3 bg-base-200 rounded-lg">
            <p className="text-sm">{response}</p>
          </div>
        ))}
        {results.count > 10 && (
          <p className="text-sm text-center text-base-content/60">
            +{results.count - 10} more responses
          </p>
        )}
      </div>
    );
  }

  return null;
}