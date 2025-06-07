import { db } from "@/firebase/client"; // adjust path if needed
import { collection, getDocs, query, where } from "firebase/firestore";

export const getAllQuizzes = async (userId) => {
  try {
    if (!userId) return [];
    
    const quizzesRef = collection(db, "quizes");
    const q = query(quizzesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const quizzes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return quizzes;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
};