import icon_profile from "../assets/icon_profile.svg"
import ProfileMenuWrapper from "./ProfileMenu"
import FormInput from "./FormInput"
import { useState } from "react"

export default function Header( {renderSearch, urlInput, setUrlInput, handleSubmit}: 
    {renderSearch: boolean, 
     urlInput:string, 
     setUrlInput: (url:string) => void,
     handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void}) {
    
    const [menuVisibility, setMenuVisibility] = useState<boolean>(false)
    let additionalRender = undefined
    
    // scroll hook: if passed the logo set render to true
    if (renderSearch) {
        additionalRender = (
            <>
                <FormInput urlInput={urlInput} setUrlInput={setUrlInput} handleSubmit={handleSubmit}/>
                <p className='font-logo text-lg'>SENTISTREAM</p>
            </>
        )
    }

    return (
        <div className="sticky top-2.5 z-10">
            <div className="flex flex-row-reverse justify-between m-[10px] h-max">
                <button onClick={() => setMenuVisibility(!menuVisibility)}>
                    <img className="scale-[0.8]" src={icon_profile}/>
                </button>
                {/* this two only visible if user scroll pass the logo */}
                {additionalRender}
            </div>
            <ProfileMenuWrapper visible={menuVisibility}/>

        </div>
    )
}