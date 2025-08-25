// Firebase Database Initialization Script
import { ref, set, get } from 'firebase/database';
import { database } from './firebase';

/**
 * Initialize Firebase Database with Revised Module Structure
 */
const initializeModulesInFirebase = async () => {
  try {
    const modules = {
      'bug_bounty': {
        name: 'Bug Bounty Program',
        description: 'Report bugs and earn rewards.',
        defaultPermissions: {
          canRead: true,
          canSubmit: true,
          canReview: false,
          canApprove: false
        },
        licensedUsers: {}
      },
      'task_voting': {
        name: 'Task Voting',
        description: 'Vote for tasks and features.',
        defaultPermissions: {
          canRead: true,
          canVote: true,
          canCreate: false,
          canModerate: false
        },
        licensedUsers: {}
      },
    };

    const modulesRef = ref(database, 'system/modules');
    const modulesSnapshot = await get(modulesRef);

    if (!modulesSnapshot.exists()) {
      await set(modulesRef, modules);
    }

    console.log('Modules initialized.')
  } catch(error: any) {
    console.error('Error initializing modules in Firebase:', error);
  }
};

export default initializeModulesInFirebase;

