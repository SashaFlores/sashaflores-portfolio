
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

document.addEventListener('DOMContentLoaded', function () {
    const blocks = document.querySelectorAll('.codebox pre code');
    blocks.forEach(code => {
        const lines = code.textContent.replace(/\r\n?/g, '\n').split('\n');
        while (lines.length && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }

        if (!lines.length) {
            return;
        }

        let minIndent = Infinity;
        lines.forEach(line => {
            if (!line.trim()) {
                return;
            }
            const leading = line.match(/^(\s*)/)[1].length;
            minIndent = Math.min(minIndent, leading);
        });

        if (!isFinite(minIndent) || minIndent === 0) {
            return;
        }

        const trimmed = lines.map(line => (line.trim() ? line.slice(minIndent) : ''));
        code.textContent = trimmed.join('\n');
    });
});

// Init App
function init() {
    const txtElement = document.querySelector('.txt-type');
    if (!txtElement) {
        return;
    }
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




/* -----------Filtering projects --------------------------------*/
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

/* -----blog filtering ----------------------*/
document.addEventListener('DOMContentLoaded', function () {
  // Function to handle blog filtering
  function initBlogFiltering() {
    // Scope to the blog page only
    const blogRoot = document.querySelector('article.blog');
    if (!blogRoot) return;

    const blogFilterButtons = blogRoot.querySelectorAll('[data-filter-btn]');
    const blogItems = blogRoot.querySelectorAll('.blog-item');

    // Apply filter (uses the visible button text, as your HTML already does)
    function applyFilter(selectedCategory) {
      const sel = (selectedCategory || 'all').trim().toLowerCase();

      // Button active state
      blogFilterButtons.forEach(btn => {
        const label = btn.textContent.trim().toLowerCase();
        btn.classList.toggle('active', label === sel || (sel === 'all' && label === 'all'));
      });

      // Show/hide items
      blogItems.forEach(item => {
        const itemCategory = (item.dataset.category || '').trim().toLowerCase();
        item.style.display = (sel === 'all' || itemCategory === sel) ? 'block' : 'none';
      });
    }

    // Update the URL query param (?category=...) without reloading
    function setURL(selectedCategory, replaceOnly = false) {
      const params = new URLSearchParams(window.location.search);
      const sel = (selectedCategory || 'all').trim().toLowerCase();

      if (sel === 'all') {
        params.delete('category');                   // keep clean URL for "All"
      } else {
        params.set('category', sel);                 // URLSearchParams will encode spaces
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history[replaceOnly ? 'replaceState' : 'pushState'](null, '', newUrl);
    }

    // Wire clicks
    blogFilterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedCategory = button.textContent; // keep your current source of truth
        applyFilter(selectedCategory);
        setURL(selectedCategory);
  });
});

    // On load: apply from ?category=... if present
    const qs = new URLSearchParams(window.location.search);
    const qCat = qs.get('category');
    if (qCat) {
      applyFilter(decodeURIComponent(qCat));
      setURL(qCat, true); // normalize without adding to history
    }
  }

  // Function to handle the popup window (unchanged)
  function initPopup() {
    const myButton = document.getElementById("myButton");
    const myPopup = document.getElementById("myPopup");
    const closePopup = document.getElementById("closePopup");
    const emailInput = document.querySelector(".popup-input");
    const subscribeButton = document.getElementById("popup-subscribe-btn");
    const errorMessageElement = document.querySelector(".error-message");
    const successMessageElement = document.querySelector(".success-message");

    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

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

    emailInput.addEventListener("blur", function () {
      const email = emailInput.value;
      const isValid = validateEmail(email);
      updateErrorMessage(isValid);
    });

    function updateErrorMessage(isValid) {
      if (isValid) {
        subscribeButton.removeAttribute("disabled");
        errorMessageElement.textContent = "";
      } else {
        subscribeButton.setAttribute("disabled", "true");
        errorMessageElement.textContent = "Please enter a valid email !";
      }
    }

    const subscribeForm = document.querySelector("form[name='subscribe-form']");
    subscribeForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = emailInput.value;
      const isValid = validateEmail(email);

      if (!isValid) {
        errorMessageElement.textContent = "Please enter a valid email!";
      } else {
        const formData = new FormData(subscribeForm);
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString()
        })
        .then(response => {
          if (response.ok) {
            successMessageElement.textContent = "Thank you for subscribing!";
          } else {
            errorMessageElement.textContent = "An error occurred. Please try again later.";
          }
        })
      }
    });
  }

  function normalizeCodeIndentation() {
    const blocks = document.querySelectorAll('.codebox pre code');
    blocks.forEach(code => {
      const raw = code.textContent.replace(/\r\n?/g, '\n');
      const lines = raw.split('\n');

      while (lines.length && lines[0].trim() === '') {
        lines.shift();
      }
      while (lines.length && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }

      if (!lines.length) return;

      let minIndent = null;
      const indentWidths = line => line.replace(/\t/g, '  ').match(/^(\s*)/)[1].length;

      lines.forEach(line => {
        if (!line.trim()) return;
        const width = indentWidths(line);
        minIndent = minIndent === null ? width : Math.min(minIndent, width);
        if (minIndent === 0) return;
      });

      if (!minIndent) {
        return;
      }

      const trimLine = line => {
        let remaining = minIndent;
        let index = 0;

        while (remaining > 0 && index < line.length) {
          const char = line[index];
          if (char === ' ') {
            remaining -= 1;
          } else if (char === '\t') {
            remaining -= 2;
          } else {
            break;
          }
          index += 1;
        }
        return line.slice(index);
      };

      const normalized = lines.map(line => (line.trim() ? trimLine(line) : ''));
      code.textContent = normalized.join('\n');
    });
  }

  // Initialize blog filtering and popup after DOM is loaded
  initBlogFiltering();
  initPopup();
  normalizeCodeIndentation();
});


