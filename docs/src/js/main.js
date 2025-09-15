// Menu and Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
  // Menu highlighting
  const menuItems = document.querySelectorAll('.nav-menu a');
  const currentPath = window.location.pathname;

  menuItems.forEach((item) => {
    if (item.getAttribute('href') === currentPath.split('/').pop()) {
      item.classList.add('active');
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Progress indicator
  const progressBar = document.querySelector('.progress-bar');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;

      progressBar.style.width = scrolled + '%';
    });
  }

  // Copy code functionality
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const codeBlock = button.closest('.code-container').querySelector('.code-block');
      const code = codeBlock.textContent;

      navigator.clipboard.writeText(code).then(() => {
        const originalText = button.querySelector('span').textContent;

        button.querySelector('span').textContent = 'Copied!';
        button.querySelector('i').classList.remove('fa-copy');
        button.querySelector('i').classList.add('fa-check');

        setTimeout(() => {
          button.querySelector('span').textContent = originalText;
          button.querySelector('i').classList.remove('fa-check');
          button.querySelector('i').classList.add('fa-copy');
        }, 2000);
      });
    });
  });

  // Theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';

  document.body.setAttribute('data-theme', savedTheme);

  // Collapsible sections
  const collapsibles = document.querySelectorAll('.collapsible');

  collapsibles.forEach((collapsible) => {
    const header = collapsible.querySelector('.collapsible-header');
    const content = collapsible.querySelector('.collapsible-content');

    if (header && content) {
      header.addEventListener('click', () => {
        content.style.maxHeight = content.style.maxHeight
          ? null
          : content.scrollHeight + 'px';
        header.classList.toggle('active');
      });
    }
  });

  // Feature list animations
  const featureLists = document.querySelectorAll('.feature-list');

  if (window.IntersectionObserver) {
    const listObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          listObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
    });

    featureLists.forEach((list) => {
      listObserver.observe(list);
    });
  }
});

// Helper function to check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
