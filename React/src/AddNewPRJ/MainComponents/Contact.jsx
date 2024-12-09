import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../Context/App_Context';

const Contact = () => {
  const { contactRef } = useContext(AppContext)

  const [attributeValueL, setAttributeValueL] = useState('flip-up');
  const [attributeValueR, setAttributeValueR] = useState('flip-up');

  useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      // Example condition: change attribute value based on window width
      if (window.innerWidth < 600) {
        setAttributeValueL('flip-up');
        setAttributeValueR('flip-up');
      } else {
        setAttributeValueL('fade-right');
        setAttributeValueR('fade-left');
      }
    };

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    // Call handleResize once when component mounts
    handleResize();

    // Clean up: remove event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array ensures effect runs only once on mount


  return (
    <section id="contacts" ref={contactRef} className="h-full max-w-[1000px] mx-auto w-full pb-14 text-center gap-5 lg:text-start flex lg:flex-row flex-col-reverse justify-between lg:gap-28 items-center">
    <div className=' mypaddingTop  flex-col justify-center lg:items-center m-auto  '>
     

      <div className=' flex flex-row flex-wrap justify-center items-center'>
        <h2 data-aos="fade-down" className='text-[52px] w-full font-semibold leading-normal align-middle flex justify-center'>
          <span className=' text-fuchsia-500'>CONTACT ME</span>
        </h2>
          <form action="" className='flex flex-col m-4 max-w-[700px]'>
              <input className=' bg-slate-800 p-2 text-white text-xl border-2 rounded border-fuchsia-800 b_glow' type="text" name="" id="" placeholder='Enter Full name' />
            <div className=' py-4 gap-4 flex flex-wrap '>
              <input data-aos={attributeValueL}  className=' bg-slate-800 p-2 text-white text-xl border-2 rounded border-fuchsia-800 b_glow flex-1 basis-[200px]' type="text" name="" id="" placeholder='Enter Email' />
              <input data-aos={attributeValueR}  className=' bg-slate-800 p-2 text-white text-xl border-2 rounded border-fuchsia-800 b_glow flex-1 basis-[200px]' type="text" name="" id="" placeholder='Enter Phone' />
            </div>
            <textarea className=' bg-slate-800 p-2 text-white text-xl border-2 rounded border-fuchsia-800 b_glow resize-none' name="" id="" cols="100%" placeholder='Write your message here ... ' rows="5"></textarea>
            <button data-aos="fade-up" className='neno-button shadow-xl b_glow text-white border-2 hover:bg-fuchsia-500 border-fuchsia-800  hover:border-fuchsia-500 rounded-lg py-2 px-8 mt-4 uppercase relative overflow-hidden'>
              SEND
            </button>
          </form>

        </div>
        </div>
    </section>
  )
}

export default Contact