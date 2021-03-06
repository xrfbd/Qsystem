function insert_update_rank(celement, cnum){
        var cnum = arguments[1] ? arguments[1] : 1;//设置cnum参数默认值为1，代表当次新插入的个数
        var pelement = celement.prev();
        var rankdic = {};
        var newrank = 1;
        var classname = celement.attr("class");

        if(classname == "cmodule"){//模块的情况下，要判断在不在末级类目下，如果不在末级类目模块是不能排序的
            curpath = window.location.pathname;
            catid = curpath.replace(/[^0-9]/ig,"");
            if(catid == ""){
                alert("非末级产品类目下不能对模块进行排序！");
                location.reload();
                return;
            }else{
                var url = "/case/haschildren/";
                var para = {"pid":catid,};
                $.get(url, para, function(data){
                    var rs = eval('('+data+')');
                    if(rs.success){
                        if(rs.haschildren){
                            alert("非末级产品类目下不能对模块进行排序！");
                            location.reload();
                            return;
                        }
                    }else{ 
                        alert("判断失败");
                    }
                });
            }
        }

        //如果插入的第一个元素前面没元素，则rank是1，否则是前面那个元素的rank值+1
        if(pelement.length == 0 || pelement.attr("class") !== celement.attr("class")){
            celement.attr("rank", "1");
        }
        else{
            newrank = parseInt(pelement.attr("rank"))+1;
            celement.attr("rank", newrank);

        }
        //批量插入多个用例后，该第一个插入用例后面的新用例rank值也要更新
        var tempele = celement; 
        for(var i=1;i<cnum;i++){
        	tempele = tempele.next(); 
            newrank = newrank + 1;
            tempele.attr("rank", newrank);


        }

        var cid = celement.attr("value");
        if(cid){//有用例id的拼json准备存到数据库，没有id的勾上复选框等着保存
            rankdic[cid] = newrank;
        }else{
            celement.find("input").eq(0).attr("checked", "checked");
        }

        var nx = tempele.nextAll().filter("."+classname);
        var mid = 0;
        if(classname == "mtr"){
            mid = -1;
        }

        nx.each(function(){
            newrank = parseInt($(this).attr("rank")) + cnum;
            $(this).attr("rank", newrank);
            cid = $(this).attr("value");
            if(cid){//有用例id的拼json准备存到数据库，没有id的勾上复选框等着保存
                rankdic[cid] = newrank;
            }
            else{
                $(this).find("input").eq(0).attr("checked", "checked");
            }
        });
        rankdic = JSON.stringify(rankdic);
        url = "/case/updaterank/";
        para = {"mid":mid, "rankdict":rankdic};
        $.post(url, para, function(data){
            var rs = eval('('+data+')');
            if(rs.success){
                //alert("排序更新成功!");
            }else{
                alert(rs.message);
            }
        }); 
    }

