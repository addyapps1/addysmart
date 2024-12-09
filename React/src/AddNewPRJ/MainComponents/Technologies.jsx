import { useContext, useEffect } from 'react';
import { AppContext } from '../Context/App_Context';

import AOS from 'aos';
import 'aos/dist/aos.css'

const Technologies  = () => {

  useEffect(()=>{
    AOS.init({
      easing: 'ease-in-quart',
      delay: 0,
      duration: 750
    })},[])
  
  const { technologiesRef } = useContext(AppContext)

  return (
    <section  id="technologies" ref={technologiesRef} className="mypaddingTop h-full my-20 max-w-[1000px] mx-auto w-full px-4 text-center gap-5 lg:text-start flex lg:flex-row flex-col-reverse justify-between lg:gap-28 items-center ">
    <div className=' flex-col justify-center lg:items-center'>
     

      <div className=' flex flex-row flex-wrap justify-center items-center'>
        <h2 data-aos="fade-down" className='text-[52px] w-full font-semibold leading-normal align-middle flex justify-center'>
          <span data-aos="zoom-in"  className=' text-fuchsia-500 responsiveFontSize'>TECHNOLOGIES</span>
        </h2>
        <div className=' w-full flex justify-center flex-wrap '>
          <h3 data-aos="zoom-in" className=' w-full text-white text-center text-[40px]'>LANGUAGES</h3>
            <div data-aos="fade-up" className=' techs '>HTML5</div>
            <div data-aos="fade-down" className=' techs '>CSS3</div>
            <div data-aos="fade-up" className=' techs '>JAVASCRIPT</div>
            <div data-aos="fade-down" className=' techs '>TYPESCRIPT</div>
            <div data-aos="fade-up" className=' techs '>TAILWIND</div>
            <div data-aos="fade-down" className=' techs '>REACT.JS</div>
            <div data-aos="fade-up" className=' techs '>NODE.js</div>
            <div data-aos="fade-down" className=' techs '>EXPRESS</div>
            <div data-aos="fade-up" className=' techs '>PYTHON</div>
            <div data-aos="fade-down" className=' techs '>FLASK</div>
            <div data-aos="fade-up" className=' techs '>Django</div>
            <div data-aos="fade-down" className=' techs '>PHP</div>
            <div data-aos="fade-up" className=' techs '>LARAVEL</div>
            <div data-aos="fade-down" className=' techs '>SHELL</div>
            <div data-aos="fade-up" className=' techs '>GHERKIN</div>
            <div data-aos="fade-down" className=' techs '>YAML</div>



        </div>

        <div className=' w-full flex justify-center flex-wrap m-12 '>
            <h3 data-aos="zoom-in" className=' w-full text-white text-center text-[40px]'>TESTING FOR JAVASCRIPT</h3>
            <div data-aos="fade-up" className=' techs '>Jest</div>
            <div data-aos="fade-down" className=' techs '>Mocha</div>
            <div data-aos="fade-up" className=' techs '>Chai</div>
            <div data-aos="fade-down" className=' techs '>Nyc</div>
            <div data-aos="fade-up" className=' techs '>Synon</div>
            <div data-aos="fade-down" className=' techs '>Supertest</div>
            <div data-aos="fade-up" className=' techs '>Should</div>
            <div data-aos="fade-down" className=' techs '>Cucumber.js </div>
        </div>

        <div className=' w-full flex justify-center flex-wrap m-12 '>
            <h3 data-aos="zoom-in" className=' w-full text-white text-center text-[40px]'>TESTING FOR REACT</h3>
            <div data-aos="flip-up" className=' techs '>Jest</div>
            <div data-aos="flip-left" className=' techs '>Enzyme</div>
        </div>
        
        <div className=' w-full flex justify-center flex-wrap m-12  '>
            <h3 data-aos="zoom-in" className=' w-full text-white text-center text-[40px]'>TESTING FOR PYTHON</h3>
            <div data-aos="flip-left" className=' techs '>Nose</div>
            <div data-aos="flip-right" className=' techs '>Pytest</div>
            <div data-aos="flip-left" className=' techs '>Unittest</div>
            <div data-aos="flip-right" className=' techs '>Behave</div>
        </div>


        <div className=' w-full flex justify-center flex-wrap m-12 '>
            <h3 data-aos="zoom-in" className=' w-full text-white text-center text-[40px]'>TESTING FOR PHP</h3>
            <div data-aos="flip-up" className=' techs '>PHPUnit</div>
            <div data-aos="flip-left" className=' techs '>Codeception</div>
        </div>


        <div className=' w-full flex justify-center flex-wrap m-12 '>
            <h3 data-aos="zoom-in" className=' w-full text-white text-center text-[40px]'>DEVOPS</h3>
            <div data-aos="fade-up" className=' techs '>Docker</div>
            <div data-aos="fade-down" className=' techs '>Kubernetes</div>
            <div data-aos="fade-up" className=' techs '>Git Action</div>
            <div data-aos="fade-down" className=' techs '>IBM Cloud</div>
        </div>


      </div>
    </div>

  </section>
  )
}

export default Technologies 