// src/app/services/blog/blog.service.ts
import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from '@angular/fire/firestore';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from '@angular/fire/storage';
import { BlogPost } from '../../core/interfaces/blog/blog-post.interface';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly COLLECTION_NAME = 'blog-posts';
  private readonly STORAGE_PATH = 'blog-images';

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  async createPost(post: BlogPost): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(this.firestore, this.COLLECTION_NAME), 
        {
          ...post,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(post: BlogPost): Promise<void> {
    if (!post.id) throw new Error('Post ID is required');
    
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, post.id);
      await updateDoc(docRef, {
        ...post,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      // Primero obtener el post para verificar si tiene imagen
      const post = await this.getPostById(postId);
      if (post?.imageUrl) {
        await this.deleteImage(post.imageUrl);
      }
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, postId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async getPostById(postId: string): Promise<BlogPost | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, postId);
      const docSnap = await getDocs(query(collection(this.firestore, this.COLLECTION_NAME), where('id', '==', postId)));
      
      if (docSnap.empty) return null;
      
      const data = docSnap.docs[0].data();
      return {
        ...data,
        id: docSnap.docs[0].id,
        createdAt: data['createdAt'].toDate(),
        updatedAt: data['updatedAt'].toDate()
      } as BlogPost;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data()['createdAt'].toDate(),
        updatedAt: doc.data()['updatedAt'].toDate()
      })) as BlogPost[];
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  async getRelatedPosts(currentPostId: string, tags: string[], limitCount: number = 3): Promise<BlogPost[]> {
    try {
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('status', '==', 'published'),
        where('tags', 'array-contains-any', tags),
        where('id', '!=', currentPostId),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data()['createdAt'].toDate(),
        updatedAt: doc.data()['updatedAt'].toDate()
      })) as BlogPost[];
    } catch (error) {
      console.error('Error getting related posts:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, `${this.STORAGE_PATH}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  private async deleteImage(imageUrl: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, imageUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async getPosts(): Promise<BlogPost[]> {
    try {
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data()['createdAt'].toDate(),
        updatedAt: doc.data()['updatedAt'].toDate()
      })) as BlogPost[];
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }
}