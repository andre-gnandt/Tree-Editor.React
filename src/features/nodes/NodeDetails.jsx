import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, setStateProperty, updateNodeData, updateNodeNumber, updateNodeDescription, updateNodeTitle, updateNodeParent} from './nodeSlice'
import { DeleteCascade,  DeleteSingle, updateNode, createNode, createRoot } from '../../api/nodes/nodesApi';
import { InputText} from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import './DetailsList.css';
import UploadThumbnail from '../utils/UploadThumbnail';
import Draggable from 'react-draggable';

const NodeDetails = ({
    mobile = false,
    unMount,
    render, 
    inputNode, 
    nodeList, 
    create = false,
    root = false
    })  =>     
    {
    const dispatch = useDispatch();
    const node = useSelector(state => state.node);
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const[titleRequired, setTitleRequired] = useState(true);
    //const[resetFiles, setResetFiles] = useState({reset: false});
    const resetThumbnail = useRef(1);
    const [deleteOptions, setDeleteOptions] = useState("");
    const deleteType = useRef("cascade"); //single | cascade
    const fileChangeCount = useRef(0);
    const [Create, setCreate] = useState(create);
    const [Root, setRoot] = useState(root);

    const handleChange = (value, method) => {
        dispatch(method(value));
    }

    const FileChangeCallBack = (showButtons) => 
    {
        if(showButtons)
        {
            fileChangeCount.current = 1;
        }
        else 
        {
            fileChangeCount.current = 0;
        }

        setHideButtons(changeCount.current+fileChangeCount.current);
    }

    const SetNodeVar = (node) => {
        inputNode.data = node.data;
        inputNode.title = node.title;
        inputNode.number = node.number;
        inputNode.description = node.description;
        inputNode.rankId = node.rankId;
        inputNode.level = node.level;
        inputNode.nodeId = node.nodeId;
        inputNode.id = node.id;
        inputNode.files = node.files;
        inputNode.thumbnailId = node.thumbnailId;
        inputNode.treeId = node.treeId;
    }

    const GetUpdateNodeObject = (node) =>
    {
        const updateNodeObject =
        {
            id: node.id,
            data: node.data,
            title: node.title,
            number: node.number,
            description: node.description,
            rankId: node.rankId,
            level: node.level,
            thumbnailId: node.thumbnailId,
            treeId: node.treeId,
            nodeId: node.nodeId,
            files: [],
            children: []
        };

        return updateNodeObject;
    }

    function CheckValueChange(originalValue, previousValue, newValue)
    {

        if(originalValue != null && String(originalValue).length === 0) originalValue = null;
        if(previousValue != null && String(previousValue).length === 0) previousValue = null;
        if(newValue != null && String(newValue).length === 0) newValue = null;

        const previousChangeCount = changeCount.current;
        if(previousValue ==  originalValue && newValue != originalValue)
        {
            changeCount.current++;
        }
        else if(previousValue !=  originalValue && newValue == originalValue)
        {
            changeCount.current--;
        }

        if((previousChangeCount == 0 && changeCount.current != 0) || (previousChangeCount != 0 && changeCount.current == 0))
        {
            setHideButtons(changeCount.current+fileChangeCount.current);
        }
    }

    const GetConfirmDelete = () =>
        {
            return (
            <>  <Draggable>
                    <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}}  visible = {(deleteOptions === "confirm")} onHide = {() => {setDeleteOptions("")}}>
                        <>  
                        <i onClick={() => {setDeleteOptions("")}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                            <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                                <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>Please confirm that you would like to delete the node(s).</div>
                                <div style = {{position: 'relative', top: '10vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button className='text-overflow button' onClick={() => {HandleDeleteNode();}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Yes</button>
                                    </div>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button 
                                             onClick={() => {setDeleteOptions(""); }}
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

    const GetDeleteOptions = () =>
    {
        return (
        <>  <Draggable>
                <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}}  visible = {(deleteOptions === "options")} onHide = {() => {setDeleteOptions("")}}>
                    <>  
                    <i onClick={() => {setDeleteOptions("")}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                        <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                            <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>What type of Deletion would you like to make?</div>
                            <div style = {{position: 'relative', top: '3vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button className='text-overflow button' onClick={() => {deleteType.current = "cascade"; setDeleteOptions("confirm");}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Delete Cascade</button>
                                    <div style = {{fontSize: '3vh'}}>
                                        (Delete this node and all descendants )
                                    </div>
                                </div>
                                <div style = {{borderLeft: '3px dotted black', backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button 
                                         onClick={() => {deleteType.current = "single"; setDeleteOptions("confirm"); }}
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

    function RenderCreateOrSaveButton()
    {
        if(Create || Root)
        {
            return (
                <>Create</>
            );
        }
        
        return (
            <>Save</>
        );
    }

    async function HandleDeleteNode()
    {   
        if(deleteType.current === "single")
        {
            const deleteNode = GetUpdateNodeObject(inputNode);
            const children = [];
            inputNode.children.forEach(child => 
            {
                children.push(GetUpdateNodeObject(child));
            }
            )

            deleteNode["children"]  = children;

            await DeleteSingle(inputNode.nodeId, deleteNode);
            render("delete single", null, node.id, null, node.nodeId);
        }
        else
        {
            await DeleteCascade(inputNode.id);
            render("delete cascade", null, node.id, null, node.nodeId);
        }
        unMount();
    }

    async function HandleSaveOrCreate()
    {
        if(!node.title || node.title.trim().length === 0)
        {
            setTitleRequired(false);
        }
        else if(!Create && !Root)
        {
            
            var updatedNode = await updateNode(node.id, node); 
            if(!updatedNode) return;
            
            if(node.nodeId != inputNode.nodeId)
            {
                const oldParentId = inputNode.nodeId;
                SetNodeVar(updatedNode);
                render("update", inputNode, node.id, node.nodeId, oldParentId);
            }
            else{
                SetNodeVar(updatedNode);
                render("update", inputNode, node.id);
            }

            dispatch(cloneNode(inputNode));
        }
        else if(Create)
        {            
            var resultNode = await createNode(node);
            if(!resultNode) return;
            
            SetNodeVar(resultNode);
            render("create", inputNode);

            dispatch(cloneNode(inputNode));
            setCreate(false);
        }  
        else if(Root)
        {
            var resultNode = await createRoot(node);
            if(!resultNode) return;
            
            SetNodeVar(resultNode);
            nodeList.length = 0;
            render("new root", inputNode);

            dispatch(cloneNode(inputNode));
            setRoot(false);
        }  


        if(node.title && node.title.trim().length > 0)
        {
            changeCount.current = 0;
            setHideButtons(0);
        }
    }

    const ResetForm = () =>
    {
        document.getElementById('file-upload-button').value = null;
        changeCount.current = 0; 
        fileChangeCount.current = 0;
        resetThumbnail.current = resetThumbnail.current * -1;
        setHideButtons(0);
        //setResetFiles({reset: true}); 
        handleChange(inputNode, cloneNode);
    }

    const GetHeader = () => {
        if(Create)return <>Create New Node</>;
        if(Root)return <>Create New Root</>;
        
        return <>Node Content</>;
    }

        //approx container height = 81.95vh
        return(
        <>  
            <div className='dialog-root'>
                <div id = 'fixed-header' className='fixed-header'>
                    <div className='dialog-header-inner'>
                        <i onClick={() => {unMount()}} className='pi pi-times dialog-close-button' style = {{fontSize: mobile ? '6vw' : '6.5vh'}}/>
                        <div className='dialog-header center-text' style = {{fontSize: mobile ? '4vw' : '4.8vh'}}>{GetHeader()}</div>                   
                        <div className='dialog-delete'>
                        { (node.nodeId && !Root && !Create) && (
                            <>
                                
                                <button className='dialog-delete-button button text-overflow' 
                                    style = {{fontSize: mobile ? '2.5vw' : '3vh'}} 
                                    onClick={() => {setDeleteOptions("options")}}                       
                                >
                                Delete</button>                   
                                { (deleteOptions === "options") && 
                                    (
                                    <>
                                        {GetDeleteOptions()}
                                    </>
                                    )
                                }
                                { (deleteOptions === "confirm") && 
                                    (
                                    <>
                                        {GetConfirmDelete()}
                                    </>
                                    )
                                }
                            </>
                            )
                        }
                        </div>
                    </div> 
                </div>
                <div className={(hideButtons === 0 && titleRequired) ? 'container': 'container-shrunk'}> 
                    <div className='thumbnail-container-outer' style = {{height: mobile ? '39.6vw' : '44vh', marginBottom: mobile ? '5vw': '5.275vh'}}>
                        <div className="thumbnail-container" style = {{height: mobile ? '39.6vw' : '44vh', width: mobile ? '29.7vw' : '33vh'}}>                         
                            <UploadThumbnail /* reset = {resetFiles} */ mobile = {mobile} reset = {resetThumbnail.current} fileChangeCallBack = {FileChangeCallBack} inputNode = {inputNode} /> 
                        </div>
                        {
                        <div className='title-container' style = {{width: mobile ? 'calc(92% - 27.75vw)' : 'calc(92% - 33vh)'}}>
                            <InputTextarea 
                                maxLength={50}
                                autoResize 
                                rows = {1} 
                                placeholder="Title" 
                                className= {mobile ? ( (titleRequired) ? "title-mobile" : "title-required-mobile" ) : (titleRequired ? "title" : "title-required")}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(inputNode.title, node.title, e.target.value); handleChange(e.target.value, updateNodeTitle);}} value = {node.title ? node.title : ""} />
                        </div>
                        }
                    </div>
                    { (!Root && inputNode.nodeId) && (
                        <div className="entryContainer" style = {{height: mobile ? '5.7vw' : '6.5vh', marginBottom: mobile ? '3.9vw' : '4.3vh'}}>
                            <div className = "fullWidthLeft" style = {{fontSize: mobile ? '3.9vw':'4.2vh'}}>
                                Parent:  
                            </div> 
                            <div className="fullWidthRight">
                                <Dropdown  
                                    maxLength={1000}
                                    className = "dropdown"
                                    placeholder='Select Parent...'
                                    panelStyle={{borderRadius: '2vh', color: 'rgba(204, 223, 255, 0.9)', backgroundColor: '#ccffffe6'}}
                                    style = {{fontSize: mobile ? '2.8vw' : '3vh'}}
                                    onFocus={(event) => {}}
                                    //className='input'
                                    disabled = {node.nodeId ? false : true}
                                    filter
                                    onChange = {(e) => {CheckValueChange(inputNode.nodeId, node.nodeId, e.target.value.id); handleChange(e.target.value.id, updateNodeParent);}} 
                                    value = {nodeList.find((object) => object.id === node.nodeId)}
                                    options = {nodeList}
                                    optionLabel='title'
                                    />
                            </div>
                        </div> 
                    )
                    }
                    <div className="entryContainer" style = {{height: mobile ? '15vw' : '17vh', marginBottom: mobile ? '3.9vw' : '4.3vh'}}>
                        <div className = "fullWidthLeft" style = {{fontSize: mobile ? '3.9vw':'4.2vh'}}>
                            Description:  
                        </div> 
                        <div className="fullWidthRight">
                            <InputTextarea maxLength={1000} placeholder='Description...' autoResize style = {{fontSize: mobile ? '3vw' : '3vh'}} rows={5} className = "input" onChange = {(e) => {CheckValueChange(inputNode.description, node.description, e.target.value); handleChange(e.target.value, updateNodeDescription);}} value = {node.description ? node.description : ""} />
                        </div>
                    </div>
                    <div className="entryContainer" style = {{height: mobile ? '24vw' : '26vh', marginBottom: mobile ? '3.9vw' : '4.3vh'}}>
                        <div className = "fullWidthLeft" style = {{fontSize: mobile ? '3.9vw':'4.2vh'}}>
                            Data: 
                        </div>
                        <div className="fullWidthRight">
                            <InputTextarea maxLength={1000} placeholder='Data...' autoResize rows={7} style = {{fontSize: mobile ? '3vw' : '3vh'}} className = "input-data" onChange = {(e) => {CheckValueChange(inputNode.data, node.data, e.target.value); handleChange(e.target.value, updateNodeData);}} value = {node.data? node.data : ""} />    
                        </div>
                    </div>
                    <div className="entryContainer" style = {{height: mobile ? '5.7vw' : '6.5vh', marginBottom: mobile ? '3.9vw' : '4.3vh'}}>
                        <div className = "fullWidthLeft" style = {{fontSize: mobile ? '3.9vw':'4.2vh'}}>
                            Number:  
                        </div> 
                        <div className="fullWidthRight">
                            <InputText style = {{fontSize: mobile ? '3vw': '3vh'}} maxLength={1000} placeholder='Number...' className = "input" type = 'number' keyfilter='int' onChange = {(e) => {CheckValueChange(inputNode.number, node.number, e.target.value); handleChange(e.target.value, updateNodeNumber);}} value = {node.number ? node.number : ""} />
                        </div>
                    </div>
                    {/*
                    <div className="entryContainer">
                        <div className = "fullWidthLeft">
                            Rank:  
                        </div> 
                        <div className="fullWidthRight">
                            <InputText className = "input" value = {""} />
                        </div>
                    </div>
                    */}
                </div> 
                {
                <div className = 'dialog-save-banner' hidden = {hideButtons === 0 && titleRequired} style = {{height: (hideButtons === 0 && titleRequired)? '0%':'7.2%'}}>
                    <div className = 'dialog-save-container' hidden = {hideButtons === 0}  id = 'node-details-button-container' style = {{ fontSize: mobile ? '' : '4vh'}}>
                        <button hidden = {hideButtons === 0} className = 'dialog-save-button dialog-save-button-left button text-overflow' style = {{fontSize: mobile ? '3.4vw': '3.8vh'}} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {hideButtons === 0} className = 'dialog-save-button button text-overflow'  style = {{fontSize: mobile ? '3.4vw': '3.8vh'}} onClick = {() => { ResetForm();}} > Reset </button>
                    </div>
                    <div className='text-overflow title-required-container'  hidden = {(titleRequired)} style = {{fontSize: mobile ? '2.8vw' : '3vh'}}>Title is required!</div>
                </div>
                }
            </div>
        </>    
        );
}

export default NodeDetails 