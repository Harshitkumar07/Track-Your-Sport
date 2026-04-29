import { getFirestore } from 'firebase/firestore';
import { app, auth } from '../../services/firebase/firebaseClient';

export const db = getFirestore(app);
export { auth };
