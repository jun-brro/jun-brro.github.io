$(document).ready(function() {

  // Variables
  var $codeSnippets = $('.code-example-body'),
      $nav = $('.navbar'),
      $body = $('body'),
      $window = $(window),
      $popoverLink = $('[data-popover]'),
      navOffsetTop = $nav.length ? $nav.offset().top : 0,
      $document = $(document),
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $('a[href^="#"]').on('click', smoothScroll)
    buildSnippets();
    initAbstracts();
    initSideNav();
    initSidebarWheel();
  }

  // The sidebar is fixed (overflow hidden); forward wheel scrolling over it
  // to the main column so the page still scrolls wherever the cursor is.
  function initSidebarWheel() {
    var sidebar = document.querySelector('.sidebar');
    var main = document.querySelector('.main-col');
    if (!sidebar || !main) return;
    sidebar.addEventListener('wheel', function(e) {
      if (window.getComputedStyle(main).overflowY === 'visible') return; // stacked/mobile
      e.preventDefault();
      // normalize deltaMode: 0 = pixels (trackpad), 1 = lines, 2 = pages
      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= main.clientHeight;
      main.scrollTop += dy;
    }, { passive: false });
  }

  function initSideNav() {
    var $links = $('.side-nav a');
    if (!$links.length) return;
    var sections = [];
    $links.each(function() {
      var hash = $(this).attr('href');
      if (hash && hash.charAt(0) === '#' && $(hash).length) {
        sections.push({ $link: $(this), $el: $(hash) });
      }
    });
    if (!sections.length) return;
    function spy() {
      var threshold = 140; // viewport-relative, works whichever element scrolls
      var active = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].$el[0].getBoundingClientRect().top <= threshold) active = sections[i];
      }
      $links.removeClass('active');
      if (active) active.$link.addClass('active');
    }
    $window.on('scroll', spy);
    $('.main-col').on('scroll', spy);
    spy();
  }

  function initAbstracts() {
    $('.abstract-toggle').on('click', function() {
      var $btn = $(this);
      var $panel = $btn.closest('.paper').find('.paper-abstract');
      var isOpen = $btn.attr('aria-expanded') === 'true';
      if (isOpen) {
        // set current height so the transition to 0 animates
        $panel.css('max-height', $panel[0].scrollHeight + 'px');
        $panel[0].offsetHeight; // force reflow
        $panel.removeClass('open').css('max-height', '0px');
        $btn.attr('aria-expanded', 'false');
      } else {
        $panel.addClass('open').css('max-height', $panel[0].scrollHeight + 'px');
        $btn.attr('aria-expanded', 'true');
      }
    });
    // once open, drop the fixed height so long text / reflow isn't clipped
    $('.paper-abstract').on('transitionend', function(e) {
      if (e.originalEvent.propertyName === 'max-height' && $(this).hasClass('open')) {
        $(this).css('max-height', 'none');
      }
    });
  }

  function smoothScroll(e) {
    var hash = this.hash;
    if (!hash || !$(hash).length) return;
    e.preventDefault();
    var offset = 32;
    var $main = $('.main-col');
    var mainScrolls = $main.length &&
        window.getComputedStyle($main[0]).overflowY !== 'visible' &&
        $main[0].scrollHeight > $main[0].clientHeight + 2;
    if (mainScrolls) {
      var t = $main.scrollTop() + $(hash)[0].getBoundingClientRect().top
              - $main[0].getBoundingClientRect().top - offset;
      $main.stop().animate({ scrollTop: t }, 320, 'swing');
    } else {
      var wt = $(window).scrollTop() + $(hash)[0].getBoundingClientRect().top - offset;
      $('html, body').stop().animate({ scrollTop: wt }, 320, 'swing');
    }
    if (window.history && history.replaceState) history.replaceState(null, '', hash);
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  $("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
});

  function resize() {
    if (!$nav.length) return
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() {
    if (!$nav.length) return
    if(navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function() {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })
  }


  init();

});