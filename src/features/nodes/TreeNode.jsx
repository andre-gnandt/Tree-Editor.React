import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import updateNode from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';
import NodeDetails from './NodeDetails';

const TreeNode = (props) => {
    const[dialog, setDialog] = useState(false);
    console.log("Treenode input");
    console.log(props); 
    if(props == null || props.props == null || !('id' in props.props)) return (<></>);   
    console.log("returning component");
        return(
            <>
                <div style = {{border: '1px solid red'}}>
                    <button onClick={() => {setDialog(true)}}>
                        <div>
                            <h1>{props.props.title}</h1>
                        </div>
                    </button>                    
                </div>                               
                <Dialog header = {"HEADER"} visible = {dialog} style={{ width: '50vw' }} onHide={() => {if (!dialog) return; setDialog(false)}} > 
                    <NodeDetails input = {props.props}/>
                </Dialog>               
            </> 
        );
}

export default TreeNode 