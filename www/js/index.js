/*
Copyright (c) 2021 Chris M. Sissons
https://github.com/kryptech/Glower
*/

const app = {

    // Config variables
    debugMode:          false,  // For development.
    middleDeadZone:     .25,    // .5 = 50% of control panel height.
    brightnessBoost:    1.4,    // Make brightness increase faster.
    cpEl:               undefined,

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        
        // Set up brightness
        try {
            window.pBrightness = cordova.plugins.brightness;
        }
        catch(err) {
            alert('Error loading brightness plugin:\n' + JSON.stringify(err));
        }
        if (window.pBrightness) {
            pBrightness.setKeepScreenOn(true); // Keep screen on
            pBrightness.setBrightness( // Set screen brightness
                .5 * app.brightnessBoost,
                function(status) { // Success
                }, function(status) { // Error
                    alert('Failed to set brightness');
                }
            );
        } else {
            console.log('Brightness plugin missing; this could happen if using `phonegap serve`');
        }

        // Listen for control panel touches
        app.cpEl = document.getElementById('controlPanel');
        app.cpEl.addEventListener('touchstart', app.onTouchCP, false);
        app.cpEl.addEventListener('touchmove', app.onTouchCP, false);
        if (app.debugMode) {
            app.cpEl.style.color = 'blue';
        }
        
        const hcEl = document.getElementById('helpContainer');
        const bodyEl = document.getElementById('body');

        // Check if help has been previously shown
        let helpShown = false;
        try {
            helpShown = window.localStorage.getItem('helpShown') === '1';
        } catch(e) {
            console.log('Error accessing localStorage');
        }

        // Handle help
        if (helpShown) {
            // Prevent initial animation
            bodyEl.classList.remove('showHelp');
            hcEl.remove();
        } else {
            // Listen for animation progress
            hcEl.addEventListener('animationend', () => {
                if (!hcEl.classList.contains('done') && !hcEl.classList.contains('closing')) {
                    // Inital animation done
                    hcEl.classList.add('done'); // Mark as done and ready to close
                } else if (hcEl.classList.contains('closing')) {
                    // Closing animation done
                    hcEl.remove();
                }
            });

            // Handle touches
            hcEl.addEventListener('touchstart', event => {
                if (!hcEl.classList.contains('closing')) { // Not currently closing
                    // Dismiss help
                    hcEl.classList.remove('done');
                    hcEl.classList.add('closing'); // Trigger closing animation
                    bodyEl.classList.remove('showHelp'); // End colour animation
                    
                    // Mark help as having been shown
                    if (!app.debugMode) {
                        try {
                            window.localStorage.setItem('helpShown', '1');
                        } catch(e) {}
                    }
                    
                    app.onTouchCP(event); // Pass along event to control panel
                }
            }, false);
            hcEl.addEventListener('touchmove', event => {
                app.onTouchCP(event); // Pass along event to control panel
            });
        }
        
        // Listen for close button touches
        document.getElementById('closeButton').addEventListener('click', app.exitApp, false);
    },

	// Handle control panel touches
    onTouchCP: function(event) {

        const cpRect = app.cpEl.getBoundingClientRect();

        const y = event.touches[0].pageY - cpRect.top;
        let value = 1 - y / cpRect.height;
        value = Math.round(value * 1000) / 1000; // Round to 3 decimal places
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        
        // Determine the value to use based on the deadzones
        const deadzoneBottom = (1 - app.middleDeadZone) / 2;
        const deadzoneTop = deadzoneBottom + app.middleDeadZone;
        let useValue;
        if (value <= deadzoneBottom) {
            useValue = value / (1 - app.middleDeadZone);
        } else if (value >= deadzoneTop) {
            useValue = .5 + ((value - deadzoneTop) / (1 - app.middleDeadZone));
        } else { // In the zone!
            useValue = .5;
        }
        
        // Colour lightness
        const lightness = useValue * 100;
        
        // Set control panel BG colour and border.
        app.cpEl.style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';
        app.cpEl.style.boxShadow = '0 0 4vh 1vh hsl(0, 100%, ' + lightness + '%)';
        
        // Set body background colour.
        document.getElementById('body').style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';

        // Set close button colour to contrast.
        let closeEl = document.getElementById('closeButton');
        closeEl.style.color = 'hsl(0, 0%, ' + (lightness < 50 ? '100' : '0') + '%)';
        const closeOpacity = (
                (50 - Math.abs(lightness - 50)) // Invert to 0-1 range, with extremes lower
                / (50 * 7) // Scale down
            ) + (1 / 6); // Bump up so that it never is 0
        closeEl.style.opacity = closeOpacity;

        // Handle screen brightness
        let brightness = value;
        if (value > (1 - app.middleDeadZone) / 2) { // This should use deadzoneBottom, but for some inscrutible reason it become 'undefined'.
            brightness = brightness * app.brightnessBoost;
            if (brightness > 1) {
                brightness = 1;
            }
        }
        if (app.debugMode) {
            app.cpEl.innerHTML = "value=" + value + "<br>useValue=" + useValue + "<br>brightness=" + brightness;
        }
        if (window.pBrightness) {
            pBrightness.setBrightness( // Set screen brightness
                brightness,
                function(status) { // Success
                }, function(status) { // Error
                }
            );
        }
    },

    exitApp: function() {
        navigator.app.exitApp();
    }
    
};
