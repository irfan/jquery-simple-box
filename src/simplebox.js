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
		win.bind('init.sb', actions.init);
		
		// for each element
		this.each(function(index, value){
			
			var el = $(this),
				opts = $.extend(true, {}, defaults, settings);
			
			el.bind(opts.event, function(e){
				e.preventDefault();
				$(this).trigger('start.sb');
				//loading.bind('start.sb', actions.loading);
			});
			
			el.bind('start.sb', actions.start)
			  .bind('close.sb', actions.close)
			  .bind('destroy.sb', actions.destroy);
			
			if (opts.type == 'gallery') {
				
				// create empty array in groups global variable
				if (!groups[opts.galleryName]) {
					groups[opts.galleryName] = new Array();
				};
				
				// push item to array
				groups[opts.galleryName].push(el);
				
				opts.galleryId = groups[opts.galleryName].length;
				
				el.bind('next.sb prev.sb', actions.changeImage);
			};
			
			el.data(dn, opts);
			
		}); // each
		
		if (!inited) {
			win.trigger('init.sb');
		};
		
		return this;
	} // $.fn.simplebox
	
	// set
	var actions = {
		init: function(e){
			//callback(e);
			//console.log('init: +');
			$('body').append('<div id="sbOverlay" /> <div id="sbContainer"><div id="sbContent" /><div id="sbControls"><a href="#close" id="sbCloseButton">Kapat</a><a href="#next" id="sbNextButton">Sonraki</a><a href="#prev" id="sbPrevButton">Önceki</a></div></div><div id="sbLoading">Yükleniyor...</div>');
			
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
			//console.log('setError: +');
			// if content doesn't found set auto width and height
			sbContent.html('This content is not available right now');
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
				opts = el.data(dn);
			
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
				opts = el.data(dn);
			
			if (opts.overlay) {
				if (opts.effect === 'fade') {
					container.fadeIn(opts.duration);
				}
				else{
					overlay.show();
					container.show();
				}
			}
			else{
				container.fadeIn(opts.duration);
			}
			
			// click to overlay close is need ?
			
			overlay.unbind(opts.closeEvent);
			
			if (opts.overlayClose) {
				overlay.bind(opts.closeEvent, function(e){
					e.preventDefault();
					el.trigger('close.sb', e);
				});
			}
			
			
			//console.log(opts.showControls)
			// bind close 
			//if (opts.showControls) {
				var cs = $(opts.closeSelector);
				//console.log(cs)
				cs.die();
				cs.live(opts.closeEvent, function(e){
					e.preventDefault();
					el.trigger('close.sb');
				});
			//};
			if (opts.type == 'gallery') {
				var ns = $(opts.nextSelector),
					ps = $(opts.prevSelector);
				
				ns.die(opts.nextEvent);
				ps.die(opts.nextEvent);
				
				// bind next 
				ns.live(opts.nextEvent, function(e){
					e.preventDefault();
					el.trigger('next.sb');
				}).show();
				
				// bind prev
				ps.live(opts.prevEvent, function(e){
					e.preventDefault();
					el.trigger('prev.sb');
				}).show();
				
				if (groups[opts.galleryName].length == opts.galleryId) {
					ns.die(opts.nextEvent)
					  .hide();
				};
				
				if (opts.galleryId == 1) {
					ps.die(opts.nextEvent)
					  .hide();
				};
				if (groups[opts.galleryName].length == 1) {
					ns.die(opts.nextEvent)
					  .hide();
					ps.die(opts.nextEvent)
					  .hide();
				};
				
			}
			else{
				$(opts.prevSelector).die(opts.prevEvent).hide();
				$(opts.nextSelector).die(opts.nextEvent).hide();
			}
			
			if (!opts.showControls) {
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
				opts = el.data(dn),
				content = el.attr('href');
			
			// set last opened item to global variable
			openedItem = el;
			
			container.css({
				width: opts.width,
				height: opts.height,
				padding: opts.padding,
				'background-color': opts.bg
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
			        type: opts.ajaxMethod,
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
			
			var opts = openedItem.data(dn);
			
			if (typeof(opts.height) == 'number') {
				var tp = (win.height() / 2) - (opts.height / 2),
					lp = (win.width() / 2) - (opts.width / 2);
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
				opts = el.data(dn),
				id = opts.galleryId;
			
			if (e.type == 'prev') {
				id = opts.galleryId - 2;
			};
			
			container.fadeOut(function(){
				$(groups[opts.galleryName][id]).click();
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
					opts = el.data(dn);

				overlay.css({
					'background-color' : opts.color,
					'opacity': opts.opacity,
				});

				overlay.css('height', doc.height());


				if (opts.overlay) {
					if (opts.effect == 'fade') {
						overlay.fadeIn(opts.duration);
					}
					else{
						overlay.fadeIn(opts.duration);
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
		
		debug : false
	};
})(jQuery)

