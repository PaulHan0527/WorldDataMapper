import Logo from '../navbar/Logo';
import Path from '../navbar/Path';
import Login from '../modals/Login';
import globeImage from '../../utils/globeImage.png';

import MapPageContents from '../firstMapPage/MapPageContents';
import RegionMain from '../regionViewer/RegionMain';
import UpdateAccount from '../modals/UpdateAccount';
import CreateRegion from '../modals/CreateRegion';

import CreateAccount from '../modals/CreateAccount';
import NavbarOptions from '../navbar/NavbarOptions';

import SpreadMain from '../spreadsheet/SpreadMain';

import * as mutations from '../../cache/mutations';
import { GET_DB_REGIONS } from '../../cache/queries';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { WNavbar, WNavItem, WCol, WRow, WButton } from 'wt-frontend';
import { WLayout, WLHeader, WLMain } from 'wt-frontend';
import WLFooter from 'wt-frontend/build/components/wlayout/WLFooter';
import { AddNewRegion_Transaction, ChangeParent_Transaction, DeleteRegion_Transaction, UpdateRegion_Transaction } from '../../utils/jsTPS'

const Homescreen = (props) => {
	

	const keyCombination = (e, callback) => {
		if (e.key === 'z' && e.ctrlKey) {
			if (props.tps.hasTransactionToUndo()) {
				tpsUndo();
			}
		}
		else if (e.key === 'y' && e.ctrlKey) {
			if (props.tps.hasTransactionToRedo()) {
				tpsRedo();
			}
		}
	}
	document.onkeydown = keyCombination;



	const auth = props.user === null ? false : true;

	let userInfo;

	if (auth) {
		userInfo = props.user;
	}

	const [activeRegion, setActiveRegion] = useState({});
	const [activeRegionViewer, setActiveRegionViewer] = useState({});

	// const [currentChildRegions, setCurrentChildRegions] = useState([]);
	const [path, setPath] = useState([]);
	const [showLogin, toggleShowLogin] = useState(false);
	const [showCreate, toggleShowCreate] = useState(false);
	const [showUpdate, toggleShowUpdate] = useState(false);
	const [showCreateRegion, toggleShowCreateRegion] = useState(false);

	const [canUndo, setCanUndo] = useState(props.tps.hasTransactionToUndo());
	const [canRedo, setCanRedo] = useState(props.tps.hasTransactionToRedo());

	const { loading, error, data, refetch } = useQuery(GET_DB_REGIONS);

	let allRegions = [];
	let rootRegions = [];
	let rootRegionsData = [];
	let currentChildRegions = [];

	if (loading) { console.log(loading, 'loading'); }
	if (error) { console.log(error, 'error'); }
	if (data) {
		allRegions = data.getAllRegions;
		rootRegions = allRegions.filter(root => root.rootRegion === true);

		for (let root of rootRegions) {
			rootRegionsData.push({ _id: root._id, name: root.name })
		}


	}
	if (activeRegion) {
		let activeRegionInfo = allRegions.filter(region => region._id === activeRegion._id);
		
		if(activeRegionInfo[0]) {
			for(let i = 0; i < activeRegionInfo[0].childRegionIds.length; i++) {
				let temp = allRegions.find(x => x._id === activeRegionInfo[0].childRegionIds[i]);
				currentChildRegions.push(temp);
			}
		}
	}

	const reload = async (_id) => {

		let activeRegionInfo = allRegions.filter(region => region._id === _id);
		console.log(activeRegionInfo);
	}

	

	const tpsUndo = async () => {
		const ret = await props.tps.undoTransaction();
		if (ret) {
			setCanUndo(props.tps.hasTransactionToUndo());
			setCanRedo(props.tps.hasTransactionToRedo());
		}
	}

	const tpsRedo = async () => {
		const ret = await props.tps.doTransaction();
		if (ret) {

			setCanUndo(props.tps.hasTransactionToUndo());
			setCanRedo(props.tps.hasTransactionToRedo());
		}
	}

	const [AddRegion] = useMutation(mutations.ADD_REGION);
	const [DeleteRegion] = useMutation(mutations.DELETE_REGION);
	const [UpdateRegion] = useMutation(mutations.UPDATE_REGION);
	const [UpdateRegionArray] = useMutation(mutations.UPDATE_REGION_ARRAY);
	const [ChangeParent] = useMutation(mutations.CHANGE_PARENT);



	const clickedRegion = async (_id, name) => {
		const { data } = await UpdateRegion({ variables: { field: "name", value: name, _id: _id } });
		if (data) {
			refetch();
			setActiveRegion({ _id: _id, name: name });
			clearTransactions();
		}

	}

	const createNewRootRegion = async (name) => {
		let region = {
			_id: '',
			name: name,
			capital: 'None',
			leader: 'None',
			landmarks: [],
			parentId: 'root',
			owner: props.user._id,
			rootRegion: true,
			childRegionIds: []
		}
		const { data } = await AddRegion({ variables: { region: region, updateParent_Id: "root", index: -1 }, refetchQueries: [{ query: GET_DB_REGIONS }] });
		if (data) {
			setActiveRegion({ _id: data.addRegion._id, name: data.addRegion.name });
			props.tps.clearAllTransactions();
			setPath([data.addRegion.name, data.addRegion._id]);
			refetch();
			// load it and go to region spreadsheet
			// loadRegion(data.addRegion);
		}
	}

	const renameRootRegion = async (newName, _id) => {
		const { data } = await UpdateRegion({ variables: { field: "name", value: newName, _id: _id } });
		if (data) {

		}
	}

	const deleteRootRegion = async (_id) => {

		const { data } = await DeleteRegion({ variables: { _id: _id, updateParent_Id: "root" }, refetchQueries: [{ query: GET_DB_REGIONS }] });
		if (data) {

		}
	}

	const deleteRegion = async (_id, parentId) => {
		let index;
		console.log(currentChildRegions);
		for (let i = 0 ; i < currentChildRegions.length; i++) {
			if(_id === currentChildRegions[i]._id) {
				index = i;
			}
		}
		let transaction = new DeleteRegion_Transaction(_id, DeleteRegion, AddRegion, parentId, index);
		props.tps.addTransaction(transaction);
		tpsRedo();
	}


	const createNewRegion = async (parentId) => {
		let region = {
			_id: '',
			name: 'Name',
			capital: 'Capital',
			leader: 'Leader',
			landmarks: [],
			parentId: parentId,
			owner: props.user._id,
			rootRegion: false,
			childRegionIds: []
		}
		console.log(activeRegion);
		let index = currentChildRegions.length;
		
		let regionID = region._id;
		let transaction = new AddNewRegion_Transaction(regionID, region, AddRegion, DeleteRegion, parentId, index);
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const updateRegion = (_id, oldValue, newValue, field) => {
		let transaction = new UpdateRegion_Transaction(_id, UpdateRegion, oldValue, newValue, field);
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const sortTable = (field) => {
		let newRegionArr = currentChildRegions;
		let oldArr = currentChildRegions.map(x=> x._id);
		if(field === 'name') {
			let sorted = true;
			for(let i = 0; i < newRegionArr.length - 1; i++) {
				if(newRegionArr[i].name > newRegionArr[i+1].name) {
					sorted = false;
					break;
				}
			}
			if(sorted) {
				newRegionArr.reverse();
			}
			else {
				// this is where to sort
				newRegionArr.sort((a, b) => (a.name > b.name) ? 1 : -1);
			}
		}
		else if (field === "capital") {
			let sorted = true;
			for(let i = 0; i < newRegionArr.length - 1; i++) {
				if(newRegionArr[i].capital > newRegionArr[i+1].capital) {
					sorted = false;
					break;
				}
			}
			if(sorted) {
				newRegionArr.reverse();
			}
			else {
				newRegionArr.sort((a, b) => a.capital > b.capital ? 1 : -1);
			}
		}
		else{ // leader
			let sorted = true;
			for(let i = 0; i < newRegionArr.length - 1; i++) {
				if(newRegionArr[i].leader > newRegionArr[i+1].leader) {
					sorted = false;
					break;
				}
			}
			if(sorted) {
				newRegionArr.reverse();
			}
			else {
				newRegionArr.sort((a, b) => a.leader > b.leader ? 1 : -1);
			}
		}	
		let idArray = newRegionArr.map(x => x._id);
		console.log(idArray);
		let transaction = new UpdateRegion_Transaction(activeRegion._id, UpdateRegionArray, oldArr, idArray, "childRegionIds");
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const addLandmark = (activeRV, value) => {
		let region = allRegions.find(x => x._id === activeRV._id)
		let { _id , name, capital, leader, landmarks, parentId, owner, rootRegion, childRegionIds } = region;
		let oldArr = landmarks;
		let newArr = [];
		for(let i = 0; i < oldArr.length; i ++) {
			newArr.push(oldArr[i]);
		}
		newArr.push(value);
		let transaction = new UpdateRegion_Transaction(activeRV._id, UpdateRegionArray, oldArr, newArr, "landmarks");
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const updateLandmark = (activeRV, prevName, newName) => {
		let region = allRegions.find(x => x._id === activeRV._id)
		let { _id , name, capital, leader, landmarks, parentId, owner, rootRegion, childRegionIds } = region;
		let oldArr = landmarks;
		let newArr = [];
		for(let i = 0; i < oldArr.length; i ++) {
			if(oldArr[i] === prevName) {
				newArr.push(newName);
			}
			else {
				newArr.push(oldArr[i]);
			}
			
		}
		let transaction = new UpdateRegion_Transaction(activeRV._id, UpdateRegionArray, oldArr, newArr, "landmarks");
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const deleteLandmark = (activeRV, landmark) => {
		let region = allRegions.find(x => x._id === activeRV._id)
		let { _id , name, capital, leader, landmarks, parentId, owner, rootRegion, childRegionIds } = region;
		let oldArr = landmarks;
		let newArr = [];
		for(let i = 0; i < oldArr.length; i ++) {
			if(oldArr[i] !== landmark) {
				newArr.push(oldArr[i]);
			}
		}
		let transaction = new UpdateRegion_Transaction(activeRV._id, UpdateRegionArray, oldArr, newArr, "landmarks");
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const changeParent = (_id, oldParent_id, newParent_id) => {
		// console.log("Current Region Id: "+_id);
		// console.log("Old Region parent ID: "+oldParent_id);
		// console.log("New Region Parent ID: "+newParent_id);
		let transaction = new ChangeParent_Transaction(_id, oldParent_id ,newParent_id, ChangeParent);
		props.tps.addTransaction(transaction);
		tpsRedo();
		reload(_id);
		
	}




	const setShowLogin = () => {
		toggleShowCreate(false);
		toggleShowUpdate(false);
		toggleShowCreateRegion(false);
		toggleShowLogin(!showLogin);
	};

	const setShowCreate = () => {
		toggleShowLogin(false);
		toggleShowUpdate(false);
		toggleShowCreateRegion(false);
		toggleShowCreate(!showCreate);
	};

	const setShowUpdate = () => {
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowCreateRegion(false);
		toggleShowUpdate(!showUpdate);
	}

	const setShowCreateRegion = () => {
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowUpdate(false);
		toggleShowCreateRegion(!showCreateRegion);
	}

	const clearTransactions = () => {
		props.tps.clearAllTransactions();
		setCanUndo(props.tps.hasTransactionToUndo());
		setCanRedo(props.tps.hasTransactionToRedo());
	}

	let name = "";
	if (auth) {
		name = userInfo.name;
	}

	return (
		<BrowserRouter>
			<WLayout wLayout="header">
				<WLHeader>
					<WNavbar className="navbar">
						<WRow>
							<WCol size='3'>
								<div>
									<WNavItem>
										<Logo className='logo'
											auth={auth}
											setActiveRegion={setActiveRegion}
											tps={props.tps}
											clearTransactions={clearTransactions}

											path={path} setPath={setPath}
										/>
									</WNavItem>
								</div>
							</WCol>

							<WCol size='6' className='navbar-path'>
								<ul>
									<WNavItem>
										<Path
											auth={auth}
											setActiveRegion={setActiveRegion}
											path={path} setPath={setPath}
											setActiveRegionViewer={setActiveRegionViewer}
											clearTransactions={clearTransactions}
											activeRegion={activeRegion}
											activeRegionViewer={activeRegionViewer}


										/>
									</WNavItem>
								</ul>
							</WCol>

						</WRow>


						<ul>
							<NavbarOptions
								fetchUser={props.fetchUser} auth={auth}
								setShowCreate={setShowCreate} setShowLogin={setShowLogin}
								userInfo={userInfo} setShowUpdate={setShowUpdate}

							/>
						</ul>
					</WNavbar>
				</WLHeader>

				{
					auth ?
						activeRegion._id ?

							<Redirect exact from='/home' to={{ pathname: '/home/maps/' + activeRegion._id }} />
							:
							<Redirect from='/home' to={{ pathname: '/home/maps' }} />

						:
						<Redirect exact from='/home' to={{ pathname: '/home' }} />
				}
				<Switch>
					<Route
						exact path='/home'
						name='welcome'
						render={() =>
							<div className="container-secondary">
								<WLMain className='globeImage'>
									<WRow>
										<WCol size='12'>
											<img src={globeImage} />
										</WCol>
									</WRow>
									<div className="modal-spacer">&nbsp;</div>
									<div className="modal-spacer">&nbsp;</div>
									<WRow>
										<WCol size='12' className='welcome-text'>
											Welcome To The World Data Mapper
							</WCol>

									</WRow>
								</WLMain>
							</div>

						}
					/>

					<Route
						exact path='/home/maps'
						name='maps'
						render={() =>
							<div className="container-secondary">
								<WLMain className="firstMapPage">
									<WLayout wLayout='header-footer'>
										<WLHeader className='firstMapPageHeader'>
											{name}'s maps
										</WLHeader>
										<WRow>
											<WCol size='6' className="map-contents">
												<MapPageContents
													path={path}
													setPath={setPath}

													userInfo={userInfo}
													reloadRegions={refetch}
													auth={auth}
													rootRegionsData={rootRegionsData}
													// setShowDelete={setShowDelete}
													deleteRootRegion={deleteRootRegion}
													clickedRegion={clickedRegion}
													setActiveRegion={setActiveRegion}
													setActiveRegionViewer={setActiveRegionViewer}

													renameRootRegion={renameRootRegion}

												/>
											</WCol>
											<WCol size='6'>
												<img src={globeImage} />
											</WCol>
										</WRow>

										<WLFooter>
											<WRow>
												<WCol size='6'>
												</WCol>

												<WCol size='6'>
													<WButton className='create-button' onClick={() => { setShowCreateRegion() }} hoverAnimation='lighten'>Create New Map</WButton>
												</WCol>
											</WRow>
										</WLFooter>
									</WLayout>
								</WLMain>
							</div>
						}
					/>

					<Route
						path='/home/maps/:id'
						render={() =>
							<div className="primary-container">
								<SpreadMain
									name={activeRegion.name}
									_id={activeRegion._id}
									createNewRegion={createNewRegion}
									reloadRegions={refetch}
									currentChildRegions={currentChildRegions}
									deleteRegion={deleteRegion}
									
									setActiveRegion={setActiveRegion}
									setActiveRegionViewer={setActiveRegionViewer}
									allRegions={allRegions}

									path={path}
									setPath={setPath}

									canUndo={canUndo}
									canRedo={canRedo}
									undo={tpsUndo}
									redo={tpsRedo}
									clearTransactions={clearTransactions}

									updateRegion={updateRegion}
									sortTable={sortTable}

			
								/>
							</div>
						}
					/>


					<Route
						path='/home/region/'
						name="region_viewer"
						render={() =>
							<div className="primary-container">
								<RegionMain
									allRegions={allRegions}
									currentChildRegions={currentChildRegions}
									activeRegion={activeRegion}
									setActiveRegion={setActiveRegion}
									activeRegionViewer={activeRegionViewer}
									setActiveRegionViewer={setActiveRegionViewer}

									canUndo={canUndo}
									canRedo={canRedo}
									undo={tpsUndo}
									redo={tpsRedo}
									clearTransactions={clearTransactions}

									addLandmark={addLandmark}
									updateLandmark={updateLandmark}
									deleteLandmark={deleteLandmark}

									changeParent={changeParent}



								/>
							</div>
						}
					/>
				</Switch>

				{
					showCreate && (<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} />)
				}

				{
					showLogin && (<Login fetchUser={props.fetchUser} setShowLogin={setShowLogin} reloadRegions={refetch} />)
				}

				{
					showUpdate && (<UpdateAccount userInfo={userInfo} fetchUser={props.fetchUser} setShowUpdate={setShowUpdate} />)
				}

				{
					showCreateRegion && (<CreateRegion fetchUser={props.fetchUser} createNewRootRegion={createNewRootRegion}
						setShowCreateRegion={setShowCreateRegion} reloadRegions={refetch}
						setActiveRegion={setActiveRegion} />)
				}

			</WLayout>
		</BrowserRouter>
	);
};

export default Homescreen;