import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import updateNode from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';
import NodeDetails from './NodeDetails';

const TreeNode = (props) => {
    const[visible, setVisible] = useState(true);
    
    if(props.props == null) return (<></>);
    console.log("Treenode input");
    console.log(props);    

        return(
            <>
                <div style = {{border: '1px solid red'}}>
                    <button>
                        <div>
                            <h1>{props.props.title}</h1>
                        </div>
                    </button>
                    
                </div>
                
                <div>
                    DIALOG
                    <Dialog visible = {visible}> 
                        <NodeDetails input = {props}/>
                    </Dialog>
                </div>
            </> );
}

export default TreeNode 