$("#search").on("keyup", () => {
    var search = $("#search").val();
    if(search==''){
        $("#result").html('');
    }
    else{
    $.ajax({
            url: "/search",
            method: 'GET',
            data: {
                search: search
            },
            dataType: 'json'
        })
        .done(function (response) {
            console.log(response);
            $("#result").html('');
            if(response.heading=="Found"){
                response.users.forEach((profile)=>{
                        
                         $("#result").append('<a href="/user/'+profile.username+'"><div class="friend"><div style="width: 20%;height: 70px;float: left;margin-left: 5px;border-radius: 5px;"><img class="roundimg" src="/uploads/'+profile.img+'"height="100%" width="100%"></div><div style="width: 100%;height: 70px;font-size: x-large;position: relative;left: 10px;padding-top:15px;">'+profile.firstname+' '+profile.secondname+'</div></div></a>');
                 });
           }
           else{
                $("#result").append('No User Found');
           }
        })
        .fail(function () {
            console.log("Network Down");
        })
    }
});