import React, { useState } from 'react'
import HeroSection from '../components/herosection/HeroSection'
import CourseSlider from '../components/CourseSlider/CourseSlider'
import AboutUsHome from '../components/AboutUsHome/AboutUsHome'
import EventsSection from '../components/events/EventsSection'
import GoalSection from '../components/GoalSection/GoalSection'
import CTASection from '../components/CTASection/CTASection'
import RegisterSection from '../components/RegisterSection'
import SponsorModal from './SponserModal'
import sponserimg from '../assets/alethea.png'

const Home = () => {

    const [show , setShow] = useState(true)
  
    const sponsor = {
      brand: "Our SPONSOR",
      company: "Alethea Communications",
      description: "Alethea Communications Technologies is a leader in wireless test and measurement, helping customers validate real-world device, network, network, and application performance. Our flagship product, WiCheck, is a scalable and high-performance Wi-Fi testing solution that simplifies complex challenges and ensures reliable connectivity. With flexible solutions and deep domain expertise, Alethea enables customers to perfect broadband while maximizing ROI",
      image: sponserimg,
    };

  return (
    <div className="home">
      <SponsorModal
      show={show}
      handleClose={() => setShow(false)}
      sponsor={sponsor}
      />
      <RegisterSection/>
         <HeroSection />
         {/* <EventsSection/> */}
         
         <GoalSection/>
         <CTASection/>
         
    </div>
  )
}

export default Home