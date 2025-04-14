
# Kinopoisk Top 250 Movies Analysis

## Project Overview

This project presents an interactive data visualization of the **Top 250 movies** according to the Kinopoisk platform. The goal is to provide a clear, intuitive representation of film data by country, genre, budget, ratings, and more. Users can explore **global trends** in cinema, popular genres by region, and **audience preferences** through engaging visual tools. 

Moreover, visualizations reveal significant patterns in the film industry that are related to the success of a movie. Therefore, the information in the project can be a **valuable tool** for film analysts to understand certain trends in movie statistics.

**Live Project**: Available at [Vercel link – to be added].

## Repository Structure

```
.
├── api/                    # Backend with Flask API and Docker configuration
│   ├── app.py
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── data/
│       └── optimized_data.json
│
├── data/                   # All datasets
│   ├── cleaned_data.json
│   ├── movies_final.json
│   └── optimized_data.json
│
├── frontend/               # Frontend built with React + Vite
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Main React components
│   │   │   ├── Charts/
│   │   │   ├── AnimatedNumber.jsx
│   │   │   ├── ExpandedChartModal.jsx
│   │   │   ├── ExplorationSection.jsx
│   │   │   ├── FilmSlider.jsx
│   │   │   ├── GenreWordCloud.jsx
│   │   │   ├── SentimentRadar.jsx
│   │   │   └── WorldMap.jsx
│   │   ├── hooks/          # Important frontend hooks
│   │   ├── utils/
│   │   │   └── countryMappings.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
│
├── notebooks/              # Jupyter notebooks for analysis
├── preprocessing/          # Data preparation scripts
├── parsing.ipynb           # Web scraping notebook using Selenium
├── requirements.txt
├── README.md
├── LICENSE
└── .gitignore
```

## Second Checkpoint Summary

As part of the second project checkpoint, we completed the following major tasks:

1. **Backend Integration**  
   A fully functional Flask server was created (see `/api`). All API endpoints are set up and deliver processed data to the frontend.

2. **Core Visualizations Developed**  
   The main visual components have been built in React (`/frontend/src/components`). Charts, maps, and data panels are actively being integrated into the UI.

3. **Cloud Deployment**  
   The project has been deployed to a cloud platform using **Vercel**, ensuring easy access and performance scalability.

4. **Ready-to-Use React Components**  
   All interactive components (sliders, modals, radar charts, maps) are prepared and only require final integration on the main page. Now we are working on it, and some visualizations can look inappropriate, but by the time the presentation, we will bring them to a good look, as well as add additional visualizations.

5. **Modern and Engaging UI Design**  
   The interface features a clean, responsive layout with animated and dynamic visual elements for a rich user experience.

---

## Installation & Usage

### 1. Clone the Repository

```bash
git clone https://github.com/Data-Wrangling-and-Visualisation/Movie-Data-Visualization.git
cd Movie-Data-Visualization
```

### 2. Backend (Flask + Docker)

You can run the backend using Docker:

```bash
cd api
docker-compose up --build
```

The Flask server will start on `http://localhost:5000/`.

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The development server will start on `http://localhost:5173/`.


## How to use repository files

1. **Scrape Data**  
   Run `parsing.ipynb` to extract data from Kinopoisk and generate `movies_final.json`.

2. **Clean Data**  
   Run your preprocessing script to convert and clean the data into `cleaned_data.json`.

3. **Run Backend**  
   Start the Flask server to serve data through RESTful endpoints.

4. **Launch Frontend**  
   Launch the React app and interact with the visualizations.


## Dependencies

### Backend (Python)
- Flask
- pandas, numpy
- selenium, requests
- currency_converter

### Frontend (Node)
- React, Vite
- chart.js, d3, plotly
- other visualization libraries

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
