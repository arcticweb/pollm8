export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
  },
} as const;

export const DEFAULT_LANGUAGE = 'en';

export const TRANSLATIONS = {
  en: {
    common: {
      appName: 'VoteHub',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      viewMore: 'View More',
      viewLess: 'View Less',
      close: 'Close',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
    },

    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordsMustMatch: 'Passwords must match',
      invalidCredentials: 'Invalid email or password',
      emailInUse: 'Email already in use',
      signInSuccess: 'Signed in successfully',
      signUpSuccess: 'Account created successfully',
      signOutSuccess: 'Signed out successfully',
    },

    profile: {
      profile: 'Profile',
      editProfile: 'Edit Profile',
      username: 'Username',
      bio: 'Bio',
      avatar: 'Avatar',
      verified: 'Verified',
      notVerified: 'Not Verified',
      verificationLevel: 'Verification Level',
      demographics: 'Demographics',
      optional: 'Optional',
      ageRange: 'Age Range',
      gender: 'Gender',
      location: 'Location',
      education: 'Education',
      employment: 'Employment',
      income: 'Income Range',
    },

    topics: {
      topics: 'Topics',
      createTopic: 'Create Topic',
      myTopics: 'My Topics',
      trending: 'Trending',
      recent: 'Recent',
      topicTitle: 'Topic Title',
      topicDescription: 'Description',
      voteType: 'Vote Type',
      requireVerification: 'Require Verification',
      expiresAt: 'Expires At',
      neverExpires: 'Never Expires',
      active: 'Active',
      closed: 'Closed',
      votes: 'Votes',
      views: 'Views',
      similarTopics: 'Similar Topics Found',
      linkToTopic: 'Link to Existing Topic',
      createNewTopic: 'Create as New Topic',
    },

    voting: {
      vote: 'Vote',
      voted: 'Voted',
      changeVote: 'Change Vote',
      yourVote: 'Your Vote',
      results: 'Results',
      allVotes: 'All Votes',
      verifiedOnly: 'Verified Users Only',
      byDemographics: 'By Demographics',
      totalVotes: 'Total Votes',
      verifiedVotes: 'Verified Votes',
      voteSuccess: 'Vote submitted successfully',
      voteError: 'Failed to submit vote',
      voteChanged: 'Vote updated successfully',
    },

    voteTypes: {
      yesNo: 'Yes/No',
      multipleChoice: 'Multiple Choice',
      rating: 'Rating Scale',
      openEnded: 'Open Ended',
    },

    notifications: {
      notifications: 'Notifications',
      preferences: 'Notification Preferences',
      channels: 'Notification Channels',
      addChannel: 'Add Channel',
      channelType: 'Channel Type',
      email: 'Email',
      webhook: 'Webhook',
      sms: 'SMS',
      topicCreatedOnMine: 'New votes on my topics',
      topicTrending: 'Trending topics',
      verificationStatus: 'Verification updates',
      similarTopicSuggested: 'Similar topics suggested',
      weeklySummary: 'Weekly summary',
    },

    settings: {
      settings: 'Settings',
      theme: 'Theme',
      fontSize: 'Font Size',
      language: 'Language',
      accessibility: 'Accessibility',
      apiKeys: 'API Keys',
      createApiKey: 'Create API Key',
      keyName: 'Key Name',
      permissions: 'Permissions',
    },

    errors: {
      generic: 'An error occurred. Please try again.',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      serverError: 'Server error',
      networkError: 'Network error',
    },

    landing: {
      hero: {
        title: 'Know What Everyone Thinks About Anything',
        subtitle: 'Poll your family, friends, or the entire planet',
        description: 'Create surveys, gather opinions, and discover insights from any audience. From casual polls to verified demographic data, VoteHub makes it easy to understand what people really think.',
        cta: 'Get Started Free',
        secondaryCta: 'See How It Works',
      },
      features: {
        title: 'Limitless Possibilities',
        subtitle: 'Everything you need to gather meaningful insights',
        items: [
          {
            title: 'Create Any Poll',
            description: 'Yes/No questions, multiple choice, ratings, or open-ended responses. Choose the format that fits your question.',
          },
          {
            title: 'Real-Time Results',
            description: 'Watch votes come in live. See instant visualizations and demographic breakdowns as people respond.',
          },
          {
            title: 'Verified Demographics',
            description: 'Optional user verification ensures data quality. Filter results by age, location, and more for targeted insights.',
          },
          {
            title: 'Smart Topic Linking',
            description: 'Our system suggests similar topics to consolidate results and prevent duplication.',
          },
          {
            title: 'Powerful API',
            description: 'Export data, integrate with your tools, and build custom applications on top of our platform.',
          },
          {
            title: 'Privacy First',
            description: 'Your data is yours. Control who sees your polls and how results are shared.',
          },
        ],
      },
      useCases: {
        title: 'Built for Everyone',
        items: [
          {
            title: 'Families',
            description: 'Decide where to go for dinner, plan vacations, or settle debates.',
          },
          {
            title: 'Teams',
            description: 'Get feedback, make decisions, and align on priorities.',
          },
          {
            title: 'Researchers',
            description: 'Collect verified demographic data for academic studies.',
          },
          {
            title: 'Businesses',
            description: 'Understand your market, test ideas, and gather customer feedback.',
          },
        ],
      },
      cta: {
        title: 'Start Understanding Your Audience',
        description: 'Join thousands discovering what people really think',
        button: 'Create Your First Poll',
      },
    },
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
export type Translation = typeof TRANSLATIONS.en;