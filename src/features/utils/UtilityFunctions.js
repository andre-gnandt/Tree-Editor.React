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
    const myTimeout = setTimeout(ClearSuccess, 3000);
}

function error() 
{
    function ClearError()
    {
        document.getElementById('error').hidden = true;
        clearTimeout(myTimeout);
    }

    document.getElementById('error').hidden = false;
    const myTimeout = setTimeout(ClearError, 3000);
}

function IsTouchDevice() {  return 'ontouchstart' in window || 'onmsgesturechange' in window; };

function IsDesktop(){ return !IsTouchDevice();}

function GetDialogWidth(portrait)
  {
    if(portrait)
    {
      return  '100vw';
    }
    else if(!IsDesktop())
    {
      return '110vh';
    }

    return String(0.45*screen.width)+"px";
  }

  function GetDialogHeight(portrait)
  {
    if(IsDesktop()) 
    {
      return '86vh';
    }
    else if(portrait)
    {
      return '110vw';
    }

    return '94vh';
  }

export{error, Success,  Saving, Loading, DoneLoading, DoneSaving, GetDialogHeight, GetDialogWidth, IsDesktop}