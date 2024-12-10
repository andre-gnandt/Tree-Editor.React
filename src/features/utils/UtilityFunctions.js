const Saving = () => 
    {
        document.getElementById('saving').hidden = false;
    }
    
    const DoneSaving = () => 
    {
        document.getElementById('saving').hidden = true;
    }
    
    const Loading = () => 
    {
        document.getElementById('loading').hidden = false;
    }
    
    const DoneLoading = () => 
    {
        document.getElementById('loading').hidden = true;
    }
    
    function Success() 
    {
        const ClearSuccess = () =>
            {
                document.getElementById('success').hidden = true;
                clearTimeout(myTimeout);
            }
    
        document.getElementById('success').hidden = false;
        const myTimeout = setTimeout(ClearSuccess, 1600);
    }
    
    function error() 
    {
        function ClearError()
        {
            document.getElementById('error').hidden = true;
            clearTimeout(myTimeout);
        }
    
        document.getElementById('error').hidden = false;
        const myTimeout = setTimeout(ClearError, 2000);
    }

export{error, Success,  Saving, Loading, DoneLoading, DoneSaving}