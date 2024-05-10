import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { urlValidation } from "./utils/YouTubeUrlUtils"
import { User } from "./utils/UserUtils"
import { submitTask } from "./utils/CloudFunctionUtils";


initializeApp();
const db = getFirestore()

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
    const resultRef = db.collection('AnalyzeData').doc(metaData.videoId)
    const resultSnap = await resultRef.get();
  
    // Check if it exist and not failed
    if ((resultSnap.exists) && (resultSnap.data()?.status != "Failed")) {
      // Add to user queried
      user.addQuery(metaData.videoId)
      
      return "Added to query list"
    }
    // Trigger new pipeline
    const batch_uuid = await submitTask(metaData)
    user.addQuery(metaData.videoId, batch_uuid)
    return `Started new batch: ${batch_uuid} from user call`
    }
    
    const batch_uuid = await submitTask(metaData)
    return `Started new batch: ${batch_uuid} from server call`
  }
  
);
