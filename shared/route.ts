export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Route {
  code: string;
  coord: Coordinate;
}

export const locationArray: Route[] = [{
  code: 'cG9zdA==',
  coord: {
      latitude: 51.701114,
      longitude: 5.954895,
    }
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
    }, {
  code: 'Y2hhbXBhZ25l',
  coord: {
      latitude: 51.558334,
      longitude: 6.037009
    }
  }
];