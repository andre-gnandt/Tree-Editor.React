import React, {useEffect, useState} from 'react'
import { Dialog } from 'primereact/dialog';
//import './DetailsList.css'
import '../trees/tree.css';
import NodeDetails from './NodeDetails';
import { useDispatch } from 'react-redux';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';
import { cloneNode } from './nodeSlice';

const CreateNode = ({nodeList, nodeDictionary, iconSize, rootNode, render, treeId}) => {
    const [createNode, setCreateNode] = useState(null);
    const [mobile, setMobile] = useState(window.innerHeight > 0.85 * window.innerWidth ? true : false);
    const dispatch = useDispatch();

    
    useEffect(() => {
        
        if(createNode)
        {
            window.addEventListener('resize', isMobile);
        }
        else 
        {
            window.removeEventListener('resize', isMobile);
        }
        
        return () => window.removeEventListener('resize', isMobile);
    });
    

    const newNode = 
    {
        data: null,
        title: null,
        level: 0,
        description: null,
        number: null,
        nodeId: rootNode ? rootNode.id : null,
        rankId: null,
        country: null,
        region: null,
        children: [],
        files: [],
        thumbnailId: null,
        treeId: rootNode ? rootNode.treeId : null,
    };

    const unMount = () => 
    {
        window.removeEventListener('resize', isMobile);
        setCreateNode(false);
    }

    
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
    

    function CompareNodes(a, b)
    {
        if ( a.title < b.title ){                                                                   
            return -1;
          }
          if ( a.title > b.title ){
            return 1;
          }
          return 0;
    }

    function GetNodeList()
    {   
        const newList = [...nodeList];
        return newList.sort(CompareNodes);
    }

    const OpenDialog = () => 
    {
        dispatch(cloneNode(newNode));
        setCreateNode(true);
    }

    return (
        <>  
            <button className = {(newNode.nodeId == null) ? 'button-header button-save tooltip' : 'button-header button-create tooltip'} disabled = {(newNode.nodeId == null )}>
                <i className='pi pi-upload diagram-header-icon'  onClick = {() => { OpenDialog();}} />
                <span class="tooltip-left">New Node</span>
            </button>
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog 
                    className={"dialogContent"} 
                    draggable 
                    showHeader = {false}  
                    contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px',backgroundColor: '#E0E0E0'}} 
                    visible = {createNode} 
                    onHide={() => {if (!createNode) return; unMount();}} 
                    style = {{width: mobile ? '88vw' : String(0.45*screen.width)+"px", height: mobile ? '73.9vw' : '86vh', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px'}} 
                > 
                        
                        <NodeDetails 
                            mobile = {mobile}
                            unMount = {unMount} 
                            rootNode = {rootNode} 
                            files = {newNode.files} 
                            create = {true} 
                            render = {render} 
                            inputNode = {newNode} 
                            nodeList = {GetNodeList()} 
                            nodeDictionary = {nodeDictionary}/>
                </Dialog>
            </Draggable>
        </>
    );
}

export default CreateNode 