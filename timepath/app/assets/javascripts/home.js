
$(function(){
	$("#login-button").click(function(){
         console.log(this.rotate)
         if(this.rotate == true){
            $(".board").removeClass("turnover")
            this.rotate = false
            $(this).text("登录")
        }
        else{
            $(".board").addClass("turnover")
            this.rotate = true 
            //$(".board>div:first-child").removeClass("front-face")
            $(this).text("注册")
        }   
    }
    )
})