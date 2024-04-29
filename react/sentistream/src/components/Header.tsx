import icon_profile from "../assets/icon_profile.svg"
import ProfileMenuWrapper from "./ProfileMenu"
import { useState } from "react"

export default function Header() {
    
    const [visibility, setVisibility] = useState<boolean>(false)
    
    return (
        <>
            <div className="flex justify-end m-[10px] h-max">
                <button onClick={() => setVisibility(!visibility)}>
                    <img className="scale-[0.8]" src={icon_profile}/>
                </button>
            </div>
            <ProfileMenuWrapper visible={visibility}/>

        </>
    )
}