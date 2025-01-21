import React, {useEffect, useState} from 'react'
import { Dialog } from 'primereact/dialog';
import '../nodes/DetailsList.css';
import TreeDetails from './TreeDetails';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';
import { GetDialogHeight, GetDialogWidth } from '../utils/UtilityFunctions';

const TreeDialog = ({id = null, setCreateTree, createTree,  portrait, inputTree, openDialog, closeDialog, reRenderList = null}) => {
    
    return(
        <>
            <Draggable  onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog 
                    resizable = {false}
                    style = {{width: GetDialogWidth(portrait), height: GetDialogHeight(portrait), borderRadius: portrait ? '5vw' : String(0.05*screen.width)+'px'}} 
                    className={"dialogContent2"} 
                    onHide = {() => {setCreateTree(false);}} 
                    visible = {openDialog} 
                    draggable 
                    showHeader = {false}  
                    contentStyle={{width: GetDialogWidth(portrait), overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: portrait ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}}
                >
                    <TreeDetails 
                        id = {id}
                        inputTree={inputTree}
                        creation = {createTree}
                        unMount={closeDialog}
                        reRenderList={reRenderList}
                    />
                </Dialog>
            </Draggable>
        </>
    );
}

export default TreeDialog