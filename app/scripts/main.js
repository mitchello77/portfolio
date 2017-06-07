// Varibles
var keys = {37: 1, 38: 1, 39: 1, 40: 1};
var theater = theaterJS({"autoplay": false, "minSpeed": 60, "maxSpeed": 450});

$(window).on('load', function() {
  // hide preloader
  $('body').addClass('loaded');
  $('#pre-loader').addClass('hidden');
  theater.play();
  $('.twentytwenty-handle').mousedown( function() {
    $('.prompt').fadeOut();
  });
});

$(function() {
  // Varibles after DOM construction
  var objIntro = $('#intro');

  // -------------------
  console.log("JQuery Version: " + $.fn.jquery );
  if (objIntro !== undefined) {
    // FitText
    $('#intro h1').fitText(1.22);
    //theater
    theater.addActor('typer').addScene('typer:...', 3000).addScene('typer:Coder.', 2000).addScene('typer:Designer.', 2000).addScene('typer:Tech Lover.', 2000).addScene('typer:Nerd?', 500).addScene(theater.replay);
    $(window).scroll(function () {
      if (objIntro.hasClass('hidden') == false) {
        hideIntro(objIntro);
      }
    });
  };

  //scroll Reveal
  window.sr = ScrollReveal();
  sr.reveal('#mini-skills .col', {origin: 'left', delay: '250', distance: '40px'});

  $('#before-after').imagesLoaded( function() {
    $('#before-after').twentytwenty({
      default_offset_pct: 0.40
    });
  });

  $("#featured-projects .owl-carousel").owlCarousel({
    margin: 20,
    center: true,
    dotsEach: true,
    loop: true
  });

}); // END Window Ready

function hideIntro (obj) {
  window.scrollTo(0, 0);
  // animate it away
  theater.stop();
  obj.animateCss('bounceOutUp');
    obj.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
      window.scrollTo(0, 0);
      obj.addClass('hidden');
    });
}

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

/*global jQuery */
/*!
* FitText.js 1.2
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/

(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };

})( jQuery );
