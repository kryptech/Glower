/*
Copyright (c) 2021 Chris M. Sissons
https://github.com/kryptech/Glower
*/

const app = {

    // Config variables
    /** For development */
    debugMode:          false,
    /** .5 = 50% of control panel height */
    middleDeadZone:     .25,
    /** Make brightness increase faster */
    brightnessBoost:    1.4,
    ctrlPanelEl:        undefined,
    /** Increment this to re-show the guide in new versions */
    guideShownValue:    '2',

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
        app.ctrlPanelEl = document.getElementById('controlPanel');
        app.ctrlPanelEl.addEventListener('touchstart', app.onTouchCP, false);
        app.ctrlPanelEl.addEventListener('touchmove', app.onTouchCP, false);
        if (app.debugMode) {
            app.ctrlPanelEl.style.color = 'blue';
        }
        
        const guideContEl = document.getElementById('demoContainer');
        const bodyEl = document.getElementById('body');

        // Check if guide has been previously shown
        let guideShown = false;
        try {
            guideShown = window.localStorage.getItem('guideShown') === app.guideShownValue;
        } catch(e) {
            console.log('Error accessing localStorage');
        }

        // Handle guide
        if (guideShown) {
            // Prevent initial animation
            bodyEl.classList.remove('showGuide');
            guideContEl.remove();
        } else {
            // Listen for animation progress
            guideContEl.addEventListener('animationend', () => {
                if (!guideContEl.classList.contains('done') && !guideContEl.classList.contains('closing')) {
                    // Inital animation done
                    guideContEl.classList.add('done'); // Mark as done and ready to close
                } else if (guideContEl.classList.contains('closing')) {
                    // Closing animation done
                    guideContEl.remove();
                }
            });

            // Handle touches
            guideContEl.addEventListener('touchstart', event => {
                if (!guideContEl.classList.contains('closing')) { // Not currently closing
                    // Dismiss guide
                    guideContEl.classList.remove('done');
                    guideContEl.classList.add('closing'); // Trigger closing animation
                    bodyEl.classList.remove('showGuide'); // End colour animation
                    
                    // Mark guide as having been shown
                    if (!app.debugMode) {
                        try {
                            window.localStorage.setItem('guideShown', app.guideShownValue);
                        } catch(e) {}
                    }
                    
                    app.onTouchCP(event); // Pass along event to control panel
                }
            }, false);
            guideContEl.addEventListener('touchmove', event => {
                app.onTouchCP(event); // Pass along event to control panel
            });
        }
        
        // Listen for info button touches
        document.getElementById('infoButton').addEventListener('click', app.toggleShowInfo, false);
        document.getElementById('closeInfoButton').addEventListener('click', app.toggleShowInfo, false);
        
        // Listen for close button touches
        document.getElementById('closeButton').addEventListener('click', app.exitApp, false);
    },

	// Handle control panel touches
    onTouchCP: function(event) {

        const cpRect = app.ctrlPanelEl.getBoundingClientRect();

        const y = event.touches[0].pageY - cpRect.top;
        /** 0 to 1 */
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
        
        /** Colour lightness (for HSL) */
        const lightness = useValue * 100;
        
        // Set control panel BG colour and border.
        app.ctrlPanelEl.style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';
        app.ctrlPanelEl.style.boxShadow = '0 0 4vh 1vh hsl(0, 100%, ' + lightness + '%)';
        
        // Set body background colour.
        document.getElementById('body').style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';

        // Adjust buttons opacity to keep them faintly visible
        // Opacity is greatest slightly below the middle, least at the top/bottom
        const btnOpacity = (1 - Math.abs(.35 - useValue)) * .3 + .1;
        const btnEls = document.getElementsByClassName('btnFaint');
        for (let btnEl of btnEls) {
            // Set button colour to contrast
            btnEl.style.color = `hsla(0, 0%, ${ lightness < 50 ? 100 : 0}%, ${btnOpacity})`;
        }

        // Handle screen brightness
        /** 0 to 1 */
        let brightness = value;
        if (value > (1 - app.middleDeadZone) / 2) { // This should use deadzoneBottom, but for some inscrutible reason it become 'undefined'.
            brightness = brightness * app.brightnessBoost;
            if (brightness > 1) {
                brightness = 1;
            }
        }
        if (app.debugMode) {
            app.ctrlPanelEl.innerHTML = "value=" + value + "<br>useValue=" + useValue + "<br>brightness=" + brightness;
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

    toggleShowInfo: function() {
        const bodyEl = document.getElementById("body");
        bodyEl.classList.toggle("showInfo");
    },

    exitApp: function() {
        navigator.app.exitApp();
    }
    
};
