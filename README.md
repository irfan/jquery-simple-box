[jQuery Slider Plugin](http://irfandurmus.dev/projects/jquery-slider-plugin/)
======================================================================================

How to use 
--------------------------------------

### Include needed files
	<link rel="stylesheet" type="text/css" src="slider.css" />
	<script type="text/javascript" src="jquery.min.js"></script>
	<script type="text/javascript" src="slider.js"></script>

### Initialize the plugin
    $(function(){
        $('#sliderContainer').slider();
    });

### Using with user option
    $(function(){
        $('#sliderContainer').slider({
            wait:3500,
            method:'flat'
        });
    });




