var active_frame=window.parent.frames[2].document;
var page_top=window.top.document;
var grades=['X&F','C-','C ','C+','B-','B ','B+','A-','A ','A+'];
$('tr[align="center"]',active_frame).each(function(i){
	$(this).prepend('<td class="grade '+(i==0?'grade_head':'grade_btn')+'">成績分布</td>');
});
$('td.grade_head',active_frame).width('60px');
if(window.top==window){
	$('<link rel="stylesheet" type="text/css" href='+chrome.extension.getURL("style.css")+'><div id="bg"></div>').appendTo('html');
	$('#bg',page_top).html('<div id="grade_box"></div>');
}
$(document).ajaxStart(function(){
	$('#grade_box').html('<img src="'+chrome.extension.getURL("loading.gif")+'" class="loading">')
})
$(".grade_btn",active_frame).click(function(){
	$('#bg',page_top).fadeIn(100);
	var $this=$(this);
	var year=$('#select_sem option:eq(0)',active_frame).val().split('-')[0]-1;
	var term=$('#select_sem option[selected=""]',active_frame).val().split('-')[1];
	var course_code=$this.siblings('td:eq(6)').text().replace(/[E]+/g,' ');
	var class_id=$this.siblings('td:eq(3)').text();
	$.get("//if163.aca.ntu.edu.tw/eportfolio/student/Curve.asp?Year="+year+"&Term="+term+"&CouCode="+course_code+"&Class="+(class_id.length==2?class_id:''),
		function(res){
		$('#grade_box',page_top).html('');
		array = res.match(/>\(\d+/g);
		if(array!==null){
			for(var i=0;i<array.length;i++){
				array[i]=array[i].replace(/>\(/g,'');
				}
			var student_count=0;
			for(var i=0;i<array.length;i++){
				array[i]=parseInt(array[i])
				$('#grade_box',page_top).append('<span>'+grades[i]+':'+array[i]+'</span><br>');
				student_count+=array[i];
			}
			var prate=100-Math.round(10000*array[0]/student_count)/100;
			var arate=Math.round(10000*(array[7]+array[8]+array[9])/student_count)/100;
			$('#grade_box',page_top).append('Total Students:'+student_count+'<br>Pass Ratio:'+prate+'%<br>A Ratio:'+arate+'%');
		}
		else{
			$('#grade_box',page_top).append('<span>Cannot find history grades.</span>')
		}
		var ht=$('#grade_box',page_top).height();
		$('#grade_box',page_top).css({'margin-top':(-ht/2)+'px'});
		});
	}	
)
$('#bg',page_top).click(function(){
	$(this).fadeOut(100);
})