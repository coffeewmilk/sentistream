import { doc, collection, getDoc, setDoc, addDoc, query, where, getCountFromServer } from "firebase/firestore";
import { Firestore, Timestamp } from "firebase/firestore";
import { CollectionReference } from "firebase/firestore";

export class User {
    public readonly userID: string
    public readonly db: Firestore
    public queryRef: CollectionReference | undefined
    
    public constructor(userID: string, db: Firestore) {
        this.userID = userID;
        this.db = db
    }

    public async create() {
        // check if this user is already in firestore (This could be implement with listener)
        const userRef = doc(this.db, "User", this.userID)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
            setDoc(userRef, { userID: this.userID })
        }
        this.queryRef = collection(this.db, "User", this.userID, "Query")
    }

    public async addQuery( vid: string, batchID: string = "") {
        if (!this.queryRef) {
            return
        }
        
        const queryAt = Timestamp.fromDate(new Date());
        let queryLog: any;
        
        if (batchID.length === 0) {
            queryLog = {
                timestamp: queryAt,
                videoID: vid,
                alreadyExist: true,
            }
        }   
        else {
            queryLog = {
                Timestamp: queryAt,
                videoId: vid,
                alreadyExist: false,
                batchID: batchID
                }
            }
        
        await addDoc(this.queryRef, queryLog)
    }

    public async exceedQuota() {
        // todo
        if (!this.queryRef) {
            return 
        }
        const currentTime = new Date();
        const quotaHours = 24;
        const quotaStartTime = new Date(currentTime.getTime() - quotaHours*60*60000);
        
        const q = query(this.queryRef, 
                        where("timestamp", "<", Timestamp.fromDate(currentTime)), 
                        where("timestamp", ">=", Timestamp.fromDate(quotaStartTime))
                    )

        const count = await getCountFromServer(q)
        return count.data().count
        
    }
}