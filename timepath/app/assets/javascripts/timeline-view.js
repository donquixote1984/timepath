function CenterNode(){
    this.bind_node  = null
    this.center_x = 0
    this.left_percentage = 0
}

function Timeline(){

    this.timeline_container = null
    this.time_period = null
    this.time_spot = null
    this.time_period_control = null
    this.time_period_toggle = false
    this.time_period_content= null
    this.time_period_cursor =null
    this.time_period_start = false
    this.time_period_active_start_x = 0
    this.time_period_active = null

    this.time_spot =null
    this.time_spot_content =null
    this.now = new Date()
    this.career_list = []
    this.career_node_list = []
    this.axis_list = []
    this.active_interval =8 
    this.event_interval = 5 
    this.width = 0
    this.time_spot_width = 0
    this.interval_width =0 
    this.time_period_scroll_on = false
    this.width_range = {}

    this.max_time_width = 0
    this.min_time_width = 0 

    this.max_interval_width = 50 
    this.min_interval_width = 0
    this.time_month_max=0
    this.time_month_min = 10000000
    this.time_interval_max  = 0
    this.time_interval_min = 0

    this.time_period_scroll_x = 0
    this.time_period_scroll_left_x =0

    this.center_node = null
    this.content_width = 0
    this.frame_width = 0
    this.frame_spot_width = 0
    this.center_node =  new CenterNode()
    this.max_event_image_size = 100
    this.window_height = $(window).height() - 40
    this.init = function(){
        this.id = "timeline"
        this.timeline_container = $("#"+this.id)
        this.timeline_container.height(this.window_height)
        this.time_period = this.timeline_container.find("#time-period") 

        this.time_spot = this.timeline_container.find("#time-spot")
        this.time_period_control = this.time_period.find(".control")
        this.time_period_cursor = this.time_period.find(".cursor")
        this.time_period_line = this.time_period.find(".line")
        this.time_period_content = this.time_period.find(".time-content")
        this.time_period_content_container = this.time_period.find(".time-content-container")
        this.time_period_axis = this.time_period.find(".time-axis")

        this.time_spot_content =this.time_spot.find(".content-container") 

        this.width = this.time_period.width()
        this.time_spot_width = this.time_spot.width()
        this.interval_width = this.width/this.active_interval
        this.init_data()
        //this.refresh_event()
        //this.init_control()

    }
    this._get_month_between = function(career){
        var year1 = career.start_YMD.year
        var month1 = career.start_YMD.month
        var year2,month2
        if(career.end_YMD == null){
            year2 = this.now.getFullYear()
            month2 = this.now.getMonth()+1
        }
        else{
            year2 = career.end_YMD.year
            month2 = career.end_YMD.month           
        }

        return (year2-year1)*12 + month2-month1
    }

    this._get_month_between_careers = function(career2,career1){
        var y1 = career1.end_YMD.year
        var m1 = career1.end_YMD.month
        var y2 = career2.start_YMD.year
        var m2 = career2.start_YMD.month
        return (y2-y1)*12 + m2-m1
    }
    this.init_data = function(){
        var _this = this
        $.getJSON("main/career.json",function(data){
            $.each(data,function(index,entry){
                var career = new Career()
                career.start= entry.start_time
                career.start_YMD = entry.start_time_YMD
                career.end = entry.end_time
                career.end_YMD = entry.end_time_YMD
                career.title = entry.title
                career.content= entry.content
                career.color = entry.color
                career.id = entry.id
                career.name = entry.name
                career.monthes = _this._get_month_between(career)
                career.interval_monthes = 0
                career.link = entry.link

                if(index>0||_this.career_list.last()!=null){
                    var interval_month  =_this._get_month_between_careers(_this.career_list.last(), career)
                    _this.career_list.last().interval_monthes =  interval_month
                    if(interval_month > _this.time_interval_max){
                        _this.time_interval_max = interval_month
                    }
                }
                if(career.monthes>_this.time_month_max){
                    _this.time_month_max = career.monthes
                }
                if(career.monthes<_this.time_month_min){
                    _this.time_month_min = career.monthes
                }
                
                if(entry.events!=null){
                    $.each(entry.events,function(i,e){
                        var ev = new Event()
                        ev.start = e.start_time
                        ev.start_YMD = e.start_time_YMD
                        ev.end = e.end_time
                        ev.end_YMD = e.end_time_YMD
                        ev.content = e.content
                        ev.title = e.title
                        ev.data = e.data
                        ev.id  =e.id
                        ev.category = e.category
                        career.events.push(ev)
                    })
                }
                _this.career_list.push(career)
            })
            _this.frame_width = _this.time_period.width()
            _this.max_time_width = _this._get_max_time_width(_this.frame_width)
            _this.min_time_width = _this.frame_width/6
            _this.init_time_axis()  
            _this.init_controls()
            _this.init_career_events()
            _this.auto_width()
        })
    }

    this._get_max_time_width = function(framewidth){
        if(this.time_month_max>60){
            return framewidth/2
        }
        else if(this.time_month_max>30&&this.time_month_max<60){
            return framewidth/3
        }
        else {
            return framewidth/4
        }
    }
    this._get_time_width = function(month){
        return (month - this.time_month_min)/(this.time_month_max - this.time_month_min) * (this.max_time_width - this.min_time_width) + this.min_time_width
    }
    this._get_interval_width = function(month){
        return (month - this.time_interval_min)/(this.time_interval_max - this.time_interval_min) * (this.max_interval_width - this.min_interval_width) + this.min_interval_width
    }
    this.init_time_axis = function(){
        var _this  = this
        var index = 0
        var offset  = 0 
        var scale_ruler= 0
        var ruler  =0 
        for(var i = 0;i<this.career_list.length;i++){
            var career = this.career_list[i]
            var career_dom_width = this._get_time_width(career.monthes)
            //ruler+=career_dom_width

            var career_node =  $("<li class='v-timeline-period v-career' style='width:"+career_dom_width+"px;background:"+career.color+"' id='career-"+career.id+"' start='"+career.start_YMD.year+"/"+career.start_YMD.month+"'>"+
                "<div class='v-career-left-time'>"+career.start_YMD.year+"/"+career.start_YMD.month+"</div>"+
                "<div class='v-career-right-time'>"+career.end_YMD.year+"/"+career.end_YMD.month+"</div>"+
                "<div class='v-career-content'>"+
                "<div class='v-career-content-left'>"+
                "<img src='"+career.link+"'width='100px' draggable='false' />"+
                "</div>"+
                "<div class='v-career-content-right' style='width:"+(career_dom_width-120)+"px'>"+
                "<h2>"+career.name+"</h2>"+
                "<h4>"+career.title+"</h4>"+
                "<p>"+career.content+"</p>"+
                "</div>"+
                "</div>"+
            "</li>")
            this.career_list[i].bind_node = career_node
            career_node.index = i
            career_node.right_pos = ruler

            ruler+=career_dom_width

            career_node.left_pos = ruler

            career_node.disableTextSelect()
            this.time_period_content.find("ul").append(career_node)
            this.time_period_content.width(this.time_period_content.width()+career_node.width())
            this.career_node_list.push(career_node)
            if(i==0){
                continue
            }
            else{

                var monthes = this.career_list[i].interval_monthes
                var career_interval_dom_width = this._get_interval_width(monthes)
                ruler+=career_interval_dom_width
                var interval_node = $("<li class='v-timeline-period v-interval' style='width:"+career_interval_dom_width+"px;'>"+
                    "</li>")
                this.time_period_content.find("ul").append(interval_node)
                this.time_period_content.width(this.time_period_content.width()+interval_node.width())

            }

            
        }

        this.content_width = this.time_period_content.width()
        this.center_node.bind_node = this.career_node_list[0]
    }
    this.init_controls = function(){
        var _this  = this
        this.time_period_content.bind("mousemove",{"refer":this},this.time_period_mouse_move)
        this.time_period_content.bind("mousedown",{"refer":this},this.time_period_mouse_down)
        this.time_period_content.bind("mouseup",{"refer":this},this.time_period_mouse_up)           
        this.time_period_content.bind("mouseleave",{"refer":this},this.time_period_mouse_out)
    }


    this.time_period_mouse_down = function(e){
        var _this = e.data.refer
        var x = e.clientX
        _this.time_period_scroll_on = true
        _this.time_period_scroll_x = x
        _this.time_period_scroll_left_x = _this.time_period_content.offset().left
        
    }
    this.time_period_mouse_out = function(e){
        var _this = e.data.refer
        _this.time_period_scroll_on = false
    }
    this.time_period_mouse_up = function(e){
        var _this = e.data.refer
        _this.time_period_scroll_on = false
    }
    this.time_period_mouse_move = function(e){
        var _this = e.data.refer
        var x = e.clientX
            //_this.time_period_content_container.scrollLeft(_this.time_period_scroll_left_x+_this.time_period_scroll_x-x)
        var left = _this.time_period_content.offset().left
        var offset = _this.time_period_scroll_x-x
        if(_this.time_period_scroll_on){
            if(_this.time_period_scroll_left_x-offset < _this.time_period.width()/2-_this.time_period_content.width()){
            _this.time_period_content.offset(
                    {
                        left:_this.time_period.width()/2-_this.time_period_content.width()
                    }
                )
            }
            else{
                _this.time_period_content.offset(
                    {
                        left:_this.time_period_scroll_left_x-offset
                    }
                )
            }
            _this.sync_events(_this.time_period_content.offset().left, _this.content_width)
        }
        
    }

    this.sync_events = function(offset,width){
        this.relocate_center_node(offset,width)
        if(this.center_node.bind_node == null){
            return
        }
        var events_node = this.center_node.bind_node.events_node
        var events_node_width = this.center_node.bind_node.events_node_width
        var events_node_right = this.center_node.bind_node.events_node.right_pos
        var events_offset = this.center_node.left_percentage*events_node_width
        var container_offset = this.time_spot_content.offset().left
        this.time_spot_content.offset({
            left:-(this.frame_spot_width - this.time_spot_width/2 - events_node_right - events_offset)
        }) 

    }

    this.check_range = function(offset,width,career_node){
            //return percentage
        return (width+offset-this.frame_width/2-career_node.right_pos)/career_node.width()
    }

    this.relocate_center_node = function(offset,width){
        var current_offset= width+offset-this.frame_width/2
        var center_range = this.check_range(offset,width,this.center_node.bind_node)
        if(center_range>0&& center_range<=1){
            this.center_node.left_percentage = center_range
            return
        }
    
        var index = this.center_node.bind_node.index
        if(index == null){
            return
        }
        
        if(current_offset < this.center_node.bind_node.right_pos){
            //this.center_node.bind_node = null
            for(var i =1;i<6;i++)   {
                if(index-i>=0){
                    var range_checker = this.check_range(offset,width,this.career_node_list[index-i])
                    // check interval
                    if(range_checker>=0&&range_checker<1){
                        //bingo
                        this.center_node.bind_node = this.career_node_list[index-i]
                        this.center_node.left_percentage = range_checker
                        break;
                    }
                }
                else{
                    break
                }
                
            }
        }
        else if(current_offset >= this.center_node.bind_node.left_pos){
            //this.center_node.bind_node = null
            for(var i =1;i<6;i++){
                if(index+i<this.career_node_list.length){
                    var range_checker = this.check_range(offset,width,this.career_node_list[index+i])
                    // check interval
                    if(range_checker>=0&&range_checker<1){
                        //bingo
                        this.center_node.bind_node = this.career_node_list[index+i]
                        this.center_node.left_percentage = range_checker
                        break;
                    }
                }
                else{
                    break
                }
            }
        }
    }
    this.init_career_events = function(){
        var odd = false
        var framewidth = this.time_spot.width()
        var event_width = framewidth/this.event_interval
        var ruler = 0
        for(var i = 0 ;i<this.career_list.length;i++){
            var width_record = 0
            var events = this.career_list[i].events
            var events_node = $("<div class='events'  id='events-"+this.career_list[i].id+"'><ul></ul></div>")
            events_node.right_pos = ruler

            this.time_spot_content.append(events_node)
            var events_node_ul = events_node.find("ul")
            var event_node_margin = 50
            for(var j =0;j<events.length;j++){
                odd = !odd
                var odd_class = odd?"odd":"even"
                var odd_time_class = odd?"odd-time":"even-time"
                var event_color = this.career_list[i].color
                var odd_style = odd?"border-color:rgba(0,0,0,0) rgba(0,0,0,0) "+event_color+" rgba(0,0,0,0)":"border-color:"+event_color+" rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0) "
                var odd_arrow = odd?"event-arrow-bottom":"event-arrow-top"
                var event_detail_node = this._generate_event_structure(events[j])
                var event_node = $("<li class='event' style='min-width:"+event_width+"px;'><div class='event-time "+odd_time_class+"'>"+events[j].start+"</div><div class='event-arrow "+odd_arrow+"' style='"+odd_style+"'/>"+

                    "<div class='event-slot "+odd_class+"'>"+
                    "<div class='event-detail-wrapper' style='background:"+event_color+"'>"+
                        $("<div/>").append(event_detail_node).html()+   
                    "</div></div></li>")
                //<div class='event-arrow'style='"+odd_style+"'/>
                events_node_ul.append(event_node)
                width_record+=(event_width+event_node_margin)
                event_node.find(".event-slot").css({"max-width":event_width*2+"px"})

                //this._apply_auto_width(event_node.find(".event-slot"),event_detail_node.find("p"),event_width*2)

            }
            
            this.time_spot_content.width(this.time_spot_content.width()+width_record)
            this.career_list[i].bind_node.events_node = events_node
            this.career_list[i].bind_node.events_node_width = events_node.width()
            ruler+=events_node.width()
            events_node.left_pos = ruler
        }
        this.frame_spot_width = this.time_spot_content.width()
    }
    this._apply_auto_width = function(event_slot, event_text_node,max_width){
        var counter = 0
        if(max_width==null){
            max_width = this.time_spot.width()/this.event_interval 
        }
        while(true){
            counter+=1
            if(counter>20)
            {
                break;
            }
            if(event_slot.width()>=max_width){
                break;
            }
            var height_diff=  event_text_node.outerHeight(true) - event_slot.height()+ 60
            if(height_diff>0){
                event_slot.width(event_slot.width()+height_diff)
            }
            else{
                break;
            }
        }
    }
    this._generate_event_structure = function(ev){
        var _this = this
        var event_node = $("<div class='event-detail'><h3 class='event-title'><i class='event-icon glyphicons'></i><span>"+ev.title+"</span></h3></div>")
        if(ev.category === 'TEXT'){
            event_node.addClass("event-detail-text")
            event_node.append($("<div class='text-board'><p>"+ev.content+"</p></div>"))
        }
        else if(ev.category === "IMAGE"){
            event_node.addClass("event-detail-image")
            var image_node = $("<section></section>")
            var image_detail_node  =$("<div class='event-image'></div>")
            //image.src = ev.data
            //image.onload= function(){
            //  if(this.width>_this.max_event_image_size){
            //      $(image).width(100)
            //  }
            //  
            //}
            var img = $("<img src='"+ev.data+"'/>")
            image_detail_node.append(img)   

            //$(image).appendTo(image_detail_node)
            var image_text_node = $("<div class='event-detail-text'><div class='text-board'><p>"+ev.content+"</p></div></div>")
            image_node.append(image_detail_node)
            image_node.append(image_text_node)
            event_node.append(image_node)
        }
        else if(ev.category === "MAP"){

        }
        return event_node
    }

    this.render= function(){
    }
    this.auto_width = function(){
        var _this = this
        var event_list_nodes = this.time_spot_content.find(".events")
        $.each(event_list_nodes,function(){
            var event_nodes = $(this).find(".event")
            $.each(event_nodes,function(){
                var event_node = $(this)
                var event_slot_node = $(this).find(".event-slot")
                var event_text_node = $(this).find(".text-board>p")
                var max_width = 2*(event_node.css("min-width").replace('px', ''))
                _this._apply_auto_width(event_slot_node, event_text_node,max_width)
            })
        })
        var first_event = this.time_spot_content.find(".events:first").find(".event:first")
        var first_width = first_event.find(".event-slot").width()
        if(first_event.width()!=first_width){
            var diff = first_width-first_event.width()
            first_event.width(first_width)
            this._recalculate_ruler()
            this.time_spot_content.width(this.time_spot_content.width()+diff)
            this.frame_spot_width = this.time_spot_content.width()
            this.career_list[0].bind_node.events_node_width = first_event.parent().width()
        }
        
    }
    this._recalculate_ruler= function(){
        var _this = this
        var ruler = 0
        var width_record =0
        var event_list_nodes = this.time_spot_content.find(".events")
        $.each(event_list_nodes,function(){
            $(this).right_pos = ruler
             ruler+= $(this).width()
             $(this).left_pos = ruler

        })
        //this.frame_spot_width = this.time_spot_content.width()
    }
}