import { useContext } from 'react';
import { AppContext } from '../Context/App_Context';
// import kingdomImg from '../assets/kingdom.png';
import slyders_prj from '../assets/slyders_prj.png';
import ZENAGER_prj from '../assets/ZENAGER_prj.png';
import shop_addy from '../assets/shop_addy.png';
import mrcv from '../assets/mrcv.png';

// import htmlstaticnav_prj from '../assets/htmlstaticnav.prj.png';

import { LiaGlobeSolid } from "react-icons/lia";
import { AiFillGithub } from "react-icons/ai";


const Projects = () => {
  const { projectsRef } = useContext(AppContext)

  return (
    <section id="projects" ref={projectsRef} className="mypaddingTop h-full my-20 max-w-[1000px] mx-auto w-full px-4 text-center  lg:text-start flex lg:flex-row flex-col-reverse justify-between lg:gap-28 items-center ">
    <div className=' flex-col justify-center lg:items-center'>
     

      <div className=' flex flex-row flex-wrap justify-center items-center'>
        <h2 data-aos="fade-down" className='text-[52px] w-full font-semibold leading-normal align-middle flex justify-center'>
          <span data-aos="zoom-in" className=' text-fuchsia-500'>PROJECTS</span>
        </h2>
        {/* <div className=' w-full flex justify-center flex-wrap '>
          <h3 className=' w-full text-white text-center text-[40px]'>MERN STACK</h3>
            <div data-aos="fade-up" className=' techs '>HTML5</div>
            <div data-aos="fade-down" className=' techs '>CSS3</div>
            <div data-aos="fade-up" className=' techs '>JAVASCRIPT</div>
            <div data-aos="fade-down" className=' techs '>TYPESCRIPT</div>
        </div> */}


            <div className=' w-full flex justify-center flex-wrap '>
                <div data-aos="fade-up" className=' projects overflow-hidden'>
                <img src={ZENAGER_prj} className='w-full aspect-video   '   alt="project1-image" />

                <p  className=' h-28 overflow-y-auto mt-2 px-1 ' >
                A full MERN stack project. Zenager is highly relevant to school management because it provides a comprehensive cloud-based platform to host and manage student data, 
                course records, class schedules, and more. It streamlines the registration process, eliminates queues, and enhances the management of schools.
                Why It Matters:
                My project matters because it reduces the stress and workload of administrative workers, eases the registration process, and ultimately aims to improve the school 
                management system, benefiting both administrators and students. It brings innovation and efficiency to the world of education.
                </p>
                <div className=" flex justify-center gap-2 my-1">
                <a href="https://github.com/KINGDOM-ADELE/ALXPORTFOLIO" target='_blank' ><AiFillGithub className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                <a href="https://zenager.onrender.com" target='_blank'><LiaGlobeSolid className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                </div>
                </div>

                <div data-aos="fade-down" className=' projects overflow-hidden'>
                  <img src={slyders_prj} className='w-full aspect-video   '   alt="project1-image" />
                  <p  className=' h-28 overflow-y-auto mt-2 px-1 ' >
                    In this project, i was just playing with the different carousel moves i could make with html css and javascript. Also showcasing some moves with background images 
                  </p>
                  <div className=" flex justify-center gap-2 my-1">
                  <a href="https://mysliders.onrender.com" target='_blank'><AiFillGithub className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                  <a href="https://github.com/KINGDOM-ADELE/SLIDERS" target='_blank'><LiaGlobeSolid className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                  </div>
                </div>

                <div data-aos="fade-up" className=' projects overflow-hidden'>
                <img src={mrcv} className='w-full aspect-video'   alt="project1-image" />
                  <p  className=' h-28 overflow-y-auto  mt-2 px-1' >
                  A full MERN stack project. I had to fix this up for M-R international, as an impromptu project needed for use the next morning 9:00Am. I was informed about it late at night, since the 
                  team assigned to the recruitment test project failded their deadline, the department needed something to give the propects. And by 6.xx pm my manager asked me of a project like this to 
                  be used the next morning to get CV&apos;s from prospects. I implemented drag and drop file uploads system in this project.
                  </p>
                  <div className=" flex justify-center gap-2 my-1">
                <a href="https://github.com/KINGDOM-ADELE/MRSoftHubPortal" target='_blank'><AiFillGithub className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                <a href="https://mrsofthubportal.onrender.com/" target='_blank'><LiaGlobeSolid className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                </div>
                </div>

                <div data-aos="fade-down" className=' projects overflow-hidden'>
                <img src={shop_addy} className='w-full aspect-video   '   alt="project1-image" />
                  <p  className=' h-28 overflow-y-auto mt-2 px-1 ' >
                    A Full stack Django project. A simple e-commerce MVP using Django framework, and django templating frame work, powered by a PostgreSQL database. Though the free PostgreSQL hosting is just available 
                    for 90days and it will be taken down which might affect this project in future if the database is not updated
                  </p>
                  <div className=" flex justify-center gap-2 my-1">
                <a href="https://github.com/KINGDOM-ADELE/Django_pipenv_ecommerce_CUM" target='_blank'><AiFillGithub className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                <a href="https://shopaddycus.onrender.com" target='_blank'><LiaGlobeSolid className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                </div>
                </div>


                {/* <div data-aos="fade-up" className=' projects overflow-hidden'>
                <img src={htmlstaticnav_prj} className='w-full aspect-video   '   alt="project1-image" />
                  <p  className=' h-28 overflow-y-auto  mt-2 px-1' >
                    A highly skilled and results-driven Software Engineer with over a decade of experience in full-stack web development, encompassing front-end technologies like HTML5, CSS3, JavaScript, jQuery, TypeScript and React.js, as well as back-end technologies such as Node.js, PHP, and Python. Proficient in utilizing various databases including MySQL, PostgreSQL, and MongoDB. Adept at developing scalable and maintainable applications (microservices architectural designs), with a strong focus on clean code practices and test-driven development (TDD) and Behavior-Driven Development (BDD). Experienced in defensive coding and software security measures. Familiar with Docker CLI, Kubernetes CLI (Kubectl), and DevOps principles. Excellent communication and teamwork abilities, with a proven track record of delivering high-quality solutions under tight deadlines.
                  </p>
                  <div className=" flex justify-center gap-2 my-1">
                <a href="https://github.com/KINGDOM-ADELE/HTMLSTATICNAV" target='_blank'><AiFillGithub className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                <a href="https://htmlstaticnav.onrender.com" target='_blank'><LiaGlobeSolid className=' text-[22px] h-full  text-fuchsia-600 hover:text-fuchsia-500 rounded-full glow' /></a>
                </div>
                </div> */}
                
            </div>
        </div>
        </div>
    </section>
  )
}

export default Projects