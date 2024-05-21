import {HttpsError, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

import {urlValidation, metaData} from "./utils/YouTubeUrlUtils";
import {User} from "./utils/UserUtils";
import {submitTask} from "./utils/CloudFunctionUtils";


initializeApp();
const db = getFirestore();

export const validate = onCall({timeoutSeconds: 480, region: "asia-southeast1"},
  async (request) => {
    const url = request.data.url;
    const uid = request.auth?.uid;
    let metaData: metaData
    let batchId: string
    
    try {
      metaData = await urlValidation(url);
    } catch (e) {
      throw new HttpsError("invalid-argument", 
                `The function is unable to extract video: ${e}`)
    }

    // When called from client
    if (uid) {
      logger.log("Recieved call from uid:", uid);
      const user = new User(uid, db);
      await user.create();
      
      // Does user exceed call quota?
      if (await user.exceedQuota()) {
        throw new HttpsError("permission-denied", "exceed Quota")
      }

      // Is user email verified?
      if (!(await user.emailVerified())) {
        throw new HttpsError("permission-denied",
                  "Please verifiy your email!" )
      }

      // Check if the result already exist in database
      const resultRef = db.collection("AnalyzeData").doc(metaData.videoId);
      const resultSnap = await resultRef.get();

      // Check if it exist and not failed
      if ((resultSnap.exists) && (resultSnap.data()?.status != "Failed")) {
      // Add to user queried
        user.addQuery(metaData.videoId);

        return "Added to query list";
      }
      // Trigger new pipeline
      try {
        batchId = await submitTask(metaData);
      } catch (e) {
        throw new HttpsError("internal", 
                  `Task submittion failed: ${e}`)
        
      }
      user.addQuery(metaData.videoId, batchId);
      return `Started new batch: ${batchId} from user call`;
    }

    try {
      batchId = await submitTask(metaData);
    } catch (e) {
      throw new HttpsError("internal", 
                `Task submittion failed: ${e}`)
    }
    return `Started new batch: ${batchId} from server call`;
  }

);
