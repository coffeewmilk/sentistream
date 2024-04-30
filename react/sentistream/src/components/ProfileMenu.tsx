import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/Firebase";
import { ErrorBoundary } from "react-error-boundary";
import { signIn, register, signOut } from "../utils/Firebase";
import firebase from "firebase/compat/app";


export default function ProfileMenuWrapper({visible = false}: {visible: boolean}) {
    
    const [isLogin, setIsLogin] = useState<boolean>(false)
    const [hasAccount, setHasAccount] = useState<boolean>(true)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLogin(true)
            }
            else {
                setIsLogin(false)
            }
        })
    });

    
    return (
        <div className={"absolute top-[100px] right-[10px] text-base z-10 " + (visible? "visible": "hidden")}>
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
                <DataInputField name="Password" setInputState={setPassword}/>
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
        register({email, password, rePassword}).catch((e) => setSubmitError(e))
    }
    
    return (
        <ErrorBoundary fallback={<p> Error</p>} >
            <form onSubmit={handleSubmit} className="bg-blue-dark2 w-[374px] rounded-3xl p-4 flex flex-col space-y-8 text-sm">
                <p> Register</p>
                <DataInputField name="Email address" setInputState={setEmail}/>
                <DataInputField name="Password" setInputState={setPassword} addStyle={(password == rePassword)? "": "outline outline-red-light"}/>
                <DataInputField name="Re-enter Password" setInputState={setRePassword} addStyle={(password == rePassword)? "": "outline outline-red-light"}/>
                <FormButtonFooter setHasAccount={setHasAccount} hasAccount={false}/>
                <ErrorDisplay submitError={submitError}/>
            </form>
        </ErrorBoundary>
    )
}

function UserMenu() {
    const userEmail = auth.currentUser?.email
    
    return (
        <div className="bg-blue-dark2 w-[374px] rounded-3xl p-4 flex flex-col space-y-8 text-sm">
            <p>{userEmail}</p>
            <UserMenuButton name="Setting"/>
            <UserMenuButton name="Sign out" clickFunction={signOut}/>
        </div>
    )
}

function UserMenuButton( {name, clickFunction, addStyle=""}: {name: string, clickFunction?: () => void, addStyle?: string}) {
    return (
        <button className={""+ addStyle} onClick={clickFunction}>{name}</button>
    )
}

function DataInputField( {name, setInputState, addStyle=""} : {name: string, setInputState: (input:string) => void, addStyle?:string} ) {
    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        setInputState((event.target as HTMLInputElement).value)
    }
    
    return (
        <input type="text" name={name} placeholder={name} onChange={handleChange} className={"bg-blue-light text-white text-opacity-50 rounded-full h-[48px] w-[313px] px-4 mx-auto " + addStyle}/>
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