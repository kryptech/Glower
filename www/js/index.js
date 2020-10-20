/*
Copyright (c) 2020 Chris M. Sissons
https://github.com/kryptech/Glower
*/

const app = {

    // Config variables
    debugMode:          false,  // For development.
    middleDeadZone:     .25,    // .5 = 50% of control panel height.
    brightnessBoost:    1.4,    // Make brightness increase faster.
    cpTimeoutId:        0,      // For cancelling control panel fade.

    // Application Constructor
    initialize: function() {
        //console.log('initialize');
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        //console.log('deviceReady');
        
        try {
            window.pBrightness = cordova.plugins.brightness;
        }
        catch(err) {
            console.log('Error loading brightness plugin:');
            console.log(JSON.stringify(err));
        }
        if (window.pBrightness) {
            pBrightness.setKeepScreenOn(true); // Keep screen on
            pBrightness.setBrightness( // Set screen brightness
                .5 * app.brightnessBoost,
                function(status) { // Success
                }, function(status) { // Error
                    console.log('Failed to set brightness');
                }
            );
        } else {
            console.log('Brightness plugin missing; this could happen if using `phonegap serve`:');
        }
        
        // Style title's opening effects.
        let titleEl = document.getElementById('title');
        titleEl.style.opacity = 0;
        titleEl.style.textShadow = '0 0 3vw hsl(0, 100%, 90%)'; // Larger and lighter.
        titleEl.style.top = '-100vh'; // Move completely off the top of the screen.
        
        // Make frame colour match control panel after a bit.
        app.cpTimeoutId = setTimeout(
            function() {
                document.getElementById('body').style.backgroundColor = 'hsl(0, 100%, 50%)'; // clEl.style.backgroundColour doesn't seem to work. :(
            }, 10000
        );

        // Listen for control panel touches.
        let cpEl = document.getElementById('controlPanel');
        cpEl.addEventListener('touchstart', app.onTouch, false);
        cpEl.addEventListener('touchmove', app.onTouch, false);
        if (app.debugMode) {
            cpEl.style.color = 'blue';
        }

        // Listen for close button touches
        document.getElementById('closeButton').addEventListener('click', app.exitApp, false);
    },
    
	onTouch: function(event) {
        
        clearTimeout(app.cpTimeoutId); // Prevent frame colour from changing anymore.

        let cpEl = event.target;
        let cpRect = cpEl.getBoundingClientRect();

        let y = event.touches[0].pageY - cpRect.top;
        let value = 1 - y / cpRect.height;
        value = Math.round(value * 1000) / 1000; // Round to 3 decimal places.
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
        cpEl.style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';
        cpEl.style.boxShadow = '0 0 4vh 1vh hsl(0, 100%, ' + lightness + '%)';
        
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
            cpEl.innerHTML = "value=" + value + "<br>useValue=" + useValue + "<br>brightness=" + brightness;
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