function delete_update_rank(celement){
    var nextele = celement.next();
    var classname = celement.attr("class");
    if(nextele.length !== 0 || classname == "cmodule"){    
    //删除用例/模块后他们后面的用例/模块rank值先不变了 反正相对位置没有变 要不然批量删除的时候好麻烦        
/*            console.log(classname);
        var nx = celement.nextAll().filter("."+classname);//该被删除模块/用例后面的模块/用例
        var rankdic = {}
        var mid = 0
        if(classname == "mtr"){
            mid = -1
        }
        nx.each(function(){//rank值依次减1
            var newrank = parseInt($(this).attr("rank"))-1;
            var cid = $(this).attr("value");//取该模块/用例的id
            $(this).attr("rank", newrank);
            if(cid){//有用例id的拼json准备存到数据库，没有id的勾上复选框等着保存
                rankdic[cid] = newrank;
            }
            else{
                $(this).find("input").eq(0).attr("checked", "checked");
            }
        });
        rankdic = JSON.stringify(rankdic);
        url = "/case/updaterank/";
        para = {"mid":mid, "rankdict":rankdic};
        $.post(url, para, function(data){
            alert("ok");
        }); */

        //如果删掉的是模块，模块下用例的rank值要变化
        //删掉模块后，用例是直接接到上一个模块下，
        //所以模块的rank值从该被删掉模块的上一个模块的最后一个用例rank值开始递增
        if(classname == "cmodule"){
            var ccase = celement.find(".mtr");//该模块下所有用例
            var cnum = celement.prev().find(".mtr").last().attr("rank");
            mid = celement.prev().attr("value");
            var i = 1;

            rankdic = {};

            ccase.each(function(){
                var newrank = parseInt(cnum)+i;
                i = i+1;
                var cid = $(this).attr("value");
                $(this).attr("rank", newrank);
                if(cid){//有用例id的拼json准备存到数据库，没有id的勾上复选框等着保存
                    rankdic[cid] = newrank;
                }
                else{
                    $(this).find("input").eq(0).attr("checked", "checked");
                }
            });
            rankdic = JSON.stringify(rankdic);
            url = "/case/updaterank/";
            para = {"mid":mid, "rankdict":rankdic};
            
            $.post(url, para, function(data){
                var rs = eval('('+data+')');
                if(rs.success){
                    //alert("排序更新成功!");
                }else{
                    alert(rs.message);
                }
            });
                 
        }

    }
}
$(document).ready(function(){
/*    var swidth = $(window).width();
    console.log(swidth);
    console.log("width:"+swidth+"px;");
    $(".fixbar").attr("style", "width:"+swidth+"px;");*/

    var casehtml = "<tr class=\"mtr\" value=\"\"><td><input class=\"casecheck nodrag\" type=\"checkbox\" checked='checked' name=\"checklist\"></td>"+
                          "<td class=\"editable nodrag\"></td>"+
                          "<td class=\"editable nodrag\"></td>"+
                        "<td class=\"editable nodrag\"></td>"+
                          "<td class=\"nodrag\"><span class=\"level\">2</span></td>"+
                          "<td class=\"nodrag\"><a class=\"icon-play-circle\"></a></td>"+
                        "<td class=\"editable nodrag\"></td>"+
                          "<td></td>"+
                          "<td></td>"+
                          "<td class=\"editable nodrag\"></td>"+
                          "<td class=\"nodrag\">"+
                              "<a class=\"icon-plus\" title=\"添加用例\"></a> "+
                              "<a class=\"icon-download-alt\" title=\"引入用例\" href=\"#casePullModal\" data-toggle=\"modal\" id=\"pullbutton\" onclick=\"pullPop(this)\"></a> "+
                              "<a class=\"icon-eye-open\" title=\"查看结果\"></a> "+
                              "<a class=\"icon-trash\"></a>"+
                          "</td>"+            
                    "</tr>";

    var modulehtml = "<tr class=\"cmodule\">"+
                "<td colspan=\"11\">"+
                    "<div>"+
                        "<table >"+
                            "<tbody>"+
                                "<tr class=\"success\">"+
                                    "<td colspan=\"1\"><input class=\"modulecheck\" type=\"checkbox\" checked='checked' name=\"checklist\"></td>"+
                                    "<td colspan=\"9\" class=\"editable\"></td>"+
                                    "<td >"+
                                          "<a class=\"icon-plus-sign\" title=\"添加模块\"></a> "+
                                          "<a class=\"icon-plus\" title=\"添加用例\"></a> "+
                                          "<a class=\"icon-trash\"></a> "+
                                    "</td>"+
                                "</tr>"+
                                casehtml +
                            "</tbody>"+
                        "</table>"+
                    "</div>"+
                "</td>"+
            "</tr>";

    var resulthtml = "<select class=\"cresult\">"+
                        "<option>-</option>"+
                        "<option>Pass</option>"+
                        "<option>Fail</option>"+
                        "<option>Block</option>"+
                    "</select>";

    var levelhtml = "<select class=\"lselect\">"+
                        "<option>1</option>"+
                        "<option>2</option>"+
                        "<option>3</option>"+
                    "</select>";



    function scrollOffset(scroll_offset){
        var x = document.body.clientHeight;
        console.log("scroll_offset");
        console.log(x);

        $("body,html").animate({scrollTop: scroll_offset.top + x}, 500);
      }
    // click create case
    $("#newcase").click(function(){      
        var newlast = $(".mtr").last();
        if(newlast.length == 0){
            newlast = $(".success").last();
            newlast.after(casehtml);      
        }else{
            newlast.after(casehtml);
        }
        newlast = $(".mtr").last();
        insert_update_rank(newlast);
        newlast.attr("id", "newone");
        scrollOffset($("#newone").offset());
        newlast.removeAttr("id");
    });


    $("#newmodule").click(function(){
        var cmodule = $(".cmodule").last();
        cmodule.after(modulehtml);
        var newlast = cmodule.next();
        insert_update_rank(newlast.find(".mtr"));
        insert_update_rank(newlast);
        newlast.attr("id", "newone");
        scrollOffset($("#newone").offset());
        newlast.removeAttr("id");

    });
    $(".editable1").live('dblclick', function(){   //由于BUG为链接，所以把编辑改为双击
        var tdnode = $(this);
        var tdTest = tdnode.text().trim();
        //before属性用来存点击时文本域的值
        tdnode.attr("before", tdTest);

        //如果还没有执行结果，那点BUG和备注没反应
        var crs = tdnode.parent().children().eq(5).find("span");

        if(tdnode.hasClass("save") && crs.length == 0 ){
			alert("要先执行用例,才能够添加WI和备注哟~")
        }
        else{
            if(tdnode.find(".edittx").length == 0){
                tdnode.empty();
                var tx = $("<textarea class='edittx'></textarea>");
                tx.attr("value", tdTest);
                tdnode.append(tx);
                tx.focus();
            }
        }
   
    });
    $(".editable").live('click', function(){
        var tdnode = $(this);
        var tdTest = tdnode.text();
        //before属性用来存点击时文本域的值
        tdnode.attr("before", tdTest);

        //如果还没有执行结果，那点BUG和备注没反应
        var crs = tdnode.parent().children().eq(5).find("span");
	
        if(tdnode.hasClass("save") && crs.length == 0 ){
			alert("要先执行用例,才能够添加WI和备注哟~")
        }
        else{
            if(tdnode.find(".edittx").length == 0){
                tdnode.empty();
                var tx = $("<textarea class='edittx'></textarea>");
                tx.attr("value", tdTest);
                tdnode.append(tx);
                tx.focus();
            }
        }
   
    });

    $(".edittx").live('blur', function(){
        var tx = $(this);
        var etext = tx.val().trim();
        var tp = tx.parent();
        tx.remove();
        tp.attr("value", etext);
        tp.html(etext);
        //文本框的值与原来的值不同时，勾上checkbox
        if(tp.attr("before") !== etext){            
            //如果是BUG和备注部分,而且用例是保存的用例则实时保存
            var tid = tp.parent().attr("value");
            var tname = tp.attr("name");
            var crs = tp.parent().children().eq(5).find("span");//看有没有执行结果，有执行结果的才可以保存BUG和备注

			if(tp.hasClass('save') && tid && crs.length){
                var url = "/case/updateresult/";
                var para = {"tname": tname, "tid":tid, "tcnt":etext};
                $.post(url, para, function(data){
                    var rs = eval('('+data+')');
                    if(rs.success){
                        //alert("ok");
                    }else{
                        alert(rs.message);
                    }
                }); 

            }else{//其他的需要勾上checkbox等待点保存
                tp.siblings().eq(0).find("input").attr("checked", "checked");
            }
        }

    });


    //单击选择级别
    $(".level").live('click', function(){
        var tdnode = $(this).parent();
        var tdTest = $(this).text();
        tdnode.empty();
        var tx = $(levelhtml);
        tx.attr("value", tdTest);
        tdnode.append(tx);
    });

    //选择用例级别
    $(".lselect").live('change', function(){
        var tx = $(this);
        var etext = tx.val();
        var tp = tx.parent();
        tx.remove();
        tp.attr("value", etext);
        tp.html("<span class='level'>"+etext+"</span>");
        tp.siblings().eq(0).find("input").attr("checked", "checked");    
    });

    //点击执行用例，主要是把下拉框显示出来供用户选择，图标和下拉框不能同时显示
    $(".icon-play-circle").live('click', function(){
        var exeico = $(this);
        var caseid = exeico.parents(".mtr").attr("value");
        
        if(caseid !== ""){//有用例id的才可以执行
            exeico.next().remove();
            exeico.after(resulthtml);
            exeico.toggle();
            
        }

    });

    //选择执行结果
    $(".cresult").live('change', function(){
        var rsdrop = $(this);
        var thiscell = rsdrop.parent();
        var exeico = $(this).prev();
        var result = rsdrop.val();
        if($('#newmodule').attr('class')){ //如果是测试人员，就弹报bug的框。这里判断是否测试人员通过是否有新建模块的按钮进行判断，省得发请求。
	        fileBug(thiscell);   //执行失败的时候弹出新建bug弹框,成功则关闭WI
	    }
        if(result == "-"){
            return;
        }
        var caseid = rsdrop.parents(".mtr").attr("value");
        exeico.toggle();//把前面的执行图标显示出来        
        //将结果存入数据库
        url = "/case/executecase/";
        para = {"caseid":caseid, "cresult":result};
        $.post(url, para, function(data){
            var rs = eval('('+data+')');
            if(rs.success){
                rsdrop.before("<span class=\""+result+"\">&nbsp;"+result+"</span>");//在前面生成结果
/*                rsdrop.toggle();//隐藏下拉选择框*/
                rsdrop.remove(); 
                           

                //更新后端返回的执行时间和执行人，备注
                thiscell.next().next().text(rs.exedetail.exec_date);
                thiscell.next().next().next().text(rs.exedetail.executor);
                thiscell.next().next().next().next().html("");
                

            }else{     
/*                rsdrop.toggle();//隐藏下拉选择框 */
                rsdrop.remove();
                alert(rs.message);
            }
        });


    });

    //插入模块后用例后，赋rank值

    //添加用例
    $(".icon-plus").live("click", function(){
        var ccase = $(this).parent().parent();
        ccase.after(casehtml);
        insert_update_rank(ccase.next());
    });

    //添加模块
    $(".icon-plus-sign").live('click', function(){
        var cmodule = $(this).parents(".cmodule");
        cmodule.after(modulehtml);
        var newlast = cmodule.next();
        insert_update_rank(newlast.find(".mtr"));
        insert_update_rank(newlast);
        newlast.attr("id", "newone");
        scrollOffset($("#newone").offset());
        newlast.removeAttr("id");
    });

    $(".icon-chevron-up").live('click', function(){
        var cdrop = $(this);
        cdrop.removeClass("icon-chevron-up");
        cdrop.addClass("icon-chevron-down");
        cdrop.parent().parent().nextAll().toggle();


    });

    $(".icon-chevron-down").live('click', function(){
        var cdrop = $(this);
        cdrop.removeClass("icon-chevron-down");
        cdrop.addClass("icon-chevron-up");
        cdrop.parent().parent().nextAll().toggle();
    });

    function checkall(master, slave){
        if(master.attr("checked")=="checked"){ 
            slave.each(function(){
                $(this).attr("checked","checked");
            });
        }else{
             slave.each(function(){
                $(this).removeAttr("checked");
            });
        }
    }

    //全选
    $("#caseall").click(function(){
        var slave = $("#caselist").find("input");
        checkall($(this), slave);
    });

    $(".modulecheck").live('click', function(){
        var slave = $(this).parents(".cmodule").find("input");
        checkall($(this), slave);
    });

    function drag_update_rank(){
        insert_update_rank($(this));
    }

    //模块拖拽
    $("#caselist tbody").dragsort({
        dragSelector:".cmodule",
        dragSelectorExclude:".nodrag",
        dragEnd:drag_update_rank,
    });
    //用例拖拽
    $(".cmodule tbody").dragsort({
        dragSelector:".mtr",
        dragSelectorExclude:".nodrag",
        dragEnd:drag_update_rank,
    });

    //删除
    $(".icon-trash").live('click', function(){

        if(confirm("你确定要删除吗？")){
            
            var node = $(this).parent().parent();
            
            if(node.attr("class") == "mtr"){//删除用例
 /*               delete_update_rank(node);*/
                var url = "/case/deletecase/";
                var delid = node.attr("value");           
                var para = {"did": delid,};
                $.post(url, para, function(data, status){
                    var rs = eval('('+data+')');
                    if(rs.success){
                        node.remove();
                    }else{
                        alert("删除失败");
                    }
                });

            }else{//删除模块
              
                //找到该模块的前一个模块下的
                var currentm = node.parents(".cmodule");
                var prevmodule = currentm.prev().find('tbody');

                if(prevmodule.length){
                    var url = "/case/moduledel/";
                    var mid = currentm.attr("value");     
                    var para = {"mid": mid,};
                    //如果是刚新建的没有mid就直接remove掉就行
                    if(mid == undefined){
                        currentm.remove();
                        return;
                    }

                    //更新rank值
                    delete_update_rank(currentm);
                    
                    //克隆一份该模块下的用例
                    var snode = node.siblings().clone(true);

                    $.post(url, para, function(data, status){
                        var rs = eval('('+data+')');

                        if(rs.success){
                            //删掉该模块,将模块下用例复制到前一个模块下
                            currentm.remove();
                            prevmodule.append(snode);
                        }else{
                            alert("删除失败");
                        }
                    });
                    

                }else{//模块是第一个的情况下
                    var nexrmodule = currentm.next();
                    var chcase = currentm.find(".mtr");
                    if(nexrmodule.length && chcase.length == 0){//如果后面有模块，而且该模块下没有用例则可删
                        currentm.remove();
                    }else{
                        alert("抱歉~不能删除");
                    }
                    
                }
            }

            return true;
        }else{
            return false;
        }            
    });

    $("#delbtn").click(function(){
        if(confirm("你确定要删除吗？")){
            var caseChk=$("input[class='casecheck nodrag']:checked");
            var delids = "";
            $(caseChk).each(function(){
                delids += $(this).parent().parent().attr("value");
                delids += ",";

            });
            if(delids == ""){
                alert("请勾选用例再点批量删除");
                return;
            }
            $(this).attr("disabled","true"); 
            url = "/case/deletecase/";
            para = {"did": delids,};
            $.post(url, para, function(data, status){
                var rs = eval('('+data+')');
                if(rs.success){
                    $(caseChk).each(function(){
                        $(this).parent().parent().remove();
                    });
                }else{
                    alert("删除失败");
                }
            });
            $(this).removeAttr("disabled");
        }

    });


    //搜索模块js       
    var url = "/case/casecate/";
    var areaJson;
    var temp_html;
    var category1 = $(this).find(".category_select_1");
    var category2 = $(this).find(".category_select_2");
    var category3 = $(this).find(".category_select_3");      
     //初始化一级类目
    var category_select_1 = function(){
        var c1=$(".cate1").val();
        temp_html="<option>"+'全部'+"</option>";
        $.each(areaJson,function(i,category_select_1){
             temp_html+="<option value='"+category_select_1.masterid+"'>"+category_select_1.master+"</option>";
        });
        category1.html(temp_html); 
        var n = category1.get(0).selectedIndex;
        if(c1){
            $(".category_select_1 option[value="+c1+"]").attr("selected","true");
            var preoption = $(".category_select_1 option[value="+c1+"]").prevAll("option");
        }       
        if(n != 0){
            if((areaJson[n-1].slist).length != 0){
                category2.show();
                category_select_2();
                $(".cate1").attr("value",category1.children().eq(preoption.length).val());
            };
        }else{
            if(n==0 && c1 ){
                if((areaJson[preoption.length-1].slist).length != 0){
                    category2.show();
                    category_select_2();
                    $(".cate1").attr("value",category1.children().eq(preoption.length).val());
                }else{
                    category2.hide();
                    category3.hide();
                }
            }else{
                category2.hide();
                category3.hide();
            }           
        }                       
     };
    //赋值二级
    var category_select_2 = function(){
        var c2=$(".cate2").val();
        temp_html="<option>"+'请选择'+"</option>"; 
        var n = category1.get(0).selectedIndex;
        if(n==0){
            category2.css("display","none");
            category3.css("display","none");
        }else{
            if((areaJson[n-1].slist).length == 0){
                category2.css("display","none");
                category3.css("display","none");
            }else{
                $.each(areaJson[n-1].slist,function(i,category_select_2){
                    temp_html+="<option value='"+category_select_2.secondid+"'>"+category_select_2.second+"</option>";
                });
                category2.html(temp_html);
                if(c2){
                    $(".category_select_2 option[value="+c2+"]").attr("selected","true");
                }
                category_select_3();
            };
        }                    
    };
    //赋值三级
    var category_select_3 = function(){
        var c3=$(".cate3").val();
        temp_html="<option>"+'请选择'+"</option>"; 
        var m = category1.get(0).selectedIndex;
        var n = category2.get(0).selectedIndex;
        if(c3){
            category3.css("display","inline");
            $.each(areaJson[m-1].slist[n-1].thirdlist,function(i,category_select_3){
                temp_html+="<option value='"+category_select_3.thirdid+"'>"+category_select_3.third+"</option>";
            });
            category3.html(temp_html);
            $(".category_select_3 option[value="+c3+"]").attr("selected","true");
        }else{
            if(n != 0){
                if((areaJson[m-1].slist[n-1].thirdlist).length == 0){
                    category3.css("display","none");
                }else{
                    category3.css("display","inline");
                    $.each(areaJson[m-1].slist[n-1].thirdlist,function(i,category_select_3){
                        temp_html+="<option value='"+category_select_3.thirdid+"'>"+category_select_3.third+"</option>";
                    });
                    category3.html(temp_html);
                };
            }else{
                category3.css("display","none");
            };
        }                                
    };        

    //选择一级改变二级
    category1.change(function(){
        var c1=$(".cate1").attr('value','');
        var c2=$(".cate2").attr('value','');
        var c3=$(".cate3").attr('value','');

        category2.show();
        category3.hide();
        category_select_2();
    });
    //选择二级改变三级
    category2.change(function(){
        var c3=$(".cate3").attr('value','');
        category3.hide();
        category_select_3();
    });
    //获取json数据
    $.getJSON(url,function(data){
        areaJson = data;
        category_select_1();
    });



    $('.selectList select').live('click',function(){
        if ($(this).val() !== '全部' && $(this).val() !== '请选择'){
            $(".cate").attr("value",$(this).val());
            $(".next").attr("action","/case/caselist/" + $(this).val() + "/");
        }else{ 
            if($(this).val() == '请选择'){
                $(".cate").attr("value",$(this).prev().val());
                $(".next").attr("action","/case/caselist/" + $(this).prev().val() + "/");
                cateval = $(".cate").val();
                cate1val = $(".cate1").val();
                cate2val = $(".cate2").val();
                if (cateval == cate2val){
                    $(".cate3").attr("value",'');
                }
                if (cateval == cate1val){
                    $(".cate2").attr("value",'');
                    $(".cate3").attr("value",'');
                }
            }else{
                $(".next").attr("action","/case/caselist/");
                $(".cate1").attr("value",'');
                $(".cate2").attr("value",'');
                $(".cate3").attr("value",'');
            }            
        }
    });

    $('.category_select_1').click(function(){
        $(".cate1").attr("value",$(this).val());
    });

    $('.category_select_2').live('click',function(){
        if ($(this).val() !== '请选择'){
            $(".cate2").attr("value",$(this).val());
        }
    });
    $('.category_select_3').live('click',function(){
        if ($(this).val() !== '请选择'){
            $(".cate3").attr("value",$(this).val());
        }
    }); 


     // 展开/收起搜索项
     $("#searchicon").click(function(){
        $("#searchbar").toggle();
    });
    //状态没有选中时，隐藏执行结果类型 
    $('.statue').click(function(){
        if ($(this).val() !== ''){
            $(".mold").show();            
        }else{
            $(".mold").hide();
        }
    });

    if($(".hide-statue").val()){
        $(".statue").removeAttr("selected");
        $(".statue option[value="+$(".hide-statue").val()+"]").attr("selected",true);
        $(".mold").show();
        if ($(".hide-mold").val()){
            $(".mold").removeAttr("selected");
            $(".mold option[value="+$(".hide-mold").val()+"]").attr("selected",true);
        }
    };

    if($(".cauthor").val()){
        $(".author").removeAttr("selected");
        $(".author option[value="+$(".cauthor").val()+"]").attr("selected",true);
    };
    if($(".cexecutor").val()){
        $(".executor").removeAttr("selected");
        $(".executor option[value="+$(".cexecutor").val()+"]").attr("selected",true);
    };
    //时间组件
     $(".form_datetime").datetimepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
        todayBtn: true,
        pickerPosition: "bottom-left",
        language:"zh-CN",
        minView:2 
      });
     
  //备注弹框信息显示
    $(".icon-eye-open").click(function(){
        $('#myModal').modal('show');
        cpid = $(this).next().val();
        var url = "/case/execlog/" + cpid;
        $.get(url, function(data, status){
            var datalist = eval ("(" + data + ")");
            var num = datalist.length;
            $(".title").html("<h5>测试结果：共执行<span>"+(num-1)+"次</span>,通过<span>"+datalist[0].Pass+"次</span></h5>");
            recordhtml = "<thead><tr>"+
                     "<th width=\"15px\">&nbsp</th>"+
                     "<th width=\"88px\">日期</th>"+
                     "<th width=\"30px\">执行人</th>"+
                     "<th width=\"15px\">结果</th>"+
                     "<th width=\"94px\">备注</th>"+
                    "</tr></thead>";
            /*recordhtml = ''*/
            for(var i=1;i<num;i++)
            {
                recordhtml+=
                    "<tr>"+
                     "<td>#"+i+"</td>"+
                     "<td>"+datalist[i].date+"</td>"+
                     "<td>"+datalist[i].executor+"</td>"+
                     "<td>"+datalist[i].result+"</td>"+
                     "<td>"+(datalist[i].remark?datalist[i].remark:"")+"</td>"+
                    "</tr>";
            }  ;
            $(".boxtable").html(recordhtml);          
        });
    });

