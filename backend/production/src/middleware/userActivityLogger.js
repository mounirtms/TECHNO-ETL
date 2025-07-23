/**
 * User Activity Logging Middleware
 * Tracks user authentication, sessions, and activity patterns
 */

import productionLogger from '../services/productionLogger.js';

class UserActivityTracker {
  constructor() {
    this.activeSessions = new Map();
    this.userSessions = new Map();
    this.activityPatterns = new Map();
    this.authEvents = new Map();
  }

  // Extract user information from request
  extractUserInfo(req) {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    return {
      ip,
      userAgent,
      browser: {
        name: 'Unknown',
        version: 'Unknown',
        os: 'Unknown'
      },
      location: null, // Will be enhanced with geoip later
      timestamp: new Date().toISOString()
    };
  }

  // Log authentication events
  logAuthEvent(eventType, userId, sessionId, req, metadata = {}) {
    const userInfo = this.extractUserInfo(req);
    const authEvent = {
      eventType, // 'login', 'logout', 'session_created', 'session_destroyed', 'auth_failed'
      userId,
      sessionId,
      ...userInfo,
      ...metadata
    };

    // Store auth event for pattern analysis
    if (!this.authEvents.has(userId)) {
      this.authEvents.set(userId, []);
    }
    this.authEvents.get(userId).push(authEvent);

    // Keep only last 100 auth events per user
    if (this.authEvents.get(userId).length > 100) {
      this.authEvents.get(userId).shift();
    }

    productionLogger.logUserActivity('authentication', userId, sessionId, authEvent);
    
    // Log to main logger based on event type
    switch (eventType) {
      case 'login':
        productionLogger.info('User login successful', authEvent);
        break;
      case 'logout':
        productionLogger.info('User logout', authEvent);
        break;
      case 'auth_failed':
        productionLogger.warn('Authentication failed', authEvent);
        break;
      case 'session_created':
        productionLogger.info('Session created', authEvent);
        break;
      case 'session_destroyed':
        productionLogger.info('Session destroyed', authEvent);
        break;
    }
  }

  // Track user session
  trackSession(userId, sessionId, req) {
    const userInfo = this.extractUserInfo(req);
    const sessionData = {
      userId,
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      activityCount: 0,
      ...userInfo
    };

    this.activeSessions.set(sessionId, sessionData);
    
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, []);
    }
    this.userSessions.get(userId).push(sessionData);

    productionLogger.logUserActivity('session_start', userId, sessionId, sessionData);
  }

  // Update session activity
  updateSessionActivity(sessionId, activity, metadata = {}) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.activityCount++;
      
      const activityData = {
        sessionId,
        userId: session.userId,
        activity,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      // Track activity patterns
      const userId = session.userId;
      if (!this.activityPatterns.has(userId)) {
        this.activityPatterns.set(userId, {});
      }
      
      const userPatterns = this.activityPatterns.get(userId);
      if (!userPatterns[activity]) {
        userPatterns[activity] = 0;
      }
      userPatterns[activity]++;

      productionLogger.logUserActivity('user_action', userId, sessionId, activityData);
    }
  }

  // End session tracking
  endSession(sessionId, reason = 'logout') {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const sessionDuration = Date.now() - session.startTime.getTime();
      const endData = {
        sessionId,
        userId: session.userId,
        duration: sessionDuration,
        activityCount: session.activityCount,
        reason,
        timestamp: new Date().toISOString()
      };

      productionLogger.logUserActivity('session_end', session.userId, sessionId, endData);
      this.activeSessions.delete(sessionId);
    }
  }

  // Get user activity patterns
  getUserActivityPatterns(userId) {
    return {
      authEvents: this.authEvents.get(userId) || [],
      activityPatterns: this.activityPatterns.get(userId) || {},
      activeSessions: Array.from(this.activeSessions.values()).filter(s => s.userId === userId),
      sessionHistory: this.userSessions.get(userId) || []
    };
  }

  // Clean up old sessions (run periodically)
  cleanupOldSessions() {
    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity.getTime() > sessionTimeout) {
        this.endSession(sessionId, 'timeout');
      }
    }
  }
}

// Create singleton instance
const userActivityTracker = new UserActivityTracker();

// Clean up old sessions every 5 minutes
setInterval(() => {
  userActivityTracker.cleanupOldSessions();
}, 5 * 60 * 1000);

// Middleware for tracking user activity
export const userActivityMiddleware = (req, res, next) => {
  // Extract user information if available
  const userId = req.user?.id || req.headers['x-user-id'] || null;
  const sessionId = req.sessionID || req.headers['x-session-id'] || req.correlationId;

  // Add user tracking methods to request
  req.trackUserActivity = (activity, metadata = {}) => {
    if (sessionId) {
      userActivityTracker.updateSessionActivity(sessionId, activity, metadata);
    }
  };

  req.logAuthEvent = (eventType, metadata = {}) => {
    if (userId && sessionId) {
      userActivityTracker.logAuthEvent(eventType, userId, sessionId, req, metadata);
    }
  };

  req.startUserSession = (uid = userId) => {
    if (uid && sessionId) {
      userActivityTracker.trackSession(uid, sessionId, req);
    }
  };

  req.endUserSession = (reason = 'logout') => {
    if (sessionId) {
      userActivityTracker.endSession(sessionId, reason);
    }
  };

  // Track API endpoint access
  if (userId && sessionId) {
    const activity = `api_${req.method.toLowerCase()}_${req.route?.path || req.path}`;
    userActivityTracker.updateSessionActivity(sessionId, activity, {
      method: req.method,
      path: req.path,
      query: req.query,
      userAgent: req.get('User-Agent')
    });
  }

  next();
};

// Authentication event logging middleware
export const authEventMiddleware = {
  login: (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode === 200) {
        req.logAuthEvent('login', { success: true });
        req.startUserSession();
      } else {
        req.logAuthEvent('auth_failed', { 
          success: false, 
          statusCode: res.statusCode,
          reason: 'invalid_credentials'
        });
      }
      originalSend.call(this, data);
    };
    next();
  },

  logout: (req, res, next) => {
    req.logAuthEvent('logout');
    req.endUserSession('logout');
    next();
  },

  sessionCreate: (req, res, next) => {
    req.logAuthEvent('session_created');
    next();
  },

  sessionDestroy: (req, res, next) => {
    req.logAuthEvent('session_destroyed');
    req.endUserSession('session_destroyed');
    next();
  }
};

export default userActivityTracker;
export { UserActivityTracker };
