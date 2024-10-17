import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import updateNode from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';
import NodeDetails from './NodeDetails';
import Draggable from 'react-draggable';

const TreeNode = (props, css) => {
    const[dialog, setDialog] = useState(false);
    if(props == null || props.props == null || !('id' in props.props)) return (<></>);   

    //onClick={() => {setDialog(true)}
    
        return(
            <>
                
                <button style = {{display: 'table-cell', height: '80px', width: '80px'}}>
                    {props.props.title}
                </button>                    
             
                <Dialog header = {"HEADER"} visible = {dialog} style={{ width: '50vw' }} onHide={() => {if (!dialog) return; setDialog(false)}} > 
                    <NodeDetails input = {props.props}/>
                </Dialog>               
            </> 
        );
}

export default TreeNode 