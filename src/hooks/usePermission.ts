import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const ADMIN_EMAIL = 'peng24@gmail.com';

export interface UserPermission {
  email: string;
  displayName?: string;
  canEdit: boolean;
  grantedAt?: string;
  grantedBy?: string;
}

/**
 * Check if a given email has edit permission.
 * Admin always has full permission.
 */
export function usePermission(email: string | null | undefined) {
  const [canEdit, setCanEdit] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingPermission, setLoadingPermission] = useState(true);

  useEffect(() => {
    if (!email) {
      setCanEdit(false);
      setIsAdmin(false);
      setLoadingPermission(false);
      return;
    }

    // Admin always has full access
    if (email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setCanEdit(true);
      setLoadingPermission(false);
      return;
    }

    setIsAdmin(false);

    // Listen to Firestore for real-time permission updates
    const docRef = doc(db, 'allowedUsers', email);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserPermission;
          setCanEdit(data.canEdit === true);
        } else {
          setCanEdit(false);
        }
        setLoadingPermission(false);
      },
      (err) => {
        console.error('[usePermission] Firestore error:', err);
        setCanEdit(false);
        setLoadingPermission(false);
      }
    );

    return () => unsubscribe();
  }, [email]);

  return { canEdit, isAdmin, loadingPermission };
}

/**
 * One-time check (no subscription) — used during login flow.
 */
export async function checkPermissionOnce(email: string): Promise<boolean> {
  if (email === ADMIN_EMAIL) return true;
  try {
    const snap = await getDoc(doc(db, 'allowedUsers', email));
    if (snap.exists()) {
      return (snap.data() as UserPermission).canEdit === true;
    }
    return false;
  } catch {
    return false;
  }
}
