import { db } from './firebase';
import { collection, getDocs, addDoc, query, orderBy, where, doc, runTransaction, Timestamp, serverTimestamp, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Resource } from "@/types";

const resourcesCollection = collection(db, 'resources');

function docToResource(doc: any): Resource {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        url: data.url,
        tags: data.tags,
        category: data.category,
        authorEmail: data.authorEmail,
        createdAt: (data.createdAt as Timestamp)?.toDate(),
        stars: data.stars,
        starredBy: data.starredBy,
    };
}

export async function getResources(): Promise<Resource[]> {
  const q = query(resourcesCollection, orderBy('stars', 'desc'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const resources = querySnapshot.docs.map(docToResource);
  return resources;
}

export async function getResourceById(id: string): Promise<Resource | null> {
    const docRef = doc(db, 'resources', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docToResource(docSnap);
    }
    return null;
}

export async function getResourcesByAuthor(email: string): Promise<Resource[]> {
  const q = query(resourcesCollection, where('authorEmail', '==', email), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const resources = querySnapshot.docs.map(docToResource);
  return resources;
}

export async function addResource(resourceData: Omit<Resource, 'id' | 'createdAt' | 'stars' | 'starredBy'>): Promise<Resource> {
  const newResourceData = {
    ...resourceData,
    createdAt: serverTimestamp(),
    stars: 0,
    starredBy: [],
  };
  const docRef = await addDoc(resourcesCollection, newResourceData);
  
  return {
    ...resourceData,
    id: docRef.id,
    createdAt: new Date(), // Approximate client-side date
    stars: 0,
    starredBy: [],
  };
}

export async function updateResource(id: string, data: Partial<Pick<Resource, 'title' | 'description' | 'category' | 'tags'>>): Promise<void> {
    const resourceRef = doc(db, 'resources', id);
    await updateDoc(resourceRef, data);
}

export async function deleteResource(id: string): Promise<void> {
    const resourceRef = doc(db, 'resources', id);
    await deleteDoc(resourceRef);
}


export async function starResource(resourceId: string, userId: string): Promise<Resource | null> {
    const resourceRef = doc(db, 'resources', resourceId);

    try {
        await runTransaction(db, async (transaction) => {
            const resourceDoc = await transaction.get(resourceRef);
            if (!resourceDoc.exists()) {
                throw new Error("Resource does not exist!");
            }

            const data = resourceDoc.data();
            const starredBy = data.starredBy || [];
            let newStars = data.stars || 0;
            const userIndex = starredBy.indexOf(userId);

            if (userIndex !== -1) {
                // User has already starred, so unstar
                starredBy.splice(userIndex, 1);
                newStars -= 1;
            } else {
                // User has not starred, so star
                starredBy.push(userId);
                newStars += 1;
            }
            
            transaction.update(resourceRef, { stars: newStars, starredBy: starredBy });
        });
        
        // This part is tricky as we don't have the updated doc.
        // For client-side UI updates, re-fetching is the most reliable way.
        // Returning null as the updated data is not available without another read.
        return null; 
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
}
