import * as fs from 'fs';

export const logStream = fs.createWriteStream('../../api.log', {
	flags: 'a', //append
});
