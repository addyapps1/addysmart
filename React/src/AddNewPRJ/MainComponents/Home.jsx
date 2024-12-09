import { useContext, useEffect } from 'react';
import { AppContext } from '../Context/App_Context';
import { AiFillGithub } from "react-icons/ai";
import { AiFillLinkedin } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";
import { AiFillCrown } from "react-icons/ai";
import { AiFillPhone } from "react-icons/ai";
import { AiFillMail } from "react-icons/ai";
import { AiFillTwitterCircle } from "react-icons/ai";
import kingdomImg from '../assets/kingdom.png';

import AOS from 'aos';
import 'aos/dist/aos.css'
const Home = () => {

  useEffect(()=>{
  AOS.init({
    easing: 'ease-in-quart',
    delay: 0,
    duration: 750
  })},[])

  const { homeRef } = useContext(AppContext)

  return (
    <section  id="home" ref={homeRef} className=" max-w-[1000px] mx-auto w-full px-4 text-center gap-5 lg:text-start flex lg:flex-row flex-col-reverse justify-between lg:gap-28 items-center ">
        <div className=' h-full pt-28 flex-col justify-center lg:items-center m-2'>
          <h1 data-aos="fade-down" className='text-[52px] font-semibold text-slate-50  leading-normal'>
            Welcome To <span className=' text-fuchsia-500'>My Website!
            </span> I am <strong className=' responsiveFontSize'>KINGDOM ADELE</strong>
          </h1>

          <div className=' flex flex-row flex-wrap-reverse justify-center items-center'>
          <p data-aos="zoom-in-up" className=' flex-grow basis-[350px] text-left sm:text-justify text-white overflow-y-auto sm:max-h-80'>
          A highly skilled and results-driven Software Engineer with over a decade of experience in full-stack web development, encompassing front-end technologies like HTML5, CSS3, JavaScript, jQuery, TypeScript and React.js, as well as back-end technologies such as Node.js, PHP, and Python. Proficient in utilizing various databases including MySQL, PostgreSQL, and MongoDB. Adept at developing scalable and maintainable applications (microservices architectural designs), with a strong focus on clean code practices and test-driven development (TDD) and Behavior-Driven Development (BDD). Experienced in defensive coding and software security measures. Familiar with Docker CLI, Kubernetes CLI (Kubectl), and DevOps principles. Excellent communication and teamwork abilities, with a proven track record of delivering high-quality solutions under tight deadlines.
          </p>
          <figure data-aos="zoom-in-down" className=' max-w-[340px] min-w-[200px] m-4 aspect-square rounded-full overflow-hidden bg-slate-950 img_glow'>
            <img src={kingdomImg} className='w-full aspect-square '   alt="" />
          </figure>
    
          </div>
          <div data-aos="fade-up" className=' flex mt-2 gap-2'>
            <div className=' flex items-center justify-center'>
                <div className=' flex space-x-2 flex-wrap'>
                    <a href="https://github.com/KINGDOM-ADELE" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillGithub className=' text-[52px] h-full' />
                    </a>

                    <a href="https://linkedin.com/in/kingdom-adele" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillLinkedin  className=' text-[52px] h-full' />
                    </a>

                    <a href="https://linkedin.com/in/kingdom-adele" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillTwitterCircle  className=' text-[52px] h-full' />
                    </a>

                    <a href="https://www.youtube.com/@W3HOW-ng6fi" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillYoutube  className=' text-[52px] h-full' />
                    </a>

                    <a href="https://www.credly.com/users/kingdom-adele" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillCrown className=' text-[52px] h-full' />
                    </a>

                    <a href="tel:+2348068578748" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillPhone className=' text-[52px] h-full' />
                    </a>

                    <a href="tel:+2348068578748" target='_blank' className=' bg-slate-900 text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow p-2 m-2'>
                      <AiFillMail className=' text-[52px] h-full' />
                    </a>
                </div>


            </div>
          </div>

        </div>
      </section>
  )
}

export default Home