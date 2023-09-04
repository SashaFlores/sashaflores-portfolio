const fs = require('fs');
const path = require('path');

const articleIds = [
  'd4c046bb2a95',
  '95d12cac7792',
  'af818efc7a2e',
  'ce35ab0a564d',
  'a100e825ff8c',
  '51cb4f656257',
  '6da5ba68db69',
];

// Set the API key & base URL
const apiKey = "4eaa076161msh9b0648461f8c902p17e7eejsn7d985e770974";
const baseUrl = "https://medium2.p.rapidapi.com/";

// Set the headers for the request
const headers = {
  "x-rapidapi-key": apiKey,
  "x-rapidapi-host": "medium2.p.rapidapi.com"
};

let article_id

  
async function fetchAndDisplayArticles(article_id) {
  for (let i = 0; i < articleIds.length; i++) {
    const article_id = articleIds[i];
    const endpoint = `article/${article_id}/html?fullpage=true`;

    try {
      const response = await fetch(baseUrl + endpoint, { headers });
      const result = await response.text();
      // console.log(result);

      // Parse the JSON response
      const jsonResponse = JSON.parse(result);
      const htmlContent = jsonResponse.html;

      // Save the parsed HTML content to a file
      // fs.writeFileSync(`articles/${article_id}.html`, htmlContent, 'utf-8');

      // Define the path to the article HTML file
      const filePath = path.join(__dirname, '..', 'articles', `${article_id}.html`);

      // Save the parsed HTML content to a file
      fs.writeFileSync(filePath, htmlContent, 'utf-8');

      console.log(`Article ${article_id} saved successfully.`);
      // Print the article HTML or append it to your container
      console.log(articleHtml);
    } catch (error) {
      console.error(`Error fetching or saving article ${article_id}:`, error);
    }
  }
}

// Call the function to fetch and display articles
fetchAndDisplayArticles(article_id);