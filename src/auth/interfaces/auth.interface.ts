export interface IUserData {
	id: string;
	email: string;
	isAdmin: boolean;
}

export interface ITokens {
	refreshToken: string;
	accessToken: string;
}

export interface IAuthResponseData extends ITokens {
	user: IUserData;
}

export type TypeRole = 'admin' | 'user' | undefined;
