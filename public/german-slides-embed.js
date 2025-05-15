// Script to enforce language settings in embedded Google Slides
(function() {
  // Function to get the current language from the DOM
  function getCurrentLanguage() {
    // Try to detect the language from the UI
    const langButton = document.querySelector('button:has(.flag-de)') || 
                       document.querySelector('[data-language="de"]');
    
    // Check if German button is active/selected
    if (langButton && (
        langButton.classList.contains('active') || 
        langButton.getAttribute('aria-selected') === 'true' ||
        window.location.href.includes('/de/') ||
        document.documentElement.lang === 'de'
    )) {
      return 'de';
    }
    
    // Check URL path for language indicator
    if (window.location.pathname.includes('/de/')) {
      return 'de';
    }
    
    // Check HTML lang attribute
    if (document.documentElement.lang === 'de') {
      return 'de';
    }
    
    // Default to English
    return 'en';
  }

  // Execute this as soon as possible and again after window loads
  function enforceLanguageOnIframes() {
    const currentLang = getCurrentLanguage();
    console.log(`Current language detected: ${currentLang}`);
    
    // Find all iframes that load Google Slides
    const iframes = document.querySelectorAll('iframe[src*="docs.google.com/presentation"]');
    
    iframes.forEach(function(iframe) {
      try {
        if (iframe.src) {
          const url = new URL(iframe.src);
          
          // Set language parameters based on detected language
          url.searchParams.set("hl", currentLang);
          
          // Use EXACTLY the same parameters for both languages
          url.searchParams.delete("chrome");
          url.searchParams.set("rm", "demo");
          
          // For German, only add extra language enforcement
          if (currentLang === 'de') {
            url.searchParams.set("ui", "2");
            url.searchParams.set("authuser", "0");
          }
          
          // Update the iframe src
          console.log(`Updated iframe URL to ${currentLang}:`, url.toString());
          iframe.src = url.toString();
        }
      } catch (error) {
        console.error("Error enforcing language on iframe:", error);
      }
    });
  }

  // Execute immediately 
  enforceLanguageOnIframes();
  
  // Execute again after window loads
  window.addEventListener('load', enforceLanguageOnIframes);
  
  // Set up a MutationObserver to detect dynamically added iframes
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldEnforce = false;
      
      mutations.forEach(function(mutation) {
        // Check for language selector changes
        if (mutation.target && (
            mutation.target.classList?.contains('flag-de') || 
            mutation.target.getAttribute?.('data-language') === 'de' ||
            mutation.target.id === 'language-selector'
        )) {
          shouldEnforce = true;
          return;
        }
        
        // Check for iframe additions
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeName === 'IFRAME') {
              if (node.src && node.src.includes('docs.google.com/presentation')) {
                shouldEnforce = true;
                break;
              }
            } else if (node.querySelectorAll) {
              const iframes = node.querySelectorAll('iframe[src*="docs.google.com/presentation"]');
              if (iframes.length > 0) {
                shouldEnforce = true;
                break;
              }
            }
          }
        }
      });
      
      if (shouldEnforce) {
        enforceLanguageOnIframes();
      }
    });
    
    // Start observing the document body for added nodes and language changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-selected', 'data-language']
    });
  }
  
  // Listen for language changes via custom event
  window.addEventListener('languageChanged', function(e) {
    if (e.detail && e.detail.language) {
      console.log('Language changed via custom event, updating iframes');
      enforceLanguageOnIframes();
    }
  });
})(); 