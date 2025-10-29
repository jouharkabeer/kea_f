import React from "react";
import "./EntrepreneurshipSlider.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Pagination, Autoplay } from "swiper/modules";
import { FaExternalLinkAlt } from "react-icons/fa";
import ggc from '../../../assets/aratt.png'
import cip from '../../../assets/alethea.png'
import keen from '../../../assets/keen.jpg'
// Entrepreneurship Data

const companies = [
  {
    id: 1,
    name: "Aratt.",
    description: "House of Aratt, where innovation meets integrity to shape the landscapes of tomorrow. With a legacy spanning 25+ years, we specialize in creating exceptional residential and commercial spaces that seamlessly blend contemporary design with timeless elegance.",
    logo: ggc,
    website: "https://www.aratt.in",
  },
  {
    id: 2,
    name: "Alethea Communications Technologies",
    description: "Alethea Communications Technologies is a leader in wireless test and measurement, helping customers validate real-world device, network, and application performance. Our flagship product, WiCheck, is a scalable and high-performance Wi-Fi testing solution that simplifies complex challenges and ensures reliable connectivity. With flexible solutions and deep domain expertise, Alethea enables customers to perfect broadband while maximizing ROI.",
    logo: cip,
    website: "https://aletheatech.com",
  },
  {
    id: 3,
    name: "KEEN",
    description: "KEEN is a consortium of diverse businesses based in Bangalore. We design, develop, and deliver world-class products across diverse sectors.",
    logo: keen,
    website: "https://wearekeen.in",
  },

];

const EntrepreneurshipSlider = () => {
  return (
    <section className="kea-slider">
      <div className="kea-slider__background">
        <div className="kea-slider__bg-circle kea-slider__bg-circle--1"></div>
        <div className="kea-slider__bg-circle kea-slider__bg-circle--2"></div>
        <div className="kea-slider__bg-pattern"></div>
      </div>
      
      <div className="kea-slider__container">
        <div className="kea-slider__header">
          <h2 className="kea-slider__title">Top Entrepreneurial Companies</h2>
          <div className="kea-slider__title-decoration"></div>
        </div>
        
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          centeredSlidesBounds={true}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{ 
            clickable: true,
            bulletClass: 'kea-slider__bullet',
            bulletActiveClass: 'kea-slider__bullet--active'
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          modules={[Pagination, Autoplay]}
          className="kea-slider__swiper"
        >
          {companies.map((company) => (
            <SwiperSlide key={company.id} className="kea-slider__slide">
              <div className="kea-slider__card">
                <div className="kea-slider__logo-container">
                  <img src={company.logo} alt={company.name} className="kea-slider__logo" />
                </div>
                <div className="kea-slider__content">
                  <h3 className="kea-slider__company-name">{company.name}</h3>
                  <p className="kea-slider__description">{company.description}</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="kea-slider__btn">
                    Visit Website <FaExternalLinkAlt className="kea-slider__icon" />
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default EntrepreneurshipSlider;