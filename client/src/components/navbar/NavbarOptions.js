import React from 'react';
import { LOGOUT, UPDATE_ACCOUNT } from '../../cache/mutations';
import { useMutation, useApolloClient } from '@apollo/client';
import { WButton, WNavItem } from 'wt-frontend';
import { useHistory } from 'react-router-dom';

const LoggedIn = (props) => {
    const client = useApolloClient();
    const [Logout] = useMutation(LOGOUT);
    let history = useHistory();
    const handleLogout = async (e) => {
        Logout();
        const { data } = await props.fetchUser();
        if (data) {
            history.push('/home');
            let reset = await client.resetStore();
            // if (reset) props.setActiveList({});
            
        }
    };

    return (  
        <>
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options account" onClick={props.setShowUpdate} wType="texted"> 
                    {props.userInfo.name}
                </WButton>
            </WNavItem>
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options login" onClick={handleLogout} wType="texted">
                    Logout
            </WButton>
            </WNavItem >
        </>
    );
};

const LoggedOut = (props) => {
    return (
        <>
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options account" onClick={props.setShowCreate} wType="texted">
                    Create Account
                </WButton>
            </WNavItem>
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options login" onClick={props.setShowLogin} wType="texted">
                    Login
                </WButton>
            </WNavItem>
        </>
    );
};


const NavbarOptions = (props) => {
    return (
        <>
            {
                props.auth === false ? <LoggedOut setShowLogin={props.setShowLogin} setShowCreate={props.setShowCreate} />
                    : <LoggedIn fetchUser={props.fetchUser} logout={props.logout} userInfo={props.userInfo} setShowUpdate={props.setShowUpdate}  />
            }
        </>

    );
};

export default NavbarOptions;