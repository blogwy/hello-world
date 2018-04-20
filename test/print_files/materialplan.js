var MaterialPlan = {
    init : function () {
        var mpId = Common.parseURL(window.location.href)['mp_id'];
        var url = Common.getBasePath() + "mo/materiel/"+mpId;

        $.get(url, {}, function (result) {
            if ("0" == result.rstCode){
            var master = result.data.master;
            $("#mpid").html(master.mp_id);

            //填充物料计划信息
            $.each(result.data.mos, function (idx,item) {
               
                $("#maplantable_con").append('<ul class="tabcon">' +
                            '<li class="materialnumber">' + item.materiel_number + '</li>' +
                            '<li class="materialname">' + item.materiel_name + '</li>' +
                            '<li class="totaldosage">' + item.use_amount + '</li>' +                            
                        '</ul>');
                $('.matable ul').filter(':odd').addClass("bgg");
            });
           }
        });

    }
}

