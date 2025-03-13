# Kinopoisk Top 250 Movies Analysis

## Project Overview
This project is aimed at creating an interactive visualization of global data on the 250 best films collected from the Kinopoisk platform. The goal is to provide a clear and accessible representation of films by country, genre, and other key features, as well as to identify trends in the global film industry over time. The visualization will demonstrate how different countries contribute to the film industry, identify popular genres and topics by region, and analyze audience preferences on the Kinopoisk platform.

## Repository Structure
The repository contains the following files:

### 1. `movies_final.json`
- **Description**: Contains raw data collected from Kinopoisk using web scraping with Selenium.
- **Source**: Data is scraped from the Kinopoisk platform.
- **Usage**: This file serves as the initial dataset for further processing.

### 2. `parsing.ipynb`
- **Description**: A Jupyter Notebook containing the code for web scraping Kinopoisk using Selenium.
- **Purpose**: Extracts data about the top 250 movies, including details like title, year, genre, budget, revenue, and ratings.
- **Output**: Generates `movies_final.json`.

### 3. `main.py`
- **Description**: A Python script that cleans the raw data from `movies_final.json`.
- **Tasks**:
  - Removes unnecessary characters and symbols.
  - Converts numeric values to appropriate data types.
  - Converts currencies for budgets and gross values
- **Output**: Generates `cleaned_data.json`, which is ready for analysis.

### 4. `cleaned_data.json`
- **Description**: The cleaned and processed version of the raw data.
- **Usage**: This file is used as the input for exploratory data analysis (EDA).

### 5. `exploratory_analysis.ipynb`
- **Description**: A Jupyter Notebook containing the Exploratory Data Analysis (EDA) of the cleaned dataset.
- **Tasks**:
  - Analyzes missing data and handles null values.
  - Computes correlations between variables (e.g., budget vs. revenue).
  - Visualizes distributions of key metrics (e.g., budget, ratings, runtime).
  - Identifies popular genres and directors.
  - Analyzes user reviews to extract common themes and sentiments.
- **Output**: Insights and visualizations that guide further analysis and decision-making.

### 6. `.gitignore`
- **Description**: Specifies files and directories to be ignored by Git.
- **Purpose**: Prevents unnecessary files (e.g., temporary files, virtual environments) from being tracked by version control.

---

## Installation
To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name

2. **Set up a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   
   #If you don't have a requirements.txt file [we haven't it yet], install the required packages manually:
   pip install pandas numpy matplotlib seaborn plotly missingno nltk selenium requests currency-converter

## How to Use
1. **Scrape Data**: Run `parsing.ipynb` to collect data from Kinopoisk and generate `movies_final.json`.
2. **Clean Data**: Execute `main.py` to clean the raw data and produce `cleaned_data.json`.
3. **Perform EDA**: Open `exploratory_analysis.ipynb` to explore the dataset, generate insights, and create visualizations.

## Dependencies
- Python 3.x
- Libraries: `pandas`, `numpy`, `matplotlib`, `seaborn`, `plotly`, `missingno`, `nltk`, `selenium`, `json`, `requests`, `currency_converter`

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
