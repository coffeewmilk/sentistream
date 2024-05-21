import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { app } from "./Firebase-auth";

const functions = getFunctions(app, "asia-southeast1");
const validate = httpsCallable(functions, 'validate', {timeout: 360000}) //6 min timeout
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

export interface submission {
    time: Date
    url: string
    error?: string
}

export async function submit({submitList, setSubmitList, url}: 
    {submitList: React.MutableRefObject<submission[] | undefined>, setSubmitList: (submitList: submission[]) => void, url: string}) {
        const submitTime = new Date()
        if (submitList.current) {
            setSubmitList([...(submitList.current), {time: submitTime, url: url}])
        }
        try {
            await validate({url: url})
        } catch (e: unknown) {
            if (submitList.current) {
                setSubmitList((submitList.current).map((submit) => {
                    if (submit.time == submitTime) {
                        return {...submit, error: (e instanceof Error)? e.message: "Unexpected error"}
                    } else {
                        return submit;
                    }
                }))
            }
            return;
        }
        console.log("This code is run")
        if (submitList.current) {
            setSubmitList(
                (submitList.current).filter(submit => submit.time !== submitTime)
            )
            
        }
}


