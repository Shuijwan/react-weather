/**
 * flow
 */

'use strict';

import realm from '../realm';
import { weatherApiKey, weatherApiUrl } from '../config';

const defaultLocations = [
  {name: 'Canberra', postcode: '2600', state: 'ACT'},
  {name: 'Sydney', postcode: '2000', state: 'NSW'},
  {name: 'Melbourne', postcode: '3000', state: 'VIC'},
  {name: 'Brisbane', postcode: '4000', state: 'QLD'},
  {name: 'Perth', postcode: '6000', state: 'WA'},
  {name: 'Adelaide', postcode: '5000', state: 'SA'},
  {name: 'Hobart', postcode: '7000', state: 'TAS'},
  {name: 'Darwin', postcode: '0800', state: 'NT'},
];

class LocationService {
  async initialise() {
    let context = realm.current();
    try {
      let locations = context.objects('Location');
      if (locations.length > 0) {
        return;
      }

      for (var i = 0; i < defaultLocations.length; i++) {
        var location = defaultLocations[i];
        var locationId = await this.getLocationIdFromApi(location.name);

        context.write(() => {
          context.create('Location', {
            name: location.name,
            postcode: location.postcode,
            state: location.state,
            openWeatherId: locationId.toString()
          });
        });
      }
    } finally {
      context.close();
    }
  }

  async getLocationIdFromApi(location: string) {
    var url = `${weatherApiUrl}/find?q=${location},AU&type=accurate&units=metric&appid=${weatherApiKey}`;
    var locationId;

    try {
      let response = await fetch(url);
      const result = await response.json();

      return result.list[0].id;
    } catch(error) {
      // Handle error
      global.log(error);
    }
  }
}

module.exports = LocationService;
