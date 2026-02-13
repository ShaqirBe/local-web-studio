const reveals = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');


const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));



contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      formMessage.style.color = 'green';
      formMessage.textContent = 'Your request has been sent successfully!';
      formMessage.classList.add('show');
      contactForm.reset();

      // Fade out after 4 seconds
      setTimeout(() => {
        formMessage.classList.remove('show');
      }, 4000);

    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    formMessage.style.color = 'red';
    formMessage.textContent = 'There was an error sending your request. Please try again.';
    formMessage.classList.add('show');

    setTimeout(() => {
      formMessage.classList.remove('show');
    }, 4000);

    console.error(err);
  }
});

