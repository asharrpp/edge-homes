'use client';
import { createContext, ReactNode, useContext, useReducer } from 'react';

import { PropertyTypeValue, StateContextActionTypes } from '@/lib/enums';

import type { State, ReducerType, StateAction } from '../lib/types';
const initState: State = {
	isSidebarCollapsed: false,
	homeSearchValue: {
		location: '',
		type: PropertyTypeValue.SHORT_LET,
	},
};

const MyContext = createContext({
	state: initState,
	dispatch(val: StateAction) {
		void val;
	},
});

const reducer: ReducerType = (state, action) => {
	switch (action.type) {
		case StateContextActionTypes.ON_TOGGLE_SIDEBAR:
			return { ...state, isSidebarCollapsed: action.payload.isSidebarCollapsed };
		case StateContextActionTypes.ON_UPDATE_HOME_SEARCH_BAR_VALUE:
			return { ...state, homeSearchValue: { location: action.payload.location, type: action.payload.type } };
		default:
			return state;
	}
};

export const ContextProvider = ({ children }: { children: ReactNode }) => {
	const [state, dispatch] = useReducer(reducer, initState);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return <MyContext.Provider value={{ state, dispatch }}>{children}</MyContext.Provider>;
};

export const useGlobals = () => useContext(MyContext);
