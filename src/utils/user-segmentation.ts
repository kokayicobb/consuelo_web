// User Segmentation Utility for Consuelo Analytics

export interface UserSegmentationData {
  user_type_identified: 'power_user' | 'casual' | 'evaluator' | 'new_user';
  conversion_likelihood: 'high' | 'medium' | 'low' | 'unknown';
  feature_preference: 'voice_focused' | 'text_focused' | 'mixed' | 'unknown';
  support_needs: 'self_serve' | 'needs_help' | 'unknown';
  engagement_level: 'high' | 'medium' | 'low';
  acquisition_channel_quality: 'high_intent' | 'medium_intent' | 'low_intent' | 'unknown';
}

export interface UserAction {
  action: string;
  timestamp: Date;
  properties: Record<string, any>;
}

export class UserSegmentationEngine {
  private actions: UserAction[] = [];
  private userProperties: Record<string, any> = {};

  constructor(initialProperties: Record<string, any> = {}) {
    this.userProperties = initialProperties;
  }

  // Add a user action for analysis
  addAction(action: string, properties: Record<string, any> = {}) {
    this.actions.push({
      action,
      timestamp: new Date(),
      properties
    });
  }

  // Determine user type based on activity patterns
  getUserType(): UserSegmentationData['user_type_identified'] {
    const actionCount = this.actions.length;
    const uniqueActionsCount = new Set(this.actions.map(a => a.action)).size;

    // Advanced user - high activity across multiple features
    if (actionCount > 25 && uniqueActionsCount > 8) return 'power_user';

    // Regular user - moderate consistent activity
    if (actionCount > 8 && uniqueActionsCount > 4) return 'casual';

    // Trial user - exploring specific features
    if (actionCount > 3 && uniqueActionsCount > 2) return 'evaluator';

    return 'new_user';
  }

  // Determine conversion likelihood
  getConversionLikelihood(): UserSegmentationData['conversion_likelihood'] {
    const hasViewedPricing = this.actions.some(a => a.action === 'pricing_viewed');
    const hasStartedCall = this.actions.some(a => a.action === 'call_started');
    const hasCompletedSession = this.actions.some(a => a.action === 'call_ended');
    const hasFeedbackGenerated = this.actions.some(a => a.action === 'feedback_generated');
    const sessionDuration = this.getAverageSessionDuration();

    // High conversion signals
    if (hasFeedbackGenerated && hasViewedPricing && sessionDuration > 300) {
      return 'high';
    }

    // Medium conversion signals
    if ((hasCompletedSession && hasViewedPricing) ||
        (hasStartedCall && sessionDuration > 120)) {
      return 'medium';
    }

    // Low conversion signals
    if (hasViewedPricing || hasStartedCall || this.actions.length > 5) {
      return 'low';
    }

    return 'unknown';
  }

  // Determine feature preference
  getFeaturePreference(): UserSegmentationData['feature_preference'] {
    const voiceActions = this.actions.filter(a =>
      ['voice_message_sent', 'call_started', 'audio_muted', 'audio_unmuted'].includes(a.action)
    ).length;

    const textActions = this.actions.filter(a =>
      ['text_message_sent', 'command_palette_opened'].includes(a.action)
    ).length;

    if (voiceActions === 0 && textActions === 0) return 'unknown';

    if (voiceActions > textActions * 2) return 'voice_focused';
    if (textActions > voiceActions * 2) return 'text_focused';
    if (voiceActions > 0 && textActions > 0) return 'mixed';

    return 'unknown';
  }

  // Determine support needs
  getSupportNeeds(): UserSegmentationData['support_needs'] {
    const helpActions = this.actions.filter(a =>
      a.action.includes('help') || a.action.includes('support') || a.action === 'feedback_requested'
    ).length;

    const errorActions = this.actions.filter(a =>
      a.action.includes('failed') || a.action.includes('error')
    ).length;

    if (helpActions > 2 || errorActions > 3) return 'needs_help';
    if (this.actions.length > 8 && helpActions === 0) return 'self_serve';

    return 'unknown';
  }

  // Determine engagement level
  getEngagementLevel(): UserSegmentationData['engagement_level'] {
    const sessionLength = this.getAverageSessionDuration();
    const actionsPerSession = this.actions.length;
    const uniqueFeatures = new Set(this.actions.map(a => a.action)).size;

    if (sessionLength > 600 && actionsPerSession > 20 && uniqueFeatures > 6) {
      return 'high';
    }

    if (sessionLength > 300 && actionsPerSession > 10 && uniqueFeatures > 3) {
      return 'medium';
    }

    return 'low';
  }

  // Determine acquisition channel quality
  getAcquisitionChannelQuality(): UserSegmentationData['acquisition_channel_quality'] {
    const trafficSource = this.userProperties.initial_traffic_source_quality || 'unknown';
    const conversionLikelihood = this.getConversionLikelihood();

    if (trafficSource === 'paid_high_intent' ||
        (conversionLikelihood === 'high' && trafficSource !== 'unknown')) {
      return 'high_intent';
    }

    if (trafficSource === 'email_nurture' || conversionLikelihood === 'medium') {
      return 'medium_intent';
    }

    if (conversionLikelihood === 'low' || trafficSource === 'organic_discovery') {
      return 'low_intent';
    }

    return 'unknown';
  }

  // Get average session duration in seconds
  private getAverageSessionDuration(): number {
    const callSessions = this.actions.filter(a => a.action === 'call_ended');
    if (callSessions.length === 0) return 0;

    const durations = callSessions.map(session =>
      session.properties.session_duration || 0
    );

    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  }

  // Generate complete segmentation profile
  generateSegmentation(): UserSegmentationData {
    return {
      user_type_identified: this.getUserType(),
      conversion_likelihood: this.getConversionLikelihood(),
      feature_preference: this.getFeaturePreference(),
      support_needs: this.getSupportNeeds(),
      engagement_level: this.getEngagementLevel(),
      acquisition_channel_quality: this.getAcquisitionChannelQuality(),
    };
  }

  // Get actionable insights for this user
  getInsights(): string[] {
    const segmentation = this.generateSegmentation();
    const insights: string[] = [];

    if (segmentation.conversion_likelihood === 'high') {
      insights.push("High conversion potential - consider priority support");
    }

    if (segmentation.feature_preference === 'voice_focused') {
      insights.push("Prefers voice interactions - optimize audio experience");
    }

    if (segmentation.support_needs === 'needs_help') {
      insights.push("May need additional guidance - proactive support recommended");
    }

    if (segmentation.user_type_identified === 'power_user') {
      insights.push("Power user - candidate for beta features and feedback");
    }

    if (segmentation.engagement_level === 'low') {
      insights.push("Low engagement - consider re-engagement campaigns");
    }

    return insights;
  }

  // Export data for PostHog
  exportForPostHog(): Record<string, any> {
    const segmentation = this.generateSegmentation();
    const insights = this.getInsights();

    return {
      ...segmentation,
      total_actions: this.actions.length,
      unique_actions: new Set(this.actions.map(a => a.action)).size,
      avg_session_duration: this.getAverageSessionDuration(),
      last_activity: this.actions[this.actions.length - 1]?.timestamp || null,
      insights: insights,
      segmentation_updated: new Date().toISOString(),
    };
  }
}