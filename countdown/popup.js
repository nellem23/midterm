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
	    editing = false;
	    
	 if(bgpage.pauseDate)
	    {
	        showInline("resume");
	        hide("pause");
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
		}
		
		// else, show countdown
		else
		{
			show("display");
	        refreshDisplay();
			show("modify");
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
	    showInline("resume");
	    bgpage.pause();
	    clearTimeout(refreshDisplayTimeout);
	}

	function resumeTimer()
	{
	    hide("resume");
	    showInline("pause");
	    refreshDisplay();
	    bgpage.resume();
	}

	function restartTimer()
	{
	    hide("resume"); 
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
	}

// SITE LIST

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
        if(pageToBlock=="" || pageToBlock==null) return;
        pageToBlock=cropUrl(pageToBlock);
        var splited = pageToBlock.split(".");
        if(splited[0]=="www"){
            splited.splice(0,1);
            pageToBlock=splited.join(".");
        }
        if(localStorage.BlockedSites){
            var BlockedSites = JSON.parse(localStorage.BlockedSites);
            for(var i=0;i<BlockedSites.length;i++){
                if(BlockedSites[i].url==pageToBlock || "www." + BlockedSites[i].url==pageToBlock
                    || BlockedSites[i].url=="www."+pageToBlock) {
                    showMessage(translate('page_exist'));
                    return;
                } 
            }
            var Site=new Object();
            Site.url=pageToBlock;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
        }else{
            var BlockedSites=[];
            var Site=new Object();
            Site.url=pageToBlock;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
        }
        renderDomainSelect();
        saveSettings();
    }else{
        showMessage(translate('wrong_url'));
    }
    pageToBlock.value="";
}
function removeFromList(index){
    trackButton('Options','Button','RemovePage');
    var BlockedSites = JSON.parse(localStorage.BlockedSites);
    BlockedSites.splice(index, 1);
    localStorage['BlockedSites']=JSON.stringify(BlockedSites);
    renderBlockList();
    renderDomainSelect();
    saveSettings();
    
}
/*
Custom Redirect - but is now just going to send it to one page

function setRedirect(i,val){
    trackButton('Options','Button','Set Redirect');
    if(isURL(val,true)){
        var BlockedSites = JSON.parse(localStorage.BlockedSites);
        var isInBL = false;
        for(var j=0;j<BlockedSites.length;j++){
            if(cropUrl(val) == BlockedSites[j].url){
                isInBL = true;
            } 
        }
        if(!isInBL){
            BlockedSites[i].redirect = val;
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
            renderBlockList();
            saveSettings();
        }else{
            showMessage(translate('wrong_url'));
        }
    }else{
        showMessage(translate('wrong_url'));
    }
}
function unSetRedirect(i){
    trackButton('Options','Button','Unset Redirect');
    var BlockedSites = JSON.parse(localStorage.BlockedSites);
    BlockedSites[i].redirect = undefined;
    localStorage['BlockedSites']=JSON.stringify(BlockedSites);
    renderBlockList();
    saveSettings();
} */
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
            var td = $('<td style="min-width:230px;" rel="'+i+'"></tr>');
            tr.append(td);
            /* if(!getPref("whitelist")){
                var input = $('<input type="text" value="" class="redirect" />');
                td.append(input);
                if(BlockedSites[i].redirect){
                    input.val(BlockedSites[i].redirect);
                    input.attr('disabled','disabled');
                    var unset = $('<input type="button" value="'+translate('Unset')+'" />');
                    td.append(unset);
                    unset.click(function(){
                        var rel = $(this).parent('td').attr('rel');
                        unSetRedirect(rel);
                    });
                }else{
                    var set = $('<input type="button" value="'+translate('Set')+'" />');
                    td.append(set);
                    set.click(function(){
                        var rel = $(this).parent('td').attr('rel');
                        var val = $(this).parent('td').children('.redirect').val();
                        setRedirect(rel,val);
                    }); 
                }
            }else{
                var white_list_redir = getPref('whitelist_redirect') || '';
                if(cropUrl(white_list_redir) == BlockedSites[i].url){
                    td.append('<span>'+translate('redirect_page')+'</span>');
                }
            }*/
            var td = $('<td rel="'+i+'"></tr>');
            tr.append(td);
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
            td.append(remove);
            remove.click(function(){
                var rel = $(this).parent('td').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeFromList(rel);
                }
            });
        }
        /*if(!getPref("whitelist")){
            var div = $('<div><span style="display:inline-block;width:160px;">'+translate('Default_redirect_page')+'</span></div>')
            blockedList.append(div);
            var input = $('<input type="text" value="" class="blacklist_redirect" style="margin:0 8px 0 0;" />');
            div.append(input);
            if(getPref('blacklist_redirect')){
                input.val(getPref('blacklist_redirect'));
                input.attr('disabled','disabled');
                var unset = $('<input type="button" value="'+translate('Unset')+'" />');
                div.append(unset);
                unset.click(function(){
                    setPref('blacklist_redirect','');
                    renderBlockList();
                    saveSettings();
                });
            }else{
                var set = $('<input type="button" value="'+translate('Set')+'" />');
                div.append(set);
                set.click(function(){
                    var val = $('.blacklist_redirect').val();
                    if(isURL(val,true)){
                        var isInBL = false;
                        for(var j=0;j<BlockedSites.length;j++){
                            if(cropUrl(val) == BlockedSites[j].url){
                                isInBL = true;
                            } 
                        }
                        if(!isInBL){
                            setPref('blacklist_redirect',val);
                            renderBlockList();
                            saveSettings();
                        }else{
                            showMessage(translate('wrong_url'));
                        }
                    }else{
                        showMessage(translate('wrong_url'));
                    }
                });
            }
        }else{
            var div = $('<div>'+translate('Redirect_page')+'&nbsp; </div>');
            blockedList.append(div);
            var input = $('<input type="text" value="" class="whitelist_redirect" />');
            div.append(input);
            if(getPref('whitelist_redirect')){
                input.val(getPref('whitelist_redirect'));
                input.attr('disabled','disabled');
                var unset = $('<input type="button" value="'+translate('Unset')+'" />');
                div.append(unset);
                unset.click(function(){
                    setPref('whitelist_redirect','');
                    renderBlockList();
                    saveSettings();
                });
            }else{
                var set = $('<input type="button" value="'+translate('Set')+'" />');
                div.append(set);
                set.click(function(){
                    var val = $('.whitelist_redirect').val();
                    if(isURL(val,true)){
                        setPref('whitelist_redirect',val);
                        addPageToStorage(val);
                        renderBlockList();
                        saveSettings();
                    }else{
                        showMessage(translate('wrong_url'));
                    }
                }); 
            } */
        }
    }
}



	// AUTH

