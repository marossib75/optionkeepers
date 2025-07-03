import React, { useEffect } from "react";
import { Container, Navbar, Form} from "react-bootstrap";
import { connect } from "react-redux";
import CustomDropdown from "../../../commons/components/dropdown/dropdown-custom-icon";
import { ClubPageType } from "../../../enums/club-page.enum";
import { ModalCatalog } from "../../../enums/modal-catalog.enum";
import { LoadClubs } from "../../../state/club/club.action";
import { OpenModal } from "../../../state/modal/modal.action";

import { MdSort} from "react-icons/md"
import { TiArrowUpOutline } from "react-icons/ti";
import { FiUsers } from "react-icons/fi";
import { BsCalendar, BsViewList } from "react-icons/bs";
import ButtonIcon from "../../../commons/components/buttons/button-icon/ButtonIcon";
import { BiMessageSquareAdd } from "react-icons/bi";

import "./ClubsNavbar.css"


function ConnectedGroupsNavbar({search, page, dispatch, pagination}){

    const dropdownItems = [
        {   display: "New ones", 
            onClick: () => dispatch(LoadClubs(page, search, 1, 'created', -1)), 
            icon: <BsCalendar className="mr-3" size={18} />,
            active: pagination.sortBy=='created'|| pagination.sortBy==null
        },
        {   display: "Most upvoted", 
            onClick: () => dispatch(LoadClubs(page, search, 1, 'upvotes', -1)), 
            icon: <TiArrowUpOutline className="mr-3" size={18} />,
            active: pagination.sortBy=='upvotes'
        },
        {   display: "Most joined", 
            onClick: () => dispatch(LoadClubs(page, search, 1, 'members', -1)), 
            icon: <FiUsers className="mr-3" size={18} />,
            active: pagination.sortBy=='members'
        },
        {   display: "Number of strategies", 
            onClick: () => dispatch(LoadClubs(page, search, 1, 'nstrategies', -1)), 
            icon: <BsViewList className="mr-3" size={18} />,
            active: pagination.sortBy=='nstrategies'
        },
    ]

    return(
        <Navbar >
            <Container className="app-clubs-navbar">
                    <div className="app-clubs-navbar--sort">
                        <Navbar.Brand>Sort by: <strong>{pagination.sortBy}</strong></Navbar.Brand>
                        <CustomDropdown toggle={<MdSort size={18}/>} {...{dropdownItems}}/>
                    </div>
                    {page=== ClubPageType.Personal && 
                        <ButtonIcon theme='dark' fontSize={20} onClick= {()=> dispatch(OpenModal(ModalCatalog.CreateClub()))}>
                            <BiMessageSquareAdd/>
                            CreateClub
                        </ButtonIcon>}
                    <Form>
                        <Form.Control
                            type="text"
                            value = {search || ""}
                            placeholder="Search name or creator"
                            onChange={(event)=> dispatch(LoadClubs(page, event.target.value, 1, pagination.sortBy, pagination.order))}
                        />
                    </Form>
            </Container>
        </Navbar>
    );
};

const mapStateToProps = ({ clubs }) => {
    return {search: clubs.search, page: clubs.page, pagination: clubs.pagination};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const NavbarClubs = connect(mapStateToProps, mapDispatchToProps)(ConnectedGroupsNavbar)

export default NavbarClubs;