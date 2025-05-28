// "use server";

// import { auth, db } from "@/firebase/admin";

// // get questions and answers stored in the quiz collection from db
// export async function getQuizData(userId) {
//   try {
//     const quizRef = db.collection("quiz").doc(userId);
//     const quizDoc = await quizRef.get();

//     if (!quizDoc.exists) {
//       return { success: false, message: "No quiz data found for this user." };
//     }

//     const quizData = quizDoc.data();
//     return { success: true, data: quizData };
//   } catch (error) {
//     console.error("Error fetching quiz data:", error);
//     return { success: false, message: "Failed to fetch quiz data." };
//   }
// }