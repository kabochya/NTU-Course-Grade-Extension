var active_frame=window.parent.frames[2].document;
var page_top=window.top.document;
var grades=['X,F','C-','C ','C+','B-','B ','B+','A-','A ','A+'];
var grades_css=['F','C-','C','Cp','B-','B','Bp','A-','A','Ap'];
$('tr[align="center"]',active_frame).each(function(i){
	$(this).prepend('<td '+(i==0?'':'class="grade_btn" active=0')+'>成績分布</td>');
	$('.grade_btn').width('60px');
	$(this).after('<tr class="grade_row"><td class="grade_box" colspan="17"><div class="bar"></div><div class="text"></div></td></tr>');
});
$('tr.grade_row',active_frame).hide();

if(window.parent.frames[2]==window){
	$('<link rel="stylesheet" type="text/css" href='+chrome.extension.getURL('style.css')+'>').appendTo('html');
}
$(".grade_btn",active_frame).click(function(){
	var $this=$(this);
	if($this.attr('active')==1){
		return false;
	}
	var $current_row=$this.parent('tr').next('tr.grade_row');
	var $current_box=$current_row.children('td');
	var year=$('#select_sem option:eq(0)',active_frame).val().split('-')[0]-1;
	var term=$('#select_sem option[selected=""]',active_frame).val().split('-')[1];
	var course_code=$this.siblings('td:eq(6)').text();
	var class_id=$this.siblings('td:eq(3)').text();
	$this.attr('active',1);
	$.get("//if163.aca.ntu.edu.tw/eportfolio/student/Curve.asp?Year="+year+"&Term="+term+"&CouCode="+course_code+"&Class="+(class_id.length==2?class_id:''),
		function(res){
			var grade_arr = res.match(/>\(\d+/g);
			var accum = [];
			if(grade_arr!==null){
				$('.bar').show();
				for(var i=0;i<grade_arr.length;i++){
					grade_arr[i]=parseInt(grade_arr[i].replace(/>\(/g,''));
					accum[i]=(i==0?0:accum[i-1])+grade_arr[i];
					$current_box.children('.bar').prepend('<span class="grade_bar '+grades_css[i]+'"><span class="bar_desc">'+grades[i]+'<br>'+grade_arr[i]+'</span></span>');
				}
				for(var i=0;i<grade_arr.length;i++){
					if(grade_arr[i]!=0){
						$current_box.children('.bar').children('.grade_bar.'+grades_css[i]).width(100*accum[i]/accum[9]+'%');
						$current_box.children('.bar').children('.grade_bar.'+grades_css[i]).slideDown(100);
					}
				}
				var prate=100-Math.round(10000*grade_arr[0]/accum[9])/100;
				var arate=Math.round(10000*(1-accum[6]/accum[9]))/100;
				$current_box.children('.text').append('Total Students:'+accum[9]+'  Pass Ratio:'+prate+'%  A Ratio:'+arate+'%');
			}
			else{
				$current_box.children('.text').append('<span>Cannot find history grades, probably due to:<br>1. New course or course wasn\'t opened last year<br>2. Single class course has split into classes</span>')
			}
			$current_row.show();
		});
	}	
)