import { getBlob, getStorage, listAll, ref, StorageReference } from "firebase/storage";
import { app } from "./Firebase-auth";

const storage = getStorage(app)

export interface resultData {
    id: string
    text: string
    timestamp?: string // remove this arrtibute in the future?
    time_seconds: string 
    author_id: string
    finished_sentiment: string
}

export async function fetchData( vid: string, setData: (data: resultData[]) => void) {
    const dataRef = ref(storage, `/analysis/${vid}/result`);
    const fileList = await listAll(dataRef)
    let totalData: resultData[] = []
    
    if (fileList.items.length == 0) {
        throw new Error("File not found!")
    }

    var buffer: StorageReference[] = [];

    fileList.items.forEach( (itemRef) => {
        if (itemRef.name.match(".*\.json$")) {
            buffer.push(itemRef)
        }
    })

    for (const ref of buffer) {
        const bolb = await getBlob(ref)
        const data = (await bolb.text())
                       .split("\n")
                       .filter(Boolean)
                       .map((each) => (JSON.parse(each)))

        totalData = totalData.concat(data)
    }


    console.log("Total rows:", totalData.length)
    
    setData(totalData)
}