const axios = require('axios');
const fs = require('fs');

const BASE_URL = "https://practiceapi.geeksforgeeks.org/api/vr/problems/";
const MAX_PAGES = 151;

// Function to fetch data for a single page
const fetchPageData = async (page) => {
  try {
    const response = await axios.get(`${BASE_URL}?pageMode=explore&page=${page}&sortBy=submissions`);
    return response.data.results.map(problem => ({
      name: problem.problem_name,
      difficulty: problem.difficulty,
      tags: problem.tags.topic_tags.join(", "), // Include only topic tags
      url: problem.problem_url
    }));
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error.message);
    return []; // Return empty array on error to avoid breaking the script
  }
};

// Function to fetch data for all pages
const fetchAllPages = async () => {
  const allData = [];
  let globalId = 1; // Initialize the sequential ID

  for (let page = 1; page <= MAX_PAGES; page++) {
    console.log(`Fetching page ${page}...`);
    const pageData = await fetchPageData(page);

    // Add the sequential ID to each problem
    pageData.forEach(problem => {
      problem.id = globalId++;
    });

    allData.push(...pageData);
  }
  return allData;
};

// Function to convert data to CSV
const saveToCSV = (data) => {
  const headers = "ID,Problem Name,Difficulty,Tags,URL\n";
  const rows = data.map(row => 
    `${row.id},"${row.name}","${row.difficulty}","${row.tags}","${row.url}"`
  ).join("\n");

  const csvContent = headers + rows;

  fs.writeFile("all_problems_with_topic_tags.csv", csvContent, (err) => {
    if (err) {
      console.error("Error writing to CSV file:", err);
    } else {
      console.log("CSV file saved as all_problems_with_topic_tags.csv");
    }
  });
};

// Main function to execute the script
const main = async () => {
  console.log("Starting data extraction...");
  const allData = await fetchAllPages();
  console.log("Data fetched. Saving to CSV...");
  saveToCSV(allData);
};

main();