/*    $(window).scroll(function (){//浏览器滚动条滚动时触发的事件



    });*/

   //保存用例
    $(".savebtn").click(function(){
        $(".savebtn").attr("disabled","true");
        i = 1;
        j = 0; 
        var casejson = [];
        var dic = {};
        var diclist = [dic];
        var mmid = [];
        var mchk = [-2];
        var mrank = [0];
        var flag = true;
        var m = 0;
        var node = $("input[name=\"checklist\"]:checked");
        var nlen = node.length;
        $(node).each(function(){             
            var node = $(this).parent().parent();
            tdata = node.children();
            cm = $(this).parents(".cmodule");
            tmodule = cm.attr("value");
            tmrank = cm.attr("rank");
            mrank[i] = tmrank;
            if (tmodule == '' || tmodule == undefined){
                if (mrank[i-1] != tmrank){
                m--;
            }
            tmodule = m; 
            }
            mchk[i] = tmodule;
            if(node.attr("class") == "mtr"){//判断是用例还是模块
                input = $.trim(tdata.eq(2).text());
                output = $.trim(tdata.eq(3).text());
                mname = $.trim(cm.find(".success").children().eq(1).text());
                if(mname.length<=0 || mname.length> 100){
                    cm.find(".success").css('border', "3px solid #f77");
                    $(".savebtn").removeAttr("disabled");
                    alert("模块名称为必填项，长度不能大于100个字符！");
                    flag = false;
                    return false;
                }
                if(input.length > 300 || output.length > 300 || !input || !output){
                    node.css("background-color","#ffecec");
                    $(".savebtn").removeAttr("disabled");
                    alert("用例输入、期望输出为必填项，长度不能大于100个字符！");
                    flag = false;
                    return false;
                }else{
                    datadic = {"mname":mname,"mrank":cm.attr("rank"),"id":$(this).parent().parent().attr("value"),"precon":tdata.eq(1).text(),"action":input,"output":output,"priory":tdata.eq(4).text(),"rank":node.attr("rank")};
                    if(mchk[i-1] != tmodule){
                        j=0;
                        casejson = []; 
                        dic[tmodule] = casejson;
                        casejson[j] = datadic;
                    }else{
                        casejson[j] = datadic;
                    }
                }
            }else{//保存模块
                mtrnode = (node.parent(".cmodule").find(".mtr").find("input[name=\"checklist\"]:checked"));
                 if (mtrnode.length == 0){
                    cmname = $.trim(cm.find(".success").children().eq(1).text());
                    if(cmname.length>0 && cmname.length <= 100){
                        datadic = {"mname":cmname,"mrank":cm.attr("rank"),"id":-3};
                        j=0;
                        casejson = []; 
                        casejson[j] = datadic;
                       dic[tmodule] = casejson;
                    }else{
                        node.css('border', "3px solid #f77");
                        $(".savebtn").removeAttr("disabled");
                        alert("模块名称为必填项，长度不能大于30个字符！");
                        flag = false;
                        return false;
                    }                                       
                }
            }
            i++;
            j++;
        }); 
        if(flag == true){
            diclist = JSON.stringify(diclist);
            casedic = {"datas":diclist};
            node = $("input[name=\"checklist\"]:checked");
            if (diclist.length-4){
                 $.post("/case/savecase/",casedic,function(data){
                var resp = eval('('+data+')');
                if(resp.message){                    
                    node.removeAttr("checked");
                    node.parent().parent().removeAttr("style");
                    location.reload();
                }else{
                    alert("保存失败，请重新保存！");
                }
                $(".savebtn").removeAttr("disabled");
            });
            }else{
                alert("请勾选需要保存的用例！");
                $(".savebtn").removeAttr("disabled");
            }
        }
    });

