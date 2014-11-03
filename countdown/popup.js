(function () {
	window.onload = function(e){ 
    // your code 
    e.prevent.Default();
	}
    
    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', domReady, false);
    } else {
        window.attachEvent('onload', domReady);
    }

	function domReady() {

	var refreshDisplayTimeout;
	var bgpage = chrome.extension.getBackgroundPage();
	var previousValues = [15, 30, 45, 60];
	var editing = false;
	var alertBlock = false;

	document.addEventListener('DOMContentLoaded', function () {
	    load();
	    document.querySelector('#start').addEventListener('click', setTimer);
	    document.querySelector('#cancel').addEventListener('click', reset);
	    document.querySelector('#wrench').addEventListener('click', swap);
	    document.querySelector('#pause').addEventListener('click', pauseTimer);
	    document.querySelector('#resume').addEventListener('click', resumeTimer);
	    document.querySelector('#restart').addEventListener('click', restartTimer);
	});

	function show(section)
	{
	    document.getElementById(section).style.display = "block";
	}

	function showInline(section)
	{
	    document.getElementById(section).style.display = "inline";
	}

	function hide(section)
	{
	    document.getElementById(section).style.display = "none";
	}

	function load()
	{
	    hide("settings");
	    hide("modify");
	    hide("resume");
	    hide("alert alert-danger alert-dismissible fade in");
	    editing = false;
	    
	 if(bgpage.pauseDate)
	    {
	        showInline("resume");
	        hide("pause");
	        hide("alert alert-danger alert-dismissible fade in");

	    }
	   
	    // if timer off, show settings
		if(!bgpage.alarmDate)
		{
			// LOADS custom times IF they exist
			for(var i = 0; i < document.choices.radio.length; i++)
				if(localStorage[i] != null)
					document.getElementById("s"+i).textContent = localStorage[i];
			
			show("settings");
	        hide("display");
	      	hide("alert alert-danger alert-dismissible fade in");

		}
		
		// else, show countdown
		else
		{
			show("display");
	        refreshDisplay();
			show("modify");
			hide("alert alert-danger alert-dismissible fade in");

		}
	}

	function getChoice()
	{
		// find selected RADIO, RETURN selected value
		var num;
		for(var i = 0; i < document.choices.radio.length; i++)
		{
			if(document.choices.radio[i].checked == true)
				num = parseInt(document.getElementById("s"+i).textContent);
		}
		return num;
	}

	function swap()
	{
		editing = true;
		
		// swap text with fields
		for(var i = 0; i < document.choices.radio.length; i++)
		{
			var span = document.getElementById("s"+i);
			var num = parseInt(span.textContent);
			
			previousValues[i] = num;
			
			var html = "<input class='input-mini' type='text' name='custom' id='c"+i;
			html += "' value='"+num;
			html += "'>";
			// used to select on click and auto save on change
	        
			span.innerHTML = html;
		}
	    
		// swap edit button with done button
		var butt = document.getElementById("swapper");
		butt.innerHTML = "<a href='#' id='done' class='btn'><i class='icon-ok'></i></a>";
	    document.querySelector('#done').addEventListener('click', swapBack);
	}

	function swapBack()
	{
		// swap fields with text
		for(var i = 0; i < document.choices.radio.length; i++)
		{
			var span = document.getElementById("s"+i);
			var num = parseInt(document.getElementById("c"+i).value);
			
			if(isValid(num))
	        {
	            localStorage[i] = num;
	            span.textContent = num;
	        }
			else
				span.textContent = previousValues[i];
		}
		
		// swap done button with edit button
		var butt = document.getElementById("swapper");
		butt.innerHTML = "<a href='#' id='wrench' class='btn'><i class='icon-wrench'></i></a>";
	    document.querySelector('#wrench').addEventListener('click', swap);
		
		editing = false;
	}

	function setTimer()
	{
		// make sure we're dealing with text not fields
		if(editing)
			swapBack();
		
		// SET background timer for selected number
		// HIDE settings, DISPLAY countdown
	    
		var num = getChoice();
		
		// set timer, hide settings, display reset button
		if(isValid(num))
		{
			bgpage.setAlarm(num * 60000);
			hide("settings");
			hide("alert alert-danger alert-dismissible fade in");
			show("modify");
	        show("display");

			refreshDisplay();
		}
		else
			bgpage.error();
	}

	// Returns true if 0 <= amt <= 240
	function isValid(amt)
	{
		if(isNaN(amt) || (amt == null))
			return false;
				else if((amt < 0) || (amt > 240))
			return false;
				else
			return true;
	}

	function refreshDisplay()
	{
	    percent = bgpage.getTimeLeftPercent();
	    
	    if(percent < 15)
	        document.getElementById("bar").style.color = "red";
		document.getElementById("bar").textContent = bgpage.getTimeLeftString();
	    document.getElementById("bar").style.width = percent + "%";
	    
		refreshDisplayTimeout = setTimeout(refreshDisplay, 100);
	}

	function pauseTimer()
	{
	    hide("pause");
	    hide("alert alert-danger alert-dismissible fade in");
	    showInline("resume");
	    bgpage.pause();
	    clearTimeout(refreshDisplayTimeout);
	}

	function resumeTimer()
	{
	    hide("resume");
		hide("alert alert-danger alert-dismissible fade in");
	    showInline("pause");
	    refreshDisplay();
	    bgpage.resume();
	}

	function restartTimer()
	{
	    hide("resume");
	 	hide("alert alert-danger alert-dismissible fade in");
	    showInline("pause");
	    refreshDisplay();
	    bgpage.restart();
	}

	function reset()
	{
		clearTimeout(refreshDisplayTimeout);
		bgpage.turnOff();
		hide("display");
		show("settings");
		hide("modify");
		hide("alert alert-danger alert-dismissible fade in");
	}

	function block () {

	hide("alert alert-danger alert-dismissible fade in");

	var blockUrls = {};

	blockUrls.DEFAULT_DELAY_SECONDS = 20 // *1000 for milliseconds used by js

	if (localStorage.blockUrls_DELAY_SECONDS) {
	    blockUrls.PAUSE = localStorage.blockUrls_DELAY_SECONDS*1000;
	} else {
	    blockUrls.PAUSE = blockUrls.DEFAULT_DELAY_SECONDS*1000; 
	}

	if (localStorage.blockUrls_ALLOWED_URLS) {
	    var allowed_urls = localStorage.blockUrls_ALLOWED_URLS;
	} else {
	    var allowed_urls = [
	                        "google.com", 
	                        "stackoverflow.com",
	                        "amazonaws.com", 
	                        "amazon.com", 
	            			"gmail.com",
	            			"bing.com",
	       					"chrome://extension",
	            			"8tracks.com",
	            			"youtube.com",
	                        "dropbox.com",
	                        "chrome-extension://djefgihkfilidjkgnbccipmkhhpkmcaa/popup.html",
	                        "getbootstrap.com"];
	}




	blockUrls.delay_page_load = function() {    
	    if (localStorage.blockUrls_ON_OR_OFF && localStorage.blockUrls_ON_OR_OFF != "off") {
	        var on_or_off = 1;
	    } else {
	        var on_or_off = 0;
	    }
	    on_or_off = 1;

	    if (on_or_off) {
	        var host = location.href;
	        var num_allowed = allowed_urls.length;
	        var allowed = 0;
	        for (i=0; i<num_allowed; i++) {
	            reg_exp = "^.*"+allowed_urls[i]+".*$";
	            if (host.match(reg_exp)) {
	                allowed = 1;
	                break;
	            }
	        }

	        if (!allowed) {

	        	show("alert alert-warning alert-dismissible");

	            console.log("not an important page: pausing pageload for "+ (blockUrls.PAUSE/1000) +" seconds");
	            console.log(host);
	            var date = new Date();
	            var curDate;
	            do { curDate = new Date(); }
	            while ( curDate-date < blockUrls.PAUSE);
	        }
	    }
	};

	blockUrls.delay_page_load();
}
});
