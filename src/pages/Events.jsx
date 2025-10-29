import React, { useState } from 'react';
import './Events.css';
import CareerConnectImage from '../assets/programs/CareerConnect.jpeg';
import AnnualDayImage from '../assets/programs/AnnualDay.jpeg';
import Magazine from '../assets/programs/magazine.jpg'

const Events = () => {
  const handleCareerConnectRegister = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScgW0rbxqwlhL3dNK2HWGI5-XEM0MzfAg7h1iDiZSZApXKT3g/viewform', '_blank');
  };

  const handleAnnualDayRegister = () => {
    window.open('https://tiqr.events/e/KEABangalore-AnnualDay-2025-1465/', '_blank');
  };

  return (
    <div className="events-page">
      <div className="events-container">
        <div className="events-header">
          <h1>Upcoming Events</h1>
          <p>Join us for these exciting upcoming events</p>
        </div>

        <div className="events-grid">

                    {/* Annual Day Event */}
          <div className="event-card">
            <div className="event-image">

              <img src={AnnualDayImage} alt="KEA Annual Day 2025" onClick={() => showImage(AnnualDayImage)}/>

              {/* <ImagePopup show={show} handleClose={closeImage} image={selectedImage} /> */}

            </div>
            <div className="event-content">
              <h2>KEA Annual Day 2025</h2>
              <div className="event-details">
                <div className="event-info">
                  <span className="event-date">Date: 9th November 2025</span>
                  <span className="event-venue">Venue: NIMHANS Convention Centre, Bengaluru</span>
                  <span className="event-entry">Time: 9:00 AM - 5:00 PM IST</span>
                </div>
                
                <div className="event-description">
                  <h3>Annual Day Celebrations</h3>
                  <p>
                    Celebrate Kerala Engineers' Association Bangalore's Annual Day 2025 with vibrant activities, 
                    cultural performances, and community gathering. Join us for a day filled with entertainment and celebration.
                  </p>
                  
                  <div className="special-features">
                    <h4>Event Highlights:</h4>
                    <ul>
                      <li>Stand-up comedy by Sudheer Paravoor</li>
                      <li>Drama performance by Santhosh Keezhattoor</li>
                      <li>Inspiring address by Chief Guest Dr. K. Jayakumar IAS</li>
                      <li>Cultural performances and competitions</li>
                      <li>Traditional Ona Sadya feast</li>
                    </ul>
                  </div>
                </div>
                
                <button className="register-btn" onClick={handleAnnualDayRegister}>
                  Register Now
                </button>
              </div>
            </div>
          </div>

                    <div className="event-card">
            <div className="event-image">

              <img src={Magazine} alt="KEA Annual Day 2025"/>

              {/* <ImagePopup show={show} handleClose={closeImage} image={selectedImage} /> */}

            </div>
            <div className="event-content">
              <h2>KEA Annual Day 2025</h2>
              <div className="event-details">
                <div className="event-info">
                  <span className="event-date">Date: 9th November 2025</span>
                  <span className="event-venue">Venue: NIMHANS Convention Centre, Bengaluru</span>
                  <span className="event-entry">Time: 9:00 AM - 5:00 PM IST</span>
                </div>
                
                <div className="event-description">
                  <h3>Annual Day Celebrations</h3>
                  <p>
                    Celebrate Kerala Engineers' Association Bangalore's Annual Day 2025 with vibrant activities, 
                    cultural performances, and community gathering. Join us for a day filled with entertainment and celebration.
                  </p>
                  
                  <div className="special-features">
                    <h4>Event Highlights:</h4>
                    <ul>
                      <li>Stand-up comedy by Sudheer Paravoor</li>
                      <li>Drama performance by Santhosh Keezhattoor</li>
                      <li>Inspiring address by Chief Guest Dr. K. Jayakumar IAS</li>
                      <li>Cultural performances and competitions</li>
                      <li>Traditional Ona Sadya feast</li>
                    </ul>
                  </div>
                </div>
                
                <button className="register-btn" onClick={handleAnnualDayRegister}>
                  Register Now
                </button>
              </div>
            </div>
          </div>
          {/* Career Connect Event */}
          <div className="event-card">
            <div className="event-image">
              <img src={CareerConnectImage} alt="Career Connect 2025" />
            </div>
            <div className="event-content">
              <h2>Career Connect 2025</h2>
              <div className="event-details">
                <div className="event-info">
                  <span className="event-date">Date: 9th November 2025</span>
                  <span className="event-venue">Venue: NIMHANS Convention Centre, Bengaluru</span>
                  <span className="event-entry">Entry: FREE with registration</span>
                </div>
                
                <div className="event-description">
                  <h3>Thriving as Engineers in a Disruptive World</h3>
                  <p>
                    Freshers or Veterans — Disruption impacts us all. Join Career Connect 2025 for a 
                    thought-provoking panel discussion and explore ideas, skills, and strategies to stay ahead.
                  </p>
                  
                  <div className="special-features">
                    <h4>Special Features at the Venue:</h4>
                    <ul>
                      <li>Professional Resume Review Booth – Get personalized feedback on your resume by Anand from Corp Placement.</li>
                      <li>Resume Drop Zone – Submit your resume for upcoming opportunities through KEA's professional network.</li>
                    </ul>
                  </div>
                </div>
                
                <button className="register-btn" onClick={handleCareerConnectRegister}>
                  Register Now
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Events;
