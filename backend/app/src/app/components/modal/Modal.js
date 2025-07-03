import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import API from "../../../api/api";

import { Modal, Button, Form, Col} from "react-bootstrap";

import ErrorBoundary from "../../commons/components/error-boundary/ErrorBoundary";
import ButtonElement from "../../commons/components/buttons/button-element/ButtonElement.js/ButtonElement";

import { CloseModal } from "../../state/modal/modal.action";

import { ModalType } from "../../enums/modal-type.enum";

import "./Modal.css";
import { BiPlusCircle } from "react-icons/bi";
import { SocialMediCatalog } from "../../enums/social-media-catalog.enum";
import { FiDelete } from "react-icons/fi";
import CustomDropdown from "../../commons/components/dropdown/dropdown-custom-icon";
import ShareStrategyModal from "./ShareModal/ShareStrategyModal";
import ButtonIcon from "../../commons/components/buttons/button-icon/ButtonIcon";
import ShareClubModal from "./ShareModal/ShareClubModal";



function StrategyModal({props, dispatch}) {
    const { groups, name, published } = props;
    
    const [validName, setValidName] = useState(name ? true : false);
    const [isNameChanged, setIsNameChanged] = useState(false);

    const [vis, setVis] = useState(published || false); //vis for visibility (private or public)

    const onChange = (event) => {
        const form = event.currentTarget;
        const regex = /^[0-9a-zA-Z(\- _)]+$/;
        
        var input = undefined
        if (event.target.id === "strategyName") {
            input = event.target.value || "";
        }
        setIsNameChanged(input!=name)
        setValidName(form.checkValidity() && input.match(regex));
    }

    const onSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.checkValidity() === true) {
            const data = new FormData(event.target);
            data.append('published', vis);
            const entries = Object.fromEntries(data.entries());
            dispatch(props.onSubmit(entries));
            dispatch(CloseModal());
        }
    };

    return (
        <Form noValidate onSubmit={onSubmit}>
            <Form.Row>
                <Form.Group as={Col} controlId="strategyName">
                <Form.Control
                    isValid={validName}
                    onChange={onChange}
                    required
                    maxLength="128"
                    minLength="4"
                    name="name"
                    type="text"
                    placeholder="Enter name"
                    defaultValue={name || ""}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} controlId="strategyPublished">
                    <Form.Check 
                        type="switch"
                        id="custom-switch"
                        label={vis? "Public": "Private"}
                        checked={vis}
                        onChange={()=> setVis(!vis)}
                    />
                    <Form.Text id="publishedHelpBlock" muted>
                        Choose to publish it or to keep private.
                    </Form.Text>
                </Form.Group>
            </Form.Row>
            
            {
                groups &&
                <Form.Row>
                    <Form.Group as={Col} controlId="strategyGroup">
                        <Form.Control
                            as="select"
                            name="groupId"
                            required
                        >
                            {
                                groups.map((group, index) => (
                                    <option key={group.symbol} value={group.symbol}>{group.name}</option>
                                ))
                            }
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
            }
            <Form.Row className="buttons-right">
                <Button variant="outline-secondary" onClick={() => dispatch(CloseModal(props.onClose))}>
                    Cancel
                </Button>
                <Button disabled={name? !(isNameChanged || vis!=published): !validName} variant="outline-success" type="submit">
                    Save
                </Button>
            </Form.Row>
        </Form>
    );
}

