import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, setStateProperty, updateNodeData, updateNodeNumber, updateNodeDescription, updateNodeTitle, updateNodeRank, updateNodeParent} from './nodeSlice'
import { InputText} from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { updateNode } from '../../api/nodes/nodesApi';
import { Dialog } from 'primereact/dialog';
import './detailsList.css';
import UploadFile from '../utils/UploadFile';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Draggable from 'react-draggable';

const NodeDetails = (input) => {
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const titlePresent = useRef(true);
    const[titleRequired, setTitleRequired] = useState(titlePresent.current);
    const[resetFiles, setResetFiles] = useState({reset: false});
    const [deleteOptions, setDeleteOptions] = useState("");
    const deleteType = useRef("cascade"); //single | cascade
    const nodeList = useRef([]);

    const SetChangeTracker = 'setChangeTracker' in input ? input.setChangeTracker : null;
    const [create, setCreate] = useState('create' in input ? input['create'] : false);
    const [root, setRoot] = useState('root' in input ? input['root'] : false);
    const node = useSelector(state => state.node);
    const dispatch = useDispatch();
    const firstRender = useRef(true);
    const unMount = input.unMount;
    const props = input.input;
    //const rootNode = input.rootNode;
    const renderTreeNode = input.renderTreeNode;

    const Saving = () => 
    {
        document.getElementById('saving').hidden = false;
    }

    const DoneSaving = () => 
    {
        document.getElementById('saving').hidden = true;
    }

    const Loading = () => 
    {
        document.getElementById('loading').hidden = false;
    }
    
    const DoneLoading = () => 
    {
        document.getElementById('loading').hidden = true;
    }

    function Success() 
    {
        const ClearSuccess = () =>
            {
                document.getElementById('success').hidden = true;
                clearTimeout(myTimeout);
            }

        document.getElementById('success').hidden = false;
        const myTimeout = setTimeout(ClearSuccess, 1600);
    }
    
    function Error() 
    {
        function ClearError()
        {
            document.getElementById('error').hidden = true;
            clearTimeout(myTimeout);
        }

        document.getElementById('error').hidden = false;
        const myTimeout = setTimeout(ClearError, 2000);
    }

    const SetStateFiles = (value) => {
        firstRender.current = false;
        dispatch(setStateProperty({key: 'files', value: value}));
      }

    if(firstRender.current){
        firstRender.current = false;
        dispatch(cloneNode(props));
        SetStateFiles(input.files);
        nodeList.current = [...input.nodeList];
        RemoveDescendants(props);
        nodeList.current = nodeList.current.sort(CompareNodes);
    }

    const handleChange = (value, method) => {
        dispatch(method(value));
    }

    const FileChangeCallBack = (showButtons) => 
    {
        if(showButtons)
        {
            changeCount.current++;
        }
        else 
        {
            changeCount.current = 0;
        }

        setHideButtons(changeCount.current);
    }

    const setNode = (prop) => {
        prop.data = node.data;
        prop.title = node.title;
        prop.number = node.number;
        prop.description = node.description;
        prop.rankId = node.rankId;
        prop.level = node.level;
        prop.nodeId = node.nodeId;
        prop.id = node.id;
        prop.isDeleted = node.isDeleted;
        prop.files = node.files;
        prop.thumbnailId = node.thumbnailId;
        prop.treeId = node.treeId;
    }

    async function DeleteSingle(id){
        Saving();
        try{
            return await fetch("http://localhost:11727/api/Nodes/Delete-One"+id, {method: 'DELETE'})
            .then((response)=>response.json())
                .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
            }
            catch(error)
            {

            }
            DoneSaving();
            Error();
            return null;  
    };

    async function DeleteCascade(id){
        
        Saving();
        try{
            return await fetch("http://localhost:11727/api/Nodes/Delete-Cascade"+id, {method: 'DELETE'})
            .then((response)=>response.json())
                .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
            }
            catch(error)
            {

            }
            DoneSaving();
            Error();
            return null;  
    };

    async function updateNode(id, node){
            Saving();
            putOptions.body = JSON.stringify(node);
            try{
                return await fetch("http://localhost:11727/api/Nodes/"+id, putOptions)
                .then((response)=>response.json())
                .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
            }
            catch(error)
            {

            }
            DoneSaving();
            Error();
            return null;      
    };

    async function createNode(node){
        const postOptions =  {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        postOptions.body = JSON.stringify(node);

        Saving();
        try{
            return await fetch("http://localhost:11727/api/Nodes/", postOptions)
            .then((response)=>response.json())
                .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
            }
            catch(error)
            {

            }
            DoneSaving();
            Error();
            return null;  
        
    };

    async function createRoot(node){
        const postOptions =  {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        postOptions.body = JSON.stringify(node);
        Saving();
        try{
            return await fetch("http://localhost:11727/api/Nodes/Root", postOptions)
            .then((response)=>response.json())
                .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
            }
            catch(error)
            {

            }
            DoneSaving();
            Error();
            return null;  
    };

    function RemoveDescendants(node)
    {
        const removeIndex = nodeList.current.findIndex((object) => object.id === node.id);
        if(removeIndex > -1)  nodeList.current.splice(removeIndex, 1);
        node.children.forEach(child => {
            RemoveDescendants(child);
        });
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
            setHideButtons(changeCount.current);
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
        if(create || root)
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
            await DeleteSingle(props.id);
            input.render("delete single", null, node.id, null, node.nodeId);
        }
        else
        {
            await DeleteCascade(props.id);
            input.render("delete cascade", null, node.id, null, node.nodeId);
        }
        unMount();
    }

    const putOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: ""
    }

    async function HandleSaveOrCreate()
    {
        if(!node.title || node.title.trim().length === 0)
        {
            titlePresent.current = false;
            setTitleRequired(false);
        }
        else if(!create && !root)
        {
            
            var updatedNode = await updateNode(node.id, node); 
            if(!updatedNode) return;
            
            if(node.nodeId != props.nodeId)
            {
                const oldParentId = props.nodeId;
                setNode(props);
                input.render("update", props, node.id, node.nodeId, oldParentId);
            }
            else{
                setNode(props);
                input.render("update", props, node.id);
            }
        }
        else if(create)
        {            
            var resultNode = await createNode(node);
            if(!resultNode) return;
            setNode(props);
            props['id'] = resultNode.id;
            input.nodeList.push(props);
            input.render("create", props);

            dispatch(setStateProperty({key: 'id', value: resultNode.id}));
            setCreate(false);
        }  
        else if(root)
        {
            var resultNode = await createRoot(node);
            if(!resultNode) return;
            setNode(props);
            props['id'] = resultNode.id;
            input.nodeList.push(props);
            nodeList.current = [];
            input.render("new root", props);

            dispatch(setStateProperty({key: 'id', value: resultNode.id}));
            setRoot(false);
        }  


        if(node.title && node.title.trim().length > 0)
        {
            changeCount.current = 0;
            setHideButtons(changeCount.current);
        }
    }

    const GetHeader = () => {
        if(create)return <>Create New Node</>;
        if(root)return <>Create New Root</>;
        
        return <>Node Content</>;
    }
     // container: , top: '2.5vw', left: '1.5vw'}}>}
    //style = {{marginBottom: (hideButtons === 0) ? '0vh' : '3.275vh'}}
        return(
        <>  
            <div className='dialog-root'>
                <div id = 'fixed-header' className='fixed-header'>
                    <div style = {{top: '1.5vw', position: 'relative', height: '6.5vh', fontSize: '6vh', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
                        <i onClick={() => {unMount()}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '6.5vh'}}/>
                        <div className='dialog-header' style = {{fontSize: '5vh', width: '33vw', textAlign: 'center', verticalAlign: 'middle'}}>{GetHeader()}</div>                   
                        <div style = {{marginLeft: 'auto', height: '6.5vh', width: '7vw',  float: 'right' }}>
                        { (node.nodeId && !root && !create) && (
                            <>
                                
                                <button className='button text-overflow' 
                                    style = {{width:'100%', backgroundColor: 'red', height: '6.5vh', maxHeight: '6.5vh', float: 'right', fontSize: '3vh', justifyContent: 'center'}} 
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
                <div className={(changeCount.current === 0 && titleRequired) ? 'container': 'container-shrunk'} style = {{position: 'relative'}} > 
                    <div style = {{display: 'flex', height: '44vh', marginBottom: '5.275vh'}}>
                        <div className="thumbnail-container">
                            <Provider store = {store}>
                                <UploadFile reset = {resetFiles} fileChangeCallBack = {FileChangeCallBack} files = {input.files} node = {input.input} thumbnailUpload = {(props.thumbnailId)} create = {create} />
                            </Provider>  
                        </div>
                        <div className='title-container'>
                            <InputTextarea 
                                maxLength={50}
                                autoResize 
                                rows = {1} 
                                placeholder="Title" 
                                className= {(titleRequired) ? "title" : "title-required"}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(props.title, node.title, e.target.value); handleChange(e.target.value, updateNodeTitle);}} value = {node.title ? node.title : ""} />
                        </div>
                    </div>
                    <div className="entryContainer">
                        <div className = "fullWidthLeft">
                            Description:  
                        </div> 
                        <div className="fullWidthRight" style = {{height: '17vh'}}>
                            <InputTextarea maxLength={1000} placeholder='Description...' autoResize style = {{height: '17vh'}} rows={5} className = "input" onChange = {(e) => {CheckValueChange(props.description, node.description, e.target.value); handleChange(e.target.value, updateNodeDescription);}} value = {node.description ? node.description : ""} />
                        </div>
                    </div>
                    <div className="entryContainer">
                        <div className = "fullWidthLeft">
                            Data: 
                        </div>
                        <div className="fullWidthRight" style = {{height: '26vh'}}>
                            <InputTextarea maxLength={1000} placeholder='Data...' autoResize rows={7} style = {{height: '26vh'}} className = "input-data" onChange = {(e) => {CheckValueChange(props.data, node.data, e.target.value); handleChange(e.target.value, updateNodeData);}} value = {node.data? node.data : ""} />    
                        </div>
                    </div>
                    <div className="entryContainer">
                        <div className = "fullWidthLeft">
                            Number:  
                        </div> 
                        <div className="fullWidthRight">
                            <InputText maxLength={1000} placeholder='Number...' className = "input" type = 'number' keyfilter='int' onChange = {(e) => {CheckValueChange(props.number, node.number, e.target.value); handleChange(e.target.value, updateNodeNumber);}} value = {node.number ? node.number : ""} />
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
                    { (!root && props.nodeId) && (
                        <div className="entryContainer">
                            <div className = "fullWidthLeft">
                                Parent:  
                            </div> 
                            <div className="fullWidthRight">
                                <Dropdown  
                                    maxLength={1000}
                                    className = "dropdown"
                                    placeholder='Select Parent...'
                                    panelStyle={{borderRadius: '2vh', color: 'rgba(204, 223, 255, 0.9)', backgroundColor: '#ccffffe6'}}
                                    //style = {{border: '3px solid rgba(204, 223, 255, 0.9)'}}
                                    onFocus={(event) => {}}
                                    //className='input'
                                    disabled = {node.nodeId ? false : true}
                                    filter
                                    onChange = {(e) => {CheckValueChange(props.nodeId, node.nodeId, e.target.value.id); handleChange(e.target.value.id, updateNodeParent);}} 
                                    value = {nodeList.current.find((object) => object.id === node.nodeId)}
                                    options = {nodeList.current}
                                    optionLabel='title'
                                    />
                            </div>
                        </div> 
                    )
                    }
                </div> 
                <div hidden = {changeCount.current === 0 && titleRequired} style = {{height: (changeCount.current === 0 && titleRequired)? '0vh':'6.5vh', width: '40vw', position: 'relative', left: '1.5vw', display: 'flex'}}>
                    <div hidden = {changeCount.current === 0}  id = 'node-details-button-container' style = {{ fontSize: '4vh', display: 'flex', height: '100%'}}>
                        <button hidden = {changeCount.current === 0} className='button text-overflow' style = {{height: '100%', width: '16vh', marginRight: '1vh'}} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {changeCount.current === 0} className='button text-overflow' style = {{height: '100%', width: '16vh'}} onClick = {() => {titlePresent.current = true; changeCount.current = 0; setResetFiles({reset: true}); handleChange(props, cloneNode); }} > Reset </button>
                    </div>
                    <div className='text-overflow title-required-container'  hidden = {(titleRequired)} style = {{marginLeft: '2vw', width: '100%', color: 'red', textAlign: 'bottom'}}>Title is required!</div>
                </div>
            </div>
        </>    
        );
}

export default NodeDetails 