(function($){
	
	// define global variables
	var doc = $(document),
		win = $(window),
		dn = 'simplebox',	// element data name
		overlay,
		loading,
		sbContent,
		container,
		sbControls,
		isOpen = false,
		inited = false,
		openedItem,
		groups = [],
		isDataReady = false,
		interval,
		inAction = false,
		callback;
				
	// start the plugin main method
	$.fn.simplebox = function(settings, callback){
        
        callback = callback || function(){};
        settings = settings || {};
		
		// for each element
		this.each(function(index, value){
			
			var el = $(this),
				options = $.extend(true, {}, defaults, settings);
			
		    el.bind('init.sb', actions.init);
			
            el.bind(options.event, function(e){
				e.preventDefault();
				$(this).trigger('start.sb');
				//loading.bind('start.sb', actions.loading);
			});
			
			el.bind('start.sb', actions.start)
			  .bind('close.sb', actions.close)
			  .bind('destroy.sb', actions.destroy);
			
			if (options.type == 'gallery') {
				
				// create empty array in groups global variable
				if (!groups[options.galleryName]) {
					groups[options.galleryName] = new Array();
				};
				
				// push item to array
				groups[options.galleryName].push(el);
				
				options.galleryId = groups[options.galleryName].length;
				
				el.bind('next.sb prev.sb', actions.changeImage);
			};
			
			el.data(dn, options);

            if (!inited) {
                el.trigger('init.sb');
            };
			
		}); // each
		
		
		return this;
	} // $.fn.simplebox
	
	// set
	var actions = {
		init: function(e){
            console.log(e);
			var options = $(e.target).data('simplebox'),
			    lang = options[options.lang];
			
            $('body').append('<div id="sbOverlay" /> <div id="sbContainer"><div id="sbContent" /><div id="sbControls"><a href="#close" id="sbCloseButton">' + lang.close + '</a><a href="#next" id="sbNextButton">' + lang.next + '</a><a href="#prev" id="sbPrevButton">' + lang.prev + '</a></div></div><div id="sbLoading">' + lang.loading + '.</div>');
			
			overlay = $('#sbOverlay'),
			sbContent = $('#sbContent'),
			container = $('#sbContainer'),
			sbControls = $('#sbControls'),
			loading = $('#sbLoading');
			
			inited = true;
			//console.log('init: -');
			return this;
		},
		setError: function(e){
			var options = $(e.target).data('simplebox'),
			    lang = options[options.lang];
			//console.log('setError: +');
			// if content doesn't found set auto width and height
			sbContent.html(lang.contentError);
			actions.autoSize(e);
			isDataReady = false;
			//console.log('setError: -');
			return this;
		},
		autoSize: function(e){
			//console.log('autoSize: +');
			$(e.target).data(dn).width = 'auto',
			$(e.target).data(dn).height = 'auto';
			//console.log('autoSize: -');
			return this;
		},
		createImage: function(e, content){
			//console.log('createImage: +');
			var image = new Image();
			image.id = 'sbImage';
			image.onerror = function(){
				actions.setError(e);
				isDataReady = true;
				inAction = false;
			}
			image.onload = function(){
				actions.setImage(e, image);
				isDataReady = true;
				inAction = false;
			};
			
			image.src = content;
			//console.log('createImage: -');
			return this;
		},
		setImage: function(e, image){
			//console.log('setImage: +');
			var el = $(e.target),
				options = el.data(dn);
			
			if (image.width > win.width()) {
				image.width = win.width() * 0.8;
			};
			
			if (image.height > win.height()) {
				image.height = win.height() * 0.8;
			};
			
			el.data(dn).width = image.width;
			el.data(dn).height = image.height;
			
			el.data(dn).height = 'auto';
			
			sbContent.html(image);
			//console.log('setImage: -');
		},
		show: function(e){
			//callback(e);
			//console.log('show: +');
			
			if (!isDataReady) {
				if (interval) {
					clearInterval(interval);
				};
				
				interval = setInterval(function(){
					actions.start(e);
				}, 50);
				return;
			}
			else{
				clearInterval(interval);
			}
			
			var el = $(e.target),
				options = el.data(dn);
			
			if (options.overlay) {
				if (options.effect === 'fade') {
					container.fadeIn(options.duration);
				}
				else{
					overlay.show();
					container.show();
				}
			}
			else{
				container.fadeIn(options.duration);
			}
			
			// click to overlay close is need ?
			
			overlay.unbind(options.closeEvent);
			
			if (options.overlayClose) {
				overlay.bind(options.closeEvent, function(e){
					e.preventDefault();
					el.trigger('close.sb', e);
				});
			}
			
			
			//console.log(options.showControls)
			// bind close 
			//if (options.showControls) {
				var cs = $(options.closeSelector);
				//console.log(cs)
				cs.die();
				cs.live(options.closeEvent, function(e){
					e.preventDefault();
					el.trigger('close.sb');
				});
			//};
			if (options.type == 'gallery') {
				var ns = $(options.nextSelector),
					ps = $(options.prevSelector);
				
				ns.die(options.nextEvent);
				ps.die(options.nextEvent);
				
				// bind next 
				ns.live(options.nextEvent, function(e){
					e.preventDefault();
					el.trigger('next.sb');
				}).show();
				
				// bind prev
				ps.live(opitons.prevEvent, function(e){
					e.preventDefault();
					el.trigger('prev.sb');
				}).show();
				
				if (groups[options.galleryName].length == options.galleryId) {
					ns.die(options.nextEvent)
					  .hide();
				};
				
				if (options.galleryId == 1) {
					ps.die(options.nextEvent)
					  .hide();
				};
				if (groups[options.galleryName].length == 1) {
					ns.die(options.nextEvent)
					  .hide();
					ps.die(options.nextEvent)
					  .hide();
				};
				
			}
			else{
				$(options.prevSelector).die(options.prevEvent).hide();
				$(options.nextSelector).die(options.nextEvent).hide();
			}
			
			if (!options.showControls) {
				sbControls.hide();
			}
			else{
				sbControls.show();
			}
			isOpen = true;
			
			
			//console.log('show: -');
			return;
		},
		start: function(e){
			actions.loading(e);
			if (inAction) {
				return;
			};
			
			inAction = true;
			
			var el = $(e.target),
				options = el.data(dn),
				content = el.attr('href');
			
			// set last opened item to global variable
			openedItem = el;
			
			container.css({
				width: options.width,
				height: options.height,
				padding: options.padding,
				'background-color': options.bg
			});
			
			// content came from other element or ajax ???
			if (content.substring(0,1) === '#') {
				var cont = $(content);
				
				if (cont.length > 0) {
					//console.log(e, cont)
					actions.fillContent(e, cont.html());
				}
				else {
					//console.log('error')
					actions.setError(e);
				}
			}
			else if(content.substring(0,1) === '/'){
			    isDataReady = true;
    			inAction = false;
			    $.ajax({
			        url: content,
			        type: options.ajaxMethod,
			        success: function(data){
			            //console.log(data.success)
			            if (data.success) {
			                actions.fillContent(e, data.html);
			            }
			        }
			    })
			}
			else{
				actions.getImage(e, content);
			}
			
			win.bind('resize scroll mousewheel onscroll', function(e){
				actions.repos(e);
			});
			//console.log('start: -');
			return this;
		},
		fillContent: function(e, content){
		    
			sbContent.html(content);
			actions.repos();
			actions.show(e);
			
			isDataReady = true;
			inAction = false;
		},
		getImage: function (e, content) {
			//console.log('getImage: +');
			
			
			actions.createImage(e, content);
			
			actions.repos();
			actions.show(e);
			
			
			//console.log('getImage: -');
		},
		close: function(e){
			//console.log('close: +');
			var el = $(e.target),
				settings = el.data(dn);

			if (settings.effect === 'fade') {
				container.fadeOut(settings.duration, function(){
					overlay.fadeOut(settings.duration);
					el.trigger('destroy.sb');
				});
			}
			else{
				container.hide();
				overlay.hide();
				el.trigger('destroy.sb');
			}
			
			
			isOpen = false;
			isDataReady = false;
			inAction = false;
			win.unbind('resize scroll mousewheel onscroll');
			//console.log('close: -');
			return this;
		},
		destroy: function(e){
			//console.log('destroy: +');
			var el = $(e.target),
				settings = el.data(dn);

			sbContent.empty();
			//console.log('destroy: -');
			return this;
		},
		repos: function(e){
			//console.log('repos: +');
			
			var options = openedItem.data(dn);
			
			if (typeof(options.height) == 'number') {
				var tp = (win.height() / 2) - (options.height / 2),
					lp = (win.width() / 2) - (options.width / 2);
			}
			else{
				var tp = (win.height() / 2) - (container.height() / 2),
					lp = (win.width() / 2) - (container.width() / 2);
			}
			
			if (win.scrollTop() > 0) {
				tp = tp + win.scrollTop();
			};

			if (win.scrollLeft() > 0) {
				lp = lp + win.scrollLeft();
			};
			
			container.css({
				left: lp,
				top : tp
			});
			
			llp = (lp + (container.width() / 2)) - (loading.width() / 2);
			ltp = (tp + (container.height() / 2))- (loading.height() / 2);
			
			//console.log(container.width(), loading.width());
			
			loading.css({
				left:llp,
				top:ltp
			});
			
			//console.log('repos: -');
			return this;
		},
		changeImage: function(e){
			//console.log('changeimage..')
			actions.loading(e);
			
			var el = $(e.target),
				options = el.data(dn),
				id = options.galleryId;
			
			if (e.type == 'prev') {
				id = options.galleryId - 2;
			};
			
			container.fadeOut(function(){
				$(groups[options.galleryName][id]).click();
				el.trigger('destroy.sb');
			})

			isOpen = false;
			isDataReady = false;
			inAction = false;
			win.unbind('resize scroll mousewheel onscroll');
			
		},
		loading: function(e){
			//console.log(inAction);
			
			if (inAction) {
				loading.show();
			}
			else{
				loading.hide();
			}
		    
		    
			if (!overlay.is(':visible')) {
				
				var el = $(e.target),
					options = el.data(dn);

				overlay.css({
					'background-color' : options.color,
					'opacity': options.opacity,
				});

				overlay.css('height', doc.height());


				if (options.overlay) {
					if (options.effect == 'fade') {
						overlay.fadeIn(options.duration);
					}
					else{
						overlay.fadeIn(options.duration);
					}
				};

				return;
			};
			
		}
	},
	
	defaults = {
		event : 'click',
		
		showControls : true,
		
		ajaxMethod : 'GET',

		closeEvent : 'click',
		closeSelector : '#sbCloseButton',
		
		nextEvent : 'click',
		nextSelector : '#sbNextButton',
		
		prevEvent : 'click',
		prevSelector : '#sbPrevButton',
		
		effect: 'fade',
		duration : 150,
		
		width : 485,
		height : 300,
		padding : 10,
		bg:'#FFF',
		
		overlay : true,
		color : '#000',
		opacity : 0.7,
		overlayClose : true,
		
		type : 'single',
		galleryName : false,
		
        lang: 'tr',
        tr: {
            close: 'Kapat',
            next: 'Sonraki',
            prev: 'Önceki',
            loading:'Yükleniyor...',
            contentError: 'İstediğiniz içeriğe şu anda ulaşılamıyor.'
        },
        en:{
            close: 'Close',
            next: 'Next',
            prev: 'Prev',
            loading: 'Loading...',
            contentError: 'This content is not available at this moment'
        },
        de: {
            close: 'Schließen',
            next: 'Nächste',
            prev: 'Zurück',
            loading: 'Laden...',
            contentError: 'Dieser inhalt ist nicht verfügbar immMomen'
        },
		debug : false
	};
})(jQuery)



