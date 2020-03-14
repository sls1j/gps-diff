function StationModel()
{
    var public = this;
    var private = public.private = {};

    private.isStarted = false;

    private.agent = new GpsDiffAgent();    

    private.agent.onUpdate = function(location) {
        location.StationId = private.stationId;
        if ( public.onUpdate )
            public.onUpdate(location);

        private.agent.addAgentData(location)        
            .then( response => { console.log("station data successfully added.");},
                   response => { console.log("station data failed: "+response.status + " " + response.statusText);});                               
    }    
    
    public.onUpdate = null;

    public.getStations = function()
    {
        return private.agent.getStations();
    }    

    public.start = function(stationId){

        if ( private.isStarted)
            return;

        private.isStarted = true;
        private.stationId = stationId;
        private.agent.start();
    }

    public.stop = function(){
        if ( !private.isStarted )
            return;

        private.isStarted = false;
        private.agent.stop();
    }
}