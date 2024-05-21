import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/Firebase-auth";
import { ErrorBoundary } from "react-error-boundary";
import { signIn, register, signOut, verifyEmail } from "../utils/Firebase-auth";
import firebase from "firebase/compat/app";


export default function ProfileMenuWrapper({visible = false}: {visible: boolean}) {
    
    const [isLogin, setIsLogin] = useState<boolean>(false)
    const [hasAccount, setHasAccount] = useState<boolean>(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLogin(true)
            }
            else {
                setIsLogin(false)
            }
        })
        return (() => unsub())
    }, []);

    
    return (
        <div className={"absolute top-[60px] right-[10px] text-base z-10 " + (visible? "visible": "hidden")}>
            {isLogin? <UserMenu/> :(hasAccount? <SignInMenu setHasAccount={setHasAccount}/>: 
                        <RegisterMenu setHasAccount={setHasAccount}/>)}
        </div>
    )
    
}

interface setStatus {
    setHasAccount: (hasAccount: boolean) => void
}

function SignInMenu( {setHasAccount}: setStatus) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitError, setSubmitError] = useState<null| firebase.FirebaseError>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signIn({email, password}).catch((e) => setSubmitError(e))
    }

    return (
        <ErrorBoundary fallback={ <p> Error </p>} >
            <form onSubmit={handleSubmit} className="bg-blue-dark2 w-[374px] rounded-3xl p-4 flex flex-col space-y-8 text-sm">
                <p> Sign in</p>
                <DataInputField name="Email address" setInputState={setEmail}/>
                <DataInputField name="Password" setInputState={setPassword} isPassword={true}/>
                <FormButtonFooter setHasAccount={setHasAccount} hasAccount={true}/>
                <ErrorDisplay submitError={submitError}/>
            </form>
        </ErrorBoundary>
    )
}

function RegisterMenu( {setHasAccount}: setStatus) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rePassword, setRePassword] = useState("")
    const [submitError, setSubmitError] = useState<null| firebase.FirebaseError>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password == rePassword) {
            register({email, password}).catch((e) => setSubmitError(e))
        }
    }
    
    return (
        <form onSubmit={handleSubmit} className="bg-blue-dark2 w-[374px] rounded-3xl p-4 flex flex-col space-y-8 text-sm">
            <p> Register</p>
            <DataInputField name="Email address" setInputState={setEmail}/>
            <DataInputField name="Password" 
                            setInputState={setPassword} 
                            addStyle={(password == rePassword)? "": "outline outline-red-light"} 
                            isPassword={true}/>

            <DataInputField name="Re-enter Password" 
                            setInputState={setRePassword} 
                            addStyle={(password == rePassword)? "": "outline outline-red-light"} 
                            isPassword={true}/>

            <FormButtonFooter setHasAccount={setHasAccount} hasAccount={false}/>
            <ErrorDisplay submitError={submitError}/>
        </form>
    )
}

function UserMenu() {
    const userEmail = auth.currentUser?.email

    const [isEmailVerified, setIsEmailVerified] = useState(auth.currentUser?.emailVerified)
    const [message, setMessage] = useState("")

    function renderVerificationStatus() {
        if (!isEmailVerified) {
            return (
                <div className="text-xs">
                    <div className="flex flex-row justify-between">
                        <p>Please verify your Email</p>
                        <button className="bg-green text-white px-1 rounded-full" onClick={sendEmailVerification}>send</button>
                    </div>
                    <p className="text-red-light">{message}</p>
                </div>
            )
        } else {
            return 
        }
    }
    
    function checkEmailVerification() {
        auth.currentUser?.reload().then(
            () => {
                if (auth.currentUser?.emailVerified) {
                    setIsEmailVerified(true)
                    setMessage("")
                }
            }
        )
    }

    function sendEmailVerification() {
        verifyEmail().then(() => setMessage("Verification email is sent"))
                         .catch((e: unknown) => {
                            if (e instanceof Error) {
                                setMessage(e.message)
                            } else {
                                setMessage("Undefined error")
                            }
                        })
    }
    
    useEffect(() => {
        if ((isEmailVerified != undefined) && (!isEmailVerified)) {
            
            // check every 500ms
            const intervalId = setInterval(checkEmailVerification, 500)
            return(() => clearInterval(intervalId))
        }


    }, [isEmailVerified])
    
    return (
        <div className="bg-blue-dark2 rounded-3xl p-4 flex flex-col space-y-5 text-sm">
            <p className="border-b-[1px]">{userEmail}</p>
            <UserMenuButton name="Setting"/>
            <UserMenuButton name="Sign out" clickFunction={signOut}/>
            {renderVerificationStatus()}
        </div>
    )
}

function UserMenuButton( {name, clickFunction, addStyle=""}: {name: string, clickFunction?: () => void, addStyle?: string}) {
    return (
        <button className={""+ addStyle} onClick={clickFunction}>{name}</button>
    )
}

function DataInputField( {name, setInputState, isPassword=false, addStyle=""} : 
{name: string, setInputState: (input:string) => void, isPassword?:boolean, addStyle?:string} ) {
    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        setInputState((event.target as HTMLInputElement).value)
    }
    
    return (
        <input type={isPassword? "password": "text"} 
               name={name} 
               placeholder={name} 
               onChange={handleChange} 
               className={"bg-blue-light text-white text-opacity-50 rounded-full h-[48px] w-[313px] px-4 mx-auto " + addStyle}/>
    )
}

interface FooterSetStatus extends setStatus {
    hasAccount: boolean
}

function FormButtonFooter( {setHasAccount, hasAccount = true} : FooterSetStatus) {
        
    return (
        <div className="flex justify-between px-6">
            <button type="button" onClick={ () => setHasAccount(!hasAccount)} className="text-xs">{hasAccount? "Create new account": "Already has an account?"}</button>
            <FormSubmitButton name={hasAccount? "Sign in": "Create"}/>
        </div>
    )
}

function FormSubmitButton ( {name} : {name: string}) {
    return (<button className="bg-green text-white h-[34px] px-2 rounded-full text-xs" type="submit" >{name}</button> )
}

function ErrorDisplay ( {submitError}: {submitError: null| firebase.FirebaseError}) {
    if (submitError !== null) {
        return <p className="text-xs text-red-dark">{submitError?.code}</p>
    }
}