import { gql } from "@apollo/client";

export const LOGIN = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			email 
			_id
			name
			password
		}
	}
`;

export const REGISTER = gql`
	mutation Register($email: String!, $password: String!, $name: String!) {
		register(email: $email, password: $password, name: $name) {
			email
			password
			name
		}
	}
`;

export const UPDATE_ACCOUNT = gql`
	mutation Update($email: String!, $password: String!, $name: String!, $id: String!) {
		update(email: $email, password: $password, name: $name, id: $id) {
			email
			password
			name
			_id
		}
	}

`;
export const LOGOUT = gql`
	mutation Logout {
		logout 
	}
`;

export const ADD_REGION = gql`
	mutation AddRegion($region: RegionInput!) {
		addRegion(region: $region) {
			_id
			name
			capital
			leader
			landmarks
			parentId
			owner
			rootRegion
		}
	}
`;

export const DELETE_REGION = gql`
	mutation DeleteRegion($_id: String!) {
		deleteRegion(_id: $_id)
	}

`;