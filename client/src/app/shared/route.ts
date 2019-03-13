export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Route {
  code: string;
  coord: Coordinate;
  skip?: boolean;
}

export const locationArray: Route[] = [{
  code: 'UG9zdCAyYQ==',
  coord: {
    latitude: 51.701114,
    longitude: 5.954895,
  },
  skip: true,
}, {
  code: 'd2VnZWluZGU=',
  coord: {
    latitude: 51.675402,
    longitude: 5.961284
  }
}, {
  code: 'dmVubmV0amU=',
  coord: {
    latitude: 51.659853,
    longitude: 5.926366
  }
}, {
  code: 'c2xvb3RqZQ==',
  coord: {
    latitude: 51.625877,
    longitude: 5.954718
  }
}, {
  code: 'aGVpbGlnZQ==',
  coord: {
    latitude: 51.622000,
    longitude: 5.982688
  }
}, {
  code: 'cGFubmVua29la2Vu',
  coord: {
    latitude: 51.594617,
    longitude: 5.998415
  }
}, {
  code: 'bWFyaWE=',
  coord: {
    latitude: 51.585798,
    longitude: 6.028043
  }
}, {
  code: 'Y2hhbXBhZ25l',
  coord: {
    latitude: 51.558334,
    longitude: 6.037009
  }
}
];

export const postArray: Route[] = [{
  // Start
  code: 'U3RhcnQ=',
  coord: {
    latitude: 51.698066,
    longitude: 5.741429
  },
}, {
  // Post 2
  code: 'UG9zdCAy',
  coord: {
    latitude: 51.740379,
    longitude: 5.780722
  }
// Deze post is de eerste in de locatie reeks, 2 keer tonen niet nodig.
// }, {
//   // Post 2a
//   code: 'UG9zdCAyYQ==',
//   coord: {
//     latitude: 51.701114,
//     longitude: 5.954895
//   }
}, {
  // Post 3
  code: 'UG9zdCAz',
  coord: {
    latitude: 51.558226,
    longitude: 6.037146
  }
}, {
  // Post 4
  code: 'UG9zdCA0',
  coord: {
    latitude: 51.518352,
    longitude: 5.786407
  }
}, {
  // Post 5
  code: 'UG9zdCA1',
  coord: {
    latitude: 51.517913,
    longitude: 5.595172
  }
}];
