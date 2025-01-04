import React, {useEffect, useState} from 'react'
import { Dialog } from 'primereact/dialog';
import TreeDetails from './TreeDetails';
import '../nodes/DetailsList.css';
import '../trees/tree.css';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';

const EditTree = ({id, tree}) => {
    const [editTree, setEditTree] = useState(null);
    const [mobile, setMobile] = useState(window.innerHeight > 0.85 * window.innerWidth ? true : false);

    
    useEffect(() => {

        if(editTree)
        {   
            window.addEventListener('resize', isMobile);
        }
        else
        {
            window.removeEventListener('resize', isMobile);
        }     
          return () => window.removeEventListener('resize', isMobile);
        });
    

    function isMobile()
    {
        if(window.innerHeight > 0.85 * window.innerWidth)
        {
            setMobile(true);
        }
        else
        {
            setMobile(false);
        }
    }

    const closeDialog = () => 
    {
        window.removeEventListener('resize', isMobile);
        setEditTree(false);
    }

    const openDialog = () =>
    {
        isMobile();
        setEditTree(true);
    }

    return (
        <>  
            <button className = 'button-header button-save tooltip'>
                <i className='pi pi-file-edit' style = {{fontSize: '7.2vh'}} onClick = {() => { openDialog();}} />
                <span class="tooltip-right">Edit Tree Details</span>
            </button>
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog 
                    style = {{width: mobile ? '88vw' : String(0.45*screen.width)+"px", height: mobile ? '73.9vw' : '86vh', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px'}} 
                    className={"dialogContent2"} 
                    onHide = {() => {closeDialog();}} 
                    visible = {editTree} 
                    draggable 
                    showHeader = {false}  
                    contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}}
                >
                    <TreeDetails 
                        mobile = {mobile}
                        inputTree={tree}
                        creation = {false}
                        unMount={closeDialog}
                        id = {id}
                    />
                </Dialog>
            </Draggable>
        </>
    );
}

export default EditTree