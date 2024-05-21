import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, collection, DocumentData, doc, orderBy, query, Timestamp } from "firebase/firestore"

import { auth, db } from "../utils/Firebase-auth"
import { fetchData, resultData } from "../utils/Firebase-storage";

import { DoPlot } from "./Plot";


export function Datavisual() {
    const [userId, setUserId] = useState("")
        
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid)
                console.log(user.uid)
            }
            else {
                setUserId("")
            }
        })
        return (() => unsubscribe())
    }, []);

    // only render if use is login
    if ((userId.length != 0)) {
        return (
            <div className="px-9 mt-10">
                <DataWrapper userId={userId}/>
            </div>
            
        )
    } 
}

function DataWrapper( {userId}: {userId: string}) {
    const [data, setData] = useState<DocumentData[]>()

    useEffect(() => {
        // sort in order
        const q = query(collection (db, "User", userId, "Query"), orderBy("timestamp", "desc"))
        const unsub = onSnapshot(q, (snapshot) => {
            const docList: DocumentData[] = [];
            snapshot.forEach((doc) => docList.push(doc.data()))
            setData(docList)
        })
        return (() => {unsub()})
    }, []);

    if (data) {
        return (
            <>
                <p className="text-end border-b-[1px]">{data.length} results </p>
                <div className="text-start">
                    {data.map((each) => (
                        <DataRow key={each.videoId} historyDoc={each}/>
                    ))}    
                </div>
            </>
        )
    } else {
        return null;
    }
}




function DataRow( {historyDoc}: {historyDoc: DocumentData}) {
    const timestamp: Timestamp = historyDoc.timestamp // timestamp type
    const videoId = historyDoc.videoId 
    const [data, setData] = useState<DocumentData>()

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "AnalyzeData", videoId), (doc) => {
            setData(doc.data())
        })
        return (() => {unsub()})
    }, []);

    if (data) {
        return (
            <div className="py-2" >
                <p>{timestamp.toDate().toUTCString()}</p>
                <div className="grid grid-cols-3 gap1 bg-blue-light rounded-lg px-2 py-4">
                    <div className="col-span-2 m-auto"> 
                        <Histrogram videoData={data}/>
                    </div> 
                    <MetaData videoData={data}/>
                </div>
            </div> 
        )
    } else {
        return null
    }
}

function Histrogram( {videoData}: {videoData: DocumentData} ) {

    const vid: string = videoData?.videoId
    const [analyzeData, setAnalyzeData] = useState<resultData[]>([])
    
    // fetch again if the status changed to success?
    useEffect(() => {
        if (videoData.status == "Success") {
            fetchData(vid, setAnalyzeData)
        }
    }, [videoData.status]);


    return (
        <>
            {analyzeData.length == 0? "waiting for data": <DoPlot data={analyzeData}/>}
        </>
    )
}

function MetaData( {videoData}: {videoData: DocumentData}) {
    // need to sort object to ensure the order consistency
    const sortedList = Object.entries(videoData).sort()
    
    return (
        <div className="my-auto"> 
         {sortedList.map((item) => {
                if (item[0] != "data") return (
                    <MetaDataItem key={item[0]} name={item[0]} value={item[1]}/>
                )
            }
        )}
        </div>
    )
}

function MetaDataItem ( {name, value}: {name: string, value: string}) {

    let textColor = "text-blue-light2"
    if (name == "status") {
        if (value == "Success") {
            textColor = "text-green"
        }
        else if (value == "Failed"){
            textColor = "text-red-dark"
        }
        else {
            textColor = "text-blue-dark"
        }
    }

    return (
        <div>
            <p className="text-sm">{name}</p>
            <p className={"text-xs " + textColor}>{value}</p>
        </div>
    )
}