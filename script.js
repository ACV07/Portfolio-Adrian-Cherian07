document.addEventListener('DOMContentLoaded', () => {
    
    // Remove preload class to enable transitions
    document.body.classList.remove('preload');

    // Reveal animations on load
    setTimeout(() => {
        document.body.classList.add('loaded');
        
        // Trigger intersection observers for visible elements
        const animateItems = document.querySelectorAll('.animate-item');
        animateItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 100); // Stagger entry
        });
    }, 100);

    // Handle Safari/Mobile Browser Back-Forward Cache (BFCache)
    // When user swipes back, the page is restored from memory, so we must reset the transition overlay
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Page is loaded from cache
            document.body.classList.remove('page-leaving');
            document.body.classList.add('loaded');
        }
    });

    // Interactive 3D Tilt and Mouse glow effect selectively applied to pointer devices
    const interactiveCards = document.querySelectorAll('.nav-card, .cert-card');
    
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        interactiveCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate 3D tilt based on mouse position relative to center
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const tiltX = -((y - centerY) / centerY) * 8; // Max 8 degrees vertical tilt
                const tiltY = ((x - centerX) / centerX) * 8;  // Max 8 degrees horizontal tilt
                
                // Apply 3D transform dynamically
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.zIndex = "10";
                
                // Apply glow if it exists on the card
                const glow = card.querySelector('.hover-glow');
                if(glow) {
                    glow.style.left = `${x}px`;
                    glow.style.top = `${y}px`;
                }
            });

            card.addEventListener('mouseleave', () => {
                // Reset to default on mouse out gracefully
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.zIndex = "1";
            });
        });
    }

    // Page Transition Logic
    const pageLinks = document.querySelectorAll('.page-link');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only interupt if it's the same origin
            if(link.hostname === window.location.hostname && link.target !== '_blank') {
                e.preventDefault();
                const targetUrl = link.href;
                
                document.body.classList.remove('loaded');
                document.body.classList.add('page-leaving');
                
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 800); // Matches updated cinematic shutter transition duration
            }
        });
    });

    // Optional: Typewriter effect for terminal title
    const terminalTitle = document.querySelector('.terminal-title');
    if(terminalTitle) {
        const text = terminalTitle.innerText;
        terminalTitle.innerText = '';
        let i = 0;
        const typeWriter = setInterval(() => {
            if(i < text.length) {
                terminalTitle.innerText += text.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
            }
        }, 100);
    }
});

/**
 * Forces a download of a file by fetching it as a blob. 
 * This bypasses the default browser behavior of navigating to the file.
 */
window.forceDownload = async function(url, filename) {
    // Browsers strictly prevent direct forced downloads from local file system protocols
    if (window.location.protocol === 'file:') {
        window.open(url, '_blank');
        return;
    }

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download failed:', error);
        window.open(url, '_blank');
    }
};
