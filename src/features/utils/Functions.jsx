import React, { useRef } from "react";
import Draggable from 'react-draggable';
import { Dialog } from "primereact/dialog";

//class Function extends Component {

   export function Saving() 
    {
        document.getElementById('saving').hidden = false;
    }

    export function DoneSaving()
    {
        document.getElementById('saving').hidden = true;
    }

    export function Loading()
    {
        document.getElementById('loading').hidden = false;
    }

    export function DoneLoading() 
    {
        document.getElementById('loading').hidden = true;
    }

    export function Success() 
    {
        const ClearSuccess = () =>
            {
                document.getElementById('success').hidden = true;
                clearTimeout(myTimeout);
            }

        document.getElementById('success').hidden = false;
        const myTimeout = setTimeout(ClearSuccess, 3000);
    }

    export function error() 
    {
        function ClearError()
        {
            document.getElementById('error').hidden = true;
            clearTimeout(myTimeout);
        }

        document.getElementById('error').hidden = false;
        const myTimeout = setTimeout(ClearError, 3000);
    }

    export  function IsTouchDevice() {  return 'ontouchstart' in window || 'onmsgesturechange' in window; };

    export  function IsDesktop(){ return !IsTouchDevice();}

    export   function GetDialogWidth(portrait)
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

    export   function GetDialogHeight(portrait)
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

    const getDeleteType = (type) => 
    {
        if(type == "tree")
        {
            return "Please confirm that you would like to delete this Tree.";
        }

        return  "Please confirm that you would like to delete the node(s).";
    }

    export const GetConfirmDelete = (type, onCloseFuntion, closeInput, onLeft, onLeftInput, onRight, onRightInput, visible) =>
        {
            return (
            <>  <Draggable>
                    <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}} onHide={() => {}}  visible = {visible}>
                        <>  
                        <i onClick={() => {onCloseFuntion(closeInput)}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                            <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                                <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>{getDeleteType(type)}</div>
                                <div style = {{position: 'relative', top: '10vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button className='text-overflow button' onClick={() => {onLeft();}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Yes</button>
                                    </div>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button 
                                            onClick={() => {onRight(onRightInput); }}
                                            className='button text-overflow' style = {{height: '12vh',  width: '15.5vw', fontSize: '4vh'}}>No</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    </Dialog>
                </Draggable>
            </>
            );
        }

        export const GetDeleteOptions = (type, onCloseFuntion, closeInput, onLeft, onLeftInput, onRight, onRightInput, visible, deleteType) =>
            {
                return (
                <>  <Draggable>
                        <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}}  visible = {visible} onHide = {() => {}}>
                            <>  
                            <i onClick={() => {onCloseFuntion(closeInput)}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                                <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                                    <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>What type of Deletion would you like to make?</div>
                                    <div style = {{position: 'relative', top: '3vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                        <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                            <button className='text-overflow button' onClick={() => {deleteType.current = "cascade"; onLeft(onLeftInput);}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Delete Cascade</button>
                                            <div style = {{fontSize: '3vh'}}>
                                                (Delete this node and all descendants )
                                            </div>
                                        </div>
                                        <div style = {{borderLeft: '3px dotted black', backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                            <button 
                                                 onClick={() => {deleteType.current = "single"; onRight(onRightInput); }}
                                                 className='button text-overflow' style = {{height: '12vh',  width: '15.5vw', fontSize: '4vh'}}>Delete Single</button>
                                            <div style = {{fontSize: '3vh'}}>
                                                (Delete only this Node)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        </Dialog>
                    </Draggable>
                </>
                );
            }
//}
