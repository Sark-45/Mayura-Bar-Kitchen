/* ========================================
   MAYURA 1989 — Butter-Smooth Script
   ======================================== */

// ── 1. Navbar + Parallax in ONE passive rAF scroll loop ──────────────────────
const navbar = document.querySelector('.navbar');
const heroBg = document.querySelector('.parallax-bg');

let lastScrollY = window.scrollY;
let rafScheduled = false;

const onScroll = () => {
    lastScrollY = window.scrollY;
    if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(() => {
            // Navbar
            if (navbar) {
                navbar.classList.toggle('scrolled', lastScrollY > 50);
            }
            // Parallax (GPU-friendly: only backgroundPositionY)
            if (heroBg) {
                heroBg.style.backgroundPositionY = `${-(lastScrollY * 0.35)}px`;
            }
            rafScheduled = false;
        });
    }
};

window.addEventListener('scroll', onScroll, { passive: true });


// ── 2. IntersectionObserver for reveal animations (replaces scroll listener) ─
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target); // fire once, then stop
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .gallery-item, .review-card'
).forEach(el => revealObserver.observe(el));


// ── 3. Mobile Menu Toggle ─────────────────────────────────────────────────────
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileBtn.classList.toggle('active');
    });
}


// ── 4. Order Online Dropdown Toggle ──────────────────────────────────────────
const orderDropWrap = document.querySelector('.order-dropdown-wrap');
const orderDropBtn = document.querySelector('.order-dropdown-btn');

if (orderDropBtn) {
    orderDropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        orderDropWrap.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!orderDropWrap.contains(e.target)) {
            orderDropWrap.classList.remove('open');
        }
    });

    document.querySelectorAll('.order-drop-item').forEach(item => {
        item.addEventListener('click', () => orderDropWrap.classList.remove('open'));
    });
}


// ── 5. Smooth internal anchor scrolling ──────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileBtn.classList.remove('active');
            }
        }
    });
});


// ── 6. Review Carousel ───────────────────────────────────────────────────────
const reviews = [
    { text: "The authentic Andhra taste is unmatched. Bamboo Biryani is a must-try!", author: "Ananya S.", initials: "AS" },
    { text: "Wonderful rooftop vibe. Perfect for family dinners and celebrations.", author: "Vikram Mehta", initials: "VM" },
    { text: "Great service and very inclusive environment. 5 stars for the food!", author: "Sarah J.", initials: "SJ" }
];

let currentReview = 0;
const reviewCard = document.querySelector('.review-card');
const dots = document.querySelectorAll('.dot');

const updateReview = (index) => {
    if (!reviewCard) return;
    reviewCard.style.opacity = '0';
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

        reviewCard.style.opacity = '1';
        reviewCard.style.transform = 'translateY(0)';
    }, 350);
};

if (reviewCard && dots.length > 0) {
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        currentReview = i;
        updateReview(i);
    }));

    setInterval(() => {
        currentReview = (currentReview + 1) % reviews.length;
        updateReview(currentReview);
    }, 6000);
}


// ── 7. Reservation Form ───────────────────────────────────────────────────────
const resForm = document.getElementById('reservation-form');

if (resForm) {
    const dateInput = document.getElementById('res-date');
    if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);

    let successOverlay = document.querySelector('.reservation-success-overlay');
    if (!successOverlay) {
        successOverlay = document.createElement('div');
        successOverlay.className = 'reservation-success-overlay';
        document.body.appendChild(successOverlay);
    }

    resForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = resForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Sending to Kitchen...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        const formData = new FormData(resForm);
        formData.append('_subject', `New Reservation from ${formData.get('full_name')} - Mayura 1989`);
        const data = Object.fromEntries(formData.entries());
        const waText = `*New Reservation Request*\n\n*Name:* ${data.full_name}\n*Email:* ${data.email}\n*Phone:* ${data.phone_number}\n*Guests:* ${data.guests}\n*Date:* ${data.date}\n*Time:* ${data.time}\n*Occasion:* ${data.occasion}\n*Notes:* ${data.special_requests || 'None'}`;
        const waUrl = `https://wa.me/917411535145?text=${encodeURIComponent(waText)}`;

        try {
            const response = await fetch('https://formspree.io/f/mwvrbdoa', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
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
                        <p style="margin-bottom:2rem;opacity:0.8;">We've received your request! A receipt was sent to <b>${data.email}</b>. For instant confirmation, click below!</p>
                        <div style="display:flex;flex-direction:column;gap:1.5rem;align-items:center;">
                            <a href="${waUrl}" target="_blank" class="wa-confirm-btn">
                                <i class="fab fa-whatsapp"></i> Confirm on WhatsApp
                            </a>
                        </div>
                    </div>`;
                successOverlay.classList.add('active');
                resForm.reset();
            } else {
                throw new Error('Formspree failure');
            }
        } catch {
            alert('Service busy. Please contact us directly at 7411535145.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });
}

