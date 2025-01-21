import React, {useEffect, useState} from 'react'
import { Dialog } from 'primereact/dialog';
import TreeDetails from './TreeDetails';
import '../nodes/DetailsList.css';
import '../trees/tree.css';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';
import TreeDialog from './TreeDialog';

const EditTree = ({id, tree}) => {
    const [editTree, setEditTree] = useState(null);
    const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth ? true : false);

    useEffect(() => {

        if(editTree)
        {   
            window.addEventListener('resize', isPortrait);
        }
        else
        {
            window.removeEventListener('resize', isPortrait);
        }     
          return () => window.removeEventListener('resize', isPortrait);
        });
    

    function isPortrait()
    {
        if(window.innerHeight > 0.85 * window.innerWidth)
        {
            setPortrait(true);
        }
        else
        {
            setPortrait(false);
        }
    }

    const closeDialog = () => 
    {
        window.removeEventListener('resize', isPortrait);
        setEditTree(false);
    }

    const openDialog = () =>
    {
        isPortrait();
        setEditTree(true);
    }

    return (
        <>  
            <button className = 'button-header button-save tooltip'>
                <i className='pi pi-file-edit diagram-header-icon' onClick = {() => { openDialog();}} />
                <span class="tooltip-right">Edit Tree Details</span>
            </button>
            <TreeDialog 
                id = {id}
                setCreateTree = {setEditTree} 
                createTree = {false} 
                portrait = {portrait} 
                inputTree = {tree} 
                openDialog = {editTree} 
                closeDialog = {closeDialog} 
            />
        </>
    );
}

export default EditTree