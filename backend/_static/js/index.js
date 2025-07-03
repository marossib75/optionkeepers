$(document).ready(function() {
    $('.actionLink').on('click', function(event){
        event.preventDefault();
        url = $(this).attr('href');
        $.ajax({
            type: "POST",
            url: url,
            success: function(data){
                toastr['success'](data['message']);
            },
            error: function(data){
                toastr['error'](data['message']);
            }

        })
    });

    $('.modal-content').resizable({
        //alsoResize: ".modal-dialog",
        minHeight: 300,
        minWidth: 300
      });
      $('.modal-dialog').draggable();
  
      $('#indexModal').on('show.bs.modal', function() {
        $(this).find('.modal-body').css({
          'max-height': '100%'
        });
      });
});