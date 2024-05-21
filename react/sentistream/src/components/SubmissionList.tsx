import { useState } from 'react'

import { submission } from '../utils/Firebase-function'



export default function SubmissionList( {list}: {list: submission[]}) {

    const length = list.length
    const [isToggle, setIsToggle] = useState(false)
    
    return (
        <div className='fixed bottom-3 right-6 text-end'>
            <div className={"bg-blue-dark2 rounded-3xl p-4 flex flex-col space-y-5 text-sm max-h-72 overflow-y-auto " + (isToggle? "visible": "hidden")}>
                {list.length == 0? "Submit url at the input bar!" : list.map((submisstion) => <SubmissionRow submission={submisstion}/>)}
            </div>
            <button onClick={() => setIsToggle(!isToggle)}>{`${length} submitting`}</button>
        </div>
    )
}

function SubmissionRow( {submission}: {submission: submission}) {
    
    return (
        <div className='border-b-[1px] w-[470px] max-h-40'>
            <p>{submission.time.toUTCString()}</p>
            <p>{submission.url}</p>
            {(submission.error) && <p className='text-red-light'>{submission.error}</p>}
        </div>
    )
}