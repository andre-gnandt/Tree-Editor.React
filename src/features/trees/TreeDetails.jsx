import React, { useState, useRef } from 'react'
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import '../nodes/DetailsList.css';
import '../trees/tree.css';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import { deleteTree, updateTree, createTree } from '../../api/trees/treesApi';

const TreeDetails = ({mobile = false, reRenderList = null, unMount = null, id = null, inputTree, creation  = false}) => {
    const navigate = useNavigate();
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const [titleRequired, setTitleRequired] = useState(true);
    const [deleteOptions, setDeleteOptions] = useState("");
    const [create, setCreate] = useState(creation);
    const [name, setName] = useState(inputTree.name);
    const [description, setDescription] = useState(inputTree.description);

    function CheckValueChange(originalValue, previousValue, newValue)
    {
        if(originalValue != null && String(originalValue).length === 0) originalValue = null;
        if(previousValue != null && String(previousValue).length === 0) previousValue = null;
        if(newValue != null && String(newValue).length === 0) newValue = null;

        const previousChangeCount = changeCount.current;
        if(previousValue == originalValue && newValue != originalValue)
        {
            changeCount.current++;
        }
        else if(previousValue !=  originalValue && newValue == originalValue)
        {
            changeCount.current--;
        }

        console.log("change count: "+changeCount.current);
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
                                <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>Please confirm that you would like to delete this Tree.</div>
                                <div style = {{position: 'relative', top: '10vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button className='text-overflow button' onClick={() => {HandleDeleteTree();}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Yes</button>
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

    function SetInputTree(tree)
    {
        inputTree['id'] = tree.id;
        inputTree['description'] = tree.description;
        inputTree['rootId'] = tree.rootId;
        inputTree['name'] = tree.name;
    }

    function RenderCreateOrSaveButton()
    {
        if(create)
        {
            return (
                <>Create</>
            );
        }
        
        return (
            <>Save</>
        );
    }

    async function HandleDeleteTree()
    {   
        await deleteTree(id);
        unMount();
        navigate("/");
    }

    async function HandleSaveOrCreate()
    {
        if(!name || name.trim().length === 0)
        {
            setTitleRequired(false);
        }
        else if(create)
        {

            const newTree = await createTree({name: name, description: description});
            SetInputTree(newTree);
            reRenderList("create", newTree);
            setCreate(false);
            navigate("tree/"+newTree.id);
        }
        else
        {   
            inputTree.name = name;
            inputTree.description = description; 
            await updateTree(id, inputTree);
            //reRenderList("update");
        }   

        if(name && name.trim().length > 0)
        {
            changeCount.current = 0;
            setHideButtons(changeCount.current);
        }
    }

    const ResetForm = () => 
    {
        changeCount.current = 0; 
        setHideButtons(0);
        setName(inputTree.name); 
        setDescription(inputTree.description);

    }

    const GetHeader = () => {
        if(create)return <>Create New Tree</>;
        
        return <>Tree Details</>;
    }


        return(
        <>  
            <div className='dialog-root'>
                <div id = 'fixed-header' className='fixed-header'>
                    <div style = {{top: '28%', position: 'relative', height: '78%', display: 'flex'}}>
                        <i onClick={() => {unMount()}} className='pi pi-times' style = {{ width: '17.5%', marginRight: 'auto', cursor: 'pointer', fontSize: mobile ? '6vw' : '6.5vh'}}/>
                        <div className='dialog-header' style = {{fontSize: mobile ? '4vw' : '4.8vh', width: '65%', textAlign: 'center', verticalAlign: 'middle'}}>{GetHeader()}</div>                   
                        <div style = {{marginLeft: 'auto', height: '100%', width: '17.5%',  float: 'right' }}>
                        { (!create) && (
                            <> 
                                <button className='button text-overflow' 
                                    style = {{width:'100%', backgroundColor: 'red', height: '90%', maxHeight: '90%', float: 'right', fontSize: mobile ? '2.5vw' : '3vh', justifyContent: 'center'}} 
                                    onClick={() => {setDeleteOptions("confirm")}}                       
                                >
                                Delete</button>                   
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
                <div className={'container-2'} style = {{position: 'relative', overflowY: 'hidden'}} > 
                    <div style = {{top: '2%' , width: '92%', left:'4%', position: 'relative', display: 'flex', height: '48%', marginBottom: '7.5%'}}>
                        <div className='tree-title-container' style = {{justifyContent: 'center', textAlign: 'center', display: 'flex'}}>
                            <InputTextarea 
                                maxLength={50}
                                autoResize 
                                rows = {1} 
                                placeholder="Title..." 
                                className= {(titleRequired) ? "tree-title" : "tree-title-required"}
                                style = {{justifyContent: 'center', textAlign: 'center', display: 'flex', fontSize: mobile ? '8vw': '10vh'}}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(inputTree.name, name, e.target.value); setName(e.target.value);}} value = {name ? name : ""} />
                        </div>
                    </div>
                        <div className = 'tree-description-container' style = {{justifyContent: 'center', textAlign: 'center', display: 'flex', width: '92%', position: 'relative', left: '4%'}}>
                            <InputTextarea 
                                maxLength={1000}
                                placeholder='Description...'   
                                autoResize  
                                rows={6} 
                                className = 'tree-description' 
                                style = {{fontSize: mobile ? '3.2vw' : '4vh', justifyContent: 'center', verticalAlign: 'middle', textAlign: 'center', display: 'flex'}}
                                onChange = {(e) => {CheckValueChange(inputTree.description, description, e.target.value); setDescription(e.target.value);}} value = {description ? description : ""} />
                        </div>
                  
                </div> 
                {
                <div  style = {{backgroundColor: (hideButtons === 0 && titleRequired) ? '#F0F0F0' : '#DCDCDC', maxHeight: '7.2%', height: '7.2%', width: '93%', position: 'relative', left: '3.5%', display: 'flex'}}>
                    <div hidden = {hideButtons === 0}  id = 'node-details-button-container' style = {{ fontSize: mobile ? '' : '4vh', width: "38%", display: 'flex',  maxHeight: '100%', height: '100%',}}>
 
                        <button hidden = {hideButtons === 0} className='button text-overflow' style = {{fontSize: mobile ? '3.4vw': '3.8vh', maxHeight: '100%', height: '100%', width: '50%', marginRight: '2%'}} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {hideButtons === 0} className='button text-overflow' style = {{fontSize: mobile ? '3.4vw': '3.8vh', maxHeight: '100%', height: '100%', width: '50%'}} onClick = {() => { ResetForm(); }} > Reset </button>
                    </div>
                    <div className='text-overflow title-required-container'  hidden = {(titleRequired)} style = {{ fontSize: mobile ? '2.8vw' : '3vh', color: 'red', textAlign: 'bottom'}}>Title is required!</div>
                </div>
                }
            </div>

        </>    
        );
}

export default TreeDetails 