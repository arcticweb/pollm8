import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config/app.config';

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeGoogleAnalytics();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeGoogleAnalytics() {
    if (
      APP_CONFIG.analytics.providers.google.enabled &&
      APP_CONFIG.analytics.providers.google.measurementId
    ) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.analytics.providers.google.measurementId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', APP_CONFIG.analytics.providers.google.measurementId);
    }
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  async trackEvent(
    eventType: string,
    eventName: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('analytics_events').insert({
        profile_id: this.userId,
        event_type: eventType,
        event_name: eventName,
        event_data: eventData || {},
        session_id: this.sessionId,
        page_url: window.location.href,
        referrer: document.referrer || null,
      });

      if ((window as any).gtag) {
        (window as any).gtag('event', eventName, {
          event_category: eventType,
          ...eventData,
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  trackPageView(page: string) {
    this.trackEvent('page_view', 'page_viewed', { page });
  }

  trackTopicView(topicId: string, topicTitle: string) {
    this.trackEvent('topic', 'topic_viewed', { topic_id: topicId, topic_title: topicTitle });
  }

  trackTopicCreated(topicId: string, voteType: string) {
    this.trackEvent('topic', 'topic_created', { topic_id: topicId, vote_type: voteType });
  }

  trackVoteCast(topicId: string, voteType: string) {
    this.trackEvent('vote', 'vote_cast', { topic_id: topicId, vote_type: voteType });
  }

  trackVoteChanged(topicId: string, voteType: string) {
    this.trackEvent('vote', 'vote_changed', { topic_id: topicId, vote_type: voteType });
  }

  trackSignUp() {
    this.trackEvent('auth', 'sign_up');
  }

  trackSignIn() {
    this.trackEvent('auth', 'sign_in');
  }

  trackSignOut() {
    this.trackEvent('auth', 'sign_out');
  }

  trackSearch(query: string, resultsCount: number) {
    this.trackEvent('search', 'search_performed', { query, results_count: resultsCount });
  }

  trackThemeChange(theme: string) {
    this.trackEvent('settings', 'theme_changed', { theme });
  }
}

export const analyticsService = new AnalyticsService();