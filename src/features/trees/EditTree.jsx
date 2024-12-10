import React, { useState} from 'react'
import { Dialog } from 'primereact/dialog';
import TreeDetails from './TreeDetails';
import '../nodes/detailsList.css';
import '../trees/tree.css';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';

const EditTree = ({id, tree}) => {
    const [editTree, setEditTree] = useState(null);

    const closeDialog = () => 
    {
        setEditTree(false);
    }

    return (
        <>  
            <button className = 'button-header button-save tooltip'>
                <i className='pi pi-file-edit' style = {{fontSize: '7.2vh'}} onClick = {() => { setEditTree(true);}} />
                <span class="tooltip-right">Edit Tree Details</span>
            </button>
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog className={"dialogContent2"} draggable 
                    showHeader = {false}  
                    contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '1vw solid #274df5', borderRadius: '5vw', backgroundColor: '#E0E0E0'}}
                    visible = {editTree} 
                    onHide={() => {if (!editTree) return; setEditTree(false);}} >

                    <TreeDetails 
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