/* ------------------Send Mail ---------- */
/* contact form customize response as per netlify docs */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector("form[name='contact-me']");
    if (!form) return;

    const formBtn = form.querySelector("[data-form-btn]");
    const formInputs = form.querySelectorAll("[data-form-input]");
    const srSuccess = document.querySelector(".success-message");
    const srError = document.querySelector(".error-message");
    const toast = document.querySelector("[data-form-toast]");
    const toastTitle = toast?.querySelector("[data-toast-title]");
    const toastMessage = toast?.querySelector("[data-toast-message]");
    const toastIcon = toast?.querySelector("[data-toast-icon] ion-icon");
    const toastClose = toast?.querySelector("[data-toast-close]");
    let toastTimer = null;

    function checkFormValidity() {
        return Array.from(formInputs).every((input) => input.checkValidity());
    }

    const hideToast = () => {
        if (!toast) return;
        toast.classList.remove('is-visible');
        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }
        setTimeout(() => {
            if (!toast.classList.contains('is-visible')) {
                toast.setAttribute('hidden', '');
            }
        }, 320);
    };

    const showToast = (variant, title, message) => {
        if (srSuccess) {
            srSuccess.textContent = variant === 'success' ? `${title}. ${message}` : '';
        }
        if (srError) {
            srError.textContent = variant === 'error' ? `${title}. ${message}` : '';
        }

        if (!toast || !toastTitle || !toastMessage || !toastIcon) return;

        toast.classList.remove('form-toast--success', 'form-toast--error', 'is-visible');
        toast.classList.add(`form-toast--${variant}`);
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        toastIcon.setAttribute('name', variant === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline');
        toast.removeAttribute('hidden');
        // Trigger reflow so the animation plays even if the toast was already visible
        void toast.offsetWidth;
        toast.classList.add('is-visible');

        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastTimer = setTimeout(hideToast, 6000);
    };

    toastClose?.addEventListener('click', hideToast);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideToast();
        }
    });

    formInputs.forEach((input) => {
        input.addEventListener('input', () => {
            if (!formBtn) return;
            if (checkFormValidity()) {
                formBtn.removeAttribute('disabled');
            } else {
                formBtn.setAttribute('disabled', '');
            }
        });
    });

    if (formBtn && !checkFormValidity()) {
        formBtn.setAttribute('disabled', '');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!formBtn) return;

        formBtn.innerHTML = 'Sending...';
        formBtn.setAttribute('disabled', '');

        const formData = new FormData(form);

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                showToast('success', 'Message sent', 'I will get back to you as quickly as I can.');
                form.reset();
            } else {
                showToast('error', 'Something went wrong', 'Please try again—there was an error sending your message.');
            }
        } catch (error) {
            console.error('Contact form submission failed', error);
            showToast('error', 'Network error', 'Please check your connection and try again.');
        } finally {
            formBtn.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span>Send Message</span>';
            if (!checkFormValidity()) {
                formBtn.setAttribute('disabled', '');
            } else {
                formBtn.removeAttribute('disabled');
            }
        }
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
