import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, getDoc, getFirestore } from "firebase/firestore";

import urlValidation from "./utils/YouTubeUrlUtils"
import { User } from "./utils/UserUtils"

const firebaseConfig = {
  // config
};

// Initialize Firebase
interface response {
  batch_uuid: string;
  error: string | null;
}
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "asia-southeast1");
const submitTask = httpsCallable<any, response>(functions, 'analyze', {timeout: 300000})
const db = getFirestore(app)

export const validate = onCall({timeoutSeconds: 480, region: "asia-southeast1"}, async (request) => {
  const url = request.data.url;
  const uid = request.auth?.uid;
  const metaData = await urlValidation(url)
  
  // When called from client
  if (uid) {
    logger.log("Recieved call from uid:", uid)
    const user = new User(uid, db)
    await user.create()

    const count = await user.exceedQuota()
    logger.log("call count:", count)

    
    // Check if the result already exist in database
    const resultRef = doc(db, "AnalyzeData", metaData.videoId)
    const resultSnap = await getDoc(resultRef)
    
    // Check if it exist and not failed
    if ((resultSnap.exists()) && (resultSnap.data().status != "Failed")) {
      // Add to user queried
      user.addQuery(metaData.videoId)
      
      return "Added to query list"
    }
    // Trigger new pipeline
    const batch = await submitTask(metaData)
    user.addQuery(metaData.videoId, batch.data.batch_uuid)
    return `Started new batch: ${batch.data.batch_uuid} from user call`
    }
    
    const batch = await submitTask(metaData)
    return `Started new batch: ${batch.data.batch_uuid} from server call`
  }
  
);
