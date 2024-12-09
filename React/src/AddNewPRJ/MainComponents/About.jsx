import { useContext, useEffect } from 'react';
import { AppContext } from '../Context/App_Context';
import kingdomImg from '../assets/kingdomPro.jpg';
import resumePdf from '../assets/resume/ADELE_KINGDOM_RESUME.pdf'; 

import AOS from 'aos';
import 'aos/dist/aos.css'

const About = () => {
  useEffect(()=>{
    AOS.init({
      easing: 'ease-in-quart',
      delay: 0,
      // offset: 200,
      duration: 750
  })},[])

  const handleDownloadResume = () => {
    const anchor = document.createElement('a');
    anchor.href = resumePdf;
    anchor.download = 'your_resume_filename.pdf'; // Specify the filename for download
    anchor.click();
  };

  const { aboutRef} = useContext(AppContext)
  return (
    <section data-aos="fade-out" id="about" ref={aboutRef} className=" mypaddingTop h-full my-20 max-w-[1000px] mx-auto w-full px-4 text-center gap-5 lg:text-start flex lg:flex-row flex-col-reverse justify-between lg:gap-28 items-center ">
        <div className=' flex-col justify-center lg:items-center'>
         

          <div className=' flex flex-row flex-wrap justify-center items-center'>
            <h2 data-aos="fade-down" className='text-[52px] w-full font-semibold leading-normal align-middle flex justify-center'>
              <span className=' text-fuchsia-500'>ABOUT ME</span>
            </h2>
          <figure data-aos="fade-down" className=' max-w-[360px] min-w-[200px] myaspect mx-2 mb-2 rounded overflow-hidden bg-slate-950 img_glow'>
            <img src={kingdomImg} className='w-full aspect-square '   alt="" />
          </figure>
          <div className=' flex-1 basis-[350px] pl-3 text-left sm:text-justify text-white'>
            <p data-aos="fade-up" className=' overflow-y-auto sm:max-h-72' >

                I am Kingdom Adele, a dedicated and results-oriented Software Engineer based in Port Harcourt, Rivers State, Nigeria. With over a decade of experience in the field, I have honed my skills in full-stack web development, specializing in both front-end and back-end technologies. My passion lies in crafting scalable and maintainable applications while adhering to clean code practices and implementing test-driven development methodologies.
                <br />
                <strong className=' text-fuchsia-500'>Professional Expertise:</strong><br />

                In my role as a Software Instructor at M-R INTERNATIONAL NIG. LTD., I conduct comprehensive training sessions on various web development technologies, nurturing the talents of IT professionals and interns from prestigious universities. Through my efforts, I&apos;ve contributed to the significant growth of the company, increasing both trainee numbers and training fees substantially.

                Previously, I served as a Software Engineer at Capsheaf Limited, where I formulated and executed strategic plans to enhance product capabilities and efficiency. My proactive approach to research led to the identification of innovative technical solutions, resulting in a notable increase in qualified leads and securing new projects worth $2M annually.

                During my tenure as a Team Lead at C&I LEASING PLC., I successfully led marketing campaigns for Diamond Yello Account services, driving a significant increase in lead generation and customer conversion rates. Through effective mentoring and strategic planning, I achieved a remarkable 30% improvement in team performance compared to previous years.
                <br />
                <strong className=' text-fuchsia-500'>Technical Proficiencies:</strong><br />

                I possess a diverse skill set encompassing front-end technologies such as HTML5, CSS3, and React.js, as well as back-end frameworks like Node.js, PHP, and Python. My expertise extends to various databases including MySQL, PostgreSQL, and MongoDB, enabling me to develop robust and efficient applications. I am proficient in test-driven development (TDD) and Behavior-Driven Development (BDD), ensuring the delivery of high-quality software solutions.
                <br />
                <strong className=' text-fuchsia-500'>Education and Certifications:</strong><br />

                I hold a Bachelor of Technology (B.Tech) degree in Mechanical Engineering from Rivers State University of Science and Technology. Additionally, I have acquired professional certifications in software engineering, front-end and back-end development, project management, and DevOps principles, further enhancing my technical acumen.
                <br />
                <strong className=' text-fuchsia-500'>Soft Skills:</strong><br />

                Beyond technical proficiency, I possess strong written and verbal communication skills, enabling me to effectively collaborate with teams and stakeholders. I thrive in high-pressure environments, excelling in problem-solving and analytical tasks. My interpersonal skills, coupled with adaptability and organizational prowess, allow me to manage customer relationships and prioritize tasks efficiently.

                <br />
                <strong className=' text-fuchsia-500'>Summary:</strong><br />
                In summary, I am a dedicated and adaptable Software Engineer with a proven track record of delivering exceptional results. I am passionate about leveraging technology to drive innovation and contribute positively to the success of any organization.
                          
            </p>
              <button
                data-aos="fade-up"
                onClick={handleDownloadResume}
                className="neno-button shadow-xl text-white border-2 hover:bg-fuchsia-500 border-fuchsia-500 rounded-lg py-2 px-8 mt-4 uppercase relative overflow-hidden">
                RESUME
              </button>
          
    
          </div>
        </div>

      </div>
    </section>
  )
}

export default About