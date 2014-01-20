/* Created By pml0415 2014*/
var active_frame=window.parent.frames[2].document;
var grades=['X,F','C-','C ','C+','B-','B ','B+','A-','A ','A+'];
var grades_css=['F','C-','C','Cp','B-','B','Bp','A-','A','Ap'];
if(window.parent.frames[2]==window){
	$('<link rel="stylesheet" type="text/css" href='+chrome.extension.getURL('style.css')+'>').appendTo('html');
}
$('tr[align="center"]',active_frame).each(function(i){
	$(this).prepend('<td '+(i==0?'':'class="grade_btn" active=0')+'>成績分布</td>');
	$('.grade_btn').width('64px');
	$(this).after('<tr class="grade_row"><td class="grade_box" colspan="17"><div class="option"></div><span class="tname"></span><div class="bar"></div><span class="text"></span></td></tr>');
});
$('tr.grade_row',active_frame).hide();
$(".grade_btn",active_frame).click(function(){
	var $this=$(this);
	var $current_row=$this.parent('tr').next('tr.grade_row');
	if($this.attr('active')==1){
		$this.attr('active',2);
		$current_row.slideUp(100);
		return false;
	}
	else if($this.attr('active')==2){
		$this.attr('active',1);
		$current_row.slideDown(100);
		return false;
	}
	var year=$('#select_sem option:eq(0)',active_frame).val().split('-')[0]-1,
	 term=$('#select_sem option[selected=""]',active_frame).val().split('-')[1],
	 course_code=$this.siblings('td:eq(6)').text().replace(/E/,' '),
	 teacher=$this.siblings('td:eq(-7)').children('a').text(),
	 class_id=$this.siblings('td:eq(3)').text();
	class_id=(class_id.length==2?class_id:'');	
	$this.attr('active',1);
	ajaxRequest(year,term,course_code,class_id,teacher,$current_row);
	var year_str='';
	for(i=0;i<5,year-i>98;i++){
		year_str+='<option value="'+((year-i)<100?('0'+(year-i)):(year-i))+'" >'+(year-i)+'</option>';
	}
	$current_row.find('.option').html('<input type="hidden" class="grade_option grade_course_code" value="'+course_code+'"><input type="hidden" class="grade_option grade_teacher" value="'+teacher+'"><select class="grade_option grade_year">'+year_str+'</select >年'
		+'第<select class="grade_option grade_term"><option value="1">1</option><option value="2">2</option></select>學期 班次<input class="grade_option grade_class_id" type="text" value="'+class_id+'"/>(沒有班次不需填寫，如果只有一位數需補零)');
	$current_row.find('.grade_term>option[value="'+term+'"]').attr('selected',"");
	$current_row.find('.grade_option').change(function(){
		 $current_option=$(this).parent(),
		 $current_row=$(this).parents('.grade_row'),
		 year=$current_option.children('.grade_year').val(),
		 term=$current_option.children('.grade_term').val(),
		 course_code=$current_option.children('.grade_course_code').val(),
		 teacher=$current_option.children('.grade_teacher').val(),
		 class_id=$current_option.children('.grade_class_id').val();
		$current_row.find('.bar','.text').empty();
		ajaxRequest(year,term,course_code,class_id,teacher,$current_row);
	});
});
function ajaxRequest(year,term,course_code,class_id,teacher,$current_row){
	var $current_box=$current_row.children('td');
	$current_box.children('.bar').hide();
	$.get("//if163.aca.ntu.edu.tw/eportfolio/student/Curve.asp?Year="+year+"&Term="+term+"&CouCode="+course_code+"&Class="+class_id,
	function(res){
		var grade_arr = res.match(/>\(\d+/g);
		 accum = [];
		if(grade_arr!==null){
			$current_box.children('.bar').show();
			for(var i=0;i<grade_arr.length;i++){
				grade_arr[i]=parseInt(grade_arr[i].replace(/>\(/g,''));
				accum[i]=(i==0?0:accum[i-1])+grade_arr[i];
				$current_box.children('.bar').prepend('<span class="grade_bar '+grades_css[i]+'"><span class="bar_desc">'+grades[i]+'<br>'+grade_arr[i]+'</span></span>');
			}
			for(var i=0;i<grade_arr.length;i++){
				if(grade_arr[i]!=0){
					$current_box.find('.grade_bar.'+grades_css[i]).width(99.9*accum[i]/accum[9]+'%');
					$current_box.find('.bar').children('.grade_bar.'+grades_css[i]).slideDown(100);
				}
			}
			var prate=100-Math.round(10000*grade_arr[0]/accum[9])/100;
			var arate=Math.round(10000*(1-accum[6]/accum[9]))/100;
			$current_box.children('.text').html('總學生數:'+accum[9]+'  及格率:'+prate+'%  A-(含)以上比率:'+arate+'%');
			$.get('//nol.ntu.edu.tw/nol/coursesearch/search_result.php?alltime=yes&allproced=yes&cstype=5&csname='+course_code+'&current_sem='+parseInt(year,10)+'-'+term+'&startrec='+(class_id==''?0:parseInt(class_id,10)-1),
			function(res){
				var str=res.match(/teacher\.php\?.+?<\/A>/);
       				var qteacher=str[0].replace(/teacher\.php\?.+?>/,'').replace(/<\/A>/,'');
	      			if (qteacher!==teacher){
	      				$current_box.find('span.tname').css('color','red')
	      			}
	      			else{
	      				$current_box.find('span.tname').css('color','black')
	      			}
	      			$current_box.find('span.tname').html('授課教授:'+qteacher+'(統一教學教師顯示可能會不正確，一切資訊以校方為主)');
			},'text')
		}
		else{
			$current_box.children('.text').html('<span>查無該學期本課程資料，可能原因如下:<ol><li>新課或是該學期未開課。</li><li>該課程過去未分班。</li><li>課程網或是Eportfolio伺服器故障。</li></span>')
			$current_box.find('span.tname').html('');
		}
		$current_row.slideDown(100);
	});
}/* Created By pml0415 2014*/