import { version } from '../../package.json';
import { Router } from 'express';

import * as http from 'http';
import facets from './facets';

import sys from 'sys';
import exec from 'child_process';

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.get('/tracks/:show_date', (request, response) => {
		let showDate = request.params.show_date;
		if (showDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
			response.json(false);
		}

		http.get('http://phish.in/api/v1/show-on-date/' + showDate, (phishinResponse) => {

			let body = '';

			phishinResponse.on('data', (chunk) => {
				body += chunk;
			});

			phishinResponse.on('end', () => {
				let resBody = JSON.parse(body);
				let tracks = resBody.data.tracks;
				let tracksAudio = [];

				for (let i = 0; i < tracks.length; i++) {
					tracksAudio.push(tracks[i].mp3);
				}

				response.json(tracksAudio);
			});
		}).on('error', (err) => {
			console.log(err);
			response.json(err.message);
		});
	});

	return api;
}
