import Slider from "react-slick";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import './TrustedPeopleSlider.css';

const TrustedPeopleSlider = ({ people, title }) => {
  const sliderRef = useRef();

  const handleWheel = (e) => {
    e.preventDefault();
    e.deltaY < 0 ? sliderRef.current.slickPrev() : sliderRef.current.slickNext();
  };

  const settings = {
    infinite: true,
    centerMode: true,
    centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    arrows: true,
    prevArrow: <CustomArrow direction="left" />,
    nextArrow: <CustomArrow direction="right" />,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <div className="trusted-slider-wrapper">
      <h2>{title}</h2>
      <div className="slider-container" onWheel={handleWheel}>
        <Slider {...settings} ref={sliderRef}>
          {people.map((person, index) => (
            <div className="trusted-card-wrapper" key={index}>
              <div className="trusted-card">
                <div className="trusted-card-img-wrapper">
                  <img src={`/photos/people/${person.name}.png`} alt={person.name} className="actor-photo" />
                </div>
                <div className="trusted-card-content">
                  <h3>{person.name}</h3>
                  <p>{person.type === 'actor' ? 'Actor/Actress' : 'Director'}</p>
                  <p>Number of films: <span className="text-blue">{person.filmCount}</span></p>
                  <p>Rating: <span className="text-blue">{person.averageRating.toFixed(1)}</span></p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

const CustomArrow = ({ direction, onClick }) => (
  <div className={`custom-arrow ${direction}`} onClick={onClick}>
    {direction === "left" ? <FaChevronLeft /> : <FaChevronRight />}
  </div>
);

export default TrustedPeopleSlider;
