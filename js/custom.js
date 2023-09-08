
AOS.init({

});

//-------------typewriting effect


class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        // Current index of word
        const current = this.wordIndex % this.words.length;
        // Get full text of current word
        const fullTxt = this.words[current];

        // Check if deleting
        if (this.isDeleting) {
            // Remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            // Add char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Insert txt into element
        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        // Initial Type Speed
        let typeSpeed = 200;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        // If word is complete
        if (!this.isDeleting && this.txt === fullTxt) {
            // Make pause at end
            typeSpeed = this.wait;
            // Set delete to true
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            // Move to next word
            this.wordIndex++;
            // Pause before start typing
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}


// Init On DOM Load
document.addEventListener('DOMContentLoaded', init);

// Init App
function init() {
    const txtElement = document.querySelector('.txt-type');
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const wait = txtElement.getAttribute('data-wait');
    // Init TypeWriter
    new TypeWriter(txtElement, words, wait);
}


//-------------typewriting effect

filterSelection("all")
function filterSelection(c) {
    var x, i;
    x = document.getElementsByClassName("column");
    if (c == "all") c = "";
    for (i = 0; i < x.length; i++) {
        w3RemoveClass(x[i], "show");
        if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
    }
}

function w3AddClass(element, name) {
    var i, arr1, arr2;
    arr1 = element.className.split(" ");
    arr2 = name.split(" ");
    for (i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) == -1) { element.className += " " + arr2[i]; }
    }
}

function w3RemoveClass(element, name) {
    var i, arr1, arr2;
    arr1 = element.className.split(" ");
    arr2 = name.split(" ");
    for (i = 0; i < arr2.length; i++) {
        while (arr1.indexOf(arr2[i]) > -1) {
            arr1.splice(arr1.indexOf(arr2[i]), 1);
        }
    }
    element.className = arr1.join(" ");
}

$(function () {

    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('body').addClass('scrolled');
        } else {
            $('body').removeClass('scrolled');
        }
    });


    $('.navbar-nav > li.nav-item').each(function () {
        $(this).on('click', function () {
            $(this).find('.nav-link').addClass('active')
            $(this).siblings().find('.nav-link').removeClass('active')
        });
    });
    $('#myBtnContainer > .btn').each(function () {
        $(this).on('click', function () {
            $(this).addClass('active').siblings('.btn').removeClass('active')

        });
    });
});




// Filtering projects
document.addEventListener('DOMContentLoaded', function () {
    const projectFilterButtons = document.querySelectorAll('[data-filter-btn]');
    const projectItems = document.querySelectorAll('.project-item');
  
    projectFilterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedCategory = button.textContent.toLowerCase();
  
        projectFilterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
  
        projectItems.forEach(item => {
          if (selectedCategory === 'all' || item.dataset.category === selectedCategory) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      });
    });
});

// blog filtering
document.addEventListener('DOMContentLoaded', function () {
    // Function to handle blog filtering
    function initBlogFiltering() {
        const blogFilterButtons = document.querySelectorAll('[data-filter-btn]');
        const blogItems = document.querySelectorAll('.blog-item');

        blogFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedCategory = button.textContent.toLowerCase();

                blogFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                blogItems.forEach(item => {
                    const itemCategory = item.dataset.category.toLowerCase();
                    if (selectedCategory === 'all' || itemCategory === selectedCategory) {
                        item.style.display = "block";
                    } else {
                        item.style.display = "none";
                    }
                });
            });
        });
    }

    // Function to handle the popup window
    function initPopup() {
        const myButton = document.getElementById("myButton");
        const myPopup = document.getElementById("myPopup");
        const closePopup = document.getElementById("closePopup");
        const emailInput = document.querySelector(".popup-input");
        const subscribeButton = document.getElementById("popup-subscribe-btn");
        const errorMessageElement = document.getElementById("error-message");

        // Function to validate an email address
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Function to handle the subscribe button click
        function handleSubscribeClick() {
            const email = emailInput.value;

            if (validateEmail(email)) {
                subscribeButton.removeAttribute("disabled");
                errorMessageElement.textContent = "";
            } else {
                errorMessageElement.textContent = "Invalid email address. Please enter a valid email.";
                subscribeButton.setAttribute("disabled", "true");
            }
        }

        // Event listeners for the popup
        myButton.addEventListener("click", function () {
            myPopup.classList.add("show");
        });

        closePopup.addEventListener("click", function () {
            myPopup.classList.remove("show");
        });

        window.addEventListener("click", function (event) {
            if (event.target === myPopup) {
                myPopup.classList.remove("show");
            }
        });

        subscribeButton.addEventListener("click", handleSubscribeClick);
    }

    // Initialize blog filtering and popup after DOM is loaded
    initBlogFiltering();
    initPopup();
});

/*  --------Send Mail---------- */

//contact form as per Netlify Docs 
// email validation
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector("form[name='contact']");
    const formBtn = document.querySelector("[data-form-btn]");
    const formInputs = document.querySelectorAll("[data-form-input]");

    // Function to check if the form is valid
    function checkFormValidity() {
        return Array.from(formInputs).every(input => input.checkValidity());
    }

    // Add event listeners to form input fields
    formInputs.forEach(input => {
        input.addEventListener("input", function () {
            // Check form validation
            if (checkFormValidity()) {
                formBtn.removeAttribute("disabled");
            } else {
                formBtn.setAttribute("disabled", "");
            }
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Change the button text to indicate sending
        formBtn.innerHTML = 'Sending...';

        const formData = new FormData(this);

        fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            // Reset the button text on success
            formBtn.innerHTML = 'Message Sent!';
        })
        .catch(() => {
            // Reset the button text on error
            formBtn.innerHTML = 'Error Sending Email!';
        });
    });
});



/*particles*/
/* ---- particles.js config ---- */

particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 100,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 140,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});







// Check if MetaMask is available
if (typeof window.ethereum !== 'undefined') {
    const connectButton = document.querySelector('.connect-button');

    connectButton.addEventListener('click', async () => {
        try {
            // Request user's permission to access their MetaMask account
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length > 0) {
                // Prompt the user to choose from available accounts
                const selectedAccount = await promptAccountSelection(accounts);

                if (selectedAccount) {
                    // Set up Polygon network configuration (same as before)

                    // Now you can interact with the selected account, MetaMask, and Polygon
                    // For example: check the user's balance
                    const balance = await window.ethereum.request({
                        method: 'eth_getBalance',
                        params: [selectedAccount, 'latest'],
                    });
                    console.log('Selected Account:', selectedAccount);
                    console.log('Balance:', balance);
                }
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });

    async function promptAccountSelection(accounts) {
        const selectedAccount = window.prompt('Choose an account to connect:', accounts[0]);
        return selectedAccount;
    }
} else {
    console.error('MetaMask is not available');
}




