import * as MutationTypes from './mutation-types';
import { validURL } from '@/utils';

import axios from 'axios';
export default {
    state: () => ({
        geojson: null,
        listMaps: [],
    }),
    mutations: {
        [MutationTypes.HOME_SET_GEOJSON](state, geojson) {
            state.geojson = geojson;
        },
        [MutationTypes.HOME_SET_LISTMAPS](state, listMaps) {
            state.listMaps = listMaps;
        },
    },

    getters: {
        getGeoJSON(state) {
            return state.geojson;
        },
        placeGeoJson(state) {
            if (state.geoJson == '') {
                return null;
            }
            try {
                let obj = JSON.parse(state.geoJson);
                if (obj.type === 'FeatureCollection' && obj.features) {
                    obj.features.map((f) => {
                        if (
                            !['Point', 'Polygon', 'MultiPolygon'].includes(
                                f.geometry.type
                            )
                        ) {
                            throw new Error('Error Format');
                        }
                    });
                    return obj;
                } else {
                    throw new Error('Error Format');
                }
            } catch (e) {
                return null;
            }
        },
        maps(state) {
            return state.listMaps;
        },
    },

    actions: {
        async loadGeoJsonFromUrl({ commit }, url) {
            if (validURL(url)) {
                // if gist url get raw
                if (RegExp('^(https?://)?gist.github.com/').test(url)) {
                    let urlSplit = url.split('/');
                    if (
                        urlSplit.length > 3 &&
                        urlSplit[urlSplit.length - 1] !== 'raw'
                    ) {
                        urlSplit[urlSplit.length - 3] =
                            'gist.githubusercontent.com';
                        urlSplit.push('raw');
                        url = urlSplit.join('/');
                    }
                }
                const geojson = await axios
                    .get(url)
                    .then((res) => {
                        if (res.status === 200 && res.data) {
                            if (typeof res.data === 'object') {
                                return JSON.stringify(res.data, null, 2);
                            } else {
                                return res.data;
                            }
                        }
                    })
                    .catch((err) => {
                        // eslint-disable-next-line no-console
                        console.log(err);
                    });

                commit(MutationTypes.HOME_SET_GEOJSON, geojson);
            }
        },
        async getListMaps({ commit }) {
            const maps = await axios
                .get(
                    process.env.VUE_APP_LIST_MAPS_JSON_URL ||
                        'https://raw.githubusercontent.com/GeoGuess/GeoGuess-Maps/main/maps.json'
                )
                .then((res) => res.data.maps);

            commit(MutationTypes.HOME_SET_LISTMAPS, maps);
        },
    },
};
