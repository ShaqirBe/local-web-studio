const reveals = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('active'));
}

if (contactForm && formMessage) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const res = await fetch('/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload.error || 'Server error');
      }

      formMessage.style.color = 'green';
      formMessage.textContent = payload.message || 'Your request has been sent successfully!';
      formMessage.classList.add('show');
      contactForm.reset();

      setTimeout(() => {
        formMessage.classList.remove('show');
      }, 4000);
    } catch (err) {
      formMessage.style.color = 'red';
      formMessage.textContent = err.message || 'There was an error sending your request. Please try again.';
      formMessage.classList.add('show');

      setTimeout(() => {
        formMessage.classList.remove('show');
      }, 4000);

      console.error(err);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
