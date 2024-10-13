// JavaScript function to copy code to clipboard
function copyToClipboard(element) {
    var text = document.querySelector(element).textContent;
    navigator.clipboard.writeText(text).then(function () {
        alert("Copied to clipboard!");
    }).catch(function (error) {
        console.error("Failed to copy text: ", error);
    });
}
