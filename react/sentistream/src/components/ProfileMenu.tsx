import { useState } from "react";


export default function ProfileMenuWrapper({visible = false}: {visible: boolean}) {
    
    const [isLogin, setIsLogin] = useState<boolean>(false)
    const [hasAccount, setHasAccount] = useState<boolean>(true)

    if (!isLogin) 
    return (
        <div className={"absolute top-[100px] right-[10px] text-base z-10 " + (visible? "visible": "hidden")}>
            {hasAccount? <SignInMenu setIsLogin={setIsLogin} setHasAccount={setHasAccount}/>: 
                         <RegisterMenu setIsLogin={setIsLogin} setHasAccount={setHasAccount}/>}
        </div>
    )
}

interface setStatus {
    setIsLogin: (isLogin: boolean) => void;
    setHasAccount: (hasAccount: boolean) => void
}

function SignInMenu( {setIsLogin, setHasAccount}: setStatus) {
    return (
        <form className="bg-blue-dark2 w-[374px] rounded-3xl p-4 flex flex-col space-y-8 text-sm">
            <p> Sign in</p>
            <DataInputField name="Username"/>
            <DataInputField name="Password"/>
            <FormButtonFooter setIsLogin={setIsLogin} setHasAccount={setHasAccount} hasAccount={true}/>
        </form>
    )
}

function RegisterMenu({setIsLogin, setHasAccount}: setStatus) {
    return (
        <form className="bg-blue-dark2 w-[374px] rounded-3xl p-4 flex flex-col space-y-8 text-sm">
            <p> Register</p>
            <DataInputField name="Username"/>
            <DataInputField name="Password"/>
            <DataInputField name="Re-enter Password"/>
            <DataInputField name="Email address"/>
            <FormButtonFooter setIsLogin={setIsLogin} setHasAccount={setHasAccount} hasAccount={false}/>
        </form>
    )
}

function DataInputField( {name} : {name: string} ) {
    return (
        <input type="text" name={name} placeholder={name} className="bg-blue-light text-white text-opacity-50 rounded-full h-[48px] w-[313px] px-4 mx-auto"/>
    )
}

interface FooterSetStatus extends setStatus {
    hasAccount: boolean
}

function FormButtonFooter( {setIsLogin, setHasAccount, hasAccount = true} : FooterSetStatus) {
        
    return (
        <div className="flex justify-between px-6">
            <button onClick={ () => setHasAccount(!hasAccount)} className="text-xs">{hasAccount? "Create new account": "Already has an account?"}</button>
            <FormSubmitButton name={hasAccount? "Sign in": "Create"} setIsLogin={setIsLogin}/>
        </div>
    )
}

function FormSubmitButton ( {name, setIsLogin} : {name: string, setIsLogin: (Islogin: boolean) => void}) {
    return (<input className="bg-green text-white h-[34px] px-2 rounded-full text-xs" type="submit" value={name}/> )
}