window.addEventListener("load", function(){
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#eaf7f7",
                "text": "#5c7291"
            },
            "button": {
                "background": "transparent",
                "text": "#56cbdb",
                "border": "#56cbdb"
            }
        },
        "content": {
            "message": "This site uses third-party cookies: by using the site, you consent the use of cookies. For more information view the ",
            "dismiss": "OK",
            "link": "cookies policy",
            "href": "{% url 'privacy' %}"
        }
    })
});


$(document).ready(function() {
    $('body').ajaxComplete(function(e, xhr, settings) {
        if (xhr.status == 278) {
            window.location.href = xhr.getResponseHeader("Location").replace(/\?.*$/, "?next="+window.location.pathname);
        }
    });
});      