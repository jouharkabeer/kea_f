import React, { useState } from "react";
import "./LatestArticles.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import bloodcamp from '../../../assets/newsarticles/bloodcamp.jpg'
import magazine from '../../../assets/newsarticles/magazine.jpg'
import football from '../../../assets/newsarticles/football.jpg'
import football2026 from '../../../assets/newsarticles/football.jpeg'
import soccor from '../../../assets/newsarticles/soccor.jpg'
import badminton from '../../../assets/newsarticles/badminton.jpg'
import meet from '../../../assets/newsarticles/meet.jpg'
// Sample articles data


const articles = [
  {
    id: 1,
    title: "KEA Inter-Alumni Football Tournament 2026",
    date: "August 2, 2026",
    description: `🏆 KEA Inter-Alumni Football Tournament 2026 ⚽

Congratulations to all the players and teams who participated in today's tournament!

🏆 Open Category
🥇 Champions: GEC Thrissur
🥈 Runner-Up: LBS Kasaragod

🏆 Masters Category
🥇 Champions: GEC Thrissur
🥈 Runner-Up: NSS Palakkad Team 2

A big congratulations to all the winners and participants. Thank you to everyone who came to support the event and made it a grand success.

Special thanks & appreciation to our Secretary Shanoj, Faseela, Jishith, Varun, Betta, Dilshan, Joseam Sir, Hiran, Deeraj, and the entire team for their excellent coordination and dedication.

Special thanks to:
• Trendssqures – Worlds of Gardens (Sponsor)
• Narayana Health (Medical Partner)
• SnapShare (Event Engagement Partner)

Thank you all once again for your support and teamwork. Looking forward to seeing you at our next KEA event!

Arjun - President
On behalf of KEA EC`,
    image: football2026,
  },
  {
    id: 1,
    title: "Blood Donation Camp.",
    date: "September 21, 2024",
    description:
      "In association with Lions Club of Bengaluru.",
    image: bloodcamp, // Replace with actual image
  },
  {
    id: 2,
    title: "Magazine Article Invitation.",
    date: "April 04, 2025",
    description:
      "Essays, Industry Insights, Tech Article, Poetry& Short Stories, Movies & Book Reviews, Photographs, original paintings & Sketches, Travelogues.",
    image: magazine,
  },
  {
    id: 3,
    title: "Inter Alumini football tournament 2025.",
    date: "July 26, 2025",
    description:
      "Held at Whitefield United Mahadevapura, Bengaluru.",
    image: football,
  },
  {
    id: 4,
    title: "Annual Meet 2024.",
    date: "November 24, 2024",
    description:
      "Annual Meet 2024 at Marthahalli, New Horizon Engineering College Auditorium",
    image: meet,
  },
  {
    id: 5,
    title: "Badminton Tournament 2025.",
    date: "February 01, 2025",
    description:
      "Badminton Tornament 2025 at Kalavedi Sports Academy, Kadubeesanhalli",
    image: badminton,
  },
  {
    id: 6,
    title: "Soccer 2025.",
    date: "July 26, 2025",
    description:
      "Shageesh Memorial rolling trophy and Vineeth Memorial rolling trophy are the categories at Whitefield United, Mahadevapura, Bengaluru.",
    image: soccor,
  },
];


// Pagination settings
const itemsPerPage = 6;

const LatestArticles = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  // Get the current articles for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = articles.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <section className="latest-articles">
      <h2>Latest Articles</h2>
      {/* Articles Grid */}
      <div className="articles-grid">
        {currentArticles.map((article) => (
          <div key={article.id} className="article-card">
            <img src={article.image} alt={article.title} />
            <p className="article-date">{article.date}</p>
            <h3>{article.title}</h3>
            <p className="article-description">{article.description}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaArrowLeft /> Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
            onClick={() => goToPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          className="pagination-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <FaArrowRight />
        </button>
      </div>
    </section>
  );
};

export default LatestArticles;
