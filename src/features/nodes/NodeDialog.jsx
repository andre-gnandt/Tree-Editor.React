import React from 'react'
import { Dialog } from 'primereact/dialog';
import './DetailsList.css'
import NodeDetails from './NodeDetails';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';
import { GetDialogHeight, GetDialogWidth } from '../utils/UtilityFunctions';

const NodeDialog = ({
        create = false, 
        root = false, 
        unMount, 
        countries,
        portrait,
        open,
        rootNode = null,
        files = null,
        render,
        inputNode,
        nodeList,
        nodeDictionary
    }) => {

    return (
        <>
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog 
                    className={"dialogContent"} 
                    draggable 
                    showHeader = {false}  
                    style = {{width: GetDialogWidth(portrait), height: GetDialogHeight(portrait), borderRadius: portrait ? '5vw' : String(0.05*screen.width)+'px'}} 
                    contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: portrait ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}} 
                    visible = {open} 
                    onHide={() => {if (!open) return; unMount();}} >                  
                        <NodeDetails 
                            countries = {countries} 
                            unMount = {unMount} 
                            rootNode = {rootNode} 
                            files = {files} 
                            root = {root} 
                            create = {create}
                            render = {render} 
                            inputNode = {inputNode} 
                            nodeList = {nodeList} 
                            nodeDictionary = {nodeDictionary}
                        />
                </Dialog>
            </Draggable>
        </>
    );
}

export default NodeDialog 