import { useEffect, useState } from 'react';
import { Search, TrendingUp, Clock, Eye } from 'lucide-react';
import { topicService } from '../services/topicService';
import { TRANSLATIONS } from '../config/language.config';
import type { Database } from '../types/database.types';

const t = TRANSLATIONS.en;

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicsPageProps {
  onNavigate: (page: string, topicId?: string) => void;
}

export function TopicsPage({ onNavigate }: TopicsPageProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'vote_count' | 'view_count'>('created_at');

  useEffect(() => {
    loadTopics();
  }, [sortBy, search]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await topicService.getTopics({
        isActive: true,
        search: search || undefined,
        orderBy: sortBy,
        orderDirection: 'desc',
        limit: 50,
      });
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">{t.topics.topics}</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="form-control flex-1">
            <div className="input-group">
              <span>
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder={t.common.search}
                className="input input-bordered w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control">
            <select
              className="select select-bordered"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="created_at">{t.topics.recent}</option>
              <option value="vote_count">{t.topics.votes}</option>
              <option value="view_count">{t.topics.views}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-base-content/70">No topics found</p>
          <button
            onClick={() => onNavigate('create-topic')}
            className="btn btn-primary mt-4"
          >
            {t.topics.createTopic}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {topics.map((topic: any) => (
            <div
              key={topic.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => onNavigate('topic', topic.id)}
            >
              <div className="card-body">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="card-title text-2xl mb-2">{topic.title}</h2>
                    {topic.description && (
                      <p className="text-base-content/70 mb-4 line-clamp-2">
                        {topic.description}
                      </p>
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
                  </div>
                  <div className="badge badge-primary badge-lg">
                    {topic.vote_type?.display_name || 'Poll'}
                  </div>
                </div>
                {topic.creator && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-300">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        {topic.creator.avatar_url ? (
                          <img src={topic.creator.avatar_url} alt={topic.creator.username} />
                        ) : (
                          <span className="text-xs">{topic.creator.username[0]}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm">
                      {topic.creator.username}
                      {topic.creator.is_verified && (
                        <span className="ml-1 text-primary">✓</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}