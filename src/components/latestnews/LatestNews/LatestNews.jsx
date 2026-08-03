import React from "react";
import "./LatestNews.css";
import badminton from '../../../assets/newsarticles/badminton.jpg'
import football from '../../../assets/newsarticles/football.jpeg'
// Sample news data

const newsArticles = [
  {
    id: 1, 
    title: "KEA Inter-Alumni Football Tournament 2026.",
    date: "August 2, 2026",
    description:
      "The KEA Inter-Alumni Football Tournament 2026 was a thrilling event that brought together alumni from various batches to compete in a friendly yet competitive football tournament. The event was held at the KEA Sports Complex, and it witnessed enthusiastic participation from alumni teams representing different years.",
    image: football // Replace with actual image
  },
  {
    id: 2,
    title: "Badminton tournament 2025.",
    date: "February 01, 2025",
    image: badminton,
  },
  {
    id: 3,
    title: "Inter Alumini Football Tournament 2025.",
    date: "July 26, 2025",
    image: "https://via.placeholder.com/300x200", // Replace with actual image
  },
  {
    id: 4,
    title: "K-Talk KEA Talk Series'2025.",
    date: "February 01, 2025",
    image: "https://via.placeholder.com/300x200", // Replace with actual image
  },
  {
    id: 5,
    title: "Onam Special Charity Drive 2025.",
    date: "August 24, 2025",
    image: "https://via.placeholder.com/300x200", // Replace with actual image
  },
 {
    id: 6,
    title: "Annual Day 2025.",
    date: "November 09, 2025",
    image: "https://via.placeholder.com/300x200", // Replace with actual image
  },
{
    id: 7,
    title: "Career Connect 2025.",
    date: "November 09, 2025",
    image: "https://via.placeholder.com/300x200", // Replace with actual image
  },
];
console.log(newsArticles[0].description)
const LatestNews = () => {
  return (
    <section className="latest-news">
      <h2>Latest News</h2>
      <div className="news-container">
        {/* Main Article */}
        <div className="main-article">
          {/* <img src={newsArticles[0].image} alt={newsArticles[0].title} className="news-image"/> */}
          <p className="news-date">{newsArticles[0].date}</p>
          <h3>{newsArticles[0].title}</h3>
          <img src={newsArticles[0].image} alt={newsArticles[0].title} className="news-image"/>

        </div>

        {/* Side Articles */}
        <div className="side-articles">
          {newsArticles.slice(1).map((article) => (
            <div key={article.id} className="side-article">
              {/* <img src={article.image} alt={article.title} /> */}
              <div className="side-text">
                <p className="news-date">{article.date}</p>
                <h4>{article.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
