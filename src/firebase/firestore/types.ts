import { FirestoreError } from "firebase/firestore";

export type WithId<T> = T & { id: string };

export interface Snapshot<T> {
    data: T | null;
    loading: boolean;
    error: FirestoreError | null;
}
