function init() {

            // MP3 source is loaded in implementation. define var src="path/to/mp3" in HTML file

            if (!createjs.Sound.initializeDefaultPlugins()) {
                document.getElementById("error").style.display = "block";
                document.getElementById("content").style.display = "none";
                return;
            }

            $("#playPauseBtn").attr("disabled", true);

            document.getElementById("loader").className = "loader";
            

            createjs.Sound.alternateExtensions = ["mp3"];   // add other extensions to try loading if the src file extension is not supported
            createjs.Sound.addEventListener("fileload", createjs.proxy(handleLoadComplete,this)); // add an event listener for when load is completed
            createjs.Sound.registerSound(src, "music");
        }

        var instance;
        var positionInterval;
        var seeking = false;

        function handleLoadComplete(event) {

            document.getElementById("loader").className = "";

            $("#loading").css("display", "none");

            instance = createjs.Sound.createInstance("music");
            instance.stop();
            instance.addEventListener("complete", function() {
                clearInterval(positionInterval);
                $("#playBtn").removeClass("pauseBtn").addClass("playBtn")
            });           
            
            $("#playBtn").click(function(event){
                if (instance.playState == createjs.Sound.stopped) {
                    instance.play();
                }
                if (instance.playState == createjs.Sound.PLAY_FINISHED) {
                    instance.play();
                    $("#playBtn").removeClass("playBtn").addClass("pauseBtn");
                    trackTime();
                    return;
                } else {
                    instance.paused ? instance.resume() : instance.pause();
                }

                if (instance.paused) {
                    $("#playBtn").removeClass("pauseBtn").addClass("playBtn");
                } else {
                    $("#playBtn").removeClass("playBtn").addClass("pauseBtn");
                }
            });
            
            trackTime();

            // http://forums.mozillazine.org/viewtopic.php?f=25&t=2329667
            $("#thumb").mousedown(function(event) {
                //console.log("mousedown");
                var div = $();
                $("#player").append($("<div id='blocker'></div>"));
                seeking = true;
                $("#player").mousemove(function(event){
                    // event.offsetX is not supported by FF, hence the following from http://bugs.jquery.com/ticket/8523
                    if(typeof event.offsetX === "undefined") { // || typeof event.offsetY === "undefined") {
                        var targetOffset = $(event.target).offset();
                        event.offsetX = event.pageX - targetOffset.left;
                        //event.offsetY = event.pageY - targetOffset.top;
                    }
                    $("#thumb").css("left", Math.max(0, Math.min($("#track").width()-$("#thumb").width(), event.offsetX-$("#track").position().left)));
                })
                $("#player").mouseup(function(event){
                    //console.log("mouseup");
                    seeking = false;
                    $(this).unbind("mouseup mousemove");
                    var pos = $("#thumb").position().left/$("#track").width();
                    instance.setPosition(pos*instance.getDuration());
                    $("#blocker").remove();
                });
            });
        }

        var dragOffset;
        function trackTime() {
            positionInterval = setInterval(function(event) {
                if(seeking) { return; }
                $("#thumb").css("left", instance.getPosition()/instance.getDuration() * $("#track").width());
            }, 30);
        }
        