function renderAuthZone(){
    
    //titles
    $('#h1').html(chrome.app.getDetails().name);
    document.getElementById('func_title').innerHTML = translate('func_title');
    if(getPref('whitelist')){
        document.getElementById('list_title').innerHTML = translate('whitelist_title');
    }else{
        document.getElementById('list_title').innerHTML = translate('blacklist_title');
    }
    
    //labels
    document.getElementById('stats_label').innerHTML = translate('stats');
    document.getElementById('enable_label').innerHTML=translate('enable_label');
    $('#saved_text').html(translate('saved_text'));
    $('#block_page').val('example.com/example');
    
    $('#block_page').click(function(){
        $('#block_page').select();
    })
    document.getElementById('set_password').value=translate('set_password');
    
    //listeners
    document.getElementById('set_password').addEventListener("click",function(){  
        trackButton('Options','Uninstall section','Set Password');
        setPasswd();  
    },false);
    
    
    //buttons
    $('#close_button').val(translate('close_button'));
    $('#close_button').click(function(){
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.getAllInWindow(null, function(tabs) {
                for(var i = 0; i < tabs.length; i++) {
                    if(tabs[i].id==tab.id) continue;
                    chrome.tabs.update(tabs[i].id, {
                        url: tabs[i].url
                    });
                }
                window.close();
            });
        });
    })
    // addPage to block_list
    var addPage=document.getElementById('add_page');
    addPage.setAttribute('value', translate('add_page'))
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

	// block desired urls
	//need to add functionality to add or remove urls
	// need to add functionality on blockedsite.html to add or remove the site from the alert
	
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
				window.location = "file:///Users/nelle/Desktop/midterm-1a/countdown/blockedsite.html";
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
 */
});