function ClubModal({props, dispatch}) {
    const {isCreator, name, published, description, img_path, links } = props;

    const [validName, setValidName] = useState(name ? true : false);
    const [duplicateName, setDuplicateName] = useState(false);
    const [validDesc, setValidDesc] = useState(true); // already true because it can be empty "".
    const [validUrl, setValidUrl] = useState(false);

    const [clubNames, setClubNames] = useState([])
    const [vis, setVis] = useState(published || false); //vis for visibility
    const [title, setTitle] = useState(SocialMediCatalog[0].name);
    const [url, setUrl] = useState("");
    const [socialList, setSocialList] = useState(links || []);
    const [linkAdded, setLinkAdded] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState();

    useEffect(()=>{
        const getNames = async () =>{
          // get the names to use to avoid duplicates
          const names = await API.getMyClubNames();
          setClubNames(names);
        }
        getNames().catch(err=> console.log(err));
      }, [])

    function CheckDuplicateName(input){
        let different_names_from_name = clubNames.filter(n=> n!== name)
        let isUnique = different_names_from_name.filter(name => name===input).length===0
        setDuplicateName(!isUnique)
        return isUnique
    }

    const onChangeName = (event) => {
        const form = event.currentTarget;
        const regex = /^[0-9a-zA-Z(\- )]+$/;
        var nameInput = undefined
        
        if (event.target.id === "clubName") {
            nameInput = event.target.value || "";
        }
        setValidName(form.checkValidity() && nameInput.match(regex) 
            && CheckDuplicateName(nameInput));
            // the name must be different from one of the list but can stay the same (first filter)
    }

    const onChangeDesc = (event) => {
        const regex = /^$|^[0-9À-ȕa-zA-Z(.,;:\- _?\/!"'$%&|£€=*#@)]+$/;
        var descInput = undefined

        if (event.target.id === "clubDescription") {
            descInput = event.target.value || "";
        }
        setValidDesc(descInput.match(regex));
    }

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
      };


    const onChangeURL = (event) => {
        const form = event.currentTarget;
        const regex = SocialMediCatalog.filter(s => s.name === title)[0].regex;
        var urlInput = undefined
        
        if (event.target.id === "socialLink") {
            urlInput = event.target.value || "";
            setUrl(urlInput);
        }
        setValidUrl(form.checkValidity() && new RegExp(regex).test(urlInput));
    }

    const addSocialLink = () =>{
        setSocialList(prevState => [...prevState, {"title": title, "url": url}]);
        setTitle("")
        setUrl("")
        setValidUrl(false)
        setLinkAdded(true)
    }

    const removeUrl = (el)=>{
        setSocialList(prevState => prevState.filter(l => l.title !=el))
    }

    const onSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.checkValidity() === true) {
            const data = new FormData(event.target);
            data.append('published', vis);
            data.append('img_path', '' );
            data.append('links', JSON.stringify(socialList))
            const entries = Object.fromEntries(data.entries());
            //console.log(entries)
            dispatch(props.onSubmit(entries));
            dispatch(CloseModal());
        }
    };

    return (
        <Form onSubmit={onSubmit}>
            <Form.Row >
                <Form.Group as={Col} controlId="clubName">
                <Form.Control isValid={validName}
                    onChange={onChangeName}
                    // the name has to be disabled if other admins are modifying settings
                    // this because names are unique for each user
                    disabled={!isCreator && description}
                    required
                    maxLength="28"
                    minLength="4"
                    name="name"
                    type="text"
                    placeholder="Enter name"
                    defaultValue={name || ""}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                { duplicateName &&
                    <Form.Text id="nameHelpBlock" style={{color:'red'}}>
                        You already used this name!
                    </Form.Text>
                }
                <Form.Text id="nameHelpBlock" muted>
                    The name must be 4-28 characters long.
                </Form.Text>
                </Form.Group>
                <Form.Group as={Col} controlId="clubPublished">
                    <Form.Check 
                        type="switch"
                        id="custom-switch"
                        label={vis? "Public": "Private"}
                        checked={vis}
                        onChange={()=> setVis(!vis)}
                    />
                    <Form.Text id="publishedHelpBlock" muted>
                        Choose to publish it or to keep private.
                    </Form.Text>
                </Form.Group>
            </Form.Row>

            <Form.Row>
                <Form.Group as={Col} controlId="formFileSm" className="mb-3">
                    <Form.Label>Club icon</Form.Label>
                    <Form.Control type="file" size="sm" 
                    onChange={(event) => handleFileChange(event)}
                    />
                </Form.Group>
                <img src={selectedFile && URL.createObjectURL(selectedFile)} style={{width:'50px', height:'50px', marginLeft:'auto', marginRight:'0.5em'}}/>
            </Form.Row>

            <Form.Row>
                <Form.Group as={Col} controlId="clubDescription">
                <Form.Control 
                    onChange={onChangeDesc}
                    maxLength="256"
                    name="description"
                    as="textarea"
                    placeholder="Enter description"
                    defaultValue={description || ""}
                    style={{height:'160px', resize:'none'}}
                />
                <Form.Text id="nameHelpBlock" muted>
                    Your description must be at maximum of 256 characters long.
                </Form.Text>
                </Form.Group>
            </Form.Row>

            <Form.Row>
                <Form.Group as={Col} controlId="socialTitle">
                <Form.Control 
                    size="sm" 
                    as="select" 
                    onChange={(event)=> {
                        setTitle(event.target.value); 
                        setUrl(''); 
                        setValidUrl(false);
                        setLinkAdded(socialList.some(l => l.title==event.target.value))
                    }
                }>
                    {SocialMediCatalog
                        .map(social => <option key={social.name}>{social.name}</option>)
                    }
                </Form.Control>
                </Form.Group>
                <Form.Group as={Col} controlId="socialLink">
                    {linkAdded ?
                        <div style={{textAlign:'center'}}>Already added</div>
                        :
                        <>
                            <Form.Control 
                                isValid={validUrl}
                                onChange={onChangeURL}
                                value={url}
                                size="sm"
                                minLength="1"
                                type="text"
                                placeholder="Enter link"
                            />
                            <Form.Control.Feedback>Looks good</Form.Control.Feedback>
                            <Form.Text id="urlHelpBlock" muted>
                                URL of the selected Social Media
                            </Form.Text>
                        </>
                    }
                </Form.Group>
                <ButtonIcon fontSize={25} theme="dark" disabled={!(validUrl) || url===''} onClick={()=>addSocialLink()}> <BiPlusCircle/> </ButtonIcon>
            </Form.Row>
            <Form.Row>
                {
                    socialList.map(s => 
                        <ButtonElement key={s.title} text={s.title}>
                            <CustomDropdown {...{dropdownItems:[
                                { display: "Delete", onClick: ()=>removeUrl(s.title), icon: <FiDelete className="mr-3" size={16} />, type: 'delete' },
                            ]}}/>
                        </ButtonElement>
                    )
                }
            </Form.Row>

            <Form.Row className="buttons-right">
                <Button variant="outline-secondary" onClick={() => dispatch(CloseModal(props.onClose))}>
                    Cancel
                </Button>
                <Button disabled={!(validDesc&&validName)} variant="outline-success" type="submit">
                    Save
                </Button>
            </Form.Row>
        </Form>
    );
}

