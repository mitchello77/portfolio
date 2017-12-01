// Varibles
var keys = {37: 1, 38: 1, 39: 1, 40: 1};
var introtheater;
var hometheater;
var objIntro = $('#intro');
var objWelcome =$('#welcome');

$(window).on('load', function() {
  // hide preloader
  $('body').addClass('loaded');
  $('#pre-loader').addClass('hidden');
  if (objWelcome.length) {
    hometheater.play();
  }
  if (objIntro.length) {
    introtheater.play();
    $('.twentytwenty-handle').mousedown( function() {
      $('.prompt').fadeOut();
    });
  }
});

$(function() {
  // Varibles after DOM construction


  // -------------------
  console.log("JQuery Version: " + $.fn.jquery );
  FastClick.attach(document.body);
  introtheater = theaterJS({"autoplay": false, "minSpeed": 60, "maxSpeed": 450});
  hometheater = theaterJS({"autoplay": false, "minSpeed": 60, "maxSpeed": 450});
  if (objWelcome.length) {
    hometheater.addActor('welcometyper').addScene('welcometyper:...', 3000).addScene('welcometyper:Programming.', 2000).addScene('welcometyper:Web Design.', 2000).addScene('welcometyper:Content Creation.', 2000).addScene('welcometyper:Digital Marketing', 2000).addScene('welcometyper:System Dev', 2000).addScene(hometheater.replay);
    // FitText
    $('#welcome h2').fitText(0.9);
    $('#welcome .sub').fitText(1.1);
  }
  if (objIntro.length) {
    // FitText
    $('#intro h1').fitText(1.22);
    //theater
    introtheater.addActor('introtyper').addScene('introtyper:...', 3000).addScene('introtyper:Programmer.', 2000).addScene('introtyper:Designer.', 2000).addScene('introtyper:Marketer.', 2000).addScene('introtyper:Devoloper.', 2000).addScene('introtyper:Tech Lover.', 2000).addScene('introtyper:Nerd?', 500).addScene(introtheater.replay);
    $(window).scroll(function () {
      if (objIntro.hasClass('hidden') == false) {
        hideIntro(objIntro);
        $(window).off('scroll');
      }
    });
    $('#intro .scroll').on('click', function() {
      hideIntro(objIntro);
      $('#intro .scroll').off('click');
    });
    $('#before-after').imagesLoaded( function() {
      $('#before-after').twentytwenty({
        default_offset_pct: 0.40
      });
    });
  };

  //scroll Reveal
  window.sr = ScrollReveal();
  if ($('#mini-skills').length) {
    sr.reveal('#mini-skills .col', {origin: 'left', delay: '250', distance: '40px'});
  }
  if ($('#featured-projects').length) {
    $("#featured-projects .owl-carousel").owlCarousel({
      margin: 20,
      center: true,
      dotsEach: true,
      loop: true,
      responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        960:{
            items:3
        }
      }
    });
  }

  //isotope
  if ($('#portfolio-grid .portfolio-items').length) {
    var portfolio = $('#portfolio-grid .portfolio-items').imagesLoaded( function() {
      // init Isotope after all images have loaded
      portfolio.isotope({
        // options...
        itemSelector: '.item',
        percentPosition: true,
        masonry: {}
      });
    });
    // filter items on button click
    $('#portfolio-grid #filters li').on( 'click', function() {
      var filterValue = $(this).attr('data-filter');
      portfolio.isotope({ filter: filterValue });
    });
  }

  // portfolio items hover
  if ($('#portfolio-grid .portfolio-items').length) {
    $('#portfolio-grid .portfolio-items .item').hover( function () {
      // mouse over
      $('#portfolio-grid .portfolio-items .item').addClass("dull");
    }, function () {
      // mouse exit
      $('#portfolio-grid .portfolio-items .item').removeClass("dull");
    });

  }

}); // END Window Ready

function hideIntro (obj) {
  window.scrollTo(0, 0);
  // animate it away
  introtheater.stop();
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
