import React, { useState } from "react";
import "./LatestArticles.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import bloodcamp from '../../../assets/newsarticles/bloodcamp.jpg'
import magazine from '../../../assets/newsarticles/magazine.jpg'
import football from '../../../assets/newsarticles/football.jpg'
import soccor from '../../../assets/newsarticles/soccor.jpg'
import badminton from '../../../assets/newsarticles/badminton.jpg'
import meet from '../../../assets/newsarticles/meet.jpg'
// Sample articles data


const articles = [
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
