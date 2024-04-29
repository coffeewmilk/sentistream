
import Header from './components/Header'
import FormInput from './components/FormInput'
import arrow_input from './assets/arrow_input.svg'
import './App.css'

function App() {


  return (
    <>
      <Header/>
      <div className='w-max mx-auto mt-52'>
        <p className='font-logo text-xl'>SENTISTREAM</p>
        <FormInput/>
      </div>
      <div className='w-[662px] absolute top-[5px] right-[150px] z-0'>
        <img className= 'scale-y-flip -rotate-[60deg] ml-auto' src={arrow_input}/>
        <p className='font-handwrite text-lg text-white-yellow text-opacity-25'> Sign in to save and compare your results</p>
      </div>
      <div className='w-[662px] absoulute top-[550px] left-[90px] z-0'>
        <img className='ml-auto' src={arrow_input}/>
        <p className='font-handwrite text-lg text-white-yellow text-opacity-25'> Submit the YouTube streaming URL, ensuring it's a live stream with chat replay avaliable</p>
      </div>
    </>
    
  )
}

export default App
