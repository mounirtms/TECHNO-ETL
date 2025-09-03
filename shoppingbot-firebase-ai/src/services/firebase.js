const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // Add your Firebase project ID if needed
      // projectId: 'your-project-id'
    });
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
}

const db = admin.firestore();

// Store or update user information
async function storeUser(user) {
  if (!user || !user.id) {
    console.warn('⚠️ Cannot store user: missing user data');

    return;
  }

  try {
    console.log(`👥 Storing user: ${user.id} (${user.first_name || 'Unknown'})`);
    const ref = db.collection('users').doc(String(user.id));

    const userData = {
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      language_code: user.language_code || '',
      is_bot: user.is_bot || false,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if user exists to determine if it's a new user
    const userDoc = await ref.get();

    if (!userDoc.exists) {
      userData.created_at = new Date().toISOString();
      userData.total_interactions = 0;
      console.log(`✨ New user registered: ${user.id}`);
    }

    await ref.set(userData, { merge: true });
    console.log(`✅ User data stored successfully for: ${user.id}`);
  } catch (error) {
    console.error(`❌ Error storing user ${user.id}:`, error.message);
  }
}

// Log user interactions for analytics
async function logInteraction(userId, action, metadata = {}) {
  if (!userId || !action) {
    console.warn('⚠️ Cannot log interaction: missing userId or action');

    return;
  }

  try {
    console.log(`📊 Logging interaction: ${userId} - ${action}`);

    // Store interaction in interactions collection
    const interactionRef = db.collection('interactions').doc();

    await interactionRef.set({
      user_id: String(userId),
      action: action,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    });

    // Update user's total interactions count
    const userRef = db.collection('users').doc(String(userId));

    await userRef.update({
      total_interactions: admin.firestore.FieldValue.increment(1),
      last_interaction: new Date().toISOString(),
    });

    console.log(`✅ Interaction logged: ${action} for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error logging interaction for user ${userId}:`, error.message);
  }
}

// Get user statistics for admin dashboard
async function getUserStats() {
  try {
    console.log('📊 Fetching user statistics...');

    // Get total users count
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Get total interactions count
    const interactionsSnapshot = await db.collection('interactions').get();
    const totalInteractions = interactionsSnapshot.size;

    // Get today's unique users
    const today = new Date().toISOString().split('T')[0];
    const todayInteractions = await db.collection('interactions')
      .where('date', '==', today)
      .get();

    const todayUserIds = new Set();

    todayInteractions.forEach(doc => {
      todayUserIds.add(doc.data().user_id);
    });
    const todayUsers = todayUserIds.size;

    // Get most popular actions today
    const actionCounts = {};

    todayInteractions.forEach(doc => {
      const action = doc.data().action;

      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    const stats = {
      totalUsers,
      totalInteractions,
      todayUsers,
      todayInteractions: todayInteractions.size,
      popularActions: actionCounts,
    };

    console.log(`✅ Stats retrieved: ${totalUsers} users, ${totalInteractions} interactions`);

    return stats;
  } catch (error) {
    console.error('❌ Error fetching user stats:', error.message);

    return {
      totalUsers: 0,
      totalInteractions: 0,
      todayUsers: 0,
      todayInteractions: 0,
      popularActions: {},
    };
  }
}

// Get all users for broadcasting (admin only)
async function getAllUsers() {
  try {
    console.log('👥 Fetching all users for broadcast...');
    const snapshot = await db.collection('users').get();
    const users = [];

    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Retrieved ${users.length} users`);

    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);

    return [];
  }
}

// Store bot configuration (for admin settings)
async function storeBotConfig(config) {
  try {
    console.log('⚙️ Storing bot configuration...');
    const configRef = db.collection('config').doc('bot_settings');

    await configRef.set({
      ...config,
      updated_at: new Date().toISOString(),
    }, { merge: true });
    console.log('✅ Bot configuration stored successfully');
  } catch (error) {
    console.error('❌ Error storing bot config:', error.message);
  }
}

// Get bot configuration
async function getBotConfig() {
  try {
    const configRef = db.collection('config').doc('bot_settings');
    const doc = await configRef.get();

    return doc.exists ? doc.data() : {};
  } catch (error) {
    console.error('❌ Error fetching bot config:', error.message);

    return {};
  }
}

module.exports = {
  storeUser,
  logInteraction,
  getUserStats,
  getAllUsers,
  storeBotConfig,
  getBotConfig,
};
