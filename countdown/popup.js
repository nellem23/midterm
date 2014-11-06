
	var refreshProgressBarTimeout;

	var bgpage = chrome.extension.getBackgroundPage();
	console.log(bgpage)
	var previousValues = [15, 30, 45, 60];
	var editing = false;
	var pauseTimerOn = 1;
	var timerOn = 1;

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
	    hide("display");
	    editing = false;
	 
	 if(pauseTimerOn)
	    {
	        showInline("resume");
	        hide("pause");
	    }
	   
	    // if timer off, show settings so user can edit them and set the timer
		if(!timerOn)
		{
			// LOADS custom times IF they exist
			for(var i = 0; i < document.choices.radio.length; i++)
				if(localStorage[i] !== null)
					document.getElementById("s"+i).textContent = localStorage[i];
			
			show("settings");
	        hide("display");
		}
		
		// else, show countdown clock
		else
		{
			show("display");
	        refreshProgressBar();
			show("modify");
		}
  }	

	function getChoice()
	{
		// find selected RADIO, RETURN selected value
		var num;
		for(var i = 0; i < document.choices.radio.length; i++)
		{
			if(document.choices.radio[i].checked === true)
				num = parseInt(document.getElementById("s"+i).textContent);
		}
		return num;
	}

	function swap() //swaps buttons on click events 
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
		var editButton = document.getElementById("swapper");
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
			show("modify");
	        show("display");

			refreshProgressBar();
		}
		else
			bgpage.error();
	}

	// Returns true if 0 <= amt <= 240
	function isValid(amt)
	{
		if(isNaN(amt) || (amt === null))
			return false;
				else if((amt < 0) || (amt > 240))
			return false;
				else
			return true;
	}

	function refreshProgressBar()
	{
	    percent = bgpage.getTimeLeftPercent();
	    
	    if(percent < 15)
	        document.getElementById("bar").style.color = "red";
		document.getElementById("bar").textContent = bgpage.getTimeLeftString();
	    document.getElementById("bar").style.width = percent + "%";
	    
		refreshProgressBarTimeout = setTimeout(refreshProgressBar, 100);
	}


	function pauseTimer()
	{
	    hide("pause");
	    showInline("resume");
	    bgpage.pause();
	    clearTimeout(refreshProgressBarTimeout);
	}

	function resumeTimer()
	{
	    hide("resume");
	    showInline("pause");
	    refreshProgressBar();
	    bgpage.resume();
	}

	function restartTimer()
	{
	    hide("resume"); 
	    showInline("pause");
	    refreshProgressBarTimeout();
	    bgpage.restart();
	}

	function reset()
	{
		clearTimeout(refreshProgressBar);
		bgpage.turnOff();
		hide("display");
		show("settings");
		hide("modify");
	}
  
  console.log("done");

// SITE LIST

function saveSettings(){
	addPageToStorage()
};

function addPageToStorage(specPage){
    trackButton('Options','Button','AddPage');
    var pageToBlock = document.getElementById('block_page').value;
    if(pageToBlock == 'example.com/example'){
        showMessage(translate('wrong_url'));
        return;
    }
    if(specPage){
        pageToBlock = specPage;
    }
    pageToBlock = pageToBlock.trim();
    $('#page_exist').hide();
    $('#wrong_url').hide();
    if(isURL(pageToBlock) && pageToBlock!=getPref('blacklist_redirect')){
        pageToBlock = pageToBlock.toLowerCase();
        $('#block_page').val("");
        if(pageToBlock==="" || pageToBlock===null) return;
        pageToBlock=cropUrl(pageToBlock);
        var splited = pageToBlock.split(".");
        if(splited[0]=="www"){
            splited.splice(0,1);
            pageToBlock=splited.join(".");
        } 

        if(localStorage.BlockedSites){
            var BlockedSites = JSON.parse(localStorage.BlockedSites);
            for(var i=0;i<BlockedSites.length;i++){
                if(BlockedSites[i].url==pageToBlock || "www." + BlockedSites[i].url==pageToBlock||BlockedSites[i].url=="www."+pageToBlock) {
                    showMessage(translate('page_exist'));
                    return;
                } 
            }
            var Site=new Object();
            Site.url=pageToBlock;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage.BlockedSites=JSON.stringify(BlockedSites);
        }
        renderDomainSelect();
        saveSettings();
    } else{
        alert(translate('wrong_url'));
    } 
    pageToBlock.value="";
}
function removeFromList(index){
    trackButton('Options','Button','RemovePage');
    var BlockedSites = JSON.parse(localStorage.BlockedSites);
    BlockedSites.splice(index, 1);
    localStorage.BlockedSites=JSON.stringify(BlockedSites);
    renderBlockList();
    renderDomainSelect();
    saveSettings();
    
}

//Remove blocked site from on click when on blockedsite.html

function renderBlockList(){
    if(localStorage.BlockedSites){
        var BlockedSites = JSON.parse(localStorage.BlockedSites);
        var table = $('<table class="table table-striped table-bordered table-hover"><tr><th>'+translate('URL')+'</th><th>'+translate('Other')+'</th></tr></table>');
        var blockedList = $('#blockedlist');
        blockedList.empty();
        blockedList.append(table);
        for(var i=BlockedSites.length-1; i>=0; i--){
            var tr = $('<tr></tr>');
            table.append(tr);
            var td = $('<td rel="'+i+'"></tr>');
            tr.append(td);
            td.append('<strong>'+BlockedSites[i].url+'</strong>');
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
          td.append(remove);
            remove.click(function(){
                var rel = $(this).parent('td').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeFromList(rel);
                }
            }   
        );
      }
    }
}

    // addPage to block_list
    var addPage=document.getElementById('add_page');
    addPage.setAttribute('value', translate('add_page'));
    addPage.addEventListener("click",function(){
        addPageToStorage();
        renderBlockList();
    },false);
    $('#block_page').keydown(function(e){
        if(e.keyCode==13){
            addPageToStorage();
            renderBlockList();
        }
    });
}

//Remove blocked site from on click when on blockedsite.html
var unblockButton = document.querySelector('.btn btn-danger unblock');
	if (unblockButton){unblockButton.addEventListener('click',removeFromList)};


	// block desired urls
	//need to add functionality to add or remove urls
	// need to add functionality on blockedsite.html to add or remove the site from the alert
	
	var BlockedSites = {};
	var on_or_off = 0;
	BlockedSites.DEFAULT_DELAY_SECONDS = 20; // *1000 for milliseconds used by js

	if (localStorage.BlockSites_DELAY_SECONDS) {
	    BlockedSites.PAUSE = localStorage.BlockSites_DELAY_SECONDS*1000;
	} else {
	    BlockedSites.PAUSE = BlockedSites.DEFAULT_DELAY_SECONDS*1000; 
	}

	if (localStorage.BlockSites_ALLOWED_URLS) {
	    var allowed_urls = localStorage.BlockSites_ALLOWED_URLS;
  } else {

		BlockedSites.delay_page_load = function() {    
	    if (localStorage.BlockedSites_ON_OR_OFF && localStorage.BlockedSites_ON_OR_OFF != "off") {
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
				window.location = "http://nellemcdade.com/js-midterm/blockedsite.html";
	            console.log("not an important page: pausing pageload for "+ (blockUrls.PAUSE/1000) +" seconds");
	            console.log(host);
	            var date = new Date();
	            var curDate;
	            do { curDate = new Date(); }
	            while ( curDate-date < BlockedSites.PAUSE);
	        }
	    
	}
	BlockedSites.delay_page_load();
  };
};
console.log("program done");
