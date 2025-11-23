export const APP_CONFIG = {
  app: {
    name: 'VoteHub',
    tagline: 'Know What Everyone Thinks About Anything',
    description: 'Poll your family, friends, or the entire planet',
    version: '1.0.0',
  },

  features: {
    enableVerification: true,
    enableDemographics: true,
    enableAnalytics: true,
    enableNotifications: true,
    enableAPI: true,
    enableSimilarityDetection: true,
  },

  voting: {
    allowVoteChanges: true,
    defaultVoteExpiry: null,
    requireVerificationForSensitiveTopics: false,
  },

  ui: {
    defaultTheme: 'light',
    darkTheme: 'dark',
    enableThemeSwitcher: true,
    enableAccessibilityFeatures: true,
    defaultFontSize: 16,
    fontSizeRange: { min: 12, max: 24 },
  },

  notifications: {
    channels: ['email', 'webhook', 'sms'],
    defaultPreferences: {
      topicCreatedOnMine: true,
      topicTrending: false,
      verificationStatus: true,
      similarTopicSuggested: true,
      weeklySummary: false,
    },
  },

  analytics: {
    providers: {
      google: {
        enabled: true,
        measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
      },
    },
  },

  api: {
    version: 'v1',
    baseUrl: '/api',
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000,
    },
  },

  similarity: {
    threshold: 0.7,
    method: 'manual',
    enableAI: false,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;