//upload
    $(".fileload").click(function(){
        $('#upload').modal('show');
    //upload用例到对应的项目下	
    	var num = window.location.href.split('/').length
    	var cate_id = window.location.href.split('/')[num-2]
    //异步上传文件，使用uploadify插件，使用方法参见官方文档	
        $('#file_upload').uploadify({
    		//这个标签的ID和text是个人的id和realname, 由于flash的bug, 在火狐下必须formData传给后端,后端无法从session中读取
    		formData: {'uid':$('.top_bar').children('li').eq(0).children().attr("id"),'realname':$('.top_bar').children('li').eq(0).children().text()},
            'debug': false,
            'swf'  : '/static/jquery/uploadify.swf',
            'uploader'  : '/case/upload/'+cate_id,  
            // 'script'    : '/case/upload/',  
            //'cancelImg' : '/static/img/uploadify-cancel.png',  
            'auto'      : true , 
            'multi': false,//设置可以上传多个文件  
            // 'queueSizeLimit':20,//设置可以同时20个文件  
            'removeCompleted':false,//  
            // 'sizeLimit':10240000,//设置上传文件大小单位kb  
            'fileTypeExts':'*.xlsx;*.xls;',//设置上传文件类型为excel 
            'fileTypeDesc':'Excel File', 
            'buttonText': '选择文件' , 
            // 'buttonClass' :'btn btn-mini',        
            // 'onInit': function () {},
            //返回一个错误，选择文件的时候触发
            'onUploadStart' : function(file) {
                reminder_html = "<p style = 'color:red;'>正在上传请耐心等待,不要关闭弹框~~</p>";
                $('.reminder').html(reminder_html);
            },
            'onSelectError': function (file, errorCode, errorMsg) {
                switch (errorCode) {
                    case -100:
                        alert("上传的文件数量已经超出系统限制的" + $('#file_upload').uploadify('settings', 'queueSizeLimit') + "个文件！");
                        break;
                    case -110:
                        alert("文件 [" + file.name + "] 大小超出系统限制的" + $('#file_upload').uploadify('settings', 'fileSizeLimit') + "大小！");
                        break;
                    case -120:
                        alert("文件 [" + file.name + "] 大小异常！");
                        break;
                    case -130:
                        reminder_html = "<p style = 'color:red;'>"+file.name + "  类型不正确,必须为xlsx、xls格式文件</p>";
                        $('.reminder').html(reminder_html);
                        break;
                }
            },
            'onUploadSuccess' : function(file,data,response) {
                var result = eval('('+data+')');      
                if(result.success){
                    reminder_html = "<p style = 'color:red;'>成功上传!</p>";
                    $('.reminder').html(reminder_html);
                }else{
                    reminder_html = "<p style = 'color:red;'>"+result.message+"</p>";
                    $('.reminder').html(reminder_html);
                }
            },
            'onUploadError' : function(file, errorCode, errorMsg, errorString) {
              reminder_html = "<p style = 'color:red;'>"+ file.name + ' 上传失败: ' + errorString+","+errorCode+"</p>";
              $('.reminder').html(reminder_html);
            },  
            //检测FLASH失败调用
            'onFallback': function () {
                reminder_html = "<p style = 'color:red;'>您未安装FLASH控件,请安装FLASH控件后再试</p>";
                $('.reminder').html(reminder_html);
            },             
      });

        $('.fileupload').click(function(){        
            location.reload();
        });
    });

});
