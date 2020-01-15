$(window).resize(function() {
    var menu_map_width = $('#menu_map').width();
  //  console.log( document.getElementsByClassName("esriSimpleSliderTL").length);  
   // document.getElementsByClassName("esriSimpleSliderTL")[0].style.left = menu_map_width + 20;
})

$(document).ready(function() {

    var menu_map_width = $('#menu_map').width();
//    console.log($('#map_zoom_slider').width());    
  //  document.getElementsByClassName("esriSimpleSliderTL")[0].style.left = menu_map_width + 20;    
    
	new WOW().init();
	Placeholdem( document.querySelectorAll( '[placeholder]' ) );
	$(".main_mnu_button").click(function() {
		$(".main_mnu ul").slideToggle();
	});
	$("[name='lat-checkbox']").bootstrapSwitch();
	//Таймер обратного отсчета
	//Документация: http://keith-wood.name/countdown.html
	//<div class="countdown" date-time="2015-01-07"></div>
	var austDay = new Date($(".countdown").attr("date-time"));
	$(".countdown").countdown({until: austDay, format: 'yowdHMS'});

	//Попап менеджер FancyBox
	//Документация: http://fancybox.net/howto
	//<a class="fancybox"><img src="image.jpg" /></a>
	//<a class="fancybox" data-fancybox-group="group"><img src="image.jpg" /></a>
	$(".fancybox").fancybox();

	//Навигация по Landing Page
	//$(".top_mnu") - это верхняя панель со ссылками.
	//Ссылки вида <a href="#contacts">Контакты</a>
	$(".top_mnu").navigation();

	//Добавляет классы дочерним блокам .block для анимации
	//Документация: http://imakewebthings.com/jquery-waypoints/
	$(".block").waypoint(function(direction) {
		if (direction === "down") {
			$(".class").addClass("active");
		} else if (direction === "up") {
			$(".class").removeClass("deactive");
		};
	}, {offset: 100});

	//Плавный скролл до блока .div по клику на .scroll
	//Документация: https://github.com/flesler/jquery.scrollTo
	$("a.scroll").click(function() {
		$.scrollTo($(".div"), 800, {
			offset: -90
		});
	});

	//Каруселька
	//Документация: http://owlgraphic.com/owlcarousel/
	var owl = $(".carousel");
	owl.owlCarousel({
		//singleItem : true,
		items:3,
		autoPlay: 5000,
		itemsScaleUp:true,
		pagination : true,
		dots: true
	});
	/*owl.on("mousewheel", ".owl-wrapper", function (e) {
		if (e.deltaY > 0) {
			owl.trigger("owl.prev");
		} else {
			owl.trigger("owl.next");
		}
		e.preventDefault();
	});
	$(".next_button").click(function(){
		owl.trigger("owl.next");
	});
	$(".prev_button").click(function(){
		owl.trigger("owl.prev");
	});
*/
	//Кнопка "Наверх"
	//Документация:
	//http://api.jquery.com/scrolltop/
	//http://api.jquery.com/animate/
	$("#top").click(function () {
		$("body, html").animate({
			scrollTop: 0
		}, 800);
		return false;
	});
	
	//Аякс отправка форм
	//Документация: http://api.jquery.com/jquery.ajax/
	$("form").submit(function() {
		$.ajax({
			type: "GET",
			url: "mail.php",
			data: $("form").serialize()
		}).done(function() {
			alert("Спасибо за заявку!");
			setTimeout(function() {
				$.fancybox.close();
			}, 1000);
		});
		return false;
	});


$(function() {
	$( "#data1" ).datepicker({ 
		dateFormat: 'dd-mm-yy' ,
		beforeShow: function(){    
			$(".ui-datepicker").css('font-size', 10) 
		}
	});
	$("#data1").datepicker("setDate", new Date());
});

	$('tbody tr').hover(function() {
	  $(this).addClass('odd');
	}, function() {
	  $(this).removeClass('odd');
	});

 $(".allownumericwithdecimal").on("keypress keyup blur",function (event) {
            //this.value = this.value.replace(/[^0-9\.]/g,'');
     $(this).val($(this).val().replace(/[^0-9\.]/g,''));
            if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
                event.preventDefault();
            }
        });
   	

});
var inputype_val = "dd";
function inputtype(){
	if(inputype_val == "dd"){
		inputype_val = "ddd";
	document.getElementById("geocoords_title_dd").style.display = "none";
	document.getElementById("geocoords_title_ddd").style.display = "inline-block";		
	document.getElementById("lat-mask").style.display = "block";		
	document.getElementById("long-mask").style.display = "block";		
	document.getElementById("lat-simple").style.display = "none";		
	document.getElementById("long-simple").style.display = "none";		
	}else{
		inputype_val = "dd";
	document.getElementById("geocoords_title_ddd").style.display = "none";
	document.getElementById("geocoords_title_dd").style.display = "inline-block";	
	document.getElementById("lat-mask").style.display = "none";		
	document.getElementById("long-mask").style.display = "none";		
	document.getElementById("lat-simple").style.display = "block";		
	document.getElementById("long-simple").style.display = "block";			
	}

}



