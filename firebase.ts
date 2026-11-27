import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import {
  CustomWordPack,
  DailyChallengeRecord,
  GameHistoryEntry,
  GameSettings,
  Language,
  PlayerProfileStats,
  UserAggregateStats
} from './types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Sign In with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'Player',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    }
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign Out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Save Match History with full telemetry to Firestore
export const saveMatchToCloud = async (
  userId: string,
  match: GameHistoryEntry,
  settings?: GameSettings,
  stats?: UserAggregateStats
) => {
  try {
    const matchRef = doc(db, 'users', userId, 'matches', match.id);
    await setDoc(matchRef, {
      ...match,
      userId,
      difficulty: match.difficulty || settings?.difficulty || 'easy',
      language: match.language || settings?.language || 'fa',
      roundsCount: match.roundsCount || settings?.roundsCount || 3,
      roundDuration: match.roundDuration || settings?.roundDuration || 90,
      categories: match.categories || settings?.selectedCategories || [],
      createdAt: serverTimestamp()
    }, { merge: true });

    const userRef = doc(db, 'users', userId);
    const userPayload: Record<string, unknown> = {
      lastPlayedAt: new Date().toISOString()
    };
    if (stats) {
      userPayload.totalGamesPlayed = stats.totalGamesPlayed;
      userPayload.stats = stats;
    } else {
      const userDoc = await getDoc(userRef);
      const currentCount = userDoc.exists() ? (userDoc.data()?.totalGamesPlayed || 0) : 0;
      userPayload.totalGamesPlayed = currentCount + 1;
    }
    await setDoc(userRef, userPayload, { merge: true });
  } catch (error) {
    console.error('Error saving match to cloud:', error);
    throw error;
  }
};

// Fetch User's Cloud Match History
export const fetchUserMatchHistory = async (userId: string): Promise<GameHistoryEntry[]> => {
  try {
    const matchesCol = collection(db, 'users', userId, 'matches');
    const q = query(matchesCol, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    const results: GameHistoryEntry[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      results.push({
        id: data.id || docSnap.id,
        date: data.date,
        timestamp: data.timestamp,
        winnerNames: data.winnerNames || [],
        winnerColor: data.winnerColor || 'BLUE',
        players: data.players || [],
        language: (data.language as Language) || 'fa',
        difficulty: data.difficulty,
        roundsCount: data.roundsCount,
        roundDuration: data.roundDuration,
        categories: data.categories,
        wordsGuessed: data.wordsGuessed,
        wordsSwapped: data.wordsSwapped,
        mvpPlayer: data.mvpPlayer,
        mode: data.mode,
        dailyDateKey: data.dailyDateKey
      });
    });
    return results;
  } catch (error) {
    console.error('Error fetching cloud match history:', error);
    return [];
  }
};

// Sync Settings with Cloud
export const syncSettingsToCloud = async (userId: string, settings: GameSettings) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error saving settings to cloud:', error);
  }
};

export const fetchSettingsFromCloud = async (userId: string): Promise<GameSettings | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists() && snapshot.data()?.settings) {
      return snapshot.data().settings as GameSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings from cloud:', error);
    return null;
  }
};

// Sync Aggregate Stats & Achievements
export const syncUserStatsToCloud = async (userId: string, stats: UserAggregateStats) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { stats, totalGamesPlayed: stats.totalGamesPlayed }, { merge: true });
  } catch (error) {
    console.error('Error syncing user stats:', error);
  }
};

export const fetchUserStatsFromCloud = async (userId: string): Promise<UserAggregateStats | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists() && snapshot.data()?.stats) {
      return snapshot.data().stats as UserAggregateStats;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

// Custom Word Packs Cloud CRUD
export const saveCustomPackToCloud = async (userId: string, pack: CustomWordPack) => {
  try {
    const packRef = doc(db, 'users', userId, 'customPacks', pack.id);
    await setDoc(packRef, { ...pack, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error saving custom pack to cloud:', error);
    throw error;
  }
};

export const deleteCustomPackFromCloud = async (userId: string, packId: string) => {
  try {
    const packRef = doc(db, 'users', userId, 'customPacks', packId);
    await deleteDoc(packRef);
  } catch (error) {
    console.error('Error deleting custom pack from cloud:', error);
  }
};

export const fetchCustomPacksFromCloud = async (userId: string): Promise<CustomWordPack[]> => {
  try {
    const colRef = collection(db, 'users', userId, 'customPacks');
    const snapshot = await getDocs(colRef);
    const packs: CustomWordPack[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as CustomWordPack;
      if (data && data.id && Array.isArray(data.words)) {
        packs.push(data);
      }
    });
    return packs;
  } catch (error) {
    console.error('Error fetching custom packs:', error);
    return [];
  }
};

// Publish & Fetch Public Shareable Pack by Code
export const publishPackToCloud = async (userId: string, pack: CustomWordPack) => {
  try {
    const pubRef = doc(db, 'publicPacks', pack.shareCode);
    await setDoc(pubRef, { ...pack, ownerUid: userId, publishedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Error publishing public pack:', error);
  }
};

export const fetchPublicPackByCode = async (shareCode: string): Promise<CustomWordPack | null> => {
  try {
    const pubRef = doc(db, 'publicPacks', shareCode.trim().toUpperCase());
    const snap = await getDoc(pubRef);
    if (snap.exists()) {
      return snap.data() as CustomWordPack;
    }
    return null;
  } catch (error) {
    console.error('Error fetching public pack:', error);
    return null;
  }
};

// Sync Player Leaderboard Profiles
export const syncPlayerProfilesToCloud = async (userId: string, profiles: PlayerProfileStats[]) => {
  try {
    await Promise.all(
      profiles.map(p => {
        const ref = doc(db, 'users', userId, 'playerProfiles', p.key);
        return setDoc(ref, p, { merge: true });
      })
    );
  } catch (error) {
    console.error('Error syncing player profiles:', error);
  }
};

// Sync Daily Challenge Record
export const saveDailyChallengeToCloud = async (userId: string, record: DailyChallengeRecord) => {
  try {
    const ref = doc(db, 'users', userId, 'dailyChallenges', record.dateKey);
    await setDoc(ref, record, { merge: true });
  } catch (error) {
    console.error('Error syncing daily challenge:', error);
  }
};
