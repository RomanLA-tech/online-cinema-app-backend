import * as bcrypt from 'bcrypt';

export const encodePassword = async (rawPassword: string): Promise<string> => {
	try {
		return await bcrypt.genSalt().then(salt => {
			return bcrypt.hash(rawPassword, salt);
		});
	} catch (e) {
		e.message;
	}
};

export const comparePasswords = async (rawPassword: string, hash: string): Promise<boolean> => {
	try {
		return bcrypt.compare(rawPassword, hash);
	} catch (e) {
		e.message;
	}
};
