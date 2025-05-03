document.addEventListener("DOMContentLoaded", () => {
    const articleContainerIds = []; // Store article container IDs
    
    // Loop through files in the articles directory
    const articlesDirectory = 'articles';
    fetch(articlesDirectory)
        .then(response => response.text())
        .then(files => {
            files.split('\n').forEach(file => {
                if (file.endsWith('.html')) {
                    // Extract article ID
                    const articleId = file.replace('.html', ''); 
                    // Store the ID in the array
                    articleContainerIds.push(articleId); 
                }
            });

            // Now loop through the article container IDs
            articleContainerIds.forEach(articleId => {
                const articleContainer = document.getElementById(articleId);
                const imageContainer = document.getElementById(`image-${articleId}`);
                const titleContainer = document.getElementById(`title-${articleId}`);
                const contentContainer = document.getElementById(`content-${articleId}`);
                
                fetch(`articles/${articleId}.html`)
                    .then(response => response.text())
                    .then(htmlContent => {
                        // Extract and display the article info
                        const titleMatch = htmlContent.match(/<h1.*?>(.*?)<\/h1>/i);
                        const title = titleMatch ? titleMatch[1] : "Title Not Found";
                        titleContainer.textContent = title;
                        console.log("article title:", title);

                        const imageUrlMatch = htmlContent.match(/<img alt=".*?" src="(.*?)" \/>/i);
                        const imageUrl = imageUrlMatch ? imageUrlMatch[1] : "";
                        imageContainer.src = imageUrl;

                        const contentMatch = htmlContent.match(/<body>(.*?)<\/body>/is);
                        const content = contentMatch ? contentMatch[1] : "Content Not Found";
                        contentContainer.innerHTML = content;
                    })
                    .catch(error => {
                        console.error(`Error loading article ${articleId}:`, error);
                    });
            });
        })
        .catch(error => {
            console.error('Error reading articles directory:', error);
        });
});
