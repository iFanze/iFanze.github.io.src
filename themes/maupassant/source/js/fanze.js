$(document).ready(function () {
    if($(".toc-article").html() == undefined)
        return

    // var tochtml = $(".toc-article").html()
    // $("#sidebar").append(tochtml)
    $("#sidebar").append('<div class="widget"></div>')
    $("#sidebar .widget:last").append('<div class="widget-title"><i class="fa fa-external-link"> 文章目录</i></div>')
    $(".toc-article").clone().appendTo("#sidebar .widget:last")
    $(".clear .toc-article").remove()
    $(".toc-title").remove()
    $(".toc-article").css("max-width", "100%")
    $(".toc-article").css("margin", "0")
    $(".toc-article").css("float", "none")
    $(".toc-article").css("border", "none")
    $(".toc-article").show()

    var SPACING = 20
    var $toc = $('#sidebar .widget:last')
    var widget_width = $('#sidebar .widget:first').width()
    // var $footer = $('#vcomment')

    if ($toc.length) {
        var minScrollTop = $toc.offset().top - SPACING
        // var maxScrollTop = $footer.offset().top - $toc.height() - SPACING

        var tocState = {
            start: {
                // 'position': 'absolute',
                // 'top': minScrollTop
                'position': '',
                'top': 0
            },
            process: {
                'position': 'fixed',
                'top': SPACING,
                'width': widget_width,
            },
            // end: {
            //     'position': 'absolute',
            //     'top': maxScrollTop
            //     // 'position': '',
            //     // 'top': 0
            // }
        }

        $(window).scroll(function () {
            var scrollTop = $(window).scrollTop();

            if (scrollTop < minScrollTop) 
            {
                $toc.css(tocState.start);
            } 
            // else if (scrollTop > maxScrollTop) 
            // {
            //     $toc.css(tocState.end);
            // } 
            else 
            {
                $toc.css(tocState.process);
            }
        })
    }

    // var HEADERFIX = 0;
    // var $toclink = $('.toc-link'),
    //     $headerlink = $('.headerlink');

    // var headerlinkTop = $.map($headerlink, function (link) {
    //     return $(link).offset().top;
    // });
});
