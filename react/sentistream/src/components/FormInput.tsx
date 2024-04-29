export default function FormInput() {
    return (
        <form className="h-[63px] w-[661px] flex justify-between text-sm">
            <input className="bg-blue-light text-white text-opacity-50 rounded-full h-[63px] w-[586px] px-4" type="text" placeholder="https://www.youtube.com/watch?v=0O9zpZmRvxo"></input>
            <input className="bg-red-light text-red-dark h-[63px] w-[63px] rounded-full" type="submit" value="Go!"/>
        </form>
    )
} 