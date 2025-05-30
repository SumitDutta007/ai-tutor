import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client"; // adjust path if needed

export const getAllQuizzes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "quizes"));
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