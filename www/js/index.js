/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // Config variables
    debugMode:          false,  // For development.
    middleDeadZone:     .25,    // .5 = 50% of control panel height.
    brightnessBoost:    1.4,    // Make brightness increase faster.
    cpTimeoutId:        0,      // For cancelling control panel fade.

    // Application Constructor
    initialize: function() {
        console.log('initialize');
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        console.log('deviceReady');
        
        try {
            window.pBrightness = cordova.require('cordova-plugin-brightness.Brightness'); // https://github.com/mgcrea/cordova-plugin-brightness
        }
        catch(err) {
            console.log(err.name + '; ' + err.message);
        }
        if (window.pBrightness) {
            pBrightness.setKeepScreenOn(true); // Keep screen on
            pBrightness.setBrightness( // Set screen brightness
                .5 * app.brightnessBoost,
                function(status) { // Success
                }, function(status) { // Error
                }
            );
        }
        
        // Style info opening effects.
        let infoEl = document.getElementById('info');
        infoEl.style.opacity = 0;
        infoEl.style.textShadow = '0 0 3vw hsl(0, 100%, 90%)'; // Larger and lighter.
        infoEl.style.top = '-100vh'; // Move completely off the top of the screen.
        
        // Listen for touches
        let cpEl = document.getElementById('controlPanel');
        cpEl.addEventListener('touchstart', app.onTouch, false);
        cpEl.addEventListener('touchmove', app.onTouch, false);
        if (app.debugMode) {
            cpEl.style.color = 'blue';
        }

        // Make frame colour match control panel after a bit.
        app.cpTimeoutId = setTimeout(
            function() {
                document.getElementById('body').style.backgroundColor = 'hsl(0, 100%, 50%)'; // clEl.style.backgroundColour doesn't seem to work. :(
            }, 10000
        );
    },
    
	onTouch: function(event) {
        
        clearTimeout(app.cpTimeoutId); // Prevent frame colour from changing anymore.

        let cpEl = event.target;
        let cpRect = cpEl.getBoundingClientRect();

        let y = event.touches[0].pageY - cpRect.top;
        var value = 1 - y / cpRect.height;
        value = Math.round(value * 1000) / 1000; // Round to 3 decimal places.
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        
        var deadzoneBottom = (1 - app.middleDeadZone) / 2;
        var deadzoneTop = deadzoneBottom + app.middleDeadZone;
        var useValue;
        if (value <= deadzoneBottom) {
            useValue = value / (1 - app.middleDeadZone);
        } else if (value >= deadzoneTop) {
            useValue = .5 + ((value - deadzoneTop) / (1 - app.middleDeadZone));
        } else { // In the zone!
            useValue = .5;
        }
        
        let lightness = useValue * 100;
        var brightness = value;
        if (value > (1 - app.middleDeadZone) / 2) { // This should use deadzoneBottom, but for some inscrutible reason it become 'undefined'.
            brightness = brightness * app.brightnessBoost;
            if (brightness > 1) {
                brightness = 1;
            }
        }
        
        if (app.debugMode) {
            cpEl.innerHTML = "value=" + value + "<br>useValue=" + useValue + "<br>brightness=" + brightness;
        }
        
        // Set control panel BG color and border.
        cpEl.style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';
        cpEl.style.boxShadow = '0 0 4vh 1vh hsl(0, 100%, ' + lightness + '%)';
        
        // Set body background color.
        document.getElementById('body').style.backgroundColor = 'hsl(0, 100%, ' + lightness + '%)';
        
        if (window.pBrightness) {
            pBrightness.setBrightness( // Set screen brightness
                brightness,
                function(status) { // Success
                }, function(status) { // Error
                }
            );
        }
    }
    
};
