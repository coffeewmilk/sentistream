import { forwardRef, ForwardedRef } from "react"

const FormInput = forwardRef(function FormInput(props:
     {urlInput:string, 
      setUrlInput: (url: string) => void,
      handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void}, 
      ref: ForwardedRef<HTMLFormElement>) {
    
    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        props.setUrlInput((event.target as HTMLInputElement).value)
    }
    
    

    return (
        <form ref={ref} onSubmit={props.handleSubmit} className="h-[63px] w-[661px] flex justify-between text-sm">
            <input className="bg-blue-light text-white text-opacity-50 rounded-full h-[63px] w-[586px] px-4" 
                   type="text" 
                   placeholder="https://www.youtube.com/watch?v=0O9zpZmRvxo"
                   value={props.urlInput}
                   onChange={handleChange}></input>
            <input className="bg-red-light text-red-dark h-[63px] w-[63px] rounded-full" 
                   type="submit" 
                   value="Go!"/>
        </form>
    )
})

export default FormInput