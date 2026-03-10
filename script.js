// Scroll Effect for Navbar
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Reveal Animations on Scroll
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .gallery-item, .review-card');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.9;

    revealElements.forEach(el => {
        const elTop = el.getBoundingClientRect().top;
        if (elTop < triggerBottom) {
            el.classList.add('active');
        }
    });
};

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroBg = document.querySelector('.parallax-bg');
    if (heroBg) {
        heroBg.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
    }
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Mobile Menu Toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileBtn.classList.toggle('active');
    });
}

// Smooth Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileBtn.classList.remove('active');
            }
        }
    });
});

// Enhanced Review Carousel
const reviews = [
    {
        text: "The authentic Andhra taste is unmatched. Bamboo Biryani is a must-try!",
        author: "Ananya S.",
        initials: "AS"
    },
    {
        text: "Wonderful rooftop vibe. Perfect for family dinners and celebrations.",
        author: "Vikram Mehta",
        initials: "VM"
    },
    {
        text: "Great service and very inclusive environment. 5 stars for the food!",
        author: "Sarah J.",
        initials: "SJ"
    }
];

let currentReview = 0;
const reviewCard = document.querySelector('.review-card');
const dots = document.querySelectorAll('.dot');

const updateReview = (index) => {
    if (!reviewCard) return;

    reviewCard.style.opacity = 0;
    reviewCard.style.transform = 'translateY(20px)';

    setTimeout(() => {
        const r = reviews[index];
        const authorEl = reviewCard.querySelector('h4');
        const avatarEl = reviewCard.querySelector('.reviewer-avatar');
        const textEl = reviewCard.querySelector('.review-text');

        if (authorEl) authorEl.innerText = r.author;
        if (avatarEl) avatarEl.innerText = r.initials;
        if (textEl) textEl.innerText = `"${r.text}"`;

        dots.forEach(d => d.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');

        reviewCard.style.opacity = 1;
        reviewCard.style.transform = 'translateY(0)';
    }, 400);
};

if (reviewCard && dots.length > 0) {
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentReview = i;
            updateReview(currentReview);
        });
    });

    setInterval(() => {
        currentReview = (currentReview + 1) % reviews.length;
        updateReview(currentReview);
    }, 6000);
}

// Reservation Form Handling
const resForm = document.getElementById('reservation-form');

if (resForm) {
    // Set min date to today for reliability
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Create Success Overlay if doesn't exist
    let successOverlay = document.querySelector('.reservation-success-overlay');
    if (!successOverlay) {
        successOverlay = document.createElement('div');
        successOverlay.className = 'reservation-success-overlay';
        successOverlay.innerHTML = '';
        document.body.appendChild(successOverlay);
    }

    resForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Submit Button State
        const btn = resForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Sending to Kitchen...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Prepare Data
        const formData = new FormData(resForm);
        formData.append('_subject', `New Reservation from ${formData.get('full_name')} - Mayura 1989`);
        const data = Object.fromEntries(formData.entries());

        // Construct WhatsApp message for the follow-up
        const waText = `*New Reservation Request*\n\n*Name:* ${data.full_name}\n*Email:* ${data.email}\n*Phone:* ${data.phone_number}\n*Guests:* ${data.guests}\n*Date:* ${data.date}\n*Time:* ${data.time}\n*Occasion:* ${data.occasion}\n*Notes:* ${data.special_requests || 'None'}`;
        const waUrl = `https://wa.me/917411535145?text=${encodeURIComponent(waText)}`;

        try {
            // 1. Real Background Send via Formspree
            const response = await fetch('https://formspree.io/f/mjgaykzj', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // 2. Success Feedback with Summary & WhatsApp Option
                successOverlay.innerHTML = `
                    <div class="success-box">
                        <button class="close-overlay" onclick="this.closest('.reservation-success-overlay').classList.remove('active')">
                            <i class="fas fa-times"></i>
                        </button>
                        <i class="fas fa-check-circle"></i>
                        <h2 class="section-title">Reservation Requested!</h2>
                        
                        <div class="reservation-summary">
                            <p><b>Name</b> <span>${data.full_name}</span></p>
                            <p><b>Date</b> <span>${data.date}</span></p>
                            <p><b>Time</b> <span>${data.time}</span></p>
                            <p><b>Guests</b> <span>${data.guests}</span></p>
                        </div>

                        <p style="margin-bottom: 2rem; opacity: 0.8;">We've received your request! A receipt was sent to <b>${data.email}</b>. For instant confirmation, click below!</p>
                        
                        <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
                            <a href="${waUrl}" target="_blank" class="wa-confirm-btn">
                                <i class="fab fa-whatsapp"></i> Confirm on WhatsApp
                            </a>
                        </div>
                    </div>
                `;
                successOverlay.classList.add('active');
                resForm.reset();
            } else {
                throw new Error('Formspree failure');
            }

        } catch (error) {
            alert('Service busy. Please contact us directly at 7411535145.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });
}
