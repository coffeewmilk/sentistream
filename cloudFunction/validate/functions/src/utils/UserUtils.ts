import {
  Firestore, Timestamp, CollectionReference,
} from "firebase-admin/firestore";

import {getAuth} from "firebase-admin/auth";

/**
 * Representation of user
 */
export class User {
  public readonly userID: string;
  public readonly db: Firestore;
  public queryRef: CollectionReference | undefined;
  /**
   * User constructure
   * @param {string} userID - The userID
   * @param {Firestore} db - the firestore database
   */
  public constructor(userID: string, db: Firestore) {
    this.userID = userID;
    this.db = db;
  }
  /**
   * Initiate user instance
   */
  public async create() {
    // check if this user is already in firestore
    // (This could be implement with listener)
    const userRef = this.db.collection("User").doc(this.userID);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      await userRef.set({userID: this.userID});
    }
    this.queryRef = this.db.collection("User")
      .doc(this.userID)
      .collection("Query");
  }
  /**
   * Add the query into user database
   * @param {string} vid - the videoId
   * @param {string} batchID - the batchID in case the result already exist
   */
  public async addQuery( vid: string, batchID = "") {
    if (!this.queryRef) {
      return;
    }

    // delete old query if exist
    if ((await this.queryRef.doc(vid).get()).exists) {
      await this.queryRef.doc(vid).delete();
    }

    const queryAt = Timestamp.fromDate(new Date());
    let queryLog: {
      timestamp: Timestamp
      videoId: string
      alreadyExist: boolean
      batchId?: string
    };

    if (batchID.length === 0) {
      queryLog = {
        timestamp: queryAt,
        videoId: vid,
        alreadyExist: true,
      };
    } else {
      queryLog = {
        timestamp: queryAt,
        videoId: vid,
        alreadyExist: false,
        batchId: batchID,
      };
    }

    await this.queryRef.doc(vid).set(queryLog);
  }
  /**
   * The method check if user exceed quota to call the function
   * @return {number}
   */
  public async exceedQuota() {
    if (!this.queryRef) {
      return;
    }
    const currentTime = new Date();
    const quotaHours = 24;
    const quotaStartTime = new Date(
      currentTime.getTime() - quotaHours*60*60000
    );

    const q = this.queryRef
      .where("timestamp", "<", Timestamp.fromDate(currentTime))
      .where("timestamp", ">=", Timestamp.fromDate(quotaStartTime));


    const count = await q.count().get();
    // 2 calls every 24 hrs
    return (count.data().count > 2);
  }

  /**
   * Thie method check if user is email verified
   * @return {boolean}
   */
  public async emailVerified() {
    const userData = await getAuth().getUser(this.userID);
    return userData.emailVerified;
  }
}