function ConfirmModal({props, dispatch}) {

    return (
        <Form>
            <Form.Group>
                {props.message}
            </Form.Group>
            <Form.Row className="buttons-right">
                <Button variant="outline-secondary" onClick={() => dispatch(CloseModal(props.onClose))}>
                    Cancel
                </Button>
                <Button variant="outline-danger" onClick={() => {dispatch(props.onSubmit()); dispatch(CloseModal(props.onClose))} }>
                    Delete
                </Button>
            </Form.Row>
        </Form>
    );
}

function MessageModal({props, dispatch}) {
    return (
        <Form>
            <Form.Group>
                {props.message}
            </Form.Group>
            <Form.Row className="buttons-right">
                <Button variant="outline-primary" onClick={() => dispatch(CloseModal(props.onClose))}>
                    Close
                </Button>
            </Form.Row>
        </Form>
    );
}

const mapStateToProps = state => {
    return { modal: state.modal};
  };

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

function Render({render, props, dispatch}) {
    switch(render) {
        case ModalType.Message:
            return <MessageModal props={props} dispatch={dispatch}/>
        case ModalType.Confirm:
            return <ConfirmModal props={props} dispatch={dispatch}/>
        case ModalType.Strategy:
            return <StrategyModal props={props} dispatch={dispatch}/>
        case ModalType.ShareStrategy:
            return <ShareStrategyModal props={props} dispatch={dispatch}/>
        case ModalType.Club:
            return <ClubModal props={props} dispatch={dispatch}/>
        case ModalType.ShareClub:
            return <ShareClubModal props={props} dispatch={dispatch}/>
        default:
            return <div></div>
    }
}

function ConnectedModal({modal, dispatch}) {
    return (
        <Modal
            show={modal.show } 
            onHide={() => dispatch(CloseModal(modal.onHide))}
            onShow={() => modal.onShow ? dispatch(modal.onShow()) : {}}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{modal.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ErrorBoundary>
                    <Render render={modal.render} props={modal.props} dispatch={dispatch}/>
                </ErrorBoundary>
            </Modal.Body>
        </Modal>
    );
}

const GenericModal = connect(mapStateToProps, mapDispatchToProps)(ConnectedModal)

export default GenericModal;
