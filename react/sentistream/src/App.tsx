import { useRef, useState, useEffect } from 'react'

import Header from './components/Header'
import FormInput from './components/FormInput'
import { Datavisual } from './components/DataVisuals'
import SubmissionList from './components/SubmissionList'
import arrow_input from './assets/arrow_input.svg'
import { submit, submission } from './utils/Firebase-function'
import './App.css'

function App() {
  const defaultSearchRef = useRef<HTMLFormElement>(null)
  const [renderheaderSearch, setRenderHeaderSearch]  = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [submitList, setSubmitList] = useState<submission[]>([])
  
  // to use variable with in async function
  const submitListRef = useRef<submission[]>();
  submitListRef.current = submitList

  // check if user viewpoint is out of default searchbar
  const handleScroll = () => {
    if (defaultSearchRef.current) {
      if(defaultSearchRef.current.getBoundingClientRect().bottom <= 0) {
        setRenderHeaderSearch(true)
      } else {
        setRenderHeaderSearch(false)
      }
    }
  }

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrlInput("");
    submit({submitList: submitListRef, setSubmitList: setSubmitList, url: urlInput});
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  })

  return (
    <>
      <Header renderSearch={renderheaderSearch} urlInput={urlInput} setUrlInput={setUrlInput} handleSubmit={formSubmit}/>
      <SubmissionList list={submitList}/>
      <div id='toppage' className='pt-52'>
        <div className='w-max mx-auto'>
          <p className='font-logo text-xl'>SENTISTREAM</p>
          <FormInput urlInput={urlInput} setUrlInput={setUrlInput} handleSubmit={formSubmit} ref={defaultSearchRef} />
        </div>
        <div className='w-[662px] absolute top-[5px] right-[150px] z-0'>
          <img className= 'scale-y-flip -rotate-[60deg] ml-auto' src={arrow_input}/>
          <p className='font-handwrite text-lg text-white-yellow text-opacity-25'> 
            Sign in to save and compare your results
            (required!)
          </p>
        </div>
        <div className='w-[662px] absoulute top-[550px] left-[90px] z-0'>
          <img className='ml-auto' src={arrow_input}/>
          <p className='font-handwrite text-lg text-white-yellow text-opacity-25'> 
            Submit the YouTube streaming URL, ensuring it's a live stream with chat replay avaliable
          </p>
        </div>
      </div>
      <div id='bodypage' >
        <Datavisual/>
      </div>
    </>
    
  )
}

export